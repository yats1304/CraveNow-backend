import mongoose from "mongoose";
import { ADDRESS_LIMIT } from "../constants";
import { Address } from "../models/address.model";
import { Restaurant } from "../models";
import {
  AddressOwnerTypes,
  CreateAddressDto,
  updatedAddressDto,
} from "../types";
import { ErrorHandler } from "../utils";

export const createAddress = async (
  userId: string,
  ownerType: AddressOwnerTypes,
  data: CreateAddressDto,
) => {
  const {
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country,
    postalCode,
    latitude,
    longitude,
    isDefault,
  } = data;

  const existingAddress = await Address.findOne({
    userId,
    ownerType,
    addressLine1: addressLine1.trim().toLocaleLowerCase(),
    postalCode,
  });

  if (existingAddress) {
    throw new ErrorHandler(400, "Address Already exist");
  }

  const totalAddress = await Address.countDocuments({ userId, ownerType });

  const limit = ADDRESS_LIMIT[ownerType];

  if (totalAddress >= limit) {
    throw new ErrorHandler(400, `Maximum ${limit} addresses allowed.`);
  }

  const makeDefault = totalAddress === 0 || isDefault === true;

  if (makeDefault) {
    await Address.updateMany(
      {
        userId,
        ownerType,
      },
      {
        isDefault: false,
      },
    );
  }

  const address = await Address.create({
    userId,
    ownerType,
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country,
    postalCode,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    isDefault: makeDefault,
  });

  if (ownerType === AddressOwnerTypes.RESTAURANT) {
    const restaurant = await Restaurant.findOne({ ownerId: userId });

    if (!restaurant) {
      throw new ErrorHandler(
        404,
        "Please create your restaurant profile first.",
      );
    }

    restaurant.primaryAddressId = address._id as mongoose.Types.ObjectId;
    await restaurant.save();
  }

  return {
    success: true,
    message: "Address created successfully",
    address,
  };
};

export const getMyAddresses = async (
  userId: string,
  ownerType: AddressOwnerTypes,
) => {
  const addresses = await Address.find({
    userId,
    ownerType,
  })
    .sort({
      isDefault: -1,
      createdAt: -1,
    })
    .lean();

  return {
    success: true,
    total: addresses.length,
    addresses,
  };
};

export const getAddressById = async (
  userId: string,
  ownerType: AddressOwnerTypes,
  addressId: string,
) => {
  const address = await Address.findOne({
    _id: addressId,
    userId,
    ownerType,
  }).lean();

  if (!address) {
    throw new ErrorHandler(404, "Address not found.");
  }

  return {
    success: true,
    address,
  };
};

export const updatedAddress = async (
  userId: string,
  ownerType: AddressOwnerTypes,
  addressId: string,
  data: updatedAddressDto,
) => {
  const address = await Address.findOne({
    _id: addressId,
    userId,
    ownerType,
  });

  if (!address) {
    throw new ErrorHandler(404, "Address not found.");
  }

  if (data.addressLine1 && data.postalCode) {
    const duplicate = await Address.findOne({
      _id: { $ne: addressId },
      userId,
      ownerType,
      addressLine1: data.addressLine1,
      postalCode: data.postalCode,
    });

    if (duplicate) {
      throw new ErrorHandler(409, "Address already exists.");
    }
  }

  if (data.isDefault === true) {
    await Address.updateMany(
      {
        userId,
        ownerType,
      },
      {
        isDefault: false,
      },
    );
  }

  if (data.latitude !== undefined && data.longitude !== undefined) {
    address.location = {
      type: "Point",
      coordinates: [data.longitude, data.latitude],
    };
  }

  Object.assign(address, {
    ...data,
    location: address.location,
  });

  await address.save();

  return {
    success: true,
    message: "Address updated successfully.",
    address,
  };
};

export const setDefaultAddress = async (
  userId: string,
  ownerType: AddressOwnerTypes.USER,
  addressId: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const address = await Address.findOne(
      {
        _id: addressId,
        userId,
        ownerType,
      },
      null,
      { session },
    );

    if (!address) {
      throw new ErrorHandler(404, "Address not found.");
    }

    if (address.isDefault) {
      await session.abortTransaction();

      return {
        success: true,
        message: "Address is already the default address.",
      };
    }

    await Address.updateMany(
      {
        userId,
        ownerType,
      },
      {
        isDefault: false,
      },
      { session },
    );

    address.isDefault = true;

    await address.save({ session });

    await session.commitTransaction();

    return {
      success: true,
      message: "Default address update successfully.",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteAddress = async (
  userId: string,
  ownerType: AddressOwnerTypes,
  addressId: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const address = await Address.findOne(
      {
        _id: addressId,
        userId,
        ownerType,
      },
      null,
      { session },
    );

    if (!address) {
      throw new ErrorHandler(404, "Address not found.");
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne(
      {
        _id: addressId,
      },
      { session },
    );

    if (wasDefault) {
      const newDefaultAddress = await Address.findOne(
        {
          userId,
          ownerType,
        },
        null,
        {
          session,
          sort: {
            createdAt: -1,
          },
        },
      );

      if (newDefaultAddress) {
        newDefaultAddress.isDefault = true;
        await newDefaultAddress.save({ session });
      }
      await session.commitTransaction();

      return {
        success: true,
        message: "Address deleted successfully",
      };
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
