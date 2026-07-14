import { Document, Types } from "mongoose";
import {
  OrderCancelledBy,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types/index.js";

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  addressId: Types.ObjectId;
  status: OrderStatus;
  cancelledAt?: Date;
  cancelledBy?: OrderCancelledBy;
  cancellationReason?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  estimatedDeliveryTime: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
