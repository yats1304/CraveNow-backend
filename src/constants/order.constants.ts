import { OrderStatus } from "../types/index.js";

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.ACCEPTED],

  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING],

  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],

  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],

  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],

  [OrderStatus.DELIVERED]: [],

  [OrderStatus.CANCELLED]: [],
};
