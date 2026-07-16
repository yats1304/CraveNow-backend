import { Schema } from "mongoose";
import { IDelivery } from "../interfaces/delivery.interface.js";
import { DeliveryStatus } from "../types/delivery.types.js";

export const deliverySchema = new Schema<IDelivery>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    deliveryPartnerId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.ASSIGNED,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    assignmentExpiresAt: {
      type: Date,
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reassignmentCount: {
      type: Number,
      default: 0,
    },

    acceptedAt: Date,

    reachedPickupAt: Date,

    pickedUpAt: Date,

    outForDeliveryAt: Date,

    deliveredAt: Date,

    cancelledAt: Date,

    estimatedPickupTime: Date,

    estimatedDeliveryTime: Date,

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

deliverySchema.index({
  deliveryPartnerId: 1,
});

deliverySchema.index({
  status: 1,
});

deliverySchema.index({
  assignedAt: -1,
});
