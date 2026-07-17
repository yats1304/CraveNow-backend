import { Document, Types } from "mongoose";
import {
  NotificationAction,
  NotificationChannel,
  NotificationPriority,
  NotificationRecipientType,
  NotificationStatus,
  NotificationType,
} from "../types/index.js";

export interface INotificationChannelStatus {
  status: NotificationStatus;
  sentAt?: Date;
  retryCount: number;
  lastAttemptAt?: Date;
  failureReason?: string;
}

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  recipientType: NotificationRecipientType;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  action: NotificationAction;
  actionData?: Record<string, unknown>;
  channels: {
    socket?: INotificationChannelStatus;
    push?: INotificationChannelStatus;
    email?: INotificationChannelStatus;
    sms?: INotificationChannelStatus;
    inApp?: INotificationChannelStatus;
  };

  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  deletedAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
