import { Schema } from "mongoose";
import { IPayment } from "../interfaces";
import { PaymentMethod, PaymentStatus } from "../types/index.js";

export const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    gateway: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    gatewayOrderId: String,

    receipt: String,

    gatewayPaymentId: String,

    gatewaySignature: String,

    paidAt: Date,

    refundedAt: Date,
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  userId: 1,
});

paymentSchema.index({
  gatewayOrderId: 1,
});

paymentSchema.index({
  gatewayPaymentId: 1,
});

paymentSchema.index({
  status: 1,
});
