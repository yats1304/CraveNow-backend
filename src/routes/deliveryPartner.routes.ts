import express from "express";
import * as deliveryPartnerController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/user.types.js";
import {
  registerDeliveryPartnerSchema,
  updateAvailabilitySchema,
  updateDeliveryPartnerSchema,
} from "../validators/deliveryPartner.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

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

// Upto this

export default router;
