import express from "express";
import * as restaurantController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRestaurantSchema,
  updateRestaurantOpenStatusSchema,
  updateRestaurantSchema,
} from "../validators/index.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/index.js";
import { upload } from "../middlewares/upload.middleware.js";

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

router.patch(
  "/logo",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  upload.single("logo"),
  restaurantController.uploadRestaurantLogo,
);

router.get(
  "/me",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  restaurantController.getMyRestaurant,
);

export default router;
