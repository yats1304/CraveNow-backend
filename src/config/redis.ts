import { env } from "./env.js";
import { createClient } from "redis";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("Successfully connected to Redis✅");
});

redisClient.on("error", (err) => {
  console.log("Fail to connect Redis❌", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
};
