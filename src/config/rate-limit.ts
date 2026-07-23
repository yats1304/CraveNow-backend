import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";
import { logger } from "./logger.js";
import { ErrorHandler } from "../utils/errorHandler.js";

const createLimiter = (
  windowMs: number,
  max: number,
  message: string,
  limitType: string,
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    handler: (req, res, next) => {
      logger.warn(
        {
          ip: req.ip,
          path: req.path,
          method: req.method,
          userId: req.user?.userId,
          limitType,
        },
        `[Security] Rate limit exceeded: ${message}`,
      );

      next(new ErrorHandler(429, message));
    },
  });
};

export const globalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests from this IP, please try again after 15 minutes.",
  "GLOBAL",
);

export const authLimiter = createLimiter(
  60 * 1000,
  5,
  "Too many authentication attempts. Please try again after a minute.",
  "AUTH",
);

export const passwordResetLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many password reset attempts. Please try again after 15 minutes.",
  "PASSWORD_RESET",
);

export const uploadLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many upload requests. Please try again after 15 minutes.",
  "UPLOAD",
);

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => (hits - 50) * 500,
  maxDelayMs: 10000,
});
