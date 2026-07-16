import express from "express";
import * as deliveryPartnerController from "../controllers/index.js";
import * as riderLocationController from "../controllers/riderLocation.controller.js";
import * as deliveryController from "../controllers/delivery.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/user.types.js";
import {
  registerDeliveryPartnerSchema,
  updateAvailabilitySchema,
  updateDeliveryPartnerSchema,
} from "../validators/deliveryPartner.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateLocationSchema } from "../validators/riderLocation.validator.js";

const router = express.Router();

// Delivery partners routes
router.post(
  "/register",
  isAuth,
  authorizeRoles(UserRole.DELIVERY_PARTNER),
  validate(registerDeliveryPartnerSchema),
  deliveryPartnerController.registerDeliveryPartner,
);

router.get(
  "/me",
  isAuth,
  authorizeRoles(UserRole.DELIVERY_PARTNER),
  deliveryPartnerController.getMyDeliveryPartnerProfile,
);

router.patch(
  "/me",
  isAuth,
  authorizeRoles(UserRole.DELIVERY_PARTNER),
  validate(updateDeliveryPartnerSchema),
  deliveryPartnerController.updateDeliveryPartner,
);

router.patch(
  "/availability",
  isAuth,
  authorizeRoles(UserRole.DELIVERY_PARTNER),
  validate(updateAvailabilitySchema),
  deliveryPartnerController.updateAvailability,
);

router.patch(
  "/location",
  isAuth,
  authorizeRoles(UserRole.DELIVERY_PARTNER),
  validate(updateLocationSchema),
  riderLocationController.updateLocation,
);

router.get(
  "/orders",
  isAuth,
  authorizeRoles(UserRole.DELIVERY_PARTNER),
  deliveryController.getMyDeliveries,
);

// Upto this

export default router;
