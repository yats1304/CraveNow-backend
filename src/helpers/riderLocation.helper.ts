import { RiderLocation } from "../models/riderLocation.model.js";
import { ErrorHandler } from "../utils/index.js";

export const buildRiderLocationResponse = async (riderLocationId: string) => {
  const riderLocation = await RiderLocation.findById(riderLocationId)
    .populate({
      path: "deliveryPartnerId",
      populate: {
        path: "userId",
        select: "name phone avatar",
      },
      select:
        "vehicleType availabilityStatus isVerified rating totalDeliveries",
    })
    .lean();

  if (!riderLocation) {
    throw new ErrorHandler(404, "Rider location not found.");
  }

  return {
    riderLocationId: riderLocation._id,
    rider: riderLocation.deliveryPartnerId,
    location: riderLocation.location,
    heading: riderLocation.heading,
    speed: riderLocation.speed,
    accuracy: riderLocation.accuracy,
    lastUpdated: riderLocation.lastUpdated,
    createdAt: riderLocation.createdAt,
    updatedAt: riderLocation.updatedAt,
  };
};
