import { z } from "zod";
import { AddressLabel, AddressOwnerTypes } from "../types/index.js";
import { objectIdSchema, phoneSchema } from "./common.validator.js";

const coordinateSchema = z.object({
  latitude: z
    .number({
      message: "Latitude is required and must be a number",
    })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  longitude: z
    .number({
      message: "Longitude is required and must be a number",
    })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export const createAddressSchema = z.object({
  label: z.enum(AddressLabel).default(AddressLabel.HOME),

  fullName: z
    .string({
      message: "Full name is required",
    })
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  phone: phoneSchema,

  addressLine1: z
    .string({
      message: "Address Line 1 is required",
    })
    .trim()
    .min(5, "Address Line 1 must be at least 5 characters")
    .max(255, "Address Line 1 cannot exceed 255 characters"),

  addressLine2: z
    .string()
    .trim()
    .max(255, "Address Line 2 cannot exceed 255 characters")
    .optional(),

  landmark: z
    .string()
    .trim()
    .max(255, "Landmark cannot exceed 255 characters")
    .optional(),

  city: z
    .string({
      message: "City is required",
    })
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters"),

  state: z
    .string({
      message: "State is required",
    })
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State cannot exceed 100 characters"),

  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country cannot exceed 100 characters")
    .default("India"),

  postalCode: z
    .string({
      message: "Postal code is required",
    })
    .trim()
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits"),

  ...coordinateSchema.shape,

  isDefault: z.boolean().default(false),
});

export const adminCreateAddressSchema = createAddressSchema.extend({
  userId: objectIdSchema,
  ownerType: z.enum(AddressOwnerTypes),
});

export const updateAddressSchema = createAddressSchema.partial().refine(
  (data) => {
    const hasLat = data.latitude !== undefined;
    const hasLng = data.longitude !== undefined;
    return (hasLat && hasLng) || (!hasLat && !hasLng);
  },
  {
    message: "Both latitude and longitude must be provided together",
    path: ["latitude"],
  },
);

export const AddressIdParam = z.object({
  addressId: objectIdSchema,
});
