import { Socket } from "socket.io";
import { logger } from "../config/logger.js";
import {
  joinCustomerRoom,
  joinRestaurantRoom,
  joinRiderRoom,
  joinOrderRoom,
  leaveRoom,
  leaveAllRooms,
} from "./rooms.js";
import { addConnection, removeConnection } from "./socketManager.js";

export const registerSocketEvents = (socket: Socket) => {
  /**
   * Register Connection
   */
  addConnection(socket.data.userId, socket);

  logger.info(
    {
      socketId: socket.id,
      userId: socket.data.userId,
      role: socket.data.role,
    },
    "Socket connected",
  );

  /**
   * Ping
   */
  socket.on("ping", () => {
    socket.emit("pong");
  });

  /**
   * Customer Room
   */
  socket.on("joinCustomerRoom", (userId) => {
    joinCustomerRoom(socket, userId);
  });

  /**
   * Restaurant Room
   */
  socket.on("joinRestaurantRoom", (restaurantId) => {
    joinRestaurantRoom(socket, restaurantId);
  });

  /**
   * Rider Room
   */
  socket.on("joinRiderRoom", (deliveryPartnerId) => {
    joinRiderRoom(socket, deliveryPartnerId);
  });

  /**
   * Order Room
   */
  socket.on("joinOrderRoom", (orderId) => {
    joinOrderRoom(socket, orderId);
  });

  /**
   * Leave Room
   */
  socket.on("leaveRoom", (room) => {
    leaveRoom(socket, room);
  });

  /**
   * Rider Location Updates
   *
   * TODO:
   * Save location into RiderLocation collection.
   *
   * TODO:
   * Broadcast location to customers tracking this order.
   */
  socket.on("updateLocation", (location) => {
    logger.info(
      {
        socketId: socket.id,
        userId: socket.data.userId,
        location,
      },
      "Location update received",
    );
  });

  /**
   * Socket Errors
   */
  socket.on("error", (error) => {
    logger.error(
      {
        socketId: socket.id,
        error,
      },
      "Socket error",
    );
  });

  /**
   * Disconnect
   */
  socket.on("disconnect", (reason) => {
    leaveAllRooms(socket);

    removeConnection(socket.data.userId, socket.id);

    logger.info(
      {
        socketId: socket.id,
        userId: socket.data.userId,
        reason,
      },
      "Socket disconnected",
    );
  });
};
