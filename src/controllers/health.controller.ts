import { Request, Response } from "express";
import { healthService } from "../services/health.service.js";
import { TryCatch } from "../utils/index.js";

/**
 * Controller endpoint returning complete health metrics.
 *
 * @route GET /health
 * @returns 200 on healthy status, 503 if any check fails.
 */
export const getHealth = TryCatch(async (req: Request, res: Response) => {
  const result = await healthService.getHealthDetails();

  const statusCode = result.success ? 200 : 503;
  return res.status(statusCode).json(result);
});

/**
 * Controller endpoint for simple liveness probe checks.
 *
 * @route GET /health/live
 * @returns 200 status alive.
 */
export const getLiveness = TryCatch(async (req: Request, res: Response) => {
  return res.status(200).json({
    status: "alive",
  });
});

/**
 * Controller endpoint for readiness probe checks.
 *
 * @route GET /health/ready
 * @returns 200 when ready, 503 if not ready.
 */
export const getReadiness = TryCatch(async (req: Request, res: Response) => {
  const result = await healthService.checkReadiness();

  const statusCode = result.status === "ready" ? 200 : 503;
  return res.status(statusCode).json(result);
});
