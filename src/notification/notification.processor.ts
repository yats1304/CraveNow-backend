import { INotification } from "../interfaces/index.js";
import { logger } from "../config/logger.js";
import {
  markChannelAsFailed,
  markChannelAsSent,
} from "../helpers/notification.helper.js";
import { SocketChannel } from "./notification.channels/socket.channel.js";
import { PushChannel } from "./notification.channels/push.channel.js";
import { EmailChannel } from "./notification.channels/email.channel.js";
import { SmsChannel } from "./notification.channels/sms.channel.js";
import { NotificationStatus } from "../types/index.js";

/**
 * Interface that all notification channel delivery mechanisms must implement.
 */
export interface NotificationChannelHandler {
  /**
   * Dispatches the notification to the target channel.
   *
   * @param notification - The notification document to be dispatched.
   * @returns A promise that resolves when the message is successfully sent.
   */
  send(notification: INotification): Promise<void>;
}

// Static, read-only array of supported channels to avoid repeated Object.keys allocations
const SUPPORTED_CHANNELS = ["socket", "push", "email", "sms", "inApp"] as const;

/**
 * Processes all active channels for a notification document.
 * Uses the Strategy Pattern and Registry to remain open for extension but closed for modification.
 */
export class NotificationProcessor {
  // Static registry mapping channel names to their corresponding handlers
  private static readonly handlers: Map<string, NotificationChannelHandler> = new Map([
    ["socket", SocketChannel],
    ["push", PushChannel],
    ["email", EmailChannel],
    ["sms", SmsChannel],
    ["inApp", {
      async send(): Promise<void> {
        // inApp is handled purely as a DB state read by client, no dispatch needed
      }
    }]
  ]);

  /**
   * Registers a custom handler for a notification channel.
   * Allows extending the processor with new channels without modifying the core class.
   *
   * @param channel - The name of the channel.
   * @param handler - The handler implementation conforming to NotificationChannelHandler.
   */
  static registerHandler(channel: string, handler: NotificationChannelHandler): void {
    this.handlers.set(channel, handler);
  }

  /**
   * Processes all enabled and eligible channels for a notification document.
   * Ensures failure on one channel does not disrupt the dispatch of other channels.
   *
   * @param notification - The notification document to process.
   * @param jobId - Optional BullMQ job ID for structured logging.
   */
  static async process(notification: INotification, jobId?: string): Promise<void> {
    const notificationId = notification._id.toString();

    logger.info(
      { notificationId, jobId },
      "Starting notification processing for channels"
    );

    // Loop over static array of supported channels to optimize runtime performance
    for (const channel of SUPPORTED_CHANNELS) {
      if (!this.shouldProcessChannel(notification, channel)) {
        continue;
      }

      const handler = this.handlers.get(channel);
      if (!handler) {
        logger.warn(
          { notificationId, jobId, channel },
          `No handler registered for channel: ${channel}`
        );
        continue;
      }

      const channelStatus = notification.channels[channel];
      const attempt = (channelStatus?.retryCount ?? 0) + 1;

      try {
        logger.info(
          { notificationId, jobId, channel, attempt },
          `Dispatching notification via channel: ${channel}`
        );

        const startTime = Date.now();
        await handler.send(notification);
        const duration = Date.now() - startTime;

        markChannelAsSent(notification, channel);

        logger.info(
          { notificationId, jobId, channel, attempt, durationMs: duration },
          `Successfully dispatched notification via channel: ${channel}`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        markChannelAsFailed(notification, channel, errorMessage);

        logger.error(
          { notificationId, jobId, channel, attempt, error: errorMessage },
          `Failed to dispatch notification via channel: ${channel}`
        );
      }
    }

    // Persist all status updates to MongoDB exactly once after all channels finish
    try {
      await notification.save();
      logger.info(
        { notificationId, jobId },
        "Saved notification document status successfully"
      );
    } catch (saveError) {
      logger.error(
        { notificationId, jobId, error: saveError instanceof Error ? saveError.message : String(saveError) },
        "Failed to save notification document status to MongoDB"
      );
      throw saveError; // Propagate DB save failure to let BullMQ know the job failed
    }
  }

  /**
   * Helper method to determine if a channel should be processed.
   * Skips channels that are disabled or already sent.
   *
   * @param notification - The notification document.
   * @param channel - The channel key to check.
   * @returns True if the channel is enabled and pending/failed, false otherwise.
   */
  private static shouldProcessChannel(
    notification: INotification,
    channel: keyof INotification["channels"]
  ): boolean {
    const channelStatus = notification.channels[channel];

    // Skip if channel is not enabled/requested on this notification
    if (!channelStatus) {
      return false;
    }

    // Only process channels that are pending or failed
    return (
      channelStatus.status === NotificationStatus.PENDING ||
      channelStatus.status === NotificationStatus.FAILED
    );
  }
}
