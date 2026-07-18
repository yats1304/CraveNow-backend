import mongoose from "mongoose";
import { redisClient } from "../config/redis.js";
import { notificationQueue } from "../notification/notification.queue.js";

/**
 * Formats a byte number into a human-readable string (e.g. MB, GB).
 *
 * @param bytes - The raw number of bytes.
 * @returns Human-readable formatted string.
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Retrieves the current connectivity status of MongoDB.
 *
 * @returns Connection status string.
 */
export const getMongoStatus = (): string => {
  switch (mongoose.connection.readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "disconnected";
  }
};

/**
 * Retrieves the current connectivity status of the Redis client.
 *
 * @returns Connection status string.
 */
export const getRedisStatus = async (): Promise<string> => {
  try {
    if (!redisClient.isOpen) {
      return "disconnected";
    }
    const pong = await redisClient.ping();
    return pong === "PONG" ? "connected" : "disconnected";
  } catch (err) {
    return "disconnected";
  }
};

/**
 * Retrieves the current connectivity status of the BullMQ Queue.
 *
 * @returns Connection status string.
 */
export const getBullMQStatus = async (): Promise<string> => {
  try {
    const client = (await notificationQueue.client) as any;
    const pong = await client.ping();
    return pong === "PONG" ? "connected" : "disconnected";
  } catch (err) {
    return "disconnected";
  }
};
