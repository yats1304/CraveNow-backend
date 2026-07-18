import { RiderLocation } from "../models/riderLocation.model.js";
import { ErrorHandler } from "../utils/index.js";
import { calculateDistance, calculateETA } from "../utils/location.js";

export const buildCustomerTrackingResponse = async (
  deliveryPartnerId: string,
) => {
  const riderLocation = await RiderLocation.findOne({
    deliveryPartnerId,
  })
    .populate({
      path: "deliveryPartnerId",
      select: "vehicleType rating",
      populate: {
        path: "userId",
        select: "name avatar",
      },
    })
    .lean();

  if (!riderLocation) {
    throw new ErrorHandler(404, "Rider location not found.");
  }

  const rider = riderLocation.deliveryPartnerId as any;

  // Future calculations using Delivery assignment
  const distance: number | null = null;
  const eta: number | null = null;

  /*
   * TODO: Implement active delivery assignment integration once the Delivery module is completed:
   *
   * 1. Retrieve the active delivery assignment:
   *    const activeAssignment = await DeliveryAssignment.findOne({
   *      deliveryPartnerId,
   *      status: { $in: [DeliveryStatus.PICKING_UP, DeliveryStatus.DELIVERING] }
   *    });
   *
   * 2. Extract destination coordinates (Restaurant location or Customer Address location depending on delivery phase):
   *    if (activeAssignment) {
   *      const order = await Order.findById(activeAssignment.orderId).populate("addressId");
   *      const restaurant = await Restaurant.findById(activeAssignment.restaurantId);
   *
   *      const targetCoordinates = activeAssignment.status === DeliveryStatus.PICKING_UP
   *        ? { latitude: restaurant.location.coordinates[1], longitude: restaurant.location.coordinates[0] }
   *        : { latitude: order.addressId.latitude, longitude: order.addressId.longitude };
   *
   * 3. Calculate distance using the utility:
   *      distance = calculateDistance(
   *        {
   *          latitude: riderLocation.location.coordinates[1],
   *          longitude: riderLocation.location.coordinates[0]
   *        },
   *        targetCoordinates
   *      );
   *
   * 4. Calculate ETA using the utility:
   *      eta = calculateETA(distance);
   *    }
   */

  return {
    rider: {
      name: rider.userId.name,
      avatar: rider.userId.avatar,
      vehicleType: rider.vehicleType,
      rating: rider.rating,
    },

    location: {
      latitude: riderLocation.location.coordinates[1],
      longitude: riderLocation.location.coordinates[0],
    },

    heading: riderLocation.heading,
    speed: riderLocation.speed,
    lastUpdated: riderLocation.lastUpdated,

    // Placeholders for future real-time tracking calculations
    distance,
    eta,
  };
};
