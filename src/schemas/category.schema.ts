import { Schema } from "mongoose";
import { ICategory } from "../interfaces/index.js";
import { imageSchema } from "./image.schema.js";

export const categorySchema = new Schema<ICategory>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    image: {
      type: imageSchema,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({
  restaurantId: 1,
});

categorySchema.index({
  restaurantId: 1,
  name: 1,
});

categorySchema.index({
  restaurantId: 1,
  slug: 1,
});

categorySchema.index({
  isActive: 1,
});
