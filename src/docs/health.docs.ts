export const healthSchemas = {
  HealthResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      status: { type: "string", example: "healthy" },
      timestamp: { type: "string", format: "date-time", example: "2026-07-17T12:00:00.000Z" },
      uptime: { type: "integer", example: 12534 },
      environment: { type: "string", example: "development" },
      nodeVersion: { type: "string", example: "v20.10.0" },
      pid: { type: "integer", example: 1234 },
      memory: {
        type: "object",
        properties: {
          rss: { type: "string", example: "45.2 MB" },
          heapUsed: { type: "string", example: "22.1 MB" },
          heapTotal: { type: "string", example: "30.5 MB" }
        }
      },
      services: {
        type: "object",
        properties: {
          mongodb: { type: "string", example: "connected" },
          redis: { type: "string", example: "connected" },
          bullmq: { type: "string", example: "connected" }
        }
      }
    }
  },
  ReadinessResponse: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["ready", "not_ready"], example: "ready" }
    }
  },
  LivenessResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "alive" }
    }
  }
};

export const healthPaths = {
  "/health": {
    get: {
      summary: "System Health details check",
      description: "Queries all backend dependencies (MongoDB, Redis, BullMQ) and returns process uptime and memory usage metrics.",
      tags: ["Health Check"],
      security: [],
      responses: {
        200: {
          description: "All services are healthy.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HealthResponse" }
            }
          }
        },
        503: {
          description: "One or more dependencies are unhealthy.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HealthResponse" }
            }
          }
        }
      }
    }
  },
  "/health/live": {
    get: {
      summary: "Liveness probe status check",
      description: "A lightweight ping check to confirm that the server process is alive and running.",
      tags: ["Health Check"],
      security: [],
      responses: {
        200: {
          description: "Service is alive.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LivenessResponse" }
            }
          }
        }
      }
    }
  },
  "/health/ready": {
    get: {
      summary: "Readiness probe connection check",
      description: "Verifies the application is fully connected to MongoDB, Redis, and BullMQ and ready to receive API requests.",
      tags: ["Health Check"],
      security: [],
      responses: {
        200: {
          description: "Service is ready to handle traffic.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReadinessResponse" }
            }
          }
        },
        503: {
          description: "Service is not ready (one or more backend dependencies are down).",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReadinessResponse" }
            }
          }
        }
      }
    }
  }
};
