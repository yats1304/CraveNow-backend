import { DeliveryStatus } from "../types/index.js";

export const DELIVERY_STATUS_FLOW: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.ASSIGNED]: [
    DeliveryStatus.ACCEPTED,
    DeliveryStatus.CANCELLED,
  ],

  [DeliveryStatus.ACCEPTED]: [DeliveryStatus.REACHED_PICKUP],

  [DeliveryStatus.REACHED_PICKUP]: [DeliveryStatus.PICKED_UP],

  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.OUT_FOR_DELIVERY],

  [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED],

  [DeliveryStatus.DELIVERED]: [],

  [DeliveryStatus.CANCELLED]: [],
};
