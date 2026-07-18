import { Express } from "express";
import { logger } from "./logger.js";

export const configureTrustProxy = (app: Express): void => {
  const trustProxy = process.env.TRUST_PROXY || "true";

  if (trustProxy === "true" || trustProxy === "1") {
    app.set("trust proxy", true);
    logger.info("[Security] Express trust proxy enabled (value: true)");
  } else {
    app.set("trust proxy", trustProxy);
    logger.info(`[Security] Express trust proxy set to: ${trustProxy}`);
  }
};
export default configureTrustProxy;
