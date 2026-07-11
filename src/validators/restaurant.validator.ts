import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";
import { RestaurantType, RestaurantStatus } from "../types/index.js";

export const createRestaurantSchema = z.object({
  name: z
    .string("Restaurant name is required")
    .trim()
    .min(3, "Restaurant name must be at least 3 characters.")
    .max(100, "Restaurant name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  logo: z
    .string()
    .trim()
    .url("Logo must be a valid URL.")
    .or(z.literal(""))
    .optional(),

  banner: z
    .string()
    .trim()
    .url("Banner must be a valid URL.")
    .or(z.literal(""))
    .optional(),

  restaurantType: z.enum(RestaurantType, {
    error: () => ({
      message:
        "Invalid restaurant type. Allowed values are VEG, NON_VEG, or BOTH.",
    }),
  }),

  gstNumber: z
    .string()
    .trim()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST Number format.",
    )
    .optional()
    .or(z.literal("")),

  fssaiLicenseNumber: z
    .string("FSSAI License Number is required")
    .trim()
    .regex(/^\d{14}$/, "FSSAI License Number must be exactly 14 digits."),

  minimumOrderAmount: z
    .number("Minimum order amount must be a number.")
    .min(0, "Minimum order amount cannot be negative.")
    .default(0),

  deliveryRadius: z
    .number("Delivery radius must be a number.")
    .min(1, "Delivery radius must be at least 1 km.")
    .default(5),

  averagePreparationTime: z
    .number("Average preparation time must be a number.")
    .min(5, "Average preparation time must be at least 5 minutes.")
    .default(30),
});

export const updateRestaurantSchema = createRestaurantSchema.partial().extend({
  isOpen: z.boolean().optional(),
});

export const adminCreateRestaurantSchema = createRestaurantSchema.extend({
  ownerId: objectIdSchema,
  isVerified: z.boolean().default(false),
  status: z.enum(RestaurantStatus).default(RestaurantStatus.PENDING),
});

export const adminUpdateRestaurantSchema = createRestaurantSchema
  .partial()
  .extend({
    ownerId: objectIdSchema.optional(),
    isOpen: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    status: z.enum(RestaurantStatus).optional(),
  });

export const updateRestaurantStatusSchema = z.object({
  status: z.enum(RestaurantStatus, {
    error: () => ({ message: "Invalid restaurant status." }),
  }),
});

export const restaurantIdParamSchema = z.object({
  restaurantId: objectIdSchema,
});

export const updateRestaurantOpenStatusSchema = z.object({
  isOpen: z.boolean(),
});
