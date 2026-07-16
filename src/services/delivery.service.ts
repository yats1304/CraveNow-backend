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
  PaymentMethod,
  PaymentStatus,
} from "../types/index.js";
import {
  buildDeliveryResponse,
  buildRiderDeliveryResponse,
  calculateRiderEarnings,
  updateRestaurantAnalytics,
  updateCustomerAnalytics,
} from "../helpers/delivery.helper.js";
import { DELIVERY_STATUS_FLOW } from "../constants/delivery.constants.js";

// --- Private Reusable Helpers ---

const getDeliveryPartnerByUser = async (
  userId: string,
  session?: mongoose.ClientSession,
) => {
  const deliveryPartner = await DeliveryPartner.findOne({ userId }, null, { session });
  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner not found.");
  }
  return deliveryPartner;
};

const getDeliveryForRider = async (
  deliveryId: string,
  deliveryPartnerId: any,
  session?: mongoose.ClientSession,
) => {
  const delivery = await Delivery.findOne(
    {
      _id: deliveryId,
      deliveryPartnerId,
    },
    null,
    { session },
  );
  if (!delivery) {
    throw new ErrorHandler(404, "Delivery not found.");
  }
  return delivery;
};

const validateDeliveryTransition = (
  currentStatus: DeliveryStatus,
  targetStatus: DeliveryStatus,
) => {
  const allowedStatuses = DELIVERY_STATUS_FLOW[currentStatus];
  if (!allowedStatuses || !allowedStatuses.includes(targetStatus)) {
    throw new ErrorHandler(
      400,
      `Cannot change delivery status from ${currentStatus} to ${targetStatus}.`,
    );
  }
};

const updateDeliveryStatus = async (
  delivery: any,
  status: DeliveryStatus,
  session?: mongoose.ClientSession,
) => {
  delivery.status = status;
  const now = new Date();

  switch (status) {
    case DeliveryStatus.ACCEPTED:
      delivery.acceptedAt = now;
      break;
    case DeliveryStatus.REACHED_PICKUP:
      delivery.reachedPickupAt = now;
      break;
    case DeliveryStatus.PICKED_UP:
      delivery.pickedUpAt = now;
      break;
    case DeliveryStatus.OUT_FOR_DELIVERY:
      delivery.outForDeliveryAt = now;
      break;
    case DeliveryStatus.DELIVERED:
      delivery.deliveredAt = now;
      break;
    case DeliveryStatus.CANCELLED:
      delivery.cancelledAt = now;
      break;
  }

  await delivery.save({ session });
  return delivery;
};



// --- Public Service APIs ---

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
      "Delivery Assigned",
    );

    // TODO: Socket.IO - Notify rider of the new assignment
    // TODO: Socket.IO - Notify admin

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
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deliveryPartner = await getDeliveryPartnerByUser(userId, session);
    const delivery = await getDeliveryForRider(deliveryId, deliveryPartner._id, session);

    validateDeliveryTransition(delivery.status, DeliveryStatus.ACCEPTED);

    await updateDeliveryStatus(delivery, DeliveryStatus.ACCEPTED, session);

    await session.commitTransaction();

    logger.info(
      {
        deliveryId: delivery._id.toString(),
        deliveryPartnerId: deliveryPartner._id.toString(),
        orderId: delivery.orderId.toString(),
      },
      "Delivery Accepted",
    );

    // TODO: Socket.IO - Notify customer
    // TODO: Socket.IO - Notify restaurant
    // TODO: Socket.IO - Notify admin

    return await buildRiderDeliveryResponse(delivery._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const reachPickup = async (userId: string, deliveryId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deliveryPartner = await getDeliveryPartnerByUser(userId, session);
    const delivery = await getDeliveryForRider(deliveryId, deliveryPartner._id, session);

    validateDeliveryTransition(delivery.status, DeliveryStatus.REACHED_PICKUP);

    await updateDeliveryStatus(delivery, DeliveryStatus.REACHED_PICKUP, session);

    await session.commitTransaction();

    logger.info(
      {
        deliveryId: delivery._id.toString(),
        deliveryPartnerId: deliveryPartner._id.toString(),
        orderId: delivery.orderId.toString(),
      },
      "Reached Pickup",
    );

    // TODO: Socket.IO - Notify customer
    // TODO: Socket.IO - Notify restaurant

    return await buildRiderDeliveryResponse(delivery._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const pickUpOrder = async (userId: string, deliveryId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deliveryPartner = await getDeliveryPartnerByUser(userId, session);
    const delivery = await getDeliveryForRider(deliveryId, deliveryPartner._id, session);

    validateDeliveryTransition(delivery.status, DeliveryStatus.PICKED_UP);

    await updateDeliveryStatus(delivery, DeliveryStatus.PICKED_UP, session);

    await session.commitTransaction();

    logger.info(
      {
        deliveryId: delivery._id.toString(),
        deliveryPartnerId: deliveryPartner._id.toString(),
        orderId: delivery.orderId.toString(),
      },
      "Picked Up",
    );

    // TODO: Socket.IO - Notify customer
    // TODO: Socket.IO - Notify restaurant

    return await buildRiderDeliveryResponse(delivery._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const outForDelivery = async (userId: string, deliveryId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deliveryPartner = await getDeliveryPartnerByUser(userId, session);
    const delivery = await getDeliveryForRider(deliveryId, deliveryPartner._id, session);

    validateDeliveryTransition(delivery.status, DeliveryStatus.OUT_FOR_DELIVERY);

    await updateDeliveryStatus(delivery, DeliveryStatus.OUT_FOR_DELIVERY, session);

    // Update corresponding Order status
    await Order.findByIdAndUpdate(
      delivery.orderId,
      { status: OrderStatus.OUT_FOR_DELIVERY },
      { session },
    );

    await session.commitTransaction();

    logger.info(
      {
        deliveryId: delivery._id.toString(),
        deliveryPartnerId: deliveryPartner._id.toString(),
        orderId: delivery.orderId.toString(),
      },
      "Out For Delivery",
    );

    // TODO: Socket.IO - Notify customer
    // TODO: Socket.IO - Notify restaurant

    return await buildRiderDeliveryResponse(delivery._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const deliverOrder = async (userId: string, deliveryId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deliveryPartner = await getDeliveryPartnerByUser(userId, session);
    const delivery = await getDeliveryForRider(deliveryId, deliveryPartner._id, session);

    validateDeliveryTransition(delivery.status, DeliveryStatus.DELIVERED);

    const order = await Order.findById(delivery.orderId, null, { session });
    if (!order) {
      throw new ErrorHandler(404, "Order not found.");
    }

    // 7. Payment Validation
    // ONLINE payment method must already be PAID.
    if (order.paymentMethod !== PaymentMethod.COD && order.paymentStatus !== PaymentStatus.PAID) {
      throw new ErrorHandler(400, "Payment has not been completed.");
    }

    // 1. Delivery Completion
    await updateDeliveryStatus(delivery, DeliveryStatus.DELIVERED, session);

    order.status = OrderStatus.DELIVERED;
    if (order.paymentMethod === PaymentMethod.COD) {
      order.paymentStatus = PaymentStatus.PAID;
    }
    await order.save({ session });

    // 2. Rider Earnings
    const earning = calculateRiderEarnings(order);
    deliveryPartner.totalEarnings = (deliveryPartner.totalEarnings || 0) + earning;

    // 3. Rider Statistics
    deliveryPartner.totalDeliveries = (deliveryPartner.totalDeliveries || 0) + 1;
    deliveryPartner.successfulDeliveries = (deliveryPartner.successfulDeliveries || 0) + 1;
    // Future-proof statistics updates:
    // TODO: Increment cancelledDeliveries if delivery is cancelled.
    // TODO: Update acceptanceRate based on accepted vs. assigned offers.
    // TODO: Update completionRate based on delivered vs. accepted offers.

    deliveryPartner.availabilityStatus = RiderAvailabilityStatus.AVAILABLE;
    await deliveryPartner.save({ session });

    // 4. Restaurant Analytics
    await updateRestaurantAnalytics(order.restaurantId.toString(), order.total, session);

    // 5. Customer Analytics
    await updateCustomerAnalytics(order.userId.toString(), order.total, session);

    // 6. Assignment History
    // TODO: Mark assignment as COMPLETED in AssignmentHistory module when implemented.

    await session.commitTransaction();

    logger.info(
      {
        deliveryId: delivery._id.toString(),
        deliveryPartnerId: deliveryPartner._id.toString(),
        orderId: delivery.orderId.toString(),
        earning,
      },
      "Delivered",
    );

    // 10. Socket.IO TODOs
    // TODO: Notify customer
    // TODO: Notify restaurant
    // TODO: Notify admin
    // TODO: Notify rider

    // 11. BullMQ TODOs
    // TODO: Generate invoice
    // TODO: Send rating notification
    // TODO: Release promotions
    // TODO: Loyalty points
    // TODO: Delivery completed event

    return await buildRiderDeliveryResponse(delivery._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
