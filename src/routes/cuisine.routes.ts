import express from "express";
import * as cuisineController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/user.types.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCuisineSchema,
  getAllCuisinesSchema,
  cuisineByIdSchema,
  updateCuisineSchema,
  uploadCuisineImageSchema,
  toggleCuisineStatusSchema,
} from "../validators/cuisine.validator.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = express.Router();

router.get(
  "/",
  validate(getAllCuisinesSchema, "query"),
  cuisineController.getAllCuisine,
);

router.get(
  "/:cuisineId",
  validate(cuisineByIdSchema, "params"),
  cuisineController.getCuisineById,
);

router.post(
  "/",
  isAuth,
  authorizeRoles(UserRole.ADMIN),
  validate(createCuisineSchema),
  cuisineController.createCuisine,
);

router.patch(
  "/:cuisineId",
  isAuth,
  authorizeRoles(UserRole.ADMIN),
  validate(cuisineByIdSchema, "params"),
  validate(updateCuisineSchema),
  cuisineController.updateCuisine,
);

router.patch(
  "/:cuisineId/image",
  isAuth,
  authorizeRoles(UserRole.ADMIN),
  validate(cuisineByIdSchema, "params"),
  upload.single("image"),
  validate(uploadCuisineImageSchema, "file"),
  cuisineController.uploadCuisineImage,
);

router.patch(
  "/:cuisineId/status",
  isAuth,
  authorizeRoles(UserRole.ADMIN),
  validate(cuisineByIdSchema, "params"),
  validate(toggleCuisineStatusSchema),
  cuisineController.toggleCuisineStatus,
);

router.delete(
  "/:cuisineId",
  isAuth,
  authorizeRoles(UserRole.ADMIN),
  validate(cuisineByIdSchema, "params"),
  cuisineController.deleteCuisine,
);

export default router;
