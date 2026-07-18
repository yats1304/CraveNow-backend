import express from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/index.js";
import { serverAdapter } from "../config/bull-board.js";

const router = express.Router();

router.use(isAuth, authorizeRoles(UserRole.ADMIN), serverAdapter.getRouter());

export default router;
