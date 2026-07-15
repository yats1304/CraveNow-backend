import { env } from "./env.js";
import mongoose from "mongoose";
import { logger } from "./logger.js";

export const connectDB = async () => {
  try {
    logger.info("Starting MongoDB connection attempt...");
    await mongoose.connect(env.MONGODB_URI, {
      dbName: "CraveNow",
    });
    logger.info("Successfully connected to MongoDB✅");
  } catch (error) {
    logger.error(error, "Failed to connect to MongoDB❌");
  }
};
