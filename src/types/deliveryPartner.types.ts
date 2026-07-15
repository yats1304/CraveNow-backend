export enum RiderAvailabilityStatus {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
  AVAILABLE = "AVAILABLE",
  BUSY = "BUSY",
}

export enum VehicleType {
  BIKE = "BIKE",
  SCOOTER = "SCOOTER",
  BICYCLE = "BICYCLE",
  CAR = "CAR",
}

export interface RegisterDeliveryPartnerDto {
  vehicleType: VehicleType;
  vehicleNumber: string;
  drivingLicenseNumber: string;
}

export interface UpdateDeliveryPartnerDto {
  vehicleType?: VehicleType;
  vehicleNumber?: string;
}

export interface UpdateAvailabilityDto {
  availabilityStatus: RiderAvailabilityStatus;
}
