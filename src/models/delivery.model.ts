import { model } from "mongoose";
import { IDelivery } from "../interfaces/delivery.interface.js";
import { deliverySchema } from "../schemas/delivery.schema.js";

export const Delivery = model<IDelivery>("Delivery", deliverySchema);
