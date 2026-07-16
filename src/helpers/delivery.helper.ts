import mongoose from "mongoose";
import { Delivery } from "../models/delivery.model.js";
import { ErrorHandler } from "../utils/index.js";

export const buildDeliveryResponse = async (
  deliveryId: string,
  session?: mongoose.ClientSession,
) => {
  const delivery = await Delivery.findById(deliveryId, null, { session })
    .populate({
      path: "orderId",
      select:
        "orderNumber status paymentMethod paymentStatus total estimatedDeliveryTime",
    })
    .populate({
      path: "deliveryPartnerId",
      select: "vehicleType availabilityStatus rating",
      populate: {
        path: "userId",
        select: "name phone avatar",
      },
    })
    .lean();

  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }

  const rider = delivery.deliveryPartnerId as any;
  const order = delivery.orderId as any;

  return {
    deliveryId: delivery._id,
    status: delivery.status,

    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      total: order.total,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
    },

    rider: {
      id: rider._id,
      name: rider.userId.name,
      phone: rider.userId.phone,
      avatar: rider.userId.avatar,
      vehicleType: rider.vehicleType,
      availabilityStatus: rider.availabilityStatus,
      rating: rider.rating,
    },

    assignedAt: delivery.assignedAt,
    acceptedAt: delivery.acceptedAt,
    reachedPickupAt: delivery.reachedPickupAt,
    pickedUpAt: delivery.pickedUpAt,
    outForDeliveryAt: delivery.outForDeliveryAt,
    deliveredAt: delivery.deliveredAt,
    cancelledAt: delivery.cancelledAt,
    estimatedPickupTime: delivery.estimatedPickupTime,
    estimatedDeliveryTime: delivery.estimatedDeliveryTime,
    notes: delivery.notes,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
  };
};

export const buildRiderDeliveryResponse = async (deliveryId: string) => {
  const delivery = await Delivery.findById(deliveryId)
    .populate({
      path: "orderId",
      populate: [
        {
          path: "restaurantId",
          select: "name logo phone address location",
        },
        {
          path: "userId",
          select: "name phone",
        },
        {
          path: "addressId",
          select:
            "addressLine1 addressLine2 city state pincode location landmark",
        },
      ],
      select:
        "orderNumber total paymentMethod paymentStatus estimatedDeliveryTime",
    })
    .populate({
      path: "deliveryPartnerId",
      select: "vehicleType",
      populate: {
        path: "userId",
        select: "name",
      },
    })
    .lean();

  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }

  const order = delivery.orderId as any;

  return {
    deliveryId: delivery._id,
    status: delivery.status,
    assignedAt: delivery.assignedAt,
    acceptedAt: delivery.acceptedAt,
    reachedPickupAt: delivery.reachedPickupAt,
    pickedUpAt: delivery.pickedUpAt,
    outForDeliveryAt: delivery.outForDeliveryAt,
    deliveredAt: delivery.deliveredAt,
    estimatedPickupTime: delivery.estimatedPickupTime,
    estimatedDeliveryTime: delivery.estimatedDeliveryTime,

    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
    },

    restaurant: order.restaurantId,
    customer: order.userId,
    deliveryAddress: order.addressId,
    notes: delivery.notes,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
  };
};
