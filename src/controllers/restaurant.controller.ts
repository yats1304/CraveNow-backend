import { TryCatch } from "../utils/index.js";
import * as restaurantService from "../services/index.js";
import { User } from "../models/index.js";

export const createRestaurant = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await restaurantService.createRestaurant(userId, req.body);

  return res.status(201).json(data);
});

export const updateRestaurant = TryCatch(async (req, res) => {
  const { userId } = req.user!;
  const data = await restaurantService.updateRestaurant(userId, req.body);

  return res.json(data);
});

export const getMyRestaurant = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await restaurantService.getMyRestaurant(userId);

  return res.json(data);
});

export const updateRestaurantOpenStatus = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await restaurantService.updateRestaurantOpenStatus(
    userId,
    req.body.isOpen,
  );

  return res.json(data);
});

export const uploadRestaurantLogo = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await restaurantService.uploadRestaurantLogo(userId, req.file!);

  return res.json(data);
});
