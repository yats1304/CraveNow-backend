import dotenv from "dotenv";
import { ErrorHandler } from "../utils/errorHandler.js";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGODB_URI",
  "REDIS_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
  "GOOGLE_CLIENT_ID",
  "SMTP_HOST",
  "SMTP_PORT",
  "MAIL_ID",
  "MAIL_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new ErrorHandler(
      500,
      `Missing required environment variable: ${key}`,
    );
  }
}

export const env = {
  PORT: Number(process.env.PORT),
  MONGODB_URI: process.env.MONGODB_URI!,
  REDIS_URL: process.env.REDIS_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  MAIL_ID: process.env.MAIL_ID!,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET!,
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
