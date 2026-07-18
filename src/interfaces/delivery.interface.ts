import { Document, Types } from "mongoose";
import { DeliveryStatus } from "../types/delivery.types.js";

export interface IDelivery extends Document {
  orderId: Types.ObjectId;
  deliveryPartnerId: Types.ObjectId;
  status: DeliveryStatus;
  assignedAt: Date;
  assignmentExpiresAt: Date;
  cancelledBy?: Types.ObjectId;
  reassignmentCount?: number;
  acceptedAt?: Date;
  reachedPickupAt?: Date;
  pickedUpAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
