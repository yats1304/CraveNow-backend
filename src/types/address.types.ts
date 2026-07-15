import { UserRole } from "./user.types.js";

export enum AddressOwnerTypes {
  USER = "USER",
  RESTAURANT = "RESTAURANT",
  DELIVERY_PARTNER = "DELIVERY_PARTNER",
}

export enum AddressLabel {
  HOME = "HOME",
  WORK = "WORK",
  OTHER = "OTHER",
  RESTAURANT = "RESTAURANT",
}

export const OWNER_TYPE_MAP: Record<string, AddressOwnerTypes> = {
  [UserRole.CUSTOMER]: AddressOwnerTypes.USER,
  [UserRole.RESTAURANT]: AddressOwnerTypes.RESTAURANT,
  [UserRole.DELIVERY_PARTNER]: AddressOwnerTypes.DELIVERY_PARTNER,
  [UserRole.ADMIN]: AddressOwnerTypes.USER,
};

export interface CreateAddressDto {
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
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface updatedAddressDto extends CreateAddressDto {}
