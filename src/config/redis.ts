import { env } from "./env.js";
import { createClient } from "redis";
import { logger } from "./logger.js";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("connect", () => {
  logger.info("Successfully connected to Redis✅");
});

redisClient.on("error", (err) => {
  logger.error(err, "Failed to connect to Redis❌");
});

export const connectRedis = async () => {
  await redisClient.connect();
};
