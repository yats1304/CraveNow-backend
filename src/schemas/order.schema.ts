import { Schema } from "mongoose";
import { IOrder } from "../interfaces";
import {
  OrderCancelledBy,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types/index.js";

export const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
 
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
 
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
 
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
 
    cancelledAt: {
      type: Date,
    },
 
    cancelledBy: {
      type: String,
      enum: Object.values(OrderCancelledBy),
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 1,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 1,
    },

    estimatedDeliveryTime: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  userId: 1,
  createdAt: -1,
});

orderSchema.index({
  restaurantId: 1,
  createdAt: -1,
});

orderSchema.index({
  status: 1,
});

orderSchema.index({
  paymentStatus: 1,
});

