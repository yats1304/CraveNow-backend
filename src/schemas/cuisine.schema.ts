import { Schema } from "mongoose";
import { ICuisine } from "../interfaces/cuisine.interface.js";
import { imageSchema } from "./image.schema.js";

export const cuisineSchema = new Schema<ICuisine>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 50,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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

cuisineSchema.index({
  isActive: 1,
});
