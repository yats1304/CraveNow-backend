import { CLOUDINARY_FOLDERS } from "../constants/cloudinary.constants.js";
import { Category, Restaurant } from "../models/index.js";
import {
  CreateCategoryDto,
  GetAllCategoriesDto,
  RestaurantStatus,
  UpdateCategoryDto,
} from "../types/index.js";
import { ErrorHandler, generateSlug } from "../utils/index.js";
import { deleteImage, replaceImage } from "./cloudinary.service.js";

export const createCategory = async (
  userId: string,
  data: CreateCategoryDto,
) => {
  const { name, description } = data;

  const restaurant = await Restaurant.findOne({ ownerId: userId });

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  if (
    restaurant.status !== RestaurantStatus.APPROVED ||
    !restaurant.isVerified
  ) {
    throw new ErrorHandler(
      403,
      "Your restaurant is not approved to manage categories.",
    );
  }

  const normalizedName = name.trim();

  const existingCategory = await Category.findOne({
    restaurantId: restaurant._id,
    name: {
      $regex: `^${normalizedName}`,
      $options: "i",
    },
  });

  if (existingCategory) {
    throw new ErrorHandler(409, "Category already exists.");
  }

  const category = await Category.create({
    restaurantId: restaurant._id,
    name: normalizedName,
    slug: generateSlug(normalizedName),
    description,
  });

  return {
    success: true,
    message: "Category created successfully.",
    category,
  };
};

export const getAllCategories = async (
  userId: string,
  query: GetAllCategoriesDto,
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
      "Your restaurant is not approved to manage categories.",
    );
  }

  const { page = 1, limit = 10, search, isActive } = query;

  const filter: Record<string, any> = {
    restaurantId: restaurant._id,
  };

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Category.countDocuments(filter),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    categories,
  };
};

export const getCategoryById = async (userId: string, categoryId: string) => {
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
      "Your restaurant is not approved to manage categories.",
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId: restaurant._id,
  });

  if (!category) {
    throw new ErrorHandler(404, "Category not found.");
  }

  return {
    success: true,
    category,
  };
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  data: UpdateCategoryDto,
) => {
  const { name, ...updateFields } = data;

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
      "Your restaurant is not approved to manage categories.",
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId: restaurant._id,
  });

  if (!category) {
    throw new ErrorHandler(404, "Category not found.");
  }

  if (name !== undefined) {
    const normalizedName = name.trim();

    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      restaurantId: restaurant._id,
      name: {
        $regex: `^${normalizedName}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      throw new ErrorHandler(409, "Category already exists.");
    }

    category.name = normalizedName;
    category.slug = generateSlug(normalizedName);
  }

  if (Object.keys(updateFields).length > 0) {
    category.set(updateFields);
  }

  await category.save();

  return {
    success: true,
    message: "Category updated successfully.",
    category,
  };
};

export const uploadCategoryImage = async (
  userId: string,
  categoryId: string,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new ErrorHandler(400, "Category image is required.");
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
      "Your restaurant is not approved to manage categories.",
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId: restaurant._id,
  });

  if (!category) {
    throw new ErrorHandler(404, "Category not found.");
  }

  const image = await replaceImage(
    file,
    category.image?.publicId ?? null,
    CLOUDINARY_FOLDERS.CATEGORY,
  );

  category.image = {
    url: image.url,
    publicId: image.publicId,
  };

  await category.save();

  return {
    success: true,
    message: "Category image uploaded successfully.",
    image: category.image,
  };
};

export const updateCategoryStatus = async (
  userId: string,
  categoryId: string,
  isActive: boolean,
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
      "Your restaurant is not approved to manage categories.",
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId: restaurant._id,
  });

  if (!category) {
    throw new ErrorHandler(404, "Category not found.");
  }

  if (category.isActive === isActive) {
    return {
      success: false,
      message: `Category is already ${isActive ? "active" : "inactive"}.`,
    };
  }

  category.isActive = isActive;

  await category.save();

  return {
    success: true,
    message: `Category ${isActive ? "activated" : "deactivated"} successfully.`,
  };
};

export const deleteCategory = async (userId: string, categoryId: string) => {
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
      "Your restaurant is not approved to manage categories.",
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId: restaurant._id,
  });

  if (!category) {
    throw new ErrorHandler(404, "Category not found.");
  }

  //   const menuItemExists = await MenuItem.exists({
  //     categoryId,
  //     restaurantId: restaurant._id,
  //   });

  //   if (menuItemExists) {
  //     throw new ErrorHandler(
  //       409,
  //       "Cannot delete category because it contains menu items.",
  //     );
  //   }

  if (category.image?.publicId) {
    await deleteImage(category.image.publicId);
  }

  await category.deleteOne();

  return {
    success: true,
    message: "Category deleted successfully.",
  };
};
