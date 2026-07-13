import express from "express";
import * as menuItemController from "../controllers/index.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { UserRole } from "../types/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMenuItemSchema,
  getAllMenuItemsSchema,
  menuItemIdParamSchema,
  updateMenuItemSchema,
  updateMenuItemStatusSchema,
  uploadMenuItemImagesSchema,
} from "../validators/menuItems.validator.js";
import { categoryByIdSchema } from "../validators/category.validator.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/:categoryId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(categoryByIdSchema, "params"),
  validate(createMenuItemSchema),
  menuItemController.createMenuItem,
);

router.get(
  "/",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(getAllMenuItemsSchema, "query"),
  menuItemController.getRestaurantMenuItems,
);

router.get(
  "/:menuItemId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(menuItemIdParamSchema, "params"),
  menuItemController.getMenuItemById,
);

router.patch(
  "/:menuItemId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(menuItemIdParamSchema, "params"),
  validate(updateMenuItemSchema),
  menuItemController.updateMenuItem,
);

router.patch(
  "/:menuItemId/images",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(menuItemIdParamSchema, "params"),
  upload.array("images", 5),
  validate(uploadMenuItemImagesSchema, "files"),
  menuItemController.uploadMenuItemImages,
);

router.patch(
  "/:menuItemId/availability",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(menuItemIdParamSchema, "params"),
  validate(updateMenuItemStatusSchema),
  menuItemController.updateMenuItemAvailability,
);

router.delete(
  "/:menuItemId",
  isAuth,
  authorizeRoles(UserRole.RESTAURANT),
  validate(menuItemIdParamSchema, "params"),
  menuItemController.deleteMenuItem,
);

export default router;
