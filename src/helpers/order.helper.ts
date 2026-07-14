import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { ErrorHandler } from "../utils/index.js";

export const buildOrderResponse = async (orderId: string) => {
  const [order, items] = await Promise.all([
    Order.findById(orderId)
      .populate({
        path: "restaurantId",
        select: "name logo banner isOpen",
      })
      .populate({
        path: "addressId",
      })
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .lean(),

    OrderItem.find({
      orderId,
    })
      .populate({
        path: "menuItemId",
        select: "images foodType isAvailable",
      })
      .lean(),
  ]);

  if (!order) {
    throw new ErrorHandler(404, "Order not found.");
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const formattedItems = items.map((item) => {
    const menuItem = item.menuItemId as any;
    return {
      orderItemId: item._id,
      menuItem: {
        _id: menuItem?._id,
        images: menuItem?.images,
        foodType: menuItem?.foodType,
        isAvailable: menuItem?.isAvailable,
      },
      name: item.nameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPriceSnapshot,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
    };
  });

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    customer: order.userId,
    restaurant: order.restaurantId,
    address: order.addressId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    cancelledAt: order.cancelledAt,
    cancelledBy: order.cancelledBy,
    cancellationReason: order.cancellationReason,
    itemCount: items.length,
    totalQuantity,
    items: formattedItems,
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    tax: order.tax,
    total: order.total,
    notes: order.notes,
    createdAt: order.createdAt,
  };
};
