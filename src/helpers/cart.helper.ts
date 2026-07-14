import mongoose from "mongoose";
import { TAX_PERCENTAGE } from "../constants/index.js";
import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { ErrorHandler } from "../utils/index.js";

export const buildCartResponse = async (cartId: string) => {
  const [cart, items] = await Promise.all([
    Cart.findById(cartId)
      .populate({
        path: "restaurantId",
        select: "name logo banner isOpen",
      })
      .lean(),

    CartItem.find({ cartId })
      .populate({
        path: "menuItemId",
        select: "name images foodType isAvailable discountPercentage",
      })
      .lean(),
  ]);

  if (!cart) {
    throw new ErrorHandler(404, "Cart not found.");
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartId: cart._id,
    restaurant: cart.restaurantId,
    itemCount: items.length,
    totalQuantity,
    items,
    subtotal: cart.subtotal,
    discount: cart.discount,
    tax: cart.tax,
    total: cart.total,
  };
};

export const calculateCartTotals = async (
  cartId: string,
  session?: mongoose.ClientSession,
) => {
  const cartItems = await CartItem.find({ cartId }, null, { session }).lean();

  if (cartItems.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
  }

  let subtotal = 0;

  for (const item of cartItems) {
    subtotal += item.unitPriceSnapshot * item.quantity;
  }

  const discount = 0;

  const taxableAmount = subtotal - discount;

  const tax = Number(((taxableAmount * TAX_PERCENTAGE) / 100).toFixed(2));

  const total = Number((taxableAmount + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: discount,
    tax: tax,
    total: total,
  };
};

export const emptyCartResponse = () => ({
  cartId: null,
  restaurant: null,
  itemCount: 0,
  totalQuantity: 0,
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  total: 0,
});
