import { DeliveryPartner } from "../models/deliveryPartner.model.js";
import { ErrorHandler } from "../utils/index.js";

export const buildDeliveryPartnerResponse = async (
  deliveryPartnerId: string,
) => {
  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId)
    .populate({
      path: "userId",
      select: "name email phone avatar",
    })
    .lean();

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  return {
    deliveryPartnerId: deliveryPartner._id,
    user: deliveryPartner.userId,
    vehicleType: deliveryPartner.vehicleType,
    vehicleNumber: deliveryPartner.vehicleNumber,
    drivingLicenseNumber: deliveryPartner.drivingLicenseNumber,
    availabilityStatus: deliveryPartner.availabilityStatus,
    isVerified: deliveryPartner.isVerified,
    isActive: deliveryPartner.isActive,
    rating: deliveryPartner.rating,
    totalRatings: deliveryPartner.totalRatings,
    totalDeliveries: deliveryPartner.totalDeliveries,
    totalEarnings: deliveryPartner.totalEarnings,
    createdAt: deliveryPartner.createdAt,
  };
};
