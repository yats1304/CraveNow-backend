import { env } from "../config/env.js";
import { HealthResponse, ReadinessResponse } from "../types/health.types.js";
import {
  formatBytes,
  getMongoStatus,
  getRedisStatus,
  getBullMQStatus,
} from "../helpers/health.helper.js";

/**
 * Service class handling system checks and status payloads.
 */
export class HealthService {
  /**
   * Generates a complete health details check.
   *
   * @returns A promise resolving to the health check payload.
   */
  public async getHealthDetails(): Promise<HealthResponse> {
    const mongoStatus = getMongoStatus();
    const redisStatus = await getRedisStatus();
    const bullMQStatus = await getBullMQStatus();

    const isHealthy =
      mongoStatus === "connected" &&
      redisStatus === "connected" &&
      bullMQStatus === "connected";

    const mem = process.memoryUsage();

    return {
      success: isHealthy,
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      pid: process.pid,
      memory: {
        rss: formatBytes(mem.rss),
        heapUsed: formatBytes(mem.heapUsed),
        heapTotal: formatBytes(mem.heapTotal),
      },
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
        bullmq: bullMQStatus,
      },
    };
  }

  /**
   * Verifies all backend systems are ready for traffic.
   *
   * @returns A promise resolving to readiness details.
   */
  public async checkReadiness(): Promise<ReadinessResponse> {
    const mongoStatus = getMongoStatus();
    const redisStatus = await getRedisStatus();
    const bullMQStatus = await getBullMQStatus();

    const isReady =
      mongoStatus === "connected" &&
      redisStatus === "connected" &&
      bullMQStatus === "connected";

    return {
      status: isReady ? "ready" : "not_ready",
    };
  }
}

export const healthService = new HealthService();
