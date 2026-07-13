import { model } from "mongoose";
import { IMenuItem } from "../interfaces/menuItems.interface.js";
import { menuItemSchema } from "../schemas/menuItems.schema.js";

export const MenuItem = model<IMenuItem>("MenuItem", menuItemSchema);
