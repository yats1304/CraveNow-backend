import * as cartService from "../services/index.js";
import { TryCatch } from "../utils/index.js";

export const addToCart = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await cartService.addToCart(userId, req.body);

  return res.status(201).json(data);
});

export const getCart = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await cartService.getCart(userId);

  return res.json(data);
});

export const updateCartItem = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const cartItemId = req.params.cartItemId as string;

  const data = await cartService.updateCartItem(userId, cartItemId, req.body);

  return res.json(data);
});

export const removeCartItem = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const cartItemId = req.params.cartItemId as string;

  const data = await cartService.removeCartItem(userId, cartItemId);

  return res.json(data);
});

export const clearCart = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const data = await cartService.clearCart(userId);

  return res.json(data);
});
