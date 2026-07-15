import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";
import {
  RiderAvailabilityStatus,
  VehicleType,
} from "../types/deliveryPartner.types.js";

export const registerDeliveryPartnerSchema = z.object({
  vehicleType: z.enum(VehicleType, {
    error: () => ({
      message:
        "Invalid vehicle type. Allowed values are BIKE, SCOOTER, BICYCLE, or CAR.",
    }),
  }),

  vehicleNumber: z
    .string({
      message: "Vehicle number is required",
    })
    .trim()
    .min(5, "Vehicle number must be at least 5 characters.")
    .max(20, "Vehicle number cannot exceed 20 characters."),

  drivingLicenseNumber: z
    .string({
      message: "Driving license number is required",
    })
    .trim()
    .min(8, "Driving license number must be at least 8 characters.")
    .max(30, "Driving license number cannot exceed 30 characters."),
});

export const updateDeliveryPartnerSchema = z.object({
  vehicleType: z
    .enum(VehicleType, {
      error: () => ({
        message:
          "Invalid vehicle type. Allowed values are BIKE, SCOOTER, BICYCLE, or CAR.",
      }),
    })
    .optional(),

  vehicleNumber: z
    .string()
    .trim()
    .min(5, "Vehicle number must be at least 5 characters.")
    .max(20, "Vehicle number cannot exceed 20 characters.")
    .optional(),
});

export const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(RiderAvailabilityStatus, {
    error: () => ({
      message:
        "Invalid availability status. Allowed values are OFFLINE, ONLINE, AVAILABLE, or BUSY.",
    }),
  }),
});

export const deliveryPartnerIdParams = z.object({
  deliveryPartnerId: objectIdSchema,
});
