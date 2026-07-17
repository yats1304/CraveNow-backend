import {
  createNotificationPayload,
} from "../helpers/notification.helper.js";
import { INotification } from "../interfaces/index.js";
import { Notification } from "../models/index.js";
import { notificationQueue } from "./notification.queue.js";
import { logger } from "../config/logger.js";
import { NotificationStatus } from "../types/index.js";

import {
  NotificationChannel,
  NotificationRecipientType,
  NotificationType,
  NotificationPriority,
  NotificationAction,
} from "../types/index.js";

/**
 * Options required to dispatch a notification.
 */
export interface NotifyOptions {
  recipientId: string;
  recipientType: NotificationRecipientType;
  type: NotificationType;
  actionData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  action?: NotificationAction;
  channels?: NotificationChannel[];
}

/**
 * Dispatcher responsible for creating notifications in MongoDB and enqueuing jobs in BullMQ.
 */
export class NotificationDispatcher {
  /**
   * Generates a notification document, persists it to MongoDB, and enqueues a job
   * in BullMQ for asynchronous processing.
   *
   * @param options - Configuration options for the notification dispatch.
   * @returns A promise that resolves to the created notification document.
   * @throws Error if database persistence or queue insertion fails.
   */
  static async notify(options: NotifyOptions): Promise<INotification> {
    logger.info(
      { type: options.type, recipientId: options.recipientId },
      "Generating notification payload..."
    );

    let notification: INotification | null = null;

    try {
      const payload = createNotificationPayload(options);
      notification = await Notification.create(payload);

      logger.info(
        { notificationId: notification._id.toString() },
        "Saved notification in MongoDB successfully"
      );
    } catch (dbError) {
      logger.error(
        { error: dbError instanceof Error ? dbError.message : String(dbError), options },
        "Failed to create and save notification in MongoDB"
      );
      throw dbError;
    }

    try {
      const notificationIdStr = notification._id.toString();
      logger.info(
        { notificationId: notificationIdStr },
        "Enqueuing notification job in BullMQ..."
      );

      // Enqueue job with jobId set to notification._id to prevent duplicate jobs
      const job = await notificationQueue.add(
        "send-notification",
        { notificationId: notificationIdStr },
        { jobId: notificationIdStr }
      );

      logger.info(
        { notificationId: notificationIdStr, jobId: job.id },
        "Successfully enqueued job in notification-queue"
      );

      return notification;
    } catch (queueError) {
      const errorMessage = queueError instanceof Error ? queueError.message : String(queueError);
      logger.error(
        { notificationId: notification._id.toString(), error: errorMessage },
        "Failed to enqueue job in notification-queue. Updating notification channel statuses to FAILED..."
      );

      // Update channel status to FAILED in the DB since it wasn't enqueued
      if (notification) {
        for (const channel of Object.keys(notification.channels) as Array<keyof INotification["channels"]>) {
          const channelStatus = notification.channels[channel];
          if (channelStatus) {
            channelStatus.status = NotificationStatus.FAILED;
            channelStatus.failureReason = `Failed to enqueue in BullMQ: ${errorMessage}`;
            channelStatus.lastAttemptAt = new Date();
          }
        }
        try {
          await notification.save();
          logger.info(
            { notificationId: notification._id.toString() },
            "Updated database: all channels marked as failed due to queue enqueue error"
          );
        } catch (dbSaveError) {
          logger.error(
            { notificationId: notification._id.toString(), error: dbSaveError instanceof Error ? dbSaveError.message : String(dbSaveError) },
            "Failed to save channel status update to MongoDB after queue insertion failure"
          );
        }
      }

      throw queueError;
    }
  }
}
