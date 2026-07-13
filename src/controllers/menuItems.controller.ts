import * as menuItemService from "../services/index.js";
import { TryCatch } from "../utils/index.js";

export const createMenuItem = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const categoryId = req.params.categoryId as string;

  const data = await menuItemService.createMenuItem(
    userId,
    categoryId,
    req.body,
  );

  return res.status(201).json(data);
});

export const getRestaurantMenuItems = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await menuItemService.getRestaurantMenuItems(userId, req.query);

  return res.json(data);
});

export const getMenuItemById = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const menuItemId = req.params.menuItemId as string;

  const data = await menuItemService.getMenuItemById(userId, menuItemId);

  return res.json(data);
});

export const updateMenuItem = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const menuItemId = req.params.menuItemId as string;

  const data = await menuItemService.updateMenuItem(
    userId,
    menuItemId,
    req.body,
  );

  return res.json(data);
});

export const uploadMenuItemImages = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const menuItemId = req.params.menuItemId as string;

  const data = await menuItemService.uploadMenuItemImages(
    userId,
    menuItemId,
    req.files as Express.Multer.File[],
  );

  return res.json(data);
});

export const updateMenuItemAvailability = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const menuItemId = req.params.menuItemId as string;

  const data = await menuItemService.updateMenuItemAvailability(
    userId,
    menuItemId,
    req.body,
  );

  return res.status(200).json(data);
});

export const deleteMenuItem = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const menuItemId = req.params.menuItemId as string;

  const data = await menuItemService.deleteMenuItem(userId, menuItemId);

  return res.status(200).json(data);
});
