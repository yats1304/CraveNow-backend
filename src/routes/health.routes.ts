import express from "express";
import * as healthController from "../controllers/health.controller.js";

const router = express.Router();

// GET /health - Complete system status health metrics check
router.get("/", healthController.getHealth);

// GET /health/live - Liveness probe status check
router.get("/live", healthController.getLiveness);

// GET /health/ready - Readiness probe check for all backend system connections
router.get("/ready", healthController.getReadiness);

export default router;
