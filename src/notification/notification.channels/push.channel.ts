import { INotification } from "../../interfaces/index.js";
import { logger } from "../../config/logger.js";
import { NotificationChannelHandler } from "../notification.processor.js";

/**
 * Delivery channel for dispatching Push notifications.
 */
export const PushChannel: NotificationChannelHandler = {
  /**
   * Sends a push notification.
   *
   * @param notification - The notification details.
   */
  async send(notification: INotification): Promise<void> {
    // TODO: Implement Firebase Cloud Messaging push notification delivery
    logger.info(
      { notificationId: notification._id.toString(), recipientId: notification.recipientId.toString() },
      "Push notification placeholder triggered successfully",
    );
  },
};
