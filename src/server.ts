import { env } from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { logger } from "./config/logger.js";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";
import {
  initNotificationWorker,
  shutdownNotificationWorker,
} from "./notification/notification.worker.js";

const PORT = env.PORT;

await connectDB();
await connectRedis();

// Start the background notification worker
initNotificationWorker();

const server = createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");

    try {
      // Gracefully close BullMQ worker (completes current jobs, stops fetching new ones)
      await shutdownNotificationWorker();

      // Close database connection
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close();
      logger.info("MongoDB connection closed.");

      // Close Redis connection
      const { redisClient } = await import("./config/redis.js");
      await redisClient.quit();
      logger.info("Redis connection closed.");

      logger.info("Graceful shutdown completed successfully.");
      process.exit(0);
    } catch (err) {
      logger.error(err, "Error during graceful shutdown");
      process.exit(1);
    }
  });

  // Force termination after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

