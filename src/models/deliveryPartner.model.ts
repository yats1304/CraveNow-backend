import { model } from "mongoose";
import { IDeliveryPartner } from "../interfaces/deliveryPartner.interface.js";
import { deliveryPartnerSchema } from "../schemas/deliveryPartner.schema.js";

export const DeliveryPartner = model<IDeliveryPartner>(
  "DeliveryPartner",
  deliveryPartnerSchema,
);
