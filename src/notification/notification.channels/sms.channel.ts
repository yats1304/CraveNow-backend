import { INotification } from "../../interfaces/index.js";
import { logger } from "../../config/logger.js";
import { NotificationChannelHandler } from "../notification.processor.js";

/**
 * Delivery channel for dispatching SMS notifications.
 */
export const SmsChannel: NotificationChannelHandler = {
  /**
   * Sends an SMS notification.
   *
   * @param notification - The notification details.
   */
  async send(notification: INotification): Promise<void> {
    // TODO: Implement Twilio SMS delivery
    logger.info(
      { notificationId: notification._id.toString(), recipientId: notification.recipientId.toString() },
      "SMS notification placeholder triggered successfully",
    );
  },
};
