import { Document, Types } from "mongoose";
import { RestaurantStatus, RestaurantType } from "../types/restaurant.types.js";
import { IImage } from "../types/image.types.js";

export interface IRestaurant extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  logo?: IImage;
  banner?: IImage;
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
