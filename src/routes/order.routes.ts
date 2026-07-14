import express from "express";
import * as orderController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import {
  cancelOrderSchema,
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from "../validators/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { UserRole } from "../types/index.js";

const router = express.Router();

router.post(
  "/",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(createOrderSchema),
  orderController.createOrder,
);

router.get(
  "/",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  orderController.getMyOrders,
);

// RESTAURANT APIs

router.get(
  "/restaurant",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  orderController.getRestaurantOrders,
);

router.get(
  "/restaurant/:orderId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(orderIdParamSchema, "params"),
  orderController.getRestaurantOrderById,
);

router.patch(
  "/restaurant/:orderId/status",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(orderIdParamSchema, "params"),
  validate(updateOrderStatusSchema),
  orderController.updateRestaurantOrderStatus,
);

// UPTO THIS

router.get(
  "/:orderId",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(orderIdParamSchema, "params"),
  orderController.getOrderById,
);

router.patch(
  "/:orderId/cancel",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(orderIdParamSchema, "params"),
  validate(cancelOrderSchema),
  orderController.cancelOrder,
);

export default router;
