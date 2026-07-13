import express from "express";
import * as categoryController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  categoryByIdSchema,
  createCategorySchema,
  getAllCategoriesSchema,
  updateCategorySchema,
  uploadCategoryImageSchema,
  toggleCategoryStatusSchema,
} from "../validators/index.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.get(
  "/",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(getAllCategoriesSchema, "query"),
  categoryController.getAllCategories,
);

router.get(
  "/:categoryId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(categoryByIdSchema, "params"),
  categoryController.getCategoryById,
);

router.patch(
  "/:categoryId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(categoryByIdSchema, "params"),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

router.patch(
  "/:categoryId/image",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(categoryByIdSchema, "params"),
  upload.single("image"),
  validate(uploadCategoryImageSchema, "file"),
  categoryController.uploadCategoryImage,
);

router.patch(
  "/:categoryId/status",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(categoryByIdSchema, "params"),
  validate(toggleCategoryStatusSchema),
  categoryController.updateCategoryStatus,
);

router.delete(
  "/:categoryId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(categoryByIdSchema, "params"),
  categoryController.deleteCategory,
);

export default router;
