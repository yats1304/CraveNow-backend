import { env } from "../config/env.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Payment } from "../models/payment.model.js";
import { ErrorHandler } from "../utils/index.js";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const convertToPaise = (amount: number): number => {
  return Math.round(amount * 100);
};

export const convertFromPaise = (amount: number): number => {
  return amount / 100;
};

export const createRazorpayOrder = async (amount: number, receipt: string) => {
  return await razorpay.orders.create({
    amount: convertToPaise(amount),
    currency: "INR",
    receipt,
  });
};

export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean => {
  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
};

export const buildPaymentResponse = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId)
    .populate({
      path: "orderId",
      select: "orderNumber status paymentStatus paymentMethod total",
    })
    .populate({
      path: "userId",
      select: "name email phone",
    })
    .lean();

  if (!payment) {
    throw new ErrorHandler(404, "Payment not found.");
  }

  return {
    paymentId: payment._id,
    order: payment.orderId,
    customer: payment.userId,
    gateway: payment.gateway,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    receipt: payment.receipt,
    ...(payment.gatewayOrderId && {
      gatewayOrderId: payment.gatewayOrderId,
    }),
    ...(payment.gatewayPaymentId && {
      gatewayPaymentId: payment.gatewayPaymentId,
    }),
    paidAt: payment.paidAt,
    refundedAt: payment.refundedAt,
    createdAt: payment.createdAt,
  };
};

export { razorpay };

export const verifyWebhookSignature = (
  body: string,
  signature: string,
): boolean => {
  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return generatedSignature === signature;
};
