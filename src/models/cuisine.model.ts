import { model } from "mongoose";
import { ICuisine } from "../interfaces/index.js";
import { cuisineSchema } from "../schemas/index.js";

export const Cuisine = model<ICuisine>("Cuisine", cuisineSchema);
