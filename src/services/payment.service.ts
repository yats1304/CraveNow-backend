import {
  buildPaymentResponse,
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from "../helpers/index.js";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  VerifyPaymentDto,
} from "../types/index.js";
import { ErrorHandler } from "../utils/index.js";
import { env } from "../config/env.js";
import mongoose from "mongoose";
import { logger } from "../config/logger.js";


export const createPayment = async (userId: string, orderId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  if (order.status !== OrderStatus.AWAITING_PAYMENT) {
    throw new ErrorHandler(400, "This order is not awaiting payment.");
  }

  const existingPayment = await Payment.findOne({
    orderId,
  });

  if (existingPayment) {
    throw new ErrorHandler(
      400,
      "Payment has already been initiated for this order.",
    );
  }

  const razorpayOrder = await createRazorpayOrder(
    order.total,
    order.orderNumber,
  );

  logger.info({
    orderId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
  }, "Razorpay order created");


  const payment = await Payment.create({
    orderId: order._id,
    userId,
    gateway: PaymentMethod.RAZORPAY,
    status: PaymentStatus.PENDING,
    amount: order.total,
    currency: "INR",
    receipt: order.orderNumber,
    gatewayOrderId: razorpayOrder.id,
  });

  return {
    ...(await buildPaymentResponse(payment._id.toString())),

    razorpay: {
      key: env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  };
};

export const verifyPayment = async (userId: string, data: VerifyPaymentDto) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payment = await Payment.findOne(
      {
        orderId: data.orderId,
        userId,
      },
      null,
      { session },
    );

    if (!payment) {
      throw new ErrorHandler(404, "Payment not found.");
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ErrorHandler(400, "Payment has already been processed.");
    }

    const order = await Order.findById(data.orderId, null, { session });

    if (!order) {
      throw new ErrorHandler(404, "Order not found.");
    }

    if (payment.gatewayOrderId !== data.razorpayOrderId) {
      throw new ErrorHandler(400, "Invalid Razorpay order.");
    }

    const isVerified = verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );

    if (!isVerified) {
      payment.status = PaymentStatus.FAILED;
      await payment.save({ session });
      await session.commitTransaction();

      logger.warn({
        userId,
        orderId: data.orderId,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
      }, "Payment verification failed");

      throw new ErrorHandler(400, "Payment verification failed.");
    }

    payment.status = PaymentStatus.PAID;
    payment.gatewayPaymentId = data.razorpayPaymentId;
    payment.gatewaySignature = data.razorpaySignature;
    payment.paidAt = new Date();

    await payment.save({ session });

    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.PENDING;

    await order.save({ session });

    await session.commitTransaction();

    logger.info({
      userId,
      orderId: data.orderId,
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      amount: order.total,
    }, "Payment verified successfully");


    return await buildPaymentResponse(payment._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getPaymentById = async (userId: string, paymentId: string) => {
  const payment = await Payment.findOne({
    _id: paymentId,
    userId,
  }).select("_id");

  if (!payment) {
    throw new ErrorHandler(404, "Payment not found.");
  }

  return await buildPaymentResponse(payment._id.toString());
};

export const getPaymentByOrderId = async (userId: string, orderId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
  }).select("_id");

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  const payment = await Payment.findOne({
    orderId: order._id,
  }).select("_id");

  if (!payment) {
    throw new ErrorHandler(404, "Payment not found.");
  }

  return await buildPaymentResponse(payment._id.toString());
};

export const handleWebhook = async (
  body: string,
  signature: string,
  payload: any,
) => {
  logger.info({ event: payload.event }, "Webhook received from Razorpay");

  const isValid = verifyWebhookSignature(body, signature);

  if (!isValid) {
    logger.warn("Invalid webhook signature received from Razorpay");
    throw new ErrorHandler(400, "Invalid webhook signature.");
  }


  const event = payload.event;

  switch (event) {
    case "payment.captured": {
      const paymentEntity = payload.payload.payment.entity;

      const payment = await Payment.findOne({
        gatewayPaymentId: paymentEntity.id,
      });

      if (!payment) return;

      if (payment.status === PaymentStatus.PAID) {
        return;
      }

      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();

      await payment.save();

      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PENDING,
      });

      logger.info({
        paymentId: payment._id.toString(),
        gatewayPaymentId: paymentEntity.id,
        gatewayOrderId: paymentEntity.order_id,
        amount: paymentEntity.amount,
      }, "Payment captured via webhook");

      break;
    }

    case "payment.failed": {
      const paymentEntity = payload.payload.payment.entity;

      await Payment.findOneAndUpdate(
        {
          gatewayOrderId: paymentEntity.order_id,
        },
        {
          status: PaymentStatus.FAILED,
        },
      );

      logger.warn({
        gatewayOrderId: paymentEntity.order_id,
        gatewayPaymentId: paymentEntity.id,
        reason: paymentEntity.error_description,
      }, "Payment failed via webhook");

      break;
    }

    case "refund.processed": {
      const refund = payload.payload.refund.entity;

      await Payment.findOneAndUpdate(
        {
          gatewayPaymentId: refund.payment_id,
        },
        {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
        },
      );

      logger.info({
        gatewayPaymentId: refund.payment_id,
        refundId: refund.id,
        amount: refund.amount,
      }, "Refund processed via webhook");

      break;
    }

    default:
      break;
  }
};
