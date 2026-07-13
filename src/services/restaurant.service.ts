import { Types } from "mongoose";
import {
  CLOUDINARY_FOLDERS,
  RESTAURANT_VERIFICATION_FIELDS,
} from "../constants/index.js";
import { Address, Restaurant } from "../models/index.js";
import {
  AddressOwnerTypes,
  CreateRestaurantDto,
  RestaurantStatus,
  UpdateRestaurantDto,
} from "../types/index.js";
import { ErrorHandler } from "../utils/index.js";
import { replaceImage } from "./cloudinary.service.js";

export const createRestaurant = async (
  userId: string,
  data: CreateRestaurantDto,
) => {
  const {
    name,
    description,
    restaurantType,
    cuisineIds,
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
    cuisineIds: cuisineIds.map((id) => new Types.ObjectId(id)),
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
  const {
    name,
    gstNumber,
    fssaiLicenseNumber,
    primaryAddressId,
    cuisineIds,
    ...updateFields
  } = data;

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

  if (name !== undefined) {
    const trimmedName = name.trim();
    const duplicate = await Restaurant.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
      _id: { $ne: restaurant._id },
    });
    if (duplicate) {
      throw new ErrorHandler(409, "Restaurant name already exists.");
    }
    restaurant.name = trimmedName;
  }

  if (gstNumber !== undefined) {
    const trimmedGst = gstNumber.trim();
    const duplicate = await Restaurant.findOne({
      gstNumber: trimmedGst,
      _id: { $ne: restaurant._id },
    });
    if (duplicate) {
      throw new ErrorHandler(409, "GST number is already registered.");
    }
    restaurant.gstNumber = trimmedGst;
  }

  if (fssaiLicenseNumber !== undefined) {
    const trimmedFssai = fssaiLicenseNumber.trim();
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

  if (primaryAddressId !== undefined) {
    const address = await Address.findOne({
      _id: primaryAddressId,
      userId,
      ownerType: AddressOwnerTypes.RESTAURANT,
    });
    if (!address) {
      throw new ErrorHandler(404, "Restaurant address not found.");
    }
    restaurant.primaryAddressId = primaryAddressId;
  }

  const needsVerification = RESTAURANT_VERIFICATION_FIELDS.some(
    (field) => data[field] !== undefined,
  );

  if (restaurant.status === RestaurantStatus.APPROVED && needsVerification) {
    restaurant.status = RestaurantStatus.PENDING;
    restaurant.isVerified = false;
  }

  if (cuisineIds !== undefined) {
    restaurant.cuisineIds = cuisineIds.map((id) => new Types.ObjectId(id));
  }

  if (Object.keys(updateFields).length > 0) {
    restaurant.set(updateFields);
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
    .populate("cuisineIds")
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

export const uploadRestaurantLogo = async (
  userId: string,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new ErrorHandler(400, "Logo image is required!");
  }

  const restaurant = await Restaurant.findOne({ ownerId: userId });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found!");
  }

  if (restaurant.status === RestaurantStatus.SUSPENDED) {
    throw new ErrorHandler(
      403,
      "Your restaurant is suspended. You cannot update the logo.",
    );
  }

  const image = await replaceImage(
    file,
    restaurant.logo?.publicId || null,
    CLOUDINARY_FOLDERS.RESTAURANT_LOGO,
  );

  restaurant.logo = {
    url: image.url,
    publicId: image.publicId,
  };

  await restaurant.save();

  return {
    success: true,
    message: "Restaurant logo updated successfully.",
    logo: restaurant.logo,
  };
};

export const uploadRestaurantBanner = async (
  userId: string,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new ErrorHandler(400, "Banner image is required!");
  }

  const restaurant = await Restaurant.findOne({ ownerId: userId });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found!");
  }

  if (restaurant.status === RestaurantStatus.SUSPENDED) {
    throw new ErrorHandler(
      403,
      "Your restaurant is suspended. You cannot update the banner.",
    );
  }

  const image = await replaceImage(
    file,
    restaurant.banner?.publicId || null,
    CLOUDINARY_FOLDERS.RESTAURANT_BANNER,
  );

  restaurant.banner = {
    url: image.url,
    publicId: image.publicId,
  };

  await restaurant.save();

  return {
    success: true,
    message: "Restaurant banner updated successfully.",
    banner: restaurant.banner,
  };
};
