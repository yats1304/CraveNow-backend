import { Document, Types } from "mongoose";
import { IImage } from "../types/image.types.js";
import { FoodType } from "../types/menuItems.types.js";

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  images: IImage[];
  price: number;
  discountPercentage: number;
  foodType: FoodType;
  preparationTime: number;
  isAvailable: boolean;
  isFeatured: boolean;
  totalOrders: number;
  isDeleted: boolean;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
