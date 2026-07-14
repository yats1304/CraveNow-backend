import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";
import { PaymentMethod, OrderStatus } from "../types/index.js";

export const createOrderSchema = z.object({
  addressId: objectIdSchema,

  paymentMethod: z.enum(PaymentMethod, {
    error: () => ({
      message: "Invalid payment method. Allowed values are COD or RAZORPAY.",
    }),
  }),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus, {
    error: () => ({
      message: "Invalid order status.",
    }),
  }),
});

export const orderIdParamSchema = z.object({
  orderId: objectIdSchema,
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
