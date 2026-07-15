import mongoose from "mongoose";
import { logger } from "../config/logger.js";

import { Address, Cart, Restaurant } from "../models/index.js";
import {
  CancelOrderDto,
  CreateOrderDto,
  OrderCancelledBy,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RestaurantStatus,
  UpdateRestaurantOrderStatusDto,
} from "../types/index.js";
import { ErrorHandler } from "../utils/index.js";
import { CartItem } from "../models/cartItem.model.js";
import { buildOrderResponse, generateOrderNumber } from "../helpers/index.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Order } from "../models/order.model.js";
import { ORDER_STATUS_FLOW } from "../constants/order.constants.js";

export const createOrder = async (userId: string, data: CreateOrderDto) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne({ userId }, null, { session });

    if (!cart) {
      throw new ErrorHandler(404, "Cart not found.");
    }

    const cartItems = await CartItem.find(
      {
        cartId: cart._id,
      },
      null,
      { session },
    ).populate({
      path: "menuItemId",
      select: "name",
    });

    if (cartItems.length === 0) {
      throw new ErrorHandler(400, "Your cart is empty.");
    }

    const restaurant = await Restaurant.findById(cart.restaurantId, null, {
      session,
    });

    if (!restaurant) {
      throw new ErrorHandler(404, "Restaurant not found.");
    }

    if (
      !restaurant.isOpen ||
      !restaurant.isVerified ||
      restaurant.status !== RestaurantStatus.APPROVED
    ) {
      throw new ErrorHandler(400, "Restaurant is currently unavailable.");
    }

    const address = await Address.findOne(
      {
        _id: data.addressId,
        userId,
      },
      null,
      { session },
    );

    if (!address) {
      throw new ErrorHandler(404, "Address not found.");
    }

    const orderNumber = await generateOrderNumber(session);

    const order = await Order.create(
      [
        {
          orderNumber,
          userId,
          restaurantId: cart.restaurantId,
          addressId: address._id,

          paymentMethod: data.paymentMethod,
          status:
            data.paymentMethod === PaymentMethod.COD
              ? OrderStatus.PENDING
              : OrderStatus.AWAITING_PAYMENT,

          subtotal: cart.subtotal,
          discount: cart.discount,
          tax: cart.tax,
          deliveryFee: 0,
          total: cart.total,

          notes: data.notes,
        },
      ],
      {
        session,
      },
    ).then((docs) => docs[0]);

    const orderItems = cartItems.map((item) => {
      const menuItem = item.menuItemId as any;
      return {
        orderId: order._id,

        menuItemId: menuItem._id,

        nameSnapshot: menuItem.name,

        unitPriceSnapshot: item.unitPriceSnapshot,

        quantity: item.quantity,

        totalPrice: item.unitPriceSnapshot * item.quantity,

        specialInstructions: item.specialInstructions,
      };
    });

    await OrderItem.insertMany(orderItems, {
      session,
    });

    await Promise.all([
      CartItem.deleteMany(
        {
          cartId: cart._id,
        },
        {
          session,
        },
      ),

      Cart.deleteOne(
        {
          _id: cart._id,
        },
        {
          session,
        },
      ),
    ]);

    await session.commitTransaction();

    logger.info({
      orderId: order._id.toString(),
      userId,
      restaurantId: order.restaurantId.toString(),
      total: order.total,
    }, "Order created");


    return {
      success: true,
      message: "Order placed successfully.",
      order: await buildOrderResponse(order._id.toString()),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (userId: string) => {
  const orders = await Order.find({
    userId,
  })
    .populate({
      path: "restaurantId",
      select: "name logo banner",
    })
    .sort({ createAt: 1 })
    .lean();

  return {
    success: true,
    count: orders.length,
    orders,
  };
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  if (order.userId.toString() !== userId) {
    throw new ErrorHandler(403, "You are not authorized to access this order.");
  }

  return await buildOrderResponse(order._id.toString());
};

export const cancelOrder = async (
  userId: string,
  orderId: string,
  data: CancelOrderDto,
  role: string,
) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  if (
    ![
      OrderStatus.AWAITING_PAYMENT,
      OrderStatus.PENDING,
      OrderStatus.ACCEPTED,
    ].includes(order.status)
  ) {
    throw new ErrorHandler(400, "This order can no longer be cancelled.");
  }

  order.status = OrderStatus.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelledBy = role as OrderCancelledBy;
  order.cancellationReason = data.reason;

  //   // Future payment integration
  //   if (order.paymentStatus === PaymentStatus.PAID) {
  //     // Trigger refund workflow here
  //   }

  logger.info({
    orderId: order._id.toString(),
    userId,
    cancelledBy: role,
    reason: data.reason,
  }, "Order cancelled");

  await order.save();

  return await buildOrderResponse(order._id.toString());
};

export const getRestaurantOrders = async (userId: string) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  }).select("_id");

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  const orders = await Order.find({
    restaurantId: restaurant._id,
    status: { $ne: OrderStatus.AWAITING_PAYMENT },
  })
    .sort({
      createdAt: -1,
    })
    .select("_id")
    .lean();

  const response = await Promise.all(
    orders.map((order) => buildOrderResponse(order._id.toString())),
  );

  return {
    success: true,
    count: response.length,
    orders: response,
  };
};

export const getRestaurantOrderById = async (
  userId: string,
  orderId: string,
) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  }).select("_id");

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  const order = await Order.findOne({
    _id: orderId,
    restaurantId: restaurant._id,
  });

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  return await buildOrderResponse(order._id.toString());
};

export const updateRestaurantUpdateStatus = async (
  userId: string,
  orderId: string,
  data: UpdateRestaurantOrderStatusDto,
) => {
  const restaurant = await Restaurant.findOne({
    ownerId: userId,
  }).select("_id");

  if (!restaurant) {
    throw new ErrorHandler(404, "Restaurant not found.");
  }

  const order = await Order.findOne({
    _id: orderId,
    restaurantId: restaurant._id,
  });

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  if (order.status === OrderStatus.AWAITING_PAYMENT) {
    throw new ErrorHandler(400, "Waiting for customer payment.");
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new ErrorHandler(400, "Cancelled orders cannot be updated.");
  }

  const allowedStatuses = ORDER_STATUS_FLOW[order.status];

  if (!allowedStatuses.includes(data.status)) {
    throw new ErrorHandler(
      400,
      `Invalid status transition from ${order.status} to ${data.status}.`,
    );
  }

  const oldStatus = order.status;
  order.status = data.status;

  logger.info({
    orderId: order._id.toString(),
    restaurantId: restaurant._id.toString(),
    previousStatus: oldStatus,
    newStatus: data.status,
  }, "Order status updated");

  await order.save();

  return await buildOrderResponse(order._id.toString());
};

// export const handleOrderPaymentSuccess = async (orderId: string) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const order = await Order.findOne({ _id: orderId }, null, { session });

//     if (!order) {
//       throw new ErrorHandler(404, "Order not found.");
//     }

//     if (order.status !== OrderStatus.AWAITING_PAYMENT) {
//       throw new ErrorHandler(
//         400,
//         `Cannot process payment for order in ${order.status} state.`,
//       );
//     }

//     order.status = OrderStatus.PENDING;
//     order.paymentStatus = PaymentStatus.PAID;

//     await order.save({ session });

//     await session.commitTransaction();

//     return await buildOrderResponse(order._id.toString());
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     await session.endSession();
//   }
// };
