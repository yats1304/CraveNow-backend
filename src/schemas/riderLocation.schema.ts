import { Schema } from "mongoose";

export const riderLocationSchema = new Schema(
  {
    deliveryPartnerId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      required: true,
      unique: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    heading: Number,

    speed: Number,

    accuracy: Number,

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

riderLocationSchema.index({
  location: "2dsphere",
});

riderLocationSchema.index({
  lastUpdated: -1,
});
