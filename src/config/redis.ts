import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
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
