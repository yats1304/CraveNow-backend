import { Document, Types } from "mongoose";

export interface ICartItem extends Document {
  cartId: Types.ObjectId;
  menuItemId: Types.ObjectId;
  quantity: number;
  unitPriceSnapshot: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}
