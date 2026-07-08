import { Schema } from "mongoose";
import { IRestaurant } from "../interfaces";
import { RestaurantStatus, RestaurantType } from "../types/restaurant.types";

export const restaurantSchema = new Schema<IRestaurant>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    logo: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },

    primaryAddressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      default: null,
    },

    restaurantType: {
      type: String,
      enum: Object.values(RestaurantType),
      required: true,
    },

    gstNumber: {
      type: String,
      trim: true,
    },

    fssaiLicenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryRadius: {
      type: Number,
      default: 5,
      min: 1,
    },

    averagePreparationTime: {
      type: Number,
      default: 30,
      min: 5,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isOpen: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(RestaurantStatus),
      default: RestaurantStatus.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

restaurantSchema.index({
  name: "text",
});

restaurantSchema.index({
  status: 1,
});

restaurantSchema.index({
  isOpen: 1,
});

restaurantSchema.index({
  averageRating: -1,
});
