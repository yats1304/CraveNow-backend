export enum DeliveryStatus {
  ASSIGNED = "ASSIGNED",
  ACCEPTED = "ACCEPTED",
  REACHED_PICKUP = "REACHED_PICKUP",
  PICKED_UP = "PICKED_UP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface AssignRiderDto {
  deliveryPartnerId: string;
}

export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
}
