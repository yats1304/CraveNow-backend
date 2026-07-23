import { Express } from "express";
import { logger } from "./logger.js";

export const configureTrustProxy = (app: Express): void => {
  const trustProxyEnv = process.env.TRUST_PROXY;

  if (!trustProxyEnv) {
    app.set("trust proxy", false);
    logger.info("[Security] Express trust proxy disabled (default)");
    return;
  }

  if (trustProxyEnv === "true") {
    app.set("trust proxy", true);
    logger.info("[Security] Express trust proxy enabled (value: true)");
  } else if (trustProxyEnv === "false") {
    app.set("trust proxy", false);
    logger.info("[Security] Express trust proxy disabled");
  } else {
    const num = parseInt(trustProxyEnv, 10);
    if (!isNaN(num)) {
      app.set("trust proxy", num);
      logger.info(`[Security] Express trust proxy set to: ${num} (number of hops)`);
    } else {
      app.set("trust proxy", trustProxyEnv);
      logger.info(`[Security] Express trust proxy set to: ${trustProxyEnv}`);
    }
  }
};
export default configureTrustProxy;
