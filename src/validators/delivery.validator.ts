import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";
import { DeliveryStatus } from "../types/delivery.types.js";

export const createDeliverySchema = z.object({
  orderId: objectIdSchema,
  deliveryPartnerId: objectIdSchema,
  status: z
    .enum(DeliveryStatus, {
      error: () => ({
        message:
          "Invalid delivery status. Allowed values are ASSIGNED, ACCEPTED, REACHED_PICKUP, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, or CANCELLED.",
      }),
    })
    .default(DeliveryStatus.ASSIGNED),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .optional(),
});

export const assignRiderSchema = z.object({
  deliveryPartnerId: objectIdSchema,
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(DeliveryStatus, {
    error: () => ({
      message:
        "Invalid delivery status. Allowed values are ASSIGNED, ACCEPTED, REACHED_PICKUP, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, or CANCELLED.",
    }),
  }),
});

export const deliveryIdParamSchema = z.object({
  deliveryId: objectIdSchema,
});

export const deliveryIdParams = z.object({
  deliveryId: objectIdSchema,
});

