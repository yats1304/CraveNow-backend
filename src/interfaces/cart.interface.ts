import { Document, Types } from "mongoose";

export interface ICart extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
