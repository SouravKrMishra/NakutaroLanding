import { Request, Response, NextFunction } from "express";
import { Cart } from "../../../shared/models/Cart.js";
import { Product } from "../../../shared/models/Product.js";
import { createError } from "../middleware/errorHandler.js";
import mongoose from "mongoose";

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

    // Check if any products in cart are deleted and mark them
    if (cart.items && cart.items.length > 0) {
      const productIds = cart.items.map((item) => String(item.productId));

      // Filter to only valid ObjectIds to avoid CastError
      const validObjectIds = productIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      let products: Array<{ _id: any; isDeleted: boolean }> = [];
      if (validObjectIds.length > 0) {
        products = await Product.find({ _id: { $in: validObjectIds } }).select(
          "_id isDeleted"
        );
      }

      const deletedProductIds = new Set(
        products
          .filter((p: any) => p.isDeleted)
          .map((p: any) => p._id.toString())
      );

      // Treat invalid ObjectIds as unavailable/deleted
      productIds.forEach((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          deletedProductIds.add(id);
        }
      });

      // Mark cart items with deleted products
      const cartObj = cart.toObject();
      const itemsWithDeletedInfo = cartObj.items.map((item: any) => ({
        ...item,
        isDeleted: deletedProductIds.has(item.productId.toString()),
        isAvailable: !deletedProductIds.has(item.productId.toString()),
      })) as any;

      res.json({
        success: true,
        cart: { ...cartObj, items: itemsWithDeletedInfo },
      });
    } else {
      const cartObject = cart.toObject();
      res.json({ success: true, cart: cartObject });
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
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

    // Extract actual product ID from the composite ID (e.g., "690b1e9ebe5ab2df42d78947_Color:Black|Size:S")
    // The productId may contain variant information after an underscore
    const actualProductId = productId.split("_")[0];

    // Check if product is deleted
    const product = await Product.findOne({ _id: actualProductId });
    if (!product || product.isDeleted) {
      return next(createError("Product is not available", 400));
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

    // Convert mongoose document to plain object to avoid serialization issues
    const cartObject = cart.toObject();

    res.json({
      success: true,
      message: "Item added to cart successfully",
      cart: cartObject,
    });
  } catch (error: any) {
    console.error("Error adding item to cart:", error);
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
          success: true,
          message: "Cart updated successfully",
          cart: { items: [] },
        });
      } else {
        await cart.save();
        const cartObject = cart.toObject();
        res.json({
          success: true,
          message: "Cart updated successfully",
          cart: cartObject,
        });
      }
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      const cartObject = cart.toObject();
      res.json({
        success: true,
        message: "Cart updated successfully",
        cart: cartObject,
      });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
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
        success: true,
        message: "Item removed from cart successfully",
        cart: { items: [] },
      });
    } else {
      await cart.save();
      const cartObject = cart.toObject();
      res.json({
        success: true,
        message: "Item removed from cart successfully",
        cart: cartObject,
      });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
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
      success: true,
      message: "Cart cleared successfully",
      cart: { items: [] },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
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
        success: true,
        message: "Cart synced successfully",
        cart: { items: [] },
      });
    } else {
      await cart.save();
      const cartObject = cart.toObject();
      res.json({
        success: true,
        message: "Cart synced successfully",
        cart: cartObject,
      });
    }
  } catch (error) {
    console.error("Error syncing cart:", error);
    next(createError("Failed to sync cart", 500));
  }
};
