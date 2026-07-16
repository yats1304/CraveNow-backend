import * as deliveryService from "../services/delivery.service.js";
import { TryCatch } from "../utils/index.js";

export const assignRider = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const orderId = req.params.orderId as string;

  const delivery = await deliveryService.assignRider(
    userId,
    orderId,
    req.body.deliveryPartnerId,
  );

  return res.json(delivery);
});

export const getMyDeliveries = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveries = await deliveryService.getMyDeliveries(userId);

  return res.json({
    deliveries,
  });
});

export const acceptDelivery = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryId = req.params.deliveryId as string;

  const delivery = await deliveryService.acceptDelivery(userId, deliveryId);

  return res.json(delivery);
});

export const reachPickup = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryId = req.params.deliveryId as string;

  const delivery = await deliveryService.reachPickup(userId, deliveryId);

  return res.json(delivery);
});

export const pickUpOrder = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryId = req.params.deliveryId as string;

  const delivery = await deliveryService.pickUpOrder(userId, deliveryId);

  return res.json(delivery);
});

export const outForDelivery = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryId = req.params.deliveryId as string;

  const delivery = await deliveryService.outForDelivery(userId, deliveryId);

  return res.json(delivery);
});

export const deliverOrder = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const deliveryId = req.params.deliveryId as string;

  const delivery = await deliveryService.deliverOrder(userId, deliveryId);

  return res.json(delivery);
});
