import pino from "pino";
import { env } from "./env.js";

const isDevelopment = env.NODE_ENV === "development";

export const logger = pino({
  level: env.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
