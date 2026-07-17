import { QueryFilter } from "mongoose";
import { logger } from "../config/logger.js";
import { INotification } from "../interfaces/notification.interface.js";
import {
  NotificationDispatcher,
  NotifyOptions,
} from "../notification/notification.dispatcher.js";
import { Notification, User } from "../models/index.js";
import { ErrorHandler } from "../utils/index.js";
import {
  NotificationRecipientType,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  UserRole,
} from "../types/index.js";
import {
  buildNotificationResponse,
  markNotificationAsRead,
} from "../helpers/notification.helper.js";

// ==========================================
// Internal Helpers
// ==========================================

/**
 * Mapping between NotificationRecipientType and UserRole to avoid unsafe type assertions.
 */
const recipientRoleMap: Record<NotificationRecipientType, UserRole> = {
  [NotificationRecipientType.CUSTOMER]: UserRole.CUSTOMER,
  [NotificationRecipientType.RESTAURANT]: UserRole.RESTAURANT,
  [NotificationRecipientType.DELIVERY_PARTNER]: UserRole.DELIVERY_PARTNER,
  [NotificationRecipientType.ADMIN]: UserRole.ADMIN,
};

/**
 * Reusable internal helper to query a notification by ID, verify ownership,
 * and ensure it is not soft-deleted.
 *
 * @param recipientId - The ID of the requesting user.
 * @param notificationId - The ID of the target notification.
 * @param options - Configuration options, e.g. whether to return a plain object via lean().
 * @returns The queried notification document.
 * @throws ErrorHandler (404) if the notification is not found.
 * @throws ErrorHandler (403) if the requesting user does not own the notification.
 */
const getOwnedNotification = async (
  recipientId: string,
  notificationId: string,
): Promise<INotification> => {
  const notification = await Notification.findOne({
    _id: notificationId,
    isDeleted: false,
  });

  if (!notification) {
    throw new ErrorHandler(404, "Notification not found.");
  }

  if (notification.recipientId.toString() !== recipientId) {
    throw new ErrorHandler(
      403,
      "You do not have permission to access this notification.",
    );
  }

  return notification as INotification;
};

// ==========================================
// Notification Creation
// ==========================================

/**
 * Dispatches a single notification.
 *
 * @param options - Configuration options for the notification.
 * @returns A promise resolving to the created notification.
 */
export const createNotification = async (
  options: NotifyOptions,
): Promise<INotification> => {
  logger.info(
    {
      recipientId: options.recipientId,
      type: options.type,
    },
    "Creating notification...",
  );

  const notification = await NotificationDispatcher.notify(options);

  logger.info(
    {
      notificationId: notification._id.toString(),
    },
    "Notification created successfully.",
  );

  return notification;
};

/**
 * Dispatches bulk notifications.
 *
 * @param notifications - Array of notification options.
 * @returns A promise resolving to the list of created notifications.
 */
export const createBulkNotifications = async (
  notifications: NotifyOptions[],
): Promise<INotification[]> => {
  logger.info(
    {
      totalNotifications: notifications.length,
    },
    "Creating bulk notifications...",
  );

  if (notifications.length === 0) {
    logger.warn("No notifications provided for bulk creation.");
    return [];
  }

  const createdNotifications = await Promise.all(
    notifications.map((notification) =>
      NotificationDispatcher.notify(notification),
    ),
  );

  logger.info(
    {
      totalNotifications: createdNotifications.length,
    },
    "Bulk notifications created successfully.",
  );

  return createdNotifications;
};

// ==========================================
// Notification Retrieval
// ==========================================

/**
 * Retrieves a paginated list of active notifications for a specific recipient.
 *
 * @param recipientId - The ID of the recipient user.
 * @param page - The current page number (defaults to 1).
 * @param limit - The maximum number of records per page (defaults to 10).
 * @param isRead - Optional filter for read/unread status.
 * @param type - Optional filter for notification type.
 * @returns A promise that resolves to the paginated notifications and metadata.
 */
export const getNotifications = async (
  recipientId: string,
  page: number = 1,
  limit: number = 10,
  isRead?: boolean,
  type?: NotificationType,
): Promise<{
  notifications: Array<ReturnType<typeof buildNotificationResponse>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(Math.max(1, limit), 100);

  logger.info(
    { recipientId, page: pageNum, limit: limitNum, isRead, type },
    "Retrieving notifications list...",
  );

  const filter: QueryFilter<INotification> = {
    recipientId,
    isDeleted: false,
  };

  if (isRead !== undefined) {
    filter.isRead = isRead;
  }

  if (type !== undefined) {
    filter.type = type;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  const formattedNotifications = notifications.map(buildNotificationResponse);

  logger.info(
    {
      recipientId,
      page: pageNum,
      limit: limitNum,
      count: formattedNotifications.length,
      total,
    },
    "Notifications list retrieved successfully.",
  );

  return {
    notifications: formattedNotifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Retrieves a specific notification by its ID after verifying ownership.
 *
 * @param recipientId - The ID of the requesting user.
 * @param notificationId - The ID of the notification to retrieve.
 * @returns A promise that resolves to the formatted notification.
 * @throws ErrorHandler (404) if not found, or (403) if recipient doesn't own it.
 */
export const getNotificationById = async (
  recipientId: string,
  notificationId: string,
): Promise<ReturnType<typeof buildNotificationResponse>> => {
  logger.info(
    { recipientId, notificationId },
    "Retrieving specific notification by ID...",
  );

  // Retrieve using helper
  const notification = await getOwnedNotification(recipientId, notificationId);

  logger.info(
    { recipientId, notificationId },
    "Specific notification retrieved successfully.",
  );

  return buildNotificationResponse(notification);
};

// ==========================================
// Notification Updates
// ==========================================

/**
 * Marks a notification as read after validating ownership.
 *
 * @param recipientId - The ID of the requesting user.
 * @param notificationId - The ID of the notification to modify.
 * @returns A promise that resolves to the updated formatted notification.
 * @throws ErrorHandler (404) if not found, or (403) if recipient doesn't own it.
 */
export const markAsRead = async (
  recipientId: string,
  notificationId: string,
): Promise<ReturnType<typeof buildNotificationResponse>> => {
  logger.info(
    { recipientId, notificationId },
    "Marking notification as read...",
  );

  // Retrieve hydrated document to support modifications and save()
  const notification = await getOwnedNotification(recipientId, notificationId);

  if (notification.isRead) {
    logger.info(
      { recipientId, notificationId },
      "Notification is already read. Returning.",
    );
    return buildNotificationResponse(notification);
  }

  markNotificationAsRead(notification);
  await notification.save();

  logger.info(
    { recipientId, notificationId },
    "Notification marked as read and saved successfully.",
  );

  return buildNotificationResponse(notification);
};

/**
 * Marks all unread notifications for a recipient as read.
 *
 * @param recipientId - The ID of the recipient user.
 * @returns A promise that resolves to the count of modified documents.
 */
export const markAllAsRead = async (
  recipientId: string,
): Promise<{ modifiedCount: number }> => {
  logger.info(
    { recipientId },
    "Marking all notifications as read for recipient...",
  );

  const filter: QueryFilter<INotification> = {
    recipientId,
    isRead: false,
    isDeleted: false,
  };

  const result = await Notification.updateMany(filter, {
    $set: {
      isRead: true,
      readAt: new Date(),
    },
  });

  logger.info(
    { recipientId, modifiedCount: result.modifiedCount },
    "All notifications marked as read successfully.",
  );

  return { modifiedCount: result.modifiedCount };
};

// ==========================================
// Notification Deletion
// ==========================================

/**
 * Soft-deletes a notification after validating ownership.
 *
 * @param recipientId - The ID of the requesting user.
 * @param notificationId - The ID of the notification to delete.
 * @returns A promise that resolves to a success response.
 * @throws ErrorHandler (404) if not found, or (403) if recipient doesn't own it.
 */
export const deleteNotification = async (
  recipientId: string,
  notificationId: string,
): Promise<{ success: boolean; message: string }> => {
  logger.info({ recipientId, notificationId }, "Soft-deleting notification...");

  // Retrieve hydrated document to support modifications and save()
  const notification = await getOwnedNotification(recipientId, notificationId);

  notification.isDeleted = true;
  notification.deletedAt = new Date();
  await notification.save();

  logger.info(
    { recipientId, notificationId },
    "Notification soft-deleted successfully.",
  );

  return {
    success: true,
    message: "Notification deleted successfully.",
  };
};

// ==========================================
// Broadcast
// ==========================================

/**
 * Broadcasts a notification to all users matching a specified recipient type (role).
 *
 * @param recipientType - The user role type (e.g. CUSTOMER, RESTAURANT).
 * @param title - The notification title.
 * @param message - The notification message.
 * @param type - The type of notification (enum).
 * @param channels - Optional channels to dispatch notifications through.
 * @param priority - Optional notification priority level.
 * @returns A promise that resolves to the list of created notification documents.
 */
export const broadcastNotification = async (
  recipientType: NotificationRecipientType,
  title: string,
  message: string,
  type: NotificationType,
  channels?: NotificationChannel[],
  priority?: NotificationPriority,
): Promise<INotification[]> => {
  logger.info(
    { recipientType, type },
    "Broadcasting notification to all users of recipient type...",
  );

  const targetRole = recipientRoleMap[recipientType];

  // Fetch all users with role matching recipientType using lean() read optimization
  const users = await User.find({ role: targetRole }).select("_id").lean();

  if (users.length === 0) {
    logger.warn(
      { recipientType },
      "No users found with matching role to broadcast notification.",
    );
    return [];
  }

  logger.info(
    { recipientType, totalNotifications: users.length },
    `Found ${users.length} users to receive the broadcast. Generating payloads...`,
  );

  // Build NotifyOptions for each user
  const notifications: NotifyOptions[] = users.map((user) => ({
    recipientId: user._id.toString(),
    recipientType,
    title,
    message,
    type,
    channels,
    priority,
  }));

  // Delegate dispatching to the existing createBulkNotifications
  const results = await createBulkNotifications(notifications);

  logger.info(
    { recipientType, totalNotifications: results.length },
    "Broadcast notifications queued successfully.",
  );

  return results;
};
