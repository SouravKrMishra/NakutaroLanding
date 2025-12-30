import { Request, Response, NextFunction } from "express";
import { Cart } from "../../../shared/models/Cart.js";
import Product from "../../../shared/models/Product.js";
import { createError } from "../middleware/errorHandler.js";
import mongoose from "mongoose";

type ShopperType = "business" | "individual";

const getEffectiveUnitPrice = (product: any, userType: ShopperType): number => {
  const isBusiness = userType === "business";
  const regularPrice = isBusiness
    ? product.businessRegularPrice ?? product.regularPrice ?? product.price ?? 0
    : product.regularPrice ?? product.price ?? 0;

  // Treat <=0 sale prices as "unset" to match transformProduct logic
  const getValidSalePrice = (salePrice: any): number | undefined => {
    if (typeof salePrice === "number" && salePrice > 0) return salePrice;
    return undefined;
  };

  const salePrice = isBusiness
    ? getValidSalePrice(product.businessSalePrice) ??
      getValidSalePrice(product.salePrice)
    : getValidSalePrice(product.salePrice);

  const price = isBusiness
    ? product.businessPrice ?? salePrice ?? product.price ?? regularPrice
    : salePrice ?? product.price ?? regularPrice;
  return Number(price) || 0;
};

const getPrimaryImageUrl = (product: any): string => {
  const images = Array.isArray(product?.images) ? product.images : [];
  if (images.length === 0) return "";

  // Prefer defaultColor + primaryForColor if present
  if (product.defaultColor) {
    const primaryForDefaultColor = images.find(
      (img: any) =>
        img?.color === product.defaultColor && img?.isPrimaryForColor === true
    );
    if (primaryForDefaultColor?.url) return primaryForDefaultColor.url;

    const firstOfDefaultColor = images.find(
      (img: any) => img?.color === product.defaultColor
    );
    if (firstOfDefaultColor?.url) return firstOfDefaultColor.url;
  }

  const anyPrimaryForColor = images.find(
    (img: any) => img?.isPrimaryForColor === true
  );
  if (anyPrimaryForColor?.url) return anyPrimaryForColor.url;

  const anyPrimary = images.find((img: any) => img?.isPrimary === true);
  if (anyPrimary?.url) return anyPrimary.url;

  return images[0]?.url || "";
};

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
        // Ensure variants is an object (convert Map to object if needed)
        variants:
          item.variants instanceof Map
            ? Object.fromEntries(item.variants)
            : item.variants || {},
      })) as any;

      res.json({
        success: true,
        cart: { ...cartObj, items: itemsWithDeletedInfo },
      });
    } else {
      const cartObject = cart.toObject();
      // Ensure variants are properly converted from Map to object
      const transformedCart = {
        ...cartObject,
        items:
          cartObject.items && cartObject.items.length > 0
            ? cartObject.items.map((item: any) => ({
                ...item,
                variants:
                  item.variants instanceof Map
                    ? Object.fromEntries(item.variants)
                    : item.variants || {},
              }))
            : [],
      };
      res.json({ success: true, cart: transformedCart });
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
    const userType: ShopperType =
      req.user?.userType === "business" ? "business" : "individual";
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const {
      productId,
      slug,
      name,
      image,
      category,
      quantity = 1,
      inStock = true,
      variants = {},
    } = req.body;

    const productIdStr = String(productId || "");

    // Validate required fields
    if (!productId) {
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

    // Server-authoritative pricing + product metadata
    const effectivePrice = getEffectiveUnitPrice(product, userType);
    const effectiveName = product.name || name;
    const effectiveCategory = product.category || category;
    const effectiveSlug = product.slug || slug || null;
    const effectiveImage = getPrimaryImageUrl(product) || image;

    // Validate required fields: allow price of 0 (free products), but reject invalid/missing data
    // getEffectiveUnitPrice always returns a number >= 0, so we only need to check for negative values
    if (
      !effectiveName ||
      !effectiveCategory ||
      !effectiveImage ||
      effectivePrice < 0
    ) {
      return next(createError("Product data unavailable for cart item", 400));
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => String(item.productId) === productIdStr
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
      // Refresh server-authoritative fields (in case pricing/image changed)
      cart.items[existingItemIndex].price = String(effectivePrice);
      cart.items[existingItemIndex].name = effectiveName;
      cart.items[existingItemIndex].category = effectiveCategory;
      cart.items[existingItemIndex].image = effectiveImage;
      cart.items[existingItemIndex].slug = effectiveSlug;
      // Always update variants from the request (even if empty) to avoid retaining stale variant data
      cart.items[existingItemIndex].variants = new Map<string, string>(
        Object.entries(variants || {}).map(([k, v]) => [k, String(v)])
      );
      cart.items[existingItemIndex].markModified("variants");
    } else {
      // Add new item - use Mongoose's create method for subdocuments
      const newItem = {
        productId: productIdStr,
        slug: effectiveSlug,
        name: effectiveName,
        price: String(effectivePrice),
        image: effectiveImage,
        category: effectiveCategory,
        quantity,
        inStock,
        variants:
          variants && Object.keys(variants).length > 0
            ? new Map<string, string>(
                Object.entries(variants).map(([k, v]) => [k, String(v)])
              )
            : new Map<string, string>(),
      };

      // Push the item and then explicitly set variants to ensure Mongoose recognizes it
      cart.items.push(newItem);

      // Mark the variants field as modified to ensure Mongoose saves it
      const addedItem = cart.items[cart.items.length - 1];
      if (variants && Object.keys(variants).length > 0) {
        const variantsMap = new Map<string, string>(
          Object.entries(variants).map(([k, v]) => [k, String(v)])
        );
        addedItem.variants = variantsMap;
      }
      // Always mark variants as modified, even if empty
      addedItem.markModified("variants");
    }

    // Mark the entire items array as modified to ensure all changes are saved
    cart.markModified("items");

    await cart.save();

    // Convert mongoose document to plain object to avoid serialization issues
    const cartObject = cart.toObject();

    // Convert Map variants to plain objects for JSON response
    const transformedCart = {
      ...cartObject,
      items:
        cartObject.items && cartObject.items.length > 0
          ? cartObject.items.map((item: any) => ({
              ...item,
              variants:
                item.variants instanceof Map
                  ? Object.fromEntries(item.variants)
                  : item.variants || {},
            }))
          : [],
    };

    res.json({
      success: true,
      message: "Item added to cart successfully",
      cart: transformedCart,
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
        // Convert Map variants to plain objects for JSON response
        const transformedCart = {
          ...cartObject,
          items:
            cartObject.items && cartObject.items.length > 0
              ? cartObject.items.map((item: any) => ({
                  ...item,
                  variants:
                    item.variants instanceof Map
                      ? Object.fromEntries(item.variants)
                      : item.variants || {},
                }))
              : [],
        };
        res.json({
          success: true,
          message: "Cart updated successfully",
          cart: transformedCart,
        });
      }
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      const cartObject = cart.toObject();
      // Convert Map variants to plain objects for JSON response
      const transformedCart = {
        ...cartObject,
        items:
          cartObject.items && cartObject.items.length > 0
            ? cartObject.items.map((item: any) => ({
                ...item,
                variants:
                  item.variants instanceof Map
                    ? Object.fromEntries(item.variants)
                    : item.variants || {},
              }))
            : [],
      };
      res.json({
        success: true,
        message: "Cart updated successfully",
        cart: transformedCart,
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
      // Convert Map variants to plain objects for JSON response
      const transformedCart = {
        ...cartObject,
        items:
          cartObject.items && cartObject.items.length > 0
            ? cartObject.items.map((item: any) => ({
                ...item,
                variants:
                  item.variants instanceof Map
                    ? Object.fromEntries(item.variants)
                    : item.variants || {},
              }))
            : [],
      };
      res.json({
        success: true,
        message: "Item removed from cart successfully",
        cart: transformedCart,
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
      // Convert variants objects to Maps for new cart
      const itemsWithMaps = items.map((item: any) => ({
        ...item,
        variants:
          item.variants && Object.keys(item.variants).length > 0
            ? new Map(Object.entries(item.variants))
            : new Map(),
      }));
      cart = new Cart({ userId, items: itemsWithMaps });
    } else {
      // Clear existing items and add new ones - convert variants to Maps
      const itemsWithMaps = items.map((item: any) => ({
        ...item,
        variants:
          item.variants && Object.keys(item.variants).length > 0
            ? new Map(Object.entries(item.variants))
            : new Map(),
      }));
      cart.items.splice(0, cart.items.length, ...itemsWithMaps);
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
      // Convert Map variants to plain objects for JSON response
      const transformedCart = {
        ...cartObject,
        items:
          cartObject.items && cartObject.items.length > 0
            ? cartObject.items.map((item: any) => ({
                ...item,
                variants:
                  item.variants instanceof Map
                    ? Object.fromEntries(item.variants)
                    : item.variants || {},
              }))
            : [],
      };
      res.json({
        success: true,
        message: "Cart synced successfully",
        cart: transformedCart,
      });
    }
  } catch (error) {
    console.error("Error syncing cart:", error);
    next(createError("Failed to sync cart", 500));
  }
};
