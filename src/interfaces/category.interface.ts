import { Document, Types } from "mongoose";
import { IImage } from "../types/image.types.js";

export interface ICategory extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: IImage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
