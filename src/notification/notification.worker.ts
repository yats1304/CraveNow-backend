import { Worker, Job } from "bullmq";
import { queueConfig } from "../config/queue.js";
import { NOTIFICATION_QUEUE_NAME } from "./notification.queue.js";
import { Notification } from "../models/index.js";
import { NotificationProcessor } from "./notification.processor.js";
import { logger } from "../config/logger.js";

/**
 * Interface defining the expected job payload structure for notification tasks.
 */
export interface NotificationJobData {
  notificationId: string;
}

let worker: Worker<NotificationJobData, void, string> | null = null;

/**
 * Initializes and returns the singleton BullMQ Worker for notification processing.
 * Binds extensive lifecycle event listeners with structured logging.
 *
 * @returns The singleton Worker instance.
 */
export const initNotificationWorker = (): Worker<NotificationJobData, void, string> => {
  if (worker) {
    return worker;
  }

  logger.info("Initializing Notification Worker...");

  // Typed worker specifying JobData, ReturnValue, and JobName generic types
  worker = new Worker<NotificationJobData, void, string>(
    NOTIFICATION_QUEUE_NAME,
    async (job: Job<NotificationJobData, void, string>) => {
      const { notificationId } = job.data;
      const jobId = job.id;

      logger.info(
        { jobId, notificationId },
        "Processing notification job in worker started"
      );

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        const errorMsg = `Notification not found in DB: ${notificationId}`;
        logger.error({ jobId, notificationId }, errorMsg);
        throw new Error(errorMsg);
      }

      // Delegate processing to processor, passing jobId for log tracing
      await NotificationProcessor.process(notification, jobId);
    },
    {
      connection: queueConfig.connection,
      concurrency: queueConfig.worker.concurrency,
    },
  );

  // Worker lifecycle listeners with detailed structured logging

  worker.on("active", (job: Job<NotificationJobData, void, string>) => {
    logger.info(
      {
        jobId: job.id,
        notificationId: job.data.notificationId,
        attempt: job.attemptsMade + 1,
      },
      `Job ${job.id} is now active`
    );
  });

  worker.on("completed", (job: Job<NotificationJobData, void, string>) => {
    logger.info(
      {
        jobId: job.id,
        notificationId: job.data.notificationId,
        attempts: job.attemptsMade,
      },
      `Job ${job.id} completed successfully`
    );
  });

  worker.on("failed", (job: Job<NotificationJobData, void, string> | undefined, error: Error) => {
    const attemptsMade = job?.attemptsMade ?? 0;
    const maxAttempts = job?.opts?.attempts ?? 5; // Default attempts is 5

    if (attemptsMade < maxAttempts) {
      logger.warn(
        {
          jobId: job?.id,
          notificationId: job?.data?.notificationId,
          attemptsMade,
          maxAttempts,
          error: error.message,
        },
        "Notification job failed. Retrying automatically..."
      );
    } else {
      logger.error(
        {
          jobId: job?.id,
          notificationId: job?.data?.notificationId,
          attemptsMade,
          maxAttempts,
          error: error.message,
        },
        "Notification job failed permanently (max retries reached)."
      );
    }
  });

  worker.on("stalled", (jobId: string, prev: string) => {
    logger.warn(
      { jobId, prev },
      `Job ${jobId} has stalled (previous state: ${prev})`
    );
  });

  worker.on("error", (error: Error) => {
    logger.error(
      { error: error.message },
      "Notification worker encountered a global connection or operational error"
    );
  });

  worker.on("drained", () => {
    logger.info("Notification worker queue is fully drained (no remaining jobs)");
  });

  worker.on("closing", () => {
    logger.info("Notification worker is closing...");
  });

  return worker;
};

/**
 * Gracefully shuts down the notification worker.
 * Stops accepting new jobs and waits for active jobs to complete.
 *
 * @returns A promise that resolves when the worker has fully closed.
 */
export const shutdownNotificationWorker = async (): Promise<void> => {
  if (worker) {
    logger.info("Shutting down Notification Worker gracefully (allowing active jobs to finish, accepting no new jobs)...");
    try {
      // Calling close() with the default parameter waits for currently active jobs to finish
      await worker.close();
      worker = null;
      logger.info("Notification Worker shut down completely and cleanly.");
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Error occurred during Notification Worker shutdown"
      );
      throw error;
    }
  }
};
