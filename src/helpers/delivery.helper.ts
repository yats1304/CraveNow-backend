import mongoose from "mongoose";
import { Delivery } from "../models/delivery.model.js";
import { ErrorHandler } from "../utils/index.js";
import { Restaurant, User } from "../models/index.js";

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

export const calculateRiderEarnings = (order: any): number => {
  // TODO: Support future payout models:
  // - distance based
  // - surge pricing
  // - incentives
  // - peak hour bonus
  
  // Initially: earning = fixed delivery fee
  const baseDeliveryFee = order.deliveryFee || 40; 
  return baseDeliveryFee;
};

export const updateRestaurantAnalytics = async (
  restaurantId: string,
  orderTotal: number,
  session?: mongoose.ClientSession,
) => {
  await Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      $inc: {
        totalCompletedOrders: 1,
        todayCompletedOrders: 1,
      },
    },
    { session },
  );
};

export const updateCustomerAnalytics = async (
  userId: string,
  orderTotal: number,
  session?: mongoose.ClientSession,
) => {
  const user = await User.findById(userId, null, { session });
  if (user) {
    const totalOrders = (user.totalOrders || 0) + 1;
    const lifetimeSpend = (user.lifetimeSpend || 0) + orderTotal;
    const averageOrderValue = totalOrders > 0 ? lifetimeSpend / totalOrders : 0;

    user.totalOrders = totalOrders;
    user.lastOrderDate = new Date();
    user.lifetimeSpend = lifetimeSpend;
    user.averageOrderValue = averageOrderValue;

    await user.save({ session });
  }
};
