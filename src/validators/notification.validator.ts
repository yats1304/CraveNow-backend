import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";
import {
  NotificationAction,
  NotificationPriority,
  NotificationRecipientType,
  NotificationType,
} from "../types/index.js";

export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  isRead: z.enum(["true", "false"]).optional(),
  type: z.nativeEnum(NotificationType).optional(),
});

export const notificationIdParamSchema = z.object({
  notificationId: objectIdSchema,
});

export const notificationIdParams = z.object({
  notificationId: objectIdSchema,
});

export const markNotificationAsReadSchema = z.object({
  notificationId: objectIdSchema,
});

export const deleteNotificationSchema = z.object({
  notificationId: objectIdSchema,
});

export const broadcastNotificationSchema = z.object({
  recipientType: z.enum(NotificationRecipientType, {
    message: "Invalid recipient type.",
  }),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(150, "Title cannot exceed 150 characters."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(1000, "Message cannot exceed 1000 characters."),
  type: z.enum(NotificationType, {
    message: "Invalid notification type.",
  }),
  priority: z.enum(NotificationPriority).default(NotificationPriority.NORMAL),
  action: z.enum(NotificationAction).default(NotificationAction.NONE),
  actionData: z.record(z.string(), z.any()).optional(),
});
