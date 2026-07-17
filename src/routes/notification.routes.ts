import express from "express";
import * as notificationController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getNotificationsSchema,
  notificationIdParams,
  broadcastNotificationSchema,
} from "../validators/index.js";

const router = express.Router();

router.get(
  "/",
  isAuth,
  validate(getNotificationsSchema, "query"),
  notificationController.getNotifications,
);

router.post(
  "/broadcast",
  isAuth,
  authorizeRoles(UserRole.ADMIN),
  validate(broadcastNotificationSchema, "body"),
  notificationController.broadcastNotification,
);

router.patch("/read-all", isAuth, notificationController.markAllAsRead);

router.get(
  "/:notificationId",
  isAuth,
  validate(notificationIdParams, "params"),
  notificationController.getNotificationById,
);

router.patch(
  "/:notificationId/read",
  isAuth,
  validate(notificationIdParams, "params"),
  notificationController.markAsRead,
);

router.delete(
  "/:notificationId",
  isAuth,
  validate(notificationIdParams, "params"),
  notificationController.deleteNotification,
);

export default router;
