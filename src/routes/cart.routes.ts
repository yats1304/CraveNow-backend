import express from "express";
import * as cartController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addToCartSchema,
  cartItemIdParamSchema,
  updateCartItemSchema,
} from "../validators/index.js";

const router = express.Router();

router.post(
  "/",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(addToCartSchema),
  cartController.addToCart,
);

router.get(
  "/",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  cartController.getCart,
);

router.patch(
  "/items/:cartItemId",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(cartItemIdParamSchema, "params"),
  validate(updateCartItemSchema),
  cartController.updateCartItem,
);

router.delete(
  "/items/:cartItemId",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  validate(cartItemIdParamSchema, "params"),
  cartController.removeCartItem,
);

router.delete(
  "/",
  isAuth,
  authorizeRoles(UserRole.CUSTOMER),
  cartController.clearCart,
);

export default router;
