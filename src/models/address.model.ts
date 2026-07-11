import { model } from "mongoose";
import { IAddress } from "../interfaces/address.interface.js";
import { addressSchema } from "../schemas/address.schema.js";

export const Address = model<IAddress>("Address", addressSchema);
