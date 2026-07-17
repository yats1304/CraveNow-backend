import { Schema } from "mongoose";
import { INotification } from "../interfaces/index.js";
import {
  NotificationAction,
  NotificationPriority,
  NotificationRecipientType,
  NotificationStatus,
  NotificationType,
} from "../types/index.js";

/**
 * Reusable schema for each notification channel.
 */
const channelStatusSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },

    sentAt: {
      type: Date,
    },

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastAttemptAt: {
      type: Date,
    },

    failureReason: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

export const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      refPath: "recipientType",
      required: true,
    },

    recipientType: {
      type: String,
      enum: Object.values(NotificationRecipientType),
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },

    action: {
      type: String,
      enum: Object.values(NotificationAction),
      default: NotificationAction.NONE,
    },

    actionData: {
      type: Schema.Types.Mixed,
    },

    channels: {
      socket: {
        type: channelStatusSchema,
        default: () => ({}),
      },

      push: {
        type: channelStatusSchema,
        default: () => ({}),
      },

      email: {
        type: channelStatusSchema,
        default: () => ({}),
      },

      sms: {
        type: channelStatusSchema,
        default: () => ({}),
      },

      inApp: {
        type: channelStatusSchema,
        default: () => ({}),
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipientType: 1,
});

notificationSchema.index({
  type: 1,
});

notificationSchema.index({
  isRead: 1,
});

notificationSchema.index({
  priority: 1,
});
