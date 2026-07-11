import { UpdateRestaurantDto } from "../types/index.js";
import { RestaurantStatus } from "../types/index.js";

export const RESTAURANT_VERIFICATION_FIELDS: (keyof UpdateRestaurantDto)[] = [
  "name",
  "restaurantType",
  "gstNumber",
  "fssaiLicenseNumber",
  "primaryAddressId",
];

export const DEFAULT_PREPARATION_TIME = 30;
export const DEFAULT_DELIVERY_RADIUS = 5;
export const DEFAULT_MINIMUM_ORDER = 0;
export const DEFAULT_RESTAURANT_STATUS = RestaurantStatus.PENDING;
