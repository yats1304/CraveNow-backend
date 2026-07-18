export interface ServiceStatus {
  mongodb: string;
  redis: string;
  bullmq: string;
}

export interface MemoryUsage {
  rss: string;
  heapUsed: string;
  heapTotal: string;
}

export interface HealthResponse {
  success: boolean;
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  nodeVersion: string;
  pid: number;
  memory: MemoryUsage;
  services: ServiceStatus;
}

export interface ReadinessResponse {
  status: "ready" | "not_ready";
}

export interface LivenessResponse {
  status: "alive";
}
