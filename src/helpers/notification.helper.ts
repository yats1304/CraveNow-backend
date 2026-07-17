import { Types } from "mongoose";
import { INotification } from "../interfaces/index.js";
import {
  NotificationAction,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../types/index.js";
import { getNotificationTemplate } from "../templates/index.js";

export const buildNotificationResponse = (notification: INotification) => {
  return {
    notificationId: notification._id,
    recipientId: notification.recipientId,
    recipientType: notification.recipientType,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    action: notification.action,
    actionData: notification.actionData,
    isRead: notification.isRead,
    readAt: notification.readAt,
    channels: notification.channels,
    metadata: notification.metadata,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
};

export const buildNotificationListResponse = (
  notifications: INotification[],
) => {
  return {
    total: notifications.length,

    unreadCount: notifications.filter((notification) => !notification.isRead)
      .length,

    notifications: notifications.map(buildNotificationResponse),
  };
};

export const createNotificationPayload = ({
  type,
  recipientId,
  recipientType,
  actionData,
  metadata,
  title,
  message,
  priority,
  action,
  channels,
}: {
  type: NotificationType;
  recipientId: string | Types.ObjectId;
  recipientType: INotification["recipientType"];
  actionData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  action?: NotificationAction;
  channels?: NotificationChannel[];
}) => {
  const template = getNotificationTemplate(type);

  const channelsObj: Record<string, any> = {};
  if (channels && channels.length > 0) {
    if (channels.includes(NotificationChannel.SOCKET)) {
      channelsObj.socket = { status: NotificationStatus.PENDING, retryCount: 0 };
    }
    if (channels.includes(NotificationChannel.PUSH)) {
      channelsObj.push = { status: NotificationStatus.PENDING, retryCount: 0 };
    }
    if (channels.includes(NotificationChannel.EMAIL)) {
      channelsObj.email = { status: NotificationStatus.PENDING, retryCount: 0 };
    }
    if (channels.includes(NotificationChannel.SMS)) {
      channelsObj.sms = { status: NotificationStatus.PENDING, retryCount: 0 };
    }
    if (channels.includes(NotificationChannel.IN_APP)) {
      channelsObj.inApp = { status: NotificationStatus.PENDING, retryCount: 0 };
    }
  } else {
    channelsObj.socket = { status: NotificationStatus.PENDING, retryCount: 0 };
    channelsObj.push = { status: NotificationStatus.PENDING, retryCount: 0 };
    channelsObj.email = { status: NotificationStatus.PENDING, retryCount: 0 };
    channelsObj.sms = { status: NotificationStatus.PENDING, retryCount: 0 };
    channelsObj.inApp = { status: NotificationStatus.PENDING, retryCount: 0 };
  }

  return {
    recipientId: typeof recipientId === "string" ? new Types.ObjectId(recipientId) : recipientId,
    recipientType,
    title: title ?? template.title,
    message: message ?? template.message,
    type,
    priority: priority ?? template.priority,
    action: action ?? template.action,
    actionData,
    metadata,
    channels: channelsObj,
  };
};

export const markChannelAsSent = (
  notification: INotification,
  channel: keyof INotification["channels"],
) => {
  const channelStatus = notification.channels[channel];

  if (!channelStatus) {
    return;
  }

  channelStatus.status = NotificationStatus.SENT;
  channelStatus.sentAt = new Date();
  channelStatus.lastAttemptAt = new Date();
  channelStatus.failureReason = undefined;
};

export const markChannelAsFailed = (
  notification: INotification,
  channel: keyof INotification["channels"],
  reason: string,
) => {
  const channelStatus = notification.channels[channel];

  if (!channelStatus) {
    return;
  }

  channelStatus.status = NotificationStatus.FAILED;
  channelStatus.retryCount += 1;
  channelStatus.lastAttemptAt = new Date();
  channelStatus.failureReason = reason;
};

export const markNotificationAsRead = (notification: INotification) => {
  notification.isRead = true;
  notification.readAt = new Date();
  return notification;
};

export const resetChannelStatus = (
  notification: INotification,
  channel: keyof INotification["channels"],
) => {
  const channelStatus = notification.channels[channel];

  if (channelStatus) {
    channelStatus.status = NotificationStatus.PENDING;
    channelStatus.failureReason = undefined;
  }

  return notification;
};

export const markAllChannelsAsSent = (notification: INotification) => {
  const channels = Object.keys(notification.channels) as Array<
    keyof INotification["channels"]
  >;

  for (const channel of channels) {
    markChannelAsSent(notification, channel);
  }

  return notification;
};
