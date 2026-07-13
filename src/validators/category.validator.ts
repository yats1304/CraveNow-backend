import { z } from "zod";
import { fileSchema, objectIdSchema } from "./common.validator.js";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters."),

  description: z
    .string()
    .trim()
    .max(200, "Description cannot exceed 200 characters.")
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const getAllCategoriesSchema = z.object({
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

  isActive: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.toLowerCase() === "true" || val === "1") return true;
      if (val.toLowerCase() === "false" || val === "0") return false;
    }
    if (typeof val === "boolean") return val;
    return val;
  }, z.boolean().optional()),
});

export const categoryByIdSchema = z.object({
  categoryId: objectIdSchema,
});

export const uploadCategoryImageSchema = fileSchema({
  fieldname: "image",
});

export const toggleCategoryStatusSchema = z.object({
  isActive: z.boolean(),
});
