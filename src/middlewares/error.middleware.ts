import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/index.js";
import { logger } from "../config/logger.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err instanceof ErrorHandler ? err.statusCode : 500;
  const message = err instanceof ErrorHandler ? err.message : "Internal server error";

  const errorMeta = {
    method: req.method,
    url: req.url,
    statusCode,
    userId: req.user?.userId,
    stack: err instanceof Error ? err.stack : undefined,
  };

  if (statusCode >= 500) {
    logger.error(err, `Unhandled error: ${message}`, errorMeta);
  } else {
    logger.warn(err, `Request error: ${message}`, errorMeta);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
