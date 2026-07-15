import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";

export const createPaymentSchema = z.object({
  orderId: objectIdSchema,
});

export const verifyPaymentSchema = z.object({
  orderId: objectIdSchema,

  razorpayOrderId: z
    .string({
      message: "Razorpay Order ID is required",
    })
    .trim()
    .min(1, "Razorpay Order ID is required"),

  razorpayPaymentId: z
    .string({
      message: "Razorpay Payment ID is required",
    })
    .trim()
    .min(1, "Razorpay Payment ID is required"),

  razorpaySignature: z
    .string({
      message: "Razorpay Signature is required",
    })
    .trim()
    .min(1, "Razorpay Signature is required"),
});

export const paymentIdParams = z.object({
  paymentId: objectIdSchema,
});

export const orderIdParams = z.object({
  orderId: objectIdSchema,
});
