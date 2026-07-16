import mongoose from "mongoose";
import { ErrorHandler } from "../utils/index.js";
import { logger } from "../config/logger.js";
import {
  Delivery,
  DeliveryPartner,
  Order,
  Restaurant,
} from "../models/index.js";
import {
  DeliveryStatus,
  OrderStatus,
  RiderAvailabilityStatus,
} from "../types/index.js";
import {
  buildDeliveryResponse,
  buildRiderDeliveryResponse,
} from "../helpers/delivery.helper.js";
import { DELIVERY_STATUS_FLOW } from "../constants/delivery.constants.js";

export const assignRider = async (
  userId: string,
  orderId: string,
  deliveryPartnerId: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const restaurant = await Restaurant.findOne(
      {
        ownerId: userId,
      },
      null,
      { session },
    ).select("_id");

    if (!restaurant) {
      throw new ErrorHandler(404, "Restaurant not found.");
    }

    const order = await Order.findOne(
      {
        _id: orderId,
        restaurantId: restaurant._id,
      },
      null,
      { session },
    );

    if (!order) {
      throw new ErrorHandler(404, "Order not found.");
    }

    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new ErrorHandler(400, "Order is not ready for pickup.");
    }

    const existingDelivery = await Delivery.findOne(
      {
        orderId,
      },
      null,
      { session },
    );

    if (existingDelivery) {
      throw new ErrorHandler(400, "Delivery already exists.");
    }

    const rider = await DeliveryPartner.findById(deliveryPartnerId, null, {
      session,
    });

    if (!rider) {
      throw new ErrorHandler(404, "Delivery partner not found.");
    }

    if (!rider.isVerified) {
      throw new ErrorHandler(400, "Delivery partner is not verified.");
    }

    if (!rider.isActive) {
      throw new ErrorHandler(400, "Delivery partner is inactive.");
    }

    if (rider.availabilityStatus !== RiderAvailabilityStatus.AVAILABLE) {
      throw new ErrorHandler(400, "Delivery partner is unavailable.");
    }

    const delivery = await Delivery.create(
      [
        {
          orderId,
          deliveryPartnerId,
          status: DeliveryStatus.ASSIGNED,
        },
      ],
      { session },
    );

    rider.availabilityStatus = RiderAvailabilityStatus.BUSY;

    await rider.save({
      session,
    });

    await session.commitTransaction();

    logger.info(
      {
        deliveryId: delivery[0]._id.toString(),
        orderId,
        deliveryPartnerId,
      },
      "Rider assigned to delivery",
    );

    return await buildDeliveryResponse(delivery[0]._id.toString(), session);
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getMyDeliveries = async (userId: string) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  const deliveries = await Delivery.find({
    deliveryPartnerId: deliveryPartner._id,
    status: {
      $nin: [DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED],
    },
  })
    .sort({
      assignedAt: -1,
    })
    .select("_id");

  return await Promise.all(
    deliveries.map((delivery) =>
      buildRiderDeliveryResponse(delivery._id.toString()),
    ),
  );
};
export const acceptDelivery = async (userId: string, deliveryId: string) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPartnerId: deliveryPartner._id,
  });

  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }

  const allowedStatuses = DELIVERY_STATUS_FLOW[delivery.status];

  if (!allowedStatuses.includes(DeliveryStatus.ACCEPTED)) {
    throw new ErrorHandler(
      400,
      `Cannot change delivery status from ${delivery.status} to ${DeliveryStatus.ACCEPTED}.`,
    );
  }

  delivery.status = DeliveryStatus.ACCEPTED;

  delivery.acceptedAt = new Date();

  await delivery.save();

  await Order.findByIdAndUpdate(delivery.orderId, {
    status: OrderStatus.OUT_FOR_DELIVERY,
  });

  logger.info(
    {
      deliveryId: delivery._id.toString(),
      deliveryPartnerId: deliveryPartner._id.toString(),
      orderId: delivery.orderId.toString(),
    },
    "Delivery accepted by rider",
  );

  return await buildRiderDeliveryResponse(delivery._id.toString());
};

export const reachPickup = async (userId: string, deliveryId: string) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPartnerId: deliveryPartner._id,
  });

  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }

  const allowedStatuses = DELIVERY_STATUS_FLOW[delivery.status];

  if (!allowedStatuses.includes(DeliveryStatus.REACHED_PICKUP)) {
    throw new ErrorHandler(
      400,
      `Cannot change delivery status from ${delivery.status} to ${DeliveryStatus.REACHED_PICKUP}.`,
    );
  }

  delivery.status = DeliveryStatus.REACHED_PICKUP;

  delivery.reachedPickupAt = new Date();

  await delivery.save();

  return await buildRiderDeliveryResponse(delivery._id.toString());
};

export const pickUpOrder = async (userId: string, deliveryId: string) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPartnerId: deliveryPartner._id,
  });

  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }

  const allowedStatuses = DELIVERY_STATUS_FLOW[delivery.status];

  if (!allowedStatuses.includes(DeliveryStatus.PICKED_UP)) {
    throw new ErrorHandler(
      400,
      `Cannot change delivery status from ${delivery.status} to ${DeliveryStatus.PICKED_UP}.`,
    );
  }

  delivery.status = DeliveryStatus.PICKED_UP;

  delivery.pickedUpAt = new Date();

  await delivery.save();

  return await buildRiderDeliveryResponse(delivery._id.toString());
};

export const outForDelivery = async (userId: string, deliveryId: string) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }

  const delivery = await Delivery.findOne({
    _id: deliveryId,
    deliveryPartnerId: deliveryPartner._id,
  });

  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }

  const allowedStatuses = DELIVERY_STATUS_FLOW[delivery.status];

  if (!allowedStatuses.includes(DeliveryStatus.OUT_FOR_DELIVERY)) {
    throw new ErrorHandler(
      400,
      `Cannot change delivery status from ${delivery.status} to ${DeliveryStatus.OUT_FOR_DELIVERY}.`,
    );
  }

  delivery.status = DeliveryStatus.OUT_FOR_DELIVERY;

  delivery.outForDeliveryAt = new Date();

  await delivery.save();

  return await buildRiderDeliveryResponse(delivery._id.toString());
};

export const deliverOrder = async (userId: string, deliveryId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deliveryPartner = await DeliveryPartner.findOne({ userId }, null, {
      session,
    });

    if (!deliveryPartner) {
      throw new ErrorHandler(404, "Delivery partner not found.");
    }

    const delivery = await Delivery.findOne(
      {
        _id: deliveryId,
        deliveryPartnerId: deliveryPartner._id,
      },
      null,
      { session },
    );

    if (!delivery) {
      throw new ErrorHandler(404, "Delivery not found.");
    }

    const allowedStatuses = DELIVERY_STATUS_FLOW[delivery.status];

    if (!allowedStatuses.includes(DeliveryStatus.DELIVERED)) {
      throw new ErrorHandler(
        400,
        `Cannot change delivery status from ${delivery.status} to ${DeliveryStatus.DELIVERED}.`,
      );
    }
    delivery.status = DeliveryStatus.DELIVERED;
    delivery.deliveredAt = new Date();

    await delivery.save({ session });

    await Order.findByIdAndUpdate(
      delivery.orderId,
      {
        status: OrderStatus.DELIVERED,
      },
      { session },
    );

    deliveryPartner.availabilityStatus = RiderAvailabilityStatus.AVAILABLE;

    deliveryPartner.totalDeliveries += 1;

    // Update rider earnings if applicable
    // deliveryPartner.totalEarnings += commissionAmount;

    await deliveryPartner.save({
      session,
    });
    await session.commitTransaction();

    return await buildRiderDeliveryResponse(delivery._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
