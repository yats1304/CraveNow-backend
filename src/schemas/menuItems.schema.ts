import { Schema } from "mongoose";
import { imageSchema } from "./image.schema.js";
import { FoodType } from "../types/menuItems.types.js";
import { IMenuItem } from "../interfaces/menuItems.interface.js";

export const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
      maxlength: 500,
    },

    tags: {
      type: [String],
      default: [],
      lowercase: true,
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    foodType: {
      type: String,
      enum: Object.values(FoodType),
      required: true,
    },

    preparationTime: {
      type: Number,
      required: true,
      min: 5,
      max: 180,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

menuItemSchema.virtual("finalPrice").get(function () {
  const finalPrice = this.price - (this.price * this.discountPercentage) / 100;

  return Math.floor(finalPrice);
});

menuItemSchema.set("toJSON", { virtuals: true });
menuItemSchema.set("toObject", { virtuals: true });

menuItemSchema.index({
  restaurantId: 1,
});

menuItemSchema.index({
  categoryId: 1,
});

menuItemSchema.index(
  {
    restaurantId: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

menuItemSchema.index({
  foodType: 1,
});

menuItemSchema.index({
  isAvailable: 1,
});

menuItemSchema.index({
  isFeatured: 1,
});

menuItemSchema.index(
  {
    restaurantId: 1,
    slug: 1,
  },
  {
    unique: true,
  },
);

menuItemSchema.index({
  restaurantId: 1,
  categoryId: 1,
  isAvailable: 1,
});

menuItemSchema.index({
  isDeleted: 1,
});
