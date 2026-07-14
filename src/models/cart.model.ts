import { model } from "mongoose";
import { ICart } from "../interfaces/index.js";
import { cartSchema } from "../schemas/index.js";

export const Cart = model<ICart>("Cart", cartSchema);
