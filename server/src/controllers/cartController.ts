import { Request, Response, NextFunction } from "express";
import { Cart } from "../../../shared/models/Cart.js";
import { createError } from "../middleware/errorHandler.js";

// Get user's cart
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    let cart = await Cart.findOne({ userId }).populate("userId", "name email");

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    res.json({ cart });
  } catch (error) {
    next(createError("Failed to fetch cart", 500));
  }
};

// Add item to cart
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const {
      productId,
      name,
      price,
      image,
      category,
      quantity = 1,
      inStock = true,
    } = req.body;

    // Validate required fields
    if (!productId || !name || !price || !image || !category) {
      return next(createError("Missing required fields", 400));
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name,
        price,
        image,
        category,
        quantity,
        inStock,
      });
    }

    await cart.save();

    res.json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    next(createError("Failed to add item to cart", 500));
  }
};

// Update cart item quantity
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return next(createError("Invalid quantity", 400));
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(createError("Cart not found", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return next(createError("Item not found in cart", 404));
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);

      // If cart is now empty, delete the entire cart document
      if (cart.items.length === 0) {
        await Cart.findOneAndDelete({ userId });
        res.json({
          message: "Cart updated successfully",
          cart: { items: [] },
        });
      } else {
        await cart.save();
        res.json({
          message: "Cart updated successfully",
          cart,
        });
      }
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      res.json({
        message: "Cart updated successfully",
        cart,
      });
    }
  } catch (error) {
    next(createError("Failed to update cart", 500));
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(createError("Cart not found", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return next(createError("Item not found in cart", 404));
    }

    cart.items.splice(itemIndex, 1);

    // If cart is now empty, delete the entire cart document
    if (cart.items.length === 0) {
      await Cart.findOneAndDelete({ userId });
      res.json({
        message: "Item removed from cart successfully",
        cart: { items: [] },
      });
    } else {
      await cart.save();
      res.json({
        message: "Item removed from cart successfully",
        cart,
      });
    }
  } catch (error) {
    next(createError("Failed to remove item from cart", 500));
  }
};

// Clear cart
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    // Delete the entire cart document instead of just emptying it
    await Cart.findOneAndDelete({ userId });

    res.json({
      message: "Cart cleared successfully",
      cart: { items: [] },
    });
  } catch (error) {
    next(createError("Failed to clear cart", 500));
  }
};

// Sync cart (replace entire cart with new items)
export const syncCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const { items } = req.body;

    if (!Array.isArray(items)) {
      return next(createError("Items must be an array", 400));
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: items });
    } else {
      // Clear existing items and add new ones
      cart.items.splice(0, cart.items.length, ...items);
    }

    // If cart is now empty, delete the entire cart document
    if (cart.items.length === 0) {
      await Cart.findOneAndDelete({ userId });
      res.json({
        message: "Cart synced successfully",
        cart: { items: [] },
      });
    } else {
      await cart.save();
      res.json({
        message: "Cart synced successfully",
        cart,
      });
    }
  } catch (error) {
    next(createError("Failed to sync cart", 500));
  }
};
