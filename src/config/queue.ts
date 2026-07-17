import { env } from "./env.js";
import { ConnectionOptions } from "bullmq";

/**
 * Safely parses REDIS_URL into ConnectionOptions for BullMQ/ioredis.
 * Ensures maxRetriesPerRequest is set to null, as required by BullMQ.
 */
const parseRedisUrl = (redisUrl: string): ConnectionOptions => {
  try {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      db: parsed.pathname && parsed.pathname.length > 1 ? parseInt(parsed.pathname.substring(1), 10) : undefined,
      maxRetriesPerRequest: null,
    };
  } catch (error) {
    return {
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

export const queueConfig = {
  connection: parseRedisUrl(env.REDIS_URL),
  defaultJobOptions: {
    attempts: Number(process.env.QUEUE_RETRIES) || 5,
    backoff: {
      type: "exponential",
      delay: Number(process.env.QUEUE_BACKOFF_DELAY) || 2000,
    },
    removeOnComplete: {
      count: Number(process.env.QUEUE_REMOVE_ON_COMPLETE_COUNT) || 1000,
    },
    removeOnFail: {
      count: Number(process.env.QUEUE_REMOVE_ON_FAIL_COUNT) || 5000,
    },
  },
  worker: {
    concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
  },
};
