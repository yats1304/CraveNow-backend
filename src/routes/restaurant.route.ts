import express from "express";
import * as restaurantController from "../controllers";
import { isAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createRestaurantSchema,
  updateRestaurantOpenStatusSchema,
  updateRestaurantSchema,
} from "../validators";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware";
import { UserRole } from "../types";

const router = express.Router();

router.post(
  "/",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(createRestaurantSchema),
  restaurantController.createRestaurant,
);

router.patch(
  "/me",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(updateRestaurantSchema),
  restaurantController.updateRestaurant,
);

router.patch(
  "/open-status",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(updateRestaurantOpenStatusSchema),
  restaurantController.updateRestaurantOpenStatus,
);

router.get(
  "/me",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  restaurantController.getMyRestaurant,
);

export default router;
