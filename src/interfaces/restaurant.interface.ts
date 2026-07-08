import { Document, Types } from "mongoose";
import { RestaurantStatus, RestaurantType } from "../types/restaurant.types";

export interface IRestaurant extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  primaryAddressId: Types.ObjectId | null;
  restaurantType: RestaurantType;
  gstNumber?: string;
  fssaiLicenseNumber: string;
  minimumOrderAmount: number;
  deliveryRadius: number;
  averagePreparationTime: number;
  averageRating: number;
  totalReviews: number;
  isOpen: boolean;
  isVerified: boolean;
  status: RestaurantStatus;
  createdAt: Date;
  updatedAt: Date;
}
