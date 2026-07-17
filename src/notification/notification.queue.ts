import { Queue, QueueOptions } from "bullmq";
import { queueConfig } from "../config/queue.js";

/**
 * Name of the BullMQ queue for notification jobs.
 */
export const NOTIFICATION_QUEUE_NAME = "notification-queue";

/**
 * Improved configuration options for the notification queue.
 * Ensures connection reuse, exponential backoff on retry failure,
 * and automatic deletion of finished job data to prevent memory issues in Redis.
 */
const queueOptions: QueueOptions = {
  // Reuses the pre-parsed ConnectionOptions from queueConfig to avoid opening redundant connections
  connection: queueConfig.connection,

  defaultJobOptions: {
    // Number of attempts to try a failed job before marking it as permanently failed
    attempts: queueConfig.defaultJobOptions.attempts,

    // Configures exponential backoff delay to reduce strain on external downstream providers during outages
    backoff: queueConfig.defaultJobOptions.backoff,

    // Automatically removes successfully completed jobs to prevent Redis database bloat
    removeOnComplete: queueConfig.defaultJobOptions.removeOnComplete,

    // Automatically removes failed jobs beyond a certain threshold to limit memory consumption
    removeOnFail: queueConfig.defaultJobOptions.removeOnFail,
  },
};

/**
 * Singleton BullMQ Queue instance for dispatching notifications.
 */
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, queueOptions);
