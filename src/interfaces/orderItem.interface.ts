import { Document, Types } from "mongoose";

export interface IOrderItem extends Document {
  orderId: Types.ObjectId;
  menuItemId: Types.ObjectId;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}
