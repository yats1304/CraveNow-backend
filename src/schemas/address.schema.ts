import { Schema } from "mongoose";
import { IAddress } from "../interfaces/address.interface";
import { AddressLabel, AddressOwnerTypes } from "../types";

export const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "ownerType",
    },

    ownerType: {
      type: String,
      enum: Object.values(AddressOwnerTypes),
      required: true,
    },

    label: {
      type: String,
      enum: Object.values(AddressLabel),
      default: AddressLabel.HOME,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      default: "India",
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value: number[]) => value.length === 2,
          message: "Coordinates must contain [longitude, latitude].",
        },
      },
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

addressSchema.index({
  location: "2dsphere",
});

addressSchema.index({
  userId: 1,
  ownerType: 1,
});

addressSchema.index({
  userId: 1,
  ownerType: 1,
  isDefault: 1,
});
