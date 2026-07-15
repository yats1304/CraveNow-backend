import * as paymentController from "../controllers/index.js";
import express from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/user.types.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPaymentSchema,
  orderIdParams,
  paymentIdParams,
  verifyPaymentSchema,
} from "../validators/payment.validator.js";

const router = express.Router();

router.post(
  "/create-order",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(createPaymentSchema),
  paymentController.createPayment,
);

router.post(
  "/verify",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(verifyPaymentSchema),
  paymentController.verifyPayment,
);

router.get(
  "/order/:orderId",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(orderIdParams, "params"),
  paymentController.getPaymentByOrderId,
);

router.get(
  "/:paymentId",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(paymentIdParams, "params"),
  paymentController.getPaymentById,
);

router.post("/webhook", paymentController.webhook);

export default router;
