import { Schema } from "mongoose";
import { IOrderItem } from "../interfaces/index.js";

export const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    nameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },

    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
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

orderItemSchema.index({
  orderId: 1,
});

orderItemSchema.index({
  menuItemId: 1,
});
