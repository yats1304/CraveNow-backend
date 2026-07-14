import { Schema } from "mongoose";
import { ICartItem } from "../interfaces";

export const cartItemSchema = new Schema<ICartItem>(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },

    specialInstructions: {
      type: String,
      trim: true,
      maxlength: 250,
    },
  },
  {
    timestamps: true,
  },
);

cartItemSchema.index({
  cartId: 1,
});

cartItemSchema.index({
  menuItemId: 1,
});

cartItemSchema.index(
  {
    cartId: 1,
    menuItemId: 1,
  },
  {
    unique: true,
  },
);
