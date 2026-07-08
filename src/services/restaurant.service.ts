import { RESTAURANT_VERIFICATION_FIELDS } from "../constants";
import { Address, Restaurant } from "../models";
import {
  AddressOwnerTypes,
  CreateRestaurantDto,
  RestaurantStatus,
  UpdateRestaurantDto,
} from "../types";
import { ErrorHandler } from "../utils";

export const createRestaurant = async (
  userId: string,
  data: CreateRestaurantDto,
) => {
  const {
    name,
    description,
    restaurantType,
    gstNumber,
    fssaiLicenseNumber,
    minimumOrderAmount,
    deliveryRadius,
    averagePreparationTime,
  } = data;

  const existingRestaurant = await Restaurant.findOne({ ownerId: userId });

  if (existingRestaurant) {
    throw new ErrorHandler(409, "You have already registered a restaurant.");
  }

  const restaurant = await Restaurant.create({
    ownerId: userId,
    name,
    description,
    restaurantType,
    primaryAddressId: null,
    gstNumber,
    fssaiLicenseNumber,
    minimumOrderAmount,
    deliveryRadius,
    averagePreparationTime,
    status: RestaurantStatus.PENDING,
    isVerified: false,
    isOpen: false,
  });

  return {
    success: true,
    message: "Restaurant registered successfully",
    restaurant,
  };
};

export const updateRestaurant = async (
  userId: string,
  data: UpdateRestaurantDto,
) => {
  if (Object.keys(data).length === 0) {
    throw new ErrorHandler(400, "No update fields provided.");
  }

  const restaurant = await Restaurant.findOne({ ownerId: userId });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (restaurant.status === RestaurantStatus.SUSPENDED) {
    throw new ErrorHandler(
      403,
      "Your restaurant is suspended. Please contact support.",
    );
  }

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    const duplicate = await Restaurant.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
      _id: { $ne: restaurant._id },
    });
    if (duplicate) {
      throw new ErrorHandler(409, "Restaurant name already exists.");
    }
    restaurant.name = trimmedName;
  }

  if (data.gstNumber !== undefined) {
    const trimmedGst = data.gstNumber.trim();
    const duplicate = await Restaurant.findOne({
      gstNumber: trimmedGst,
      _id: { $ne: restaurant._id },
    });
    if (duplicate) {
      throw new ErrorHandler(409, "GST number is already registered.");
    }
    restaurant.gstNumber = trimmedGst;
  }

  if (data.fssaiLicenseNumber !== undefined) {
    const trimmedFssai = data.fssaiLicenseNumber.trim();
    const duplicate = await Restaurant.findOne({
      fssaiLicenseNumber: trimmedFssai,
      _id: { $ne: restaurant._id },
    });
    if (duplicate) {
      throw new ErrorHandler(
        409,
        "FSSAI License Number is already registered.",
      );
    }
    restaurant.fssaiLicenseNumber = trimmedFssai;
  }

  if (data.primaryAddressId !== undefined) {
    const address = await Address.findOne({
      _id: data.primaryAddressId,
      userId,
      ownerType: AddressOwnerTypes.RESTAURANT,
    });
    if (!address) {
      throw new ErrorHandler(404, "Restaurant address not found.");
    }
    restaurant.primaryAddressId = data.primaryAddressId;
  }

  const needsVerification = RESTAURANT_VERIFICATION_FIELDS.some(
    (field) => data[field] !== undefined,
  );

  if (restaurant.status === RestaurantStatus.APPROVED && needsVerification) {
    restaurant.status = RestaurantStatus.PENDING;
    restaurant.isVerified = false;
  }

  if (data.description !== undefined) {
    restaurant.description = data.description;
  }

  if (data.restaurantType !== undefined) {
    restaurant.restaurantType = data.restaurantType;
  }

  if (data.minimumOrderAmount !== undefined) {
    restaurant.minimumOrderAmount = data.minimumOrderAmount;
  }

  if (data.deliveryRadius !== undefined) {
    restaurant.deliveryRadius = data.deliveryRadius;
  }

  if (data.averagePreparationTime !== undefined) {
    restaurant.averagePreparationTime = data.averagePreparationTime;
  }

  await restaurant.save();

  return {
    success: true,
    message: needsVerification
      ? "Restaurant updated successfully. Verification is pending admin approval."
      : "Restaurant updated successfully.",
    restaurant,
  };
};

export const getMyRestaurant = async (userId: string) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  })
    .populate({
      path: "primaryAddressId",
      select:
        "label fullName phone addressLine1 addressLine2 landmark city state country postalCode location isDefault",
    })
    .lean();

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  return {
    success: true,
    restaurant,
  };
};

export const updateRestaurantOpenStatus = async (
  userId: string,
  isOpen: boolean,
) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (restaurant.isOpen === isOpen) {
    throw new ErrorHandler(
      409,
      `Restaurant is already ${isOpen ? "Open" : "Closed"}.`,
    );
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(403, "Your restaurant is not approved yet.");
  }

  restaurant.isOpen = isOpen;

  await restaurant.save();

  return {
    success: true,
    message: `Restaurant is now ${isOpen ? "Open" : "Closed"}`,
    restaurant,
  };
};
