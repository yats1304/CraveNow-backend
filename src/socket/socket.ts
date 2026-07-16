import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socketTypes.js";
import { socketAuthMiddleware } from "./socketAuth.js";
import { registerSocketEvents } from "./socketEvents.js";

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL || "*",
      credentials: true,
      methods: ["GET", "POST"],
    },

    transports: ["websocket", "polling"],
  });

  // Register authentication middleware
  io.use(socketAuthMiddleware);

  logger.info("Socket.IO server initialized");

  io.on("connection", (socket) => {
    logger.info(
      {
        socketId: socket.id,
      },
      "Socket connected",
    );

    registerSocketEvents(socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};

export const closeSocket = (): Promise<void> => {
  return new Promise((resolve) => {
    if (io) {
      logger.info("Closing Socket.IO server...");
      io.close(() => {
        logger.info("Socket.IO server closed cleanly");
        resolve();
      });
    } else {
      resolve();
    }
  });
};
