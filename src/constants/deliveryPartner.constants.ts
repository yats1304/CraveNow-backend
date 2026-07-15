import { RiderAvailabilityStatus } from "../types/index.js";

export const RIDER_AVAILABILITY_FLOW: Record<
  RiderAvailabilityStatus,
  RiderAvailabilityStatus[]
> = {
  [RiderAvailabilityStatus.OFFLINE]: [RiderAvailabilityStatus.ONLINE],

  [RiderAvailabilityStatus.ONLINE]: [
    RiderAvailabilityStatus.AVAILABLE,
    RiderAvailabilityStatus.OFFLINE,
  ],

  [RiderAvailabilityStatus.AVAILABLE]: [RiderAvailabilityStatus.OFFLINE],

  [RiderAvailabilityStatus.BUSY]: [],
};
