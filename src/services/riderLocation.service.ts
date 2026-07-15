import { DeliveryPartner } from "../models/index.js";
import { RiderLocation } from "../models/riderLocation.model.js";
import { UpdateLocationDto } from "../types/index.js";
import { ErrorHandler } from "../utils/index.js";
import { logger } from "../config/logger.js";
import { buildRiderLocationResponse } from "../helpers/riderLocation.helper.js";



export const updateLocation = async (
  userId: string,
  data: UpdateLocationDto,
) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id isVerified isActive");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  if (!deliveryPartner.isVerified) {
    throw new ErrorHandler(403, "Your account is pending verification.");
  }

  if (!deliveryPartner.isActive) {
    throw new ErrorHandler(403, "Your account has been deactivated.");
  }

  const riderLocation = await RiderLocation.findOneAndUpdate(
    {
      deliveryPartnerId: deliveryPartner._id,
    },
    {
      $set: {
        location: {
          type: "Point",
          coordinates: [data.longitude, data.latitude],
        },
        heading: data.heading,
        speed: data.speed,
        accuracy: data.accuracy,
        lastUpdated: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  logger.info(
    {
      deliveryPartnerId: deliveryPartner._id.toString(),
      latitude: data.latitude,
      longitude: data.longitude,
    },
    "Rider location updated",
  );

  return await buildRiderLocationResponse(riderLocation._id.toString());
};
