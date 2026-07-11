import { Document, Types } from "mongoose";
import { AddressLabel, AddressOwnerTypes } from "../types/index.js";

export interface IGeoLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IAddress extends Document {
  userId: Types.ObjectId;
  ownerType: AddressOwnerTypes;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  location: IGeoLocation;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
