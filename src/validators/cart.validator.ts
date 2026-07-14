import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";

export const addToCartSchema = z.object({
  menuItemId: objectIdSchema,

  quantity: z
    .number({
      message: "Quantity is required and must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),

  specialInstructions: z
    .string()
    .trim()
    .max(250, "Special instructions cannot exceed 250 characters.")
    .optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number({
      message: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20")
    .optional(),

  specialInstructions: z
    .string()
    .trim()
    .max(250, "Special instructions cannot exceed 250 characters.")
    .optional(),
});

export const cartIdParamSchema = z.object({
  cartId: objectIdSchema,
});

export const cartItemIdParamSchema = z.object({
  cartItemId: objectIdSchema,
});
