import { Document } from "mongoose";
import { IImage } from "../types/image.types.js";

export interface ICuisine extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: IImage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
