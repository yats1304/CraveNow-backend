import { Socket } from "socket.io";
import { logger } from "../config/logger.js";

const connections = new Map<string, Set<string>>();

/**
 * Register a new socket connection.
 */
export const addConnection = (userId: string, socket: Socket) => {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }

  connections.get(userId)!.add(socket.id);

  logger.info(
    {
      userId,
      socketId: socket.id,
      totalConnections: connections.get(userId)?.size,
    },
    "Socket connection added",
  );
};

/**
 * Remove a socket connection.
 */
export const removeConnection = (userId: string, socketId: string) => {
  const sockets = connections.get(userId);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    connections.delete(userId);
  }

  logger.info(
    {
      userId,
      socketId,
      remainingConnections: sockets.size,
    },
    "Socket connection removed",
  );
};

/**
 * Get all socket IDs for a user.
 */
export const getConnections = (userId: string): string[] => {
  return [...(connections.get(userId) ?? [])];
};

/**
 * Check if a user is online.
 */
export const isUserOnline = (userId: string): boolean => {
  return connections.has(userId);
};

/**
 * Get total connected users.
 */
export const getOnlineUsersCount = (): number => {
  return connections.size;
};

/**
 * Get total socket connections.
 */
export const getTotalConnections = (): number => {
  let total = 0;

  for (const sockets of connections.values()) {
    total += sockets.size;
  }

  return total;
};

/**
 * Remove every connection.
 * Useful during graceful shutdown.
 */
export const clearConnections = () => {
  connections.clear();

  logger.info("Socket connections cleared");
};

/**
 * Remove a socket ID from all registered connections (useful on disconnect).
 */
export const removeSocketFromAll = (socketId: string): void => {
  for (const [userId, sockets] of connections.entries()) {
    if (sockets.has(socketId)) {
      removeConnection(userId, socketId);
    }
  }
};
