import { model } from "mongoose";
import { IRestaurant } from "../interfaces";
import { restaurantSchema } from "../schemas";

export const Restaurant = model<IRestaurant>("Restaurant", restaurantSchema);
