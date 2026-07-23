import { Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { logger } from "../config/logger.js";

export const hppMiddleware = hpp();

const sanitize = mongoSanitize();

export const mongoSanitizeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.query) {
    Object.defineProperty(req, "query", {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  sanitize(req, res, next);
};

export const securityAuditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const queryString = JSON.stringify(req.query || {});
  const bodyString = JSON.stringify(req.body || {});

  const hasSuspiciousOperators =
    (queryString && queryString.includes("$")) || 
    (bodyString && bodyString.includes("$"));

  if (hasSuspiciousOperators) {
    logger.warn(
      {
        ip: req.ip,
        method: req.method,
        url: req.url,
        query: req.query,
        userId: req.user?.userId,
      },
      "[Security Audit] Suspicious NoSQL characters detected in payload.",
    );
  }

  next();
};
