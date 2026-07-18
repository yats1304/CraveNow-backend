import { env } from "./env.js";
import { corsOptions } from "./cors.js";

export const validateSecurityEnv = (): void => {
  const criticalVars = [
    "PORT",
    "MONGODB_URI",
    "REDIS_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
  ];

  for (const key of criticalVars) {
    if (!process.env[key]) {
      throw new Error(
        `[Security] Critical environment variable is missing: ${key}. Startup aborted.`,
      );
    }
  }
};

export const getCookieOptions = () => {
  const isProd = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "strict" : "lax") as "strict" | "lax" | "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };
};

export const getSocketCorsOptions = () => {
  return {
    origin: corsOptions.origin,
    methods: corsOptions.methods as string[],
    allowedHeaders: corsOptions.allowedHeaders as string[],
    credentials: corsOptions.credentials,
  };
};
