import { INotification } from "../../interfaces/index.js";
import { emitNotification } from "../../socket/emitters.js";
import { NotificationChannelHandler } from "../notification.processor.js";

/**
 * Delivery channel for dispatching Socket.IO notifications.
 */
export const SocketChannel: NotificationChannelHandler = {
  /**
   * Sends a real-time notification via Socket.IO.
   *
   * @param notification - The notification details.
   */
  async send(notification: INotification): Promise<void> {
    emitNotification(notification);
  },
};
