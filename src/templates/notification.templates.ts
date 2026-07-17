import {
  NotificationAction,
  NotificationPriority,
  NotificationType,
} from "../types/index.js";

export interface NotificationTemplate {
  title: string;
  message: string;
  priority: NotificationPriority;
  action: NotificationAction;
}

export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  NotificationTemplate
> = {
  //  Orders
  [NotificationType.ORDER_CREATED]: {
    title: "Order Placed",
    message: "Your order has been placed successfully.",
    priority: NotificationPriority.NORMAL,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.ORDER_CONFIRMED]: {
    title: "Order Confirmed",
    message: "The restaurant has confirmed your order.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.ORDER_PREPARING]: {
    title: "Preparing Your Food",
    message: "The restaurant is preparing your order.",
    priority: NotificationPriority.NORMAL,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.ORDER_READY_FOR_PICKUP]: {
    title: "Order Ready",
    message: "Your order is ready for pickup by the delivery partner.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.ORDER_OUT_FOR_DELIVERY]: {
    title: "Out For Delivery",
    message: "Your order is on the way.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.ORDER_DELIVERED]: {
    title: "Order Delivered",
    message: "Enjoy your meal! Your order has been delivered.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.ORDER_CANCELLED]: {
    title: "Order Cancelled",
    message: "Your order has been cancelled.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_ORDER,
  },

  // Payments
  [NotificationType.PAYMENT_PENDING]: {
    title: "Payment Pending",
    message: "Please complete your payment.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_PAYMENT,
  },

  [NotificationType.PAYMENT_SUCCESS]: {
    title: "Payment Successful",
    message: "Your payment has been received.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_PAYMENT,
  },

  [NotificationType.PAYMENT_FAILED]: {
    title: "Payment Failed",
    message: "Your payment could not be processed.",
    priority: NotificationPriority.URGENT,
    action: NotificationAction.OPEN_PAYMENT,
  },

  [NotificationType.PAYMENT_REFUNDED]: {
    title: "Refund Processed",
    message: "Your refund has been initiated.",
    priority: NotificationPriority.NORMAL,
    action: NotificationAction.OPEN_PAYMENT,
  },

  //Delivery
  [NotificationType.RIDER_ASSIGNED]: {
    title: "Delivery Partner Assigned",
    message: "A delivery partner has been assigned to your order.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_DELIVERY,
  },

  [NotificationType.RIDER_ACCEPTED]: {
    title: "Delivery Partner Accepted",
    message: "Your delivery partner is heading to the restaurant.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_DELIVERY,
  },

  [NotificationType.RIDER_REACHED_PICKUP]: {
    title: "Rider Arrived",
    message: "The delivery partner has reached the restaurant.",
    priority: NotificationPriority.NORMAL,
    action: NotificationAction.OPEN_DELIVERY,
  },

  [NotificationType.RIDER_PICKED_UP]: {
    title: "Order Picked Up",
    message: "Your order has been picked up.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_DELIVERY,
  },

  [NotificationType.RIDER_LOCATION_UPDATED]: {
    title: "Live Tracking",
    message: "Delivery partner location updated.",
    priority: NotificationPriority.LOW,
    action: NotificationAction.OPEN_DELIVERY,
  },

  // Restaurant
  [NotificationType.NEW_ORDER]: {
    title: "New Order",
    message: "You have received a new order.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_ORDER,
  },

  [NotificationType.RESTAURANT_APPROVED]: {
    title: "Restaurant Approved",
    message: "Your restaurant has been approved.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_RESTAURANT,
  },

  [NotificationType.RESTAURANT_REJECTED]: {
    title: "Restaurant Rejected",
    message: "Your restaurant verification was rejected.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_RESTAURANT,
  },

  // Delivery Partner
  [NotificationType.DELIVERY_PARTNER_APPROVED]: {
    title: "Account Approved",
    message: "Your delivery partner account has been approved.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_PROFILE,
  },

  [NotificationType.DELIVERY_PARTNER_REJECTED]: {
    title: "Account Rejected",
    message: "Your delivery partner account verification failed.",
    priority: NotificationPriority.HIGH,
    action: NotificationAction.OPEN_PROFILE,
  },

  //Marketing (for future)
  [NotificationType.COUPON]: {
    title: "New Coupon",
    message: "A new coupon is available for you.",
    priority: NotificationPriority.NORMAL,
    action: NotificationAction.NONE,
  },

  [NotificationType.PROMOTION]: {
    title: "Special Offer",
    message: "Check out today's exciting offers.",
    priority: NotificationPriority.LOW,
    action: NotificationAction.NONE,
  },

  //System
  [NotificationType.SYSTEM]: {
    title: "System Notification",
    message: "You have a new notification.",
    priority: NotificationPriority.NORMAL,
    action: NotificationAction.NONE,
  },
};

export const getNotificationTemplate = (
  type: NotificationType,
): NotificationTemplate => {
  return NOTIFICATION_TEMPLATES[type];
};
