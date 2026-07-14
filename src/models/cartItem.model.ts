import { model } from "mongoose";
import { ICartItem } from "../interfaces/index.js";
import { cartItemSchema } from "../schemas/index.js";

export const CartItem = model<ICartItem>("CartItem", cartItemSchema);
