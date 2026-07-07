import { model } from "mongoose";
import { IAddress } from "../interfaces/address.interface";
import { addressSchema } from "../schemas/address.schema";

export const Address = model<IAddress>("Address", addressSchema);
