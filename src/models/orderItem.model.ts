import { model } from "mongoose";
import { IOrderItem } from "../interfaces/index.js";
import { orderItemSchema } from "../schemas/index.js";

export const OrderItem = model<IOrderItem>("OrderItem", orderItemSchema);
