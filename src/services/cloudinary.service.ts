import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { IImage, UploadImageOptions } from "../types/image.types.js";
import { ErrorHandler } from "../utils/index.js";
import { logger } from "../config/logger.js";

export const uploadImage = async (
  file: Express.Multer.File,
  Options: UploadImageOptions,
): Promise<IImage> => {
  if (!file) {
    throw new ErrorHandler(400, "Image file is required.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: Options.folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          logger.error(error, "Cloudinary upload failed");
          return reject(new ErrorHandler(500, error?.message || "Failed to upload image."));
        }

        logger.info({
          publicId: result.public_id,
          folder: Options.folder,
        }, "Image uploaded to Cloudinary");

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );
    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
  logger.info({ publicId }, "Image deleted from Cloudinary");
};

export const replaceImage = async (
  file: Express.Multer.File,
  oldPublicId: string | null,
  folder: string,
): Promise<IImage> => {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }

  return uploadImage(file, { folder });
};
