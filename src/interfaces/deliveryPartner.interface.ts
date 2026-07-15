import { Document, Types } from "mongoose";
import {
  RiderAvailabilityStatus,
  VehicleType,
} from "../types/deliveryPartner.types.js";

export interface IDeliveryPartner extends Document {
  userId: Types.ObjectId;
  vehicleType: VehicleType;
  vehicleNumber: string;
  drivingLicenseNumber: string;
  availabilityStatus: RiderAvailabilityStatus;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  totalDeliveries: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}
