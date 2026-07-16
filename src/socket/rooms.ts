import { Socket } from "socket.io";
import { logger } from "../config/logger.js";

/**
 * Room Name Helpers
 */
export const getCustomerRoom = (userId: string) => `customer:${userId}`;

export const getRestaurantRoom = (restaurantId: string) =>
  `restaurant:${restaurantId}`;

export const getRiderRoom = (deliveryPartnerId: string) =>
  `rider:${deliveryPartnerId}`;

export const getOrderRoom = (orderId: string) => `order:${orderId}`;

export const getAdminRoom = () => "admin";

/**
 * Customer Room
 */

export const joinAdminRoom = (socket: Socket) => {
  const room = getAdminRoom();

  socket.join(room);

  logger.info(
    {
      socketId: socket.id,
      room,
    },
    "Joined admin room",
  );
};

export const joinCustomerRoom = (socket: Socket, userId: string) => {
  const room = getCustomerRoom(userId);

  socket.join(room);

  logger.info(
    {
      socketId: socket.id,
      room,
    },
    "Joined customer room",
  );
};

/**
 * Restaurant Room
 */
export const joinRestaurantRoom = (socket: Socket, restaurantId: string) => {
  const room = getRestaurantRoom(restaurantId);

  socket.join(room);

  logger.info(
    {
      socketId: socket.id,
      room,
    },
    "Joined restaurant room",
  );
};

/**
 * Rider Room
 */
export const joinRiderRoom = (socket: Socket, deliveryPartnerId: string) => {
  const room = getRiderRoom(deliveryPartnerId);

  socket.join(room);

  logger.info(
    {
      socketId: socket.id,
      room,
    },
    "Joined rider room",
  );
};

/**
 * Order Room
 */
export const joinOrderRoom = (socket: Socket, orderId: string) => {
  const room = getOrderRoom(orderId);

  socket.join(room);

  logger.info(
    {
      socketId: socket.id,
      room,
    },
    "Joined order room",
  );
};

/**
 * Leave Room
 */
export const leaveRoom = (socket: Socket, room: string) => {
  socket.leave(room);

  logger.info(
    {
      socketId: socket.id,
      room,
    },
    "Left room",
  );
};

/**
 * Leave All Rooms
 * (except the socket's own room)
 */
export const leaveAllRooms = (socket: Socket) => {
  socket.rooms.forEach((room) => {
    if (room !== socket.id) {
      socket.leave(room);
    }
  });

  logger.info(
    {
      socketId: socket.id,
    },
    "Left all rooms",
  );
};
