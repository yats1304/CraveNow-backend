import { PaymentMethod } from "./payment.types.js";

export enum OrderStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum OrderCancelledBy {
  CUSTOMER = "CUSTOMER",
  RESTAURANT = "RESTAURANT",
  ADMIN = "ADMIN",
  DELIVERY_RIDER = "DELIVERY_RIDER",
}

export interface CreateOrderDto {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateRestaurantOrderStatusDto {
  status: OrderStatus;
}

export interface CancelOrderDto {
  reason?: string;
}
