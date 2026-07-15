import { DeliveryPartner } from "../models/index.js";
import {
  RegisterDeliveryPartnerDto,
  RiderAvailabilityStatus,
  UpdateAvailabilityDto,
  UpdateDeliveryPartnerDto,
} from "../types/index.js";
import { ErrorHandler } from "../utils/index.js";
import { logger } from "../config/logger.js";
import { buildDeliveryPartnerResponse } from "../helpers/deliveryPartner.helper.js";
import { RIDER_AVAILABILITY_FLOW } from "../constants/deliveryPartner.constants.js";

export const registerDeliveryPartner = async (
  userId: string,
  data: RegisterDeliveryPartnerDto,
) => {
  const existingPartner = await DeliveryPartner.findOne({
    userId,
  });

  if (existingPartner) {
    throw new ErrorHandler(400, "Delivery partner profile already exists.");
  }

  const vehicleExists = await DeliveryPartner.findOne({
    vehicleNumber: data.vehicleNumber.toUpperCase(),
  });

  if (vehicleExists) {
    throw new ErrorHandler(400, "Vehicle number is already registered.");
  }

  const licenseExists = await DeliveryPartner.findOne({
    drivingLicenseNumber: data.drivingLicenseNumber.toUpperCase(),
  });

  if (licenseExists) {
    throw new ErrorHandler(400, "Driving license is already registered.");
  }
  const normalizedVehicleNumber = data.vehicleNumber
    .replace(/[\s-]/g, "")
    .toUpperCase();

  const deliveryPartner = await DeliveryPartner.create({
    userId,
    vehicleType: data.vehicleType,
    vehicleNumber: normalizedVehicleNumber,
    drivingLicenseNumber: data.drivingLicenseNumber,
  });

  logger.info(
    {
      deliveryPartnerId: deliveryPartner._id.toString(),
      userId,
      vehicleType: data.vehicleType,
    },
    "Delivery partner registered",
  );

  return await buildDeliveryPartnerResponse(deliveryPartner._id.toString());
};

export const getMyDeliveryPartnerProfile = async (userId: string) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  }).select("_id");

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner profile not found.");
  }

  return await buildDeliveryPartnerResponse(deliveryPartner._id.toString());
};

export const updateDeliveryPartner = async (
  userId: string,
  data: UpdateDeliveryPartnerDto,
) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  });

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner profile not found.");
  }

  if (deliveryPartner.availabilityStatus === RiderAvailabilityStatus.BUSY) {
    throw new ErrorHandler(
      400,
      "Vehicle details cannot be updated while you have an active delivery.",
    );
  }

  if (
    data.vehicleNumber &&
    data.vehicleNumber.toUpperCase() !== deliveryPartner.vehicleNumber
  ) {
    const existingVehicle = await DeliveryPartner.findOne({
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      _id: { $ne: deliveryPartner._id },
    });

    if (existingVehicle) {
      throw new ErrorHandler(400, "Vehicle number is already registered.");
    }

    const normalizedVehicleNumber = data.vehicleNumber
      .replace(/[\s-]/g, "")
      .toUpperCase();

    deliveryPartner.vehicleNumber = normalizedVehicleNumber.toUpperCase();
  }

  if (data.vehicleType) {
    deliveryPartner.vehicleType = data.vehicleType;
  }

  await deliveryPartner.save();

  logger.info(
    {
      deliveryPartnerId: deliveryPartner._id.toString(),
      userId,
      vehicleType: deliveryPartner.vehicleType,
    },
    "Delivery partner details updated",
  );

  return await buildDeliveryPartnerResponse(deliveryPartner._id.toString());
};

export const updateAvailability = async (
  userId: string,
  data: UpdateAvailabilityDto,
) => {
  const deliveryPartner = await DeliveryPartner.findOne({
    userId,
  });

  if (!deliveryPartner) {
    throw new ErrorHandler(404, "Delivery partner profile not found.");
  }

  if (!deliveryPartner.isVerified) {
    throw new ErrorHandler(403, "Your account is pending verification.");
  }

  if (!deliveryPartner.isActive) {
    throw new ErrorHandler(403, "Your account has been deactivated.");
  }

  if (data.availabilityStatus === RiderAvailabilityStatus.BUSY) {
    throw new ErrorHandler(
      400,
      "Busy status is managed automatically by the system.",
    );
  }

  const allowedStatuses =
    RIDER_AVAILABILITY_FLOW[deliveryPartner.availabilityStatus];

  if (!allowedStatuses.includes(data.availabilityStatus)) {
    throw new ErrorHandler(
      400,
      `Invalid availability transition from ${deliveryPartner.availabilityStatus} to ${data.availabilityStatus}.`,
    );
  }

  deliveryPartner.availabilityStatus = data.availabilityStatus;

  await deliveryPartner.save();

  logger.info(
    {
      deliveryPartnerId: deliveryPartner._id.toString(),
      userId,
      availabilityStatus: deliveryPartner.availabilityStatus,
    },
    "Delivery partner availability updated",
  );

  return await buildDeliveryPartnerResponse(deliveryPartner._id.toString());
};
