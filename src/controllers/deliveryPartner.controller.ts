import * as deliveryPartnerService from "../services/index.js";
import { TryCatch } from "../utils/index.js";

export const registerDeliveryPartner = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryPartner = await deliveryPartnerService.registerDeliveryPartner(
    userId,
    req.body,
  );

  return res.status(201).json(deliveryPartner);
});

export const getMyDeliveryPartnerProfile = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryPartner =
    await deliveryPartnerService.getMyDeliveryPartnerProfile(userId);

  return res.json(deliveryPartner);
});

export const updateDeliveryPartner = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryPartner = await deliveryPartnerService.updateDeliveryPartner(
    userId,
    req.body,
  );

  return res.json(deliveryPartner);
});

export const updateAvailability = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryPartner = await deliveryPartnerService.updateAvailability(
    userId,
    req.body,
  );

  return res.json(deliveryPartner);
});
