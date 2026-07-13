import {
  CLOUDINARY_FOLDERS,
  MAX_MENU_ITEM_IMAGES,
} from "../constants/index.js";
import { Category, MenuItem, Restaurant } from "../models/index.js";
import {
  CreateMenuItemDto,
  GetAllMenuItemsDto,
  RestaurantStatus,
  UpdateMenuItemDto,
  UpdateMenuItemStatusDto,
} from "../types/index.js";
import { ErrorHandler, generateSlug } from "../utils/index.js";
import { deleteImage, uploadImage } from "./index.js";

export const createMenuItem = async (
  userId: string,
  categoryId: string,
  data: CreateMenuItemDto,
) => {
  const {
    name,
    description,
    tags,
    price,
    discountPercentage,
    foodType,
    preparationTime,
    isFeatured,
  } = data;

  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(
      403,
      "Your restaurant is not approved to manage menu items.",
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId: restaurant._id,
    isActive: true,
  });

  if (!category) {
    throw new ErrorHandler(404, "Category not found.");
  }

  const normalizedName = name.trim();

  const existingMenuItem = await MenuItem.findOne({
    restaurantId: restaurant._id,
    name: {
      $regex: `^${normalizedName}$`,
      $options: "i",
    },
    isDeleted: false,
  });

  if (existingMenuItem) {
    throw new ErrorHandler(409, "Menu item already exists.");
  }

  const menuItem = await MenuItem.create({
    restaurantId: restaurant._id,
    categoryId,
    name: normalizedName,
    slug: generateSlug(normalizedName),
    description,
    tags,
    price,
    discountPercentage,
    foodType,
    preparationTime,
    isFeatured,
  });

  return {
    success: true,
    message: "Menu item created successfully.",
    menuItem,
  };
};

export const getRestaurantMenuItems = async (
  userId: string,
  query: GetAllMenuItemsDto,
) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    foodType,
    isAvailable,
    isFeatured,
  } = query;

  const filter: Record<string, any> = {
    restaurantId: restaurant._id,
    isDeleted: false,
  };

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (foodType) {
    filter.foodType = foodType;
  }

  if (typeof isAvailable === "boolean") {
    filter.isAvailable = isAvailable;
  }

  if (typeof isFeatured === "boolean") {
    filter.isFeatured = isFeatured;
  }

  const [menuItems, total] = await Promise.all([
    MenuItem.find(filter)
      .populate({
        path: "categoryId",
        select: "name",
      })
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit),

    MenuItem.countDocuments(filter),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    menuItems,
  };
};

export const getMenuItemById = async (userId: string, menuItemId: string) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId: restaurant._id,
    isDeleted: false,
  }).populate({
    path: "categoryId",
    select: "name slug",
  });

  if (!menuItem) {
    throw new ErrorHandler(404, "Menu item not found.");
  }

  return {
    success: true,
    menuItem,
  };
};

export const updateMenuItem = async (
  userId: string,
  menuItemId: string,
  data: UpdateMenuItemDto,
) => {
  const { categoryId, name, ...updateFields } = data;

  if (Object.keys(data).length === 0) {
    throw new ErrorHandler(400, "No update fields provided.");
  }

  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(
      403,
      "Your restaurant is not approved to manage menu items.",
    );
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId: restaurant._id,
    isDeleted: false,
  });

  if (!menuItem) {
    throw new ErrorHandler(404, "Menu item not found.");
  }

  if (categoryId) {
    const category = await Category.findOne({
      _id: categoryId,
      restaurantId: restaurant._id,
      isActive: true,
    });

    if (!category) {
      throw new ErrorHandler(404, "Category not found.");
    }

    menuItem.categoryId = category._id;
  }

  if (name !== undefined) {
    const normalizedName = name.trim();

    const existingMenuItem = await MenuItem.findOne({
      _id: { $ne: menuItemId },
      restaurantId: restaurant._id,
      name: {
        $regex: `^${normalizedName}$`,
        $options: "i",
      },
      isDeleted: false,
    });

    if (existingMenuItem) {
      throw new ErrorHandler(409, "Menu item already exists.");
    }

    menuItem.name = normalizedName;
    menuItem.slug = generateSlug(normalizedName);
  }

  if (Object.keys(updateFields).length > 0) {
    menuItem.set(updateFields);
  }

  await menuItem.save();

  return {
    success: true,
    message: "Menu item updated successfully.",
    menuItem,
  };
};

export const uploadMenuItemImages = async (
  userId: string,
  menuItemId: string,
  files: Express.Multer.File[],
) => {
  if (!files || files.length === 0) {
    throw new ErrorHandler(400, "At least one image is required.");
  }

  if (files.length > MAX_MENU_ITEM_IMAGES) {
    throw new ErrorHandler(
      400,
      `Maximum ${MAX_MENU_ITEM_IMAGES} images are allowed.`,
    );
  }

  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(
      403,
      "Your restaurant is not approved to manage menu items.",
    );
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId: restaurant._id,
    isDeleted: false,
  });

  if (!menuItem) {
    throw new ErrorHandler(404, "Menu item not found.");
  }

  await Promise.all(
    menuItem.images.map((image) => deleteImage(image.publicId)),
  );

  const uploadedResults = await Promise.all(
    files.map((file) =>
      uploadImage(file, { folder: CLOUDINARY_FOLDERS.MENU_ITEMS }),
    ),
  );

  const uploadedImages = uploadedResults.map((image) => ({
    url: image.url,
    publicId: image.publicId,
  }));

  menuItem.images = uploadedImages;

  await menuItem.save();

  return {
    success: true,
    message: "Menu item images updated successfully.",
    images: menuItem.images,
  };
};

export const updateMenuItemAvailability = async (
  userId: string,
  menuItemId: string,
  data: UpdateMenuItemStatusDto,
) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(
      403,
      "Your restaurant is not approved to manage menu items.",
    );
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId: restaurant._id,
    isDeleted: false,
  });

  if (!menuItem) {
    throw new ErrorHandler(404, "Menu item not found.");
  }

  if (menuItem.isAvailable === data.isAvailable) {
    return {
      success: false,
      message: `Menu item is already ${
        data.isAvailable ? "available" : "unavailable"
      }.`,
    };
  }

  menuItem.isAvailable = data.isAvailable;

  await menuItem.save();

  return {
    success: true,
    message: `Menu item ${
      data.isAvailable ? "enabled" : "disabled"
    } successfully.`,
  };
};

export const deleteMenuItem = async (userId: string, menuItemId: string) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(
      403,
      "Your restaurant is not approved to manage menu items.",
    );
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId: restaurant._id,
    isDeleted: false,
  });

  if (!menuItem) {
    throw new ErrorHandler(404, "Menu item not found.");
  }

  menuItem.isDeleted = true;
  menuItem.isAvailable = false;

  await menuItem.save();

  return {
    success: true,
    message: "Menu item deleted successfully.",
  };
};
