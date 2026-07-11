import { model } from "mongoose";
import { IRestaurant } from "../interfaces/index.js";
import { restaurantSchema } from "../schemas/index.js";

export const Restaurant = model<IRestaurant>("Restaurant", restaurantSchema);
