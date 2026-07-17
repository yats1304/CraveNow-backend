import { INotification } from "../../interfaces/index.js";
import { logger } from "../../config/logger.js";
import { NotificationChannelHandler } from "../notification.processor.js";
import { sendMail } from "../../utils/mail.js";
import { User } from "../../models/user.model.js";
import { AccountStatus } from "../../types/user.types.js";

/**
 * Delivery channel for dispatching Email notifications.
 */
export const EmailChannel: NotificationChannelHandler = {
  /**
   * Sends an email notification.
   *
   * @param notification - The notification details.
   */
  async send(notification: INotification): Promise<void> {
    const recipientIdStr = notification.recipientId.toString();
    const notificationIdStr = notification._id.toString();

    logger.info(
      { notificationId: notificationIdStr, recipientId: recipientIdStr },
      "Fetching recipient user email details...",
    );

    const user = await User.findOne({
      _id: notification.recipientId,
      status: AccountStatus.ACTIVE,
    })
      .select("email")
      .lean();

    if (!user || !user.email) {
      logger.warn(
        { notificationId: notificationIdStr, recipientId: recipientIdStr },
        "Could not dispatch email: Recipient user or email not found.",
      );
      return;
    }

    logger.info(
      {
        notificationId: notificationIdStr,
        recipientId: recipientIdStr,
        email: user.email,
      },
      "Sending email notification...",
    );

    await sendMail({
      to: user.email,
      subject: notification.title,
      html: notification.message,
    });

    logger.info(
      {
        notificationId: notificationIdStr,
        recipientId: recipientIdStr,
        email: user.email,
      },
      "Email notification dispatched successfully.",
    );
  },
};
