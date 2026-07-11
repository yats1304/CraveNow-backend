import { AddressOwnerTypes } from "../types/index.js";

export const ADDRESS_LIMIT = {
  [AddressOwnerTypes.USER]: 7,
  [AddressOwnerTypes.RESTAURANT]: 1,
  [AddressOwnerTypes.DELIVERY_RIDER]: 1,
} as const;
