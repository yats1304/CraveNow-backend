import mongoose from "mongoose";
import { AddToCartDto, UpdateCartItemDto } from "../types/index.js";
import { Cart, MenuItem, Restaurant } from "../models/index.js";
import { ErrorHandler } from "../utils/index.js";
import { CartItem } from "../models/cartItem.model.js";
import { logger } from "../config/logger.js";
import {
  buildCartResponse,
  calculateCartTotals,
  emptyCartResponse,
} from "../helpers/cart.helper.js";

export const addToCart = async (userId: string, data: AddToCartDto) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { menuItemId, quantity, specialInstructions } = data;

    const menuItem = await MenuItem.findOne(
      {
        _id: menuItemId,
        isDeleted: false,
        isAvailable: true,
      },
      null,
      { session },
    );

    if (!menuItem) {
      throw new ErrorHandler(404, "Menu item not found.");
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId, null, {
      session,
    });

    if (!restaurant || !restaurant.isOpen) {
      throw new ErrorHandler(400, "Restaurant is currently unavailable.");
    }

    let cart = await Cart.findOne({ userId }, null, { session });

    if (!cart) {
      const createdCarts = await Cart.create(
        [{ userId, restaurantId: restaurant._id }],
        {
          session,
        },
      );
      cart = createdCarts[0];
    }

    if (!cart) {
      throw new ErrorHandler(500, "Failed to initialize cart.");
    }

    if (cart.restaurantId.toString() !== restaurant._id.toString()) {
      throw new ErrorHandler(
        409,
        "Your cart contains items from another restaurant. Please clear your cart first.",
      );
    }

    const cartItem = await CartItem.findOne(
      { cartId: cart._id, menuItemId },
      null,
      { session },
    );

    if (cartItem) {
      cartItem.quantity += quantity;

      if (specialInstructions !== undefined) {
        cartItem.specialInstructions = specialInstructions;
      }

      await cartItem.save({ session });
    } else {
      const finalPrice =
        menuItem.price - (menuItem.price * menuItem.discountPercentage) / 100;
      await CartItem.create(
        [
          {
            cartId: cart._id,
            menuItemId,
            quantity,
            unitPriceSnapshot: finalPrice,
            specialInstructions,
          },
        ],
        { session },
      );
    }

    const totals = await calculateCartTotals(cart._id.toString(), session);

    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.tax = totals.tax;
    cart.total = totals.total;

    await cart.save({ session });

    await session.commitTransaction();

    logger.info({
      userId,
      menuItemId: data.menuItemId,
      quantity: data.quantity,
    }, "Item added to cart");

    return await buildCartResponse(cart._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getCart = async (userId: string) => {
  const cart = await Cart.findOne({
    userId,
  }).lean();

  if (!cart) {
    return emptyCartResponse();
  }

  return await buildCartResponse(cart._id.toString());
};

export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  data: UpdateCartItemDto,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cartItem = await CartItem.findById(cartItemId, null, { session });

    if (!cartItem) {
      throw new ErrorHandler(404, "Cart item not found.");
    }

    const cart = await Cart.findById(cartItem.cartId, null, {
      session,
    });

    if (!cart) {
      throw new ErrorHandler(404, "Cart not found.");
    }

    if (cart.userId.toString() !== userId) {
      throw new ErrorHandler(
        403,
        "You are not authorized to update this cart.",
      );
    }

    const quantityChanged =
      data.quantity !== undefined && data.quantity !== cartItem.quantity;

    const instructionsChanged =
      data.specialInstructions !== undefined &&
      data.specialInstructions !== cartItem.specialInstructions;

    if (!quantityChanged && !instructionsChanged) {
      await session.abortTransaction();

      return await buildCartResponse(cart._id.toString());
    }

    if (data.quantity !== undefined) {
      cartItem.quantity = data.quantity;
    }

    if (data.specialInstructions !== undefined) {
      cartItem.specialInstructions = data.specialInstructions;
    }

    await cartItem.save({ session });

    const totals = await calculateCartTotals(cart._id.toString(), session);

    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.tax = totals.tax;
    cart.total = totals.total;

    await cart.save({ session });

    await session.commitTransaction();

    return await buildCartResponse(cart._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const removeCartItem = async (userId: string, cartItemId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cartItem = await CartItem.findById(cartItemId, null, { session });

    if (!cartItem) {
      throw new ErrorHandler(404, "Cart item not found.");
    }

    const cart = await Cart.findById(cartItem.cartId, null, { session });

    if (!cart) {
      throw new ErrorHandler(404, "Cart not found.");
    }

    if (cart.userId.toString() !== userId) {
      throw new ErrorHandler(
        403,
        "You are not authorized to modify this cart.",
      );
    }

    await CartItem.deleteOne({ _id: cartItemId }, { session });

    const remainingItems = await CartItem.countDocuments(
      {
        cartId: cart._id,
      },
      { session },
    );

    if (remainingItems === 0) {
      await Cart.deleteOne(
        {
          _id: cart._id,
        },
        {
          session,
        },
      );

      await session.commitTransaction();

      logger.info({
        userId,
        cartItemId,
      }, "Item removed from cart (cart now empty)");

      return emptyCartResponse();
    }

    const totals = await calculateCartTotals(cart._id.toString(), session);

    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.tax = totals.tax;
    cart.total = totals.total;

    await cart.save({ session });

    await session.commitTransaction();

    logger.info({
      userId,
      cartItemId,
    }, "Item removed from cart");

    return await buildCartResponse(cart._id.toString());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const clearCart = async (userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne(
      {
        userId,
      },
      null,
      { session },
    );

    if (!cart) {
      await session.abortTransaction();

      return emptyCartResponse();
    }

    await Promise.all([
      CartItem.deleteMany({ cartId: cart._id }, { session }),
      Cart.deleteOne({ _id: cart._id }, { session }),
    ]);

    await session.commitTransaction();

    logger.info({
      userId,
    }, "Cart cleared");

    return emptyCartResponse();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
