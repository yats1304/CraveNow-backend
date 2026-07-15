import { Document, Types } from "mongoose";
import { PaymentMethod, PaymentStatus } from "../types/index.js";

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  gateway: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayOrderId?: string;
  receipt?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
