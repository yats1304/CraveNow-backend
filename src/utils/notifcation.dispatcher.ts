import {
  createNotificationPayload,
  markChannelAsFailed,
  markChannelAsSent,
} from "../helpers/notification.helper.js";
import { INotification } from "../interfaces/index.js";
import { Notification } from "../models/index.js";
import { emitNotification } from "../socket/emitters.js";

import {
  NotificationChannel,
  NotificationRecipientType,
  NotificationType,
  NotificationPriority,
  NotificationAction,
} from "../types/index.js";

interface NotifyOptions {
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

export class NotificationDispatcher {
  private static readonly channelMap: Record<
    keyof INotification["channels"],
    NotificationChannel
  > = {
    socket: NotificationChannel.SOCKET,
    push: NotificationChannel.PUSH,
    email: NotificationChannel.EMAIL,
    sms: NotificationChannel.SMS,
    inApp: NotificationChannel.IN_APP,
  };

  private static readonly channelHandlers: Record<
    NotificationChannel,
    (notification: INotification) => Promise<void>
  > = {
    [NotificationChannel.SOCKET]: (n) => NotificationDispatcher.sendSocket(n),
    [NotificationChannel.PUSH]: (n) => NotificationDispatcher.sendPush(n),
    [NotificationChannel.EMAIL]: (n) => NotificationDispatcher.sendEmail(n),
    [NotificationChannel.SMS]: (n) => NotificationDispatcher.sendSms(n),
    [NotificationChannel.IN_APP]: async () => {},
  };

  static async notify(options: NotifyOptions): Promise<INotification> {
    const payload = createNotificationPayload(options);

    const notification = await Notification.create(payload);

    await this.dispatch(notification);

    return notification;
  }

  static async dispatch(notification: INotification) {
    const enabledChannels = Object.keys(
      notification.channels,
    ) as Array<keyof INotification["channels"]>;

    for (const channel of enabledChannels) {
      try {
        const enumChannel = this.channelMap[channel];
        const handler = this.channelHandlers[enumChannel];

        if (handler) {
          await handler(notification);
        }

        markChannelAsSent(notification, channel);
      } catch (error) {
        markChannelAsFailed(
          notification,
          channel,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    await notification.save();
  }

  /**
   * Socket.IO
   */
  static async sendSocket(notification: INotification) {
    emitNotification(notification);
  }

  /**
   * Firebase
   */
  static async sendPush(notification: INotification) {
    // TODO
  }

  /**
   * Nodemailer
   */
  static async sendEmail(notification: INotification) {
    // TODO
  }

  /**
   * Twilio
   */
  static async sendSms(notification: INotification) {
    // TODO
  }
}

