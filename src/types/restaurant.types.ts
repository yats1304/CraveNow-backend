import { Types } from "mongoose";

export enum RestaurantStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECT = "REJECT",
  SUSPENDED = "SUSPENDED",
}

export enum RestaurantType {
  VEG = "VEG",
  NON_VEG = "NON_VEG",
  BOTH = "BOTH",
}

export interface CreateRestaurantDto {
  name: string;
  description: string;
  restaurantType: RestaurantType;
  gstNumber?: string;
  fssaiLicenseNumber: string;
  minimumOrderAmount: number;
  deliveryRadius: number;
  averagePreparationTime: number;
}

export type UpdateRestaurantDto = Partial<
  CreateRestaurantDto & {
    primaryAddressId: Types.ObjectId;
  }
>;
