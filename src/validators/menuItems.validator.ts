import { z } from "zod";
import { objectIdSchema, fileSchema } from "./common.validator.js";
import { FoodType } from "../types/index.js";

export const createMenuItemSchema = z.object({
  name: z
    .string({ message: "Menu item name is required" })
    .trim()
    .min(2, "Menu item name must be at least 2 characters.")
    .max(100, "Menu item name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),

  price: z
    .number({ message: "Price is required and must be a number." })
    .min(0, "Price cannot be negative."),

  discountPercentage: z
    .number({ message: "Discount percentage must be a number." })
    .min(0, "Discount percentage cannot be less than 0%.")
    .max(100, "Discount percentage cannot exceed 100%.")
    .default(0),

  foodType: z.enum(FoodType, {
    error: () => ({
      message: "Invalid food type. Allowed values are VEG, NON_VEG, or BOTH.",
    }),
  }),

  preparationTime: z
    .number({ message: "Preparation time is required and must be a number." })
    .min(1, "Preparation time must be at least 1 minute.")
    .max(180, "Preparation time cannot exceed 180 minutes."),

  isFeatured: z.boolean().default(false),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const updateMenuItemStatusSchema = z.object({
  isAvailable: z.boolean({ message: "Availability status must be a boolean." }),
});

export const getAllMenuItemsSchema = z.object({
  page: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.coerce
      .number({ message: "Page must be a number" })
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),
  ),

  limit: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.coerce
      .number({ message: "Limit must be a number" })
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),
  ),

  search: z.string().trim().optional(),

  categoryId: objectIdSchema.optional(),

  foodType: z.enum(FoodType).optional(),

  isAvailable: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true" || val === "1") return true;
      if (val.toLowerCase() === "false" || val === "0") return false;
    }
    if (typeof val === "boolean") return val;
    return val;
  }, z.boolean().optional()),

  isFeatured: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true" || val === "1") return true;
      if (val.toLowerCase() === "false" || val === "0") return false;
    }
    if (typeof val === "boolean") return val;
    return val;
  }, z.boolean().optional()),
});

export const menuItemIdParamSchema = z.object({
  menuItemId: objectIdSchema,
});

export const uploadMenuItemImagesSchema = z
  .array(
    fileSchema({
      fieldname: "images",
    }),
  )
  .min(1, "At least one image is required.")
  .max(5, "Maximum 5 images are allowed.");
