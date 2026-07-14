import * as orderService from "../services/index.js";
import { TryCatch } from "../utils/index.js";

export const createOrder = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await orderService.createOrder(userId, req.body);

  return res.status(201).json(data);
});

export const getMyOrders = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await orderService.getMyOrders(userId);

  return res.json(data);
});

export const getOrderById = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const orderId = req.params.orderId as string;

  const data = await orderService.getOrderById(userId, orderId);

  return res.json(data);
});

export const cancelOrder = TryCatch(async (req, res) => {
  const { userId, role } = req.user!;

  const orderId = req.params.orderId as string;

  const data = await orderService.cancelOrder(userId, orderId, req.body, role);

  return res.json(data);
});

export const getRestaurantOrders = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await orderService.getRestaurantOrders(userId);

  return res.json(data);
});

export const getRestaurantOrderById = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const orderId = req.params.orderId as string;

  const data = await orderService.getRestaurantOrderById(userId, orderId);

  return res.json(data);
});

export const updateRestaurantOrderStatus = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const orderId = req.params.orderId as string;

  const data = await orderService.updateRestaurantUpdateStatus(
    userId,
    orderId,
    req.body,
  );

  return res.json(data);
});
