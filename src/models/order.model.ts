import { model } from "mongoose";
import { IOrder } from "../interfaces/index.js";
import { orderSchema } from "../schemas/index.js";

export const Order = model<IOrder>("Order", orderSchema);
