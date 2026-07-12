import { CLOUDINARY_FOLDERS } from "../constants/cloudinary.constants.js";
import { Cuisine } from "../models/cuisine.model.js";
import { Restaurant } from "../models/index.js";
import { GetAllCuisinesDto } from "../types/cuisine.types.js";
import { ErrorHandler, generateSlug } from "../utils/index.js";
import { deleteImage, replaceImage } from "./cloudinary.service.js";

export const createCuisine = async (name: string, description: string) => {
  const normalizedName = name.trim();

  const existingCuisine = await Cuisine.findOne({
    name: { $regex: `^${normalizedName}$`, $options: "i" },
  });

  if (existingCuisine) {
    throw new ErrorHandler(409, "Cuisine already exists.");
  }

  const slug = generateSlug(normalizedName);

  const cuisine = await Cuisine.create({
    name: normalizedName,
    slug: slug,
    description,
  });

  return {
    success: true,
    message: "Cuisine created successfully.",
    cuisine,
  };
};

export const getAllCuisine = async ({
  page = 1,
  limit = 10,
  search,
  isActive,
}: GetAllCuisinesDto) => {
  const query: Record<string, any> = {};

  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (typeof isActive === "boolean") {
    query.isActive = isActive;
  }

  const [cuisine, total] = await Promise.all([
    Cuisine.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Cuisine.countDocuments(query),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totlaPages: Math.ceil(total / limit),
    cuisine,
  };
};

export const getCuisineById = async (cuisineId: string) => {
  const cuisine = await Cuisine.findById(cuisineId).lean();

  if (!cuisine) {
    throw new ErrorHandler(404, "Cuisine not found.");
  }

  return {
    success: true,
    cuisine,
  };
};

export const updateCuisine = async (
  cuisineId: string,
  name: string,
  description: string,
) => {
  const cuisine = await Cuisine.findById(cuisineId);

  if (!cuisine) {
    throw new ErrorHandler(404, "Cuisine not found!");
  }

  if (name !== undefined) {
    const normalizedName = name.trim();

    const existingCuisine = await Cuisine.findOne({
      _id: { $ne: cuisineId },
      name: {
        $regex: `^${normalizedName}$`,
        $options: "i",
      },
    });

    if (existingCuisine) {
      throw new ErrorHandler(409, "Cuisine already exists.");
    }

    cuisine.name = normalizedName;
    cuisine.slug = generateSlug(normalizedName);
  }

  if (description !== undefined) {
    cuisine.description = description.trim();
  }

  await cuisine.save();

  return {
    success: true,
    message: "Cuisine updated successfully.",
    cuisine,
  };
};

export const uploadCuisineImage = async (
  cuisineId: string,
  file: Express.Multer.File,
) => {
  if (!file) {
    throw new ErrorHandler(400, "Cuisine image is required.");
  }

  const cuisine = await Cuisine.findById(cuisineId);

  if (!cuisine) {
    throw new ErrorHandler(404, "Cuisine not found.");
  }

  const image = await replaceImage(
    file,
    cuisine.image?.publicId ?? null,
    CLOUDINARY_FOLDERS.CUISINE,
  );

  cuisine.image = {
    url: image.url,
    publicId: image.publicId,
  };

  await cuisine.save();

  return {
    success: true,
    message: "Cuisine image uploaded successfully.",
    image: cuisine.image,
  };
};

export const toggleCuisineStatus = async (
  cuisineId: string,
  isActive: boolean,
) => {
  const cuisine = await Cuisine.findById(cuisineId);

  if (!cuisine) {
    throw new ErrorHandler(404, "Cuisine not found.");
  }

  if (cuisine.isActive === isActive) {
    return {
      message: `Cuisine is already ${isActive ? "active" : "inactive"}.`,
    };
  }

  cuisine.isActive = isActive;

  await cuisine.save();

  return {
    success: true,
    message: `Cuisine ${isActive ? "activated" : "deactivated"} successfully.`,
  };
};

export const deleteCuisine = async (cuisineId: string) => {
  const cuisine = await Cuisine.findById(cuisineId);

  if (!cuisine) {
    throw new ErrorHandler(404, "Cuisine not found.");
  }

  const isCuisineInUse = await Restaurant.exists({
    cuisineIds: cuisineId,
  });

  if (isCuisineInUse) {
    throw new ErrorHandler(
      409,
      "Cannot delete cuisine because it is assigned to one or more restaurants.",
    );
  }

  if (cuisine.image?.publicId) {
    await deleteImage(cuisine.image.publicId);
  }

  await cuisine.deleteOne();

  return {
    success: true,
    message: "Cuisine deleted successfully.",
  };
};
