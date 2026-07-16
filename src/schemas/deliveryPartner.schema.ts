import { Schema } from "mongoose";
import { IDeliveryPartner } from "../interfaces/deliveryPartner.interface.js";
import {
  RiderAvailabilityStatus,
  VehicleType,
} from "../types/deliveryPartner.types.js";

export const deliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },

    drivingLicenseNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },

    availabilityStatus: {
      type: String,
      enum: Object.values(RiderAvailabilityStatus),
      default: RiderAvailabilityStatus.OFFLINE,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    successfulDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

deliveryPartnerSchema.index({
  availabilityStatus: 1,
});

deliveryPartnerSchema.index({
  isVerified: 1,
});

deliveryPartnerSchema.index({
  vehicleType: 1,
});

deliveryPartnerSchema.index({
  rating: -1,
});
