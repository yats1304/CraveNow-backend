import { getIO } from "./socket.js";
import {
  getCustomerRoom,
  getRestaurantRoom,
  getRiderRoom,
  getOrderRoom,
  getAdminRoom,
} from "./rooms.js";
import { DeliveryStatus, NotificationRecipientType } from "../types/index.js";

/**
 * Restaurant
 */

export const emitNewOrder = (restaurantId: string, orderId: string) => {
  const io = getIO();

  io.to(getRestaurantRoom(restaurantId)).emit("new:order", {
    orderId,
  });
};

/**
 * Customer
 */

export const emitOrderCreated = (userId: string, orderId: string) => {
  const io = getIO();

  io.to(getCustomerRoom(userId)).emit("order:created", {
    orderId,
  });
};

export const emitOrderAccepted = (userId: string, orderId: string) => {
  const io = getIO();

  io.to(getCustomerRoom(userId)).emit("order:accepted", {
    orderId,
  });
};

export const emitOrderPreparing = (userId: string, orderId: string) => {
  const io = getIO();

  io.to(getCustomerRoom(userId)).emit("order:preparing", {
    orderId,
  });
};

export const emitOrderReady = (userId: string, orderId: string) => {
  const io = getIO();

  io.to(getCustomerRoom(userId)).emit("order:ready", {
    orderId,
  });
};

/**
 * Rider
 */

export const emitRiderAssigned = (
  deliveryPartnerId: string,
  deliveryId: string,
  orderId: string,
) => {
  const io = getIO();

  io.to(getRiderRoom(deliveryPartnerId)).emit("delivery:assigned", {
    deliveryId,
    orderId,
  });
};

export const emitDeliveryCancelled = (
  deliveryPartnerId: string,
  deliveryId: string,
) => {
  const io = getIO();

  io.to(getRiderRoom(deliveryPartnerId)).emit("delivery:cancelled", {
    deliveryId,
  });
};

export const emitDeliveryUpdated = (
  deliveryPartnerId: string,
  deliveryId: string,
  status: DeliveryStatus,
) => {
  const io = getIO();

  io.to(getRiderRoom(deliveryPartnerId)).emit("delivery:updated", {
    deliveryId,
    status,
  });
};

/**
 * Live Tracking
 */

export const emitDeliveryLocation = (
  orderId: string,
  latitude: number,
  longitude: number,
  heading?: number,
  speed?: number,
) => {
  const io = getIO();

  io.to(getOrderRoom(orderId)).emit("delivery:location", {
    deliveryId: orderId,
    latitude,
    longitude,
    heading,
    speed,
  });
};

/**
 * Completion
 */

export const emitDeliveryCompleted = (orderId: string, deliveryId: string) => {
  const io = getIO();

  io.to(getOrderRoom(orderId)).emit("delivery:completed", {
    orderId,
    deliveryId,
  });
};

/**
 * Generic Error
 */

export const emitSocketError = (room: string, message: string) => {
  const io = getIO();

  io.to(room).emit("socket:error", {
    message,
  });
};

/**
 * Emit generic notification to recipient room
 */
export const emitNotification = (notification: any) => {
  const io = getIO();
  let room = "";

  switch (notification.recipientType) {
    case NotificationRecipientType.CUSTOMER:
      room = getCustomerRoom(notification.recipientId.toString());
      break;
    case NotificationRecipientType.RESTAURANT:
      room = getRestaurantRoom(notification.recipientId.toString());
      break;
    case NotificationRecipientType.DELIVERY_PARTNER:
      room = getRiderRoom(notification.recipientId.toString());
      break;
    case NotificationRecipientType.ADMIN:
      room = getAdminRoom();
      break;
  }

  if (room) {
    io.to(room).emit("notification:received", notification);
  }
};

