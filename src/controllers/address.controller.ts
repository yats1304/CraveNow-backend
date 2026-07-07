import { TryCatch, ErrorHandler } from "../utils";
import * as addressService from "../services";
import { AddressOwnerTypes, OWNER_TYPE_MAP } from "../types";

export const createAddress = TryCatch(async (req, res) => {
  const { userId, role } = req.user!;

  const ownerType = OWNER_TYPE_MAP[role];
  if (!ownerType) {
    throw new ErrorHandler(403, "You are not allowed to create an address.");
  }

  const data = await addressService.createAddress(userId, ownerType, req.body);

  return res.status(201).json(data);
});

export const getMyAddresses = TryCatch(async (req, res) => {
  const { userId, role } = req.user!;

  const ownerType = OWNER_TYPE_MAP[role];
  if (!ownerType) {
    throw new ErrorHandler(403, "You are not allowed to get an addresses.");
  }

  const data = await addressService.getMyAddresses(userId, ownerType);

  return res.json(data);
});

export const getAddressById = TryCatch(async (req, res) => {
  const { userId, role } = req.user!;

  const ownerType = OWNER_TYPE_MAP[role];
  if (!ownerType) {
    throw new ErrorHandler(403, "You are not allowed to get this address.");
  }

  const addressId = req.params.addressId as string;

  const data = await addressService.getAddressById(
    userId,
    ownerType,
    addressId,
  );

  return res.json(data);
});

export const updatedAddress = TryCatch(async (req, res) => {
  const { userId, role } = req.user!;
  const addressId = req.params.addressId as string;

  const ownerType = OWNER_TYPE_MAP[role];
  if (!ownerType) {
    throw new ErrorHandler(403, "You are not allowed to get this address.");
  }

  const data = await addressService.updatedAddress(
    userId,
    ownerType,
    addressId,
    req.body,
  );

  return res.json(data);
});

export const setDefaultAddress = TryCatch(async (req, res) => {
  const { userId } = req.user!;
  const addressId = req.params.addressId as string;

  const ownerType = AddressOwnerTypes.USER;
  if (!ownerType) {
    throw new ErrorHandler(403, "You are not allowed to get this address.");
  }

  const data = await addressService.setDefaultAddress(
    userId,
    ownerType,
    addressId,
  );

  res.json(data);
});

export const deleteAddress = TryCatch(async (req, res) => {
  const { userId, role } = req.user!;
  const addressId = req.params.addressId as string;

  const ownerType = OWNER_TYPE_MAP[role];
  if (!ownerType) {
    throw new ErrorHandler(403, "You are not allowed to get this address.");
  }

  const data = await addressService.deleteAddress(userId, ownerType, addressId);

  return res.json(data);
});
