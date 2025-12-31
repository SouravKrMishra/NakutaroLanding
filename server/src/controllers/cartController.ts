import { Request, Response, NextFunction } from "express";
import { Cart } from "../../../shared/models/Cart.js";
import Product from "../../../shared/models/Product.js";
import { createError } from "../middleware/errorHandler.js";
import mongoose from "mongoose";

type ShopperType = "business" | "individual";

const getAvailableStock = (product: any): number | null => {
  // For shared_stock, return null (unlimited)
  if (product.inventoryType === "shared_stock") {
    return null;
  }
  // For individual_stock, return the quantity
  return product.stock?.quantity ?? 0;
};

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

// Helper function to normalize variants for comparison
// Converts Maps to objects and sorts keys for consistent comparison
const normalizeVariants = (variants: any): Record<string, string> => {
  if (!variants) return {};

  // If it's a Map, convert to object
  if (variants instanceof Map) {
    return Object.fromEntries(variants);
  }

  // If it's already an object, return it
  if (typeof variants === "object" && !Array.isArray(variants)) {
    return variants;
  }

  return {};
};

// Helper function to compare two variant objects
const variantsMatch = (variants1: any, variants2: any): boolean => {
  const normalized1 = normalizeVariants(variants1);
  const normalized2 = normalizeVariants(variants2);

  const keys1 = Object.keys(normalized1).sort();
  const keys2 = Object.keys(normalized2).sort();

  // Different number of keys means they don't match
  if (keys1.length !== keys2.length) return false;

  // Check if all keys and values match
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (String(normalized1[key]) !== String(normalized2[key])) return false;
  }

  return true;
};

// Auto-adjust cart quantities for business users when stock increases
const autoAdjustCartQuantities = async (cart: any): Promise<boolean> => {
  if (!cart.items || cart.items.length === 0) return false;

  let hasChanges = false;

  // Get all items marked as below minimum
  const itemsToCheck = cart.items.filter((item: any) => item.isBelowMinimum);

  if (itemsToCheck.length === 0) return false;

  // Get product IDs for batch query
  const productIds = itemsToCheck
    .map((item: any) => {
      const actualProductId = String(item.productId).split("_")[0];
      return mongoose.Types.ObjectId.isValid(actualProductId)
        ? actualProductId
        : null;
    })
    .filter((id: any) => id !== null);

  if (productIds.length === 0) return false;

  // Fetch products to check current stock
  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
  }).select("_id stock inventoryType minBusinessQuantity");

  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

  // Check each item and adjust if stock is now sufficient
  for (const item of itemsToCheck) {
    const actualProductId = String(item.productId).split("_")[0];
    const product = productMap.get(actualProductId);

    if (!product) continue;

    const availableStock = getAvailableStock(product);
    const minQuantity =
      (item as any).minBusinessQuantity || product.minBusinessQuantity || 1;

    // Ensure the cart item records the minimum for future requests
    (item as any).minBusinessQuantity = minQuantity;

    // If stock is now sufficient for minimum quantity
    if (availableStock === null || availableStock >= minQuantity) {
      (item as any).quantity = minQuantity;
      (item as any).isBelowMinimum = false;
      hasChanges = true;
    }
    // If stock increased but still below minimum, update to new stock level
    else if (availableStock > (item as any).quantity) {
      (item as any).quantity = availableStock;
      hasChanges = true;
    }
  }

  return hasChanges;
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

    // Auto-adjust quantities for business users if stock has increased
    const userType: ShopperType =
      req.user?.userType === "business" ? "business" : "individual";
    if (userType === "business") {
      const needsSave = await autoAdjustCartQuantities(cart);
      if (needsSave) {
        await cart.save();
      }
    }

    // Check if any products in cart are deleted and mark them
    if (cart.items && cart.items.length > 0) {
      const productIds = cart.items.map((item) => String(item.productId));

      // Filter to only valid ObjectIds to avoid CastError
      const validObjectIds = productIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      let products: Array<{
        _id: any;
        isDeleted: boolean;
        minBusinessQuantity?: number;
      }> = [];
      if (validObjectIds.length > 0) {
        products = await Product.find({ _id: { $in: validObjectIds } }).select(
          "_id isDeleted minBusinessQuantity"
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

      // Mark cart items with deleted products and ensure minBusinessQuantity/isBelowMinimum are present
      const cartObj = cart.toObject();
      const itemsWithDeletedInfo = cartObj.items.map((item: any) => {
        const productIdStr = item.productId?.toString?.() || "";
        const productDoc = products.find(
          (p: any) => p._id.toString() === productIdStr
        );
        const ensuredMin =
          item.minBusinessQuantity ?? productDoc?.minBusinessQuantity ?? 1;
        return {
          ...item,
          minBusinessQuantity: ensuredMin,
          isBelowMinimum: item.isBelowMinimum ?? false,
          isDeleted: deletedProductIds.has(productIdStr),
          isAvailable: !deletedProductIds.has(productIdStr),
          // Ensure variants is an object (convert Map to object if needed)
          variants:
            item.variants instanceof Map
              ? Object.fromEntries(item.variants)
              : item.variants || {},
        };
      }) as any;

      res.json({
        success: true,
        cart: { ...cartObj, items: itemsWithDeletedInfo },
      });
    } else {
      const cartObject = cart.toObject();
      // Preload product minBusinessQuantity for items to avoid per-item queries
      const cartProductIds = cartObject.items
        .map((item: any) => item.productId)
        .filter((id: any) => mongoose.Types.ObjectId.isValid(id));
      const productDocs = await Product.find({
        _id: { $in: cartProductIds },
        isDeleted: false,
      }).select("_id minBusinessQuantity");
      const productMap = new Map(
        productDocs.map((p: any) => [p._id.toString(), p])
      );

      // Ensure variants are properly converted from Map to object and min fields are present
      const transformedCart = {
        ...cartObject,
        items:
          cartObject.items && cartObject.items.length > 0
            ? cartObject.items.map((item: any) => {
                const productIdStr = item.productId?.toString?.() || "";
                const productDoc = productMap.get(productIdStr);
                const ensuredMin =
                  item.minBusinessQuantity ??
                  productDoc?.minBusinessQuantity ??
                  1;
                return {
                  ...item,
                  minBusinessQuantity: ensuredMin,
                  isBelowMinimum: item.isBelowMinimum ?? false,
                  variants:
                    item.variants instanceof Map
                      ? Object.fromEntries(item.variants)
                      : item.variants || {},
                };
              })
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

    // Business bulk buying logic
    const minBusinessQuantity = product.minBusinessQuantity || 1;
    const availableStock = getAvailableStock(product);
    let effectiveQuantity = quantity;
    let isBelowMinimum = false;

    // For business users, enforce minimum quantity
    if (userType === "business") {
      // Use the larger of selected quantity or minimum quantity
      effectiveQuantity = Math.max(quantity, minBusinessQuantity);

      // If stock is limited and less than what we want, cap at available stock
      if (availableStock !== null && availableStock < effectiveQuantity) {
        effectiveQuantity = availableStock;
        // Mark as below minimum only if stock is less than the minimum requirement
        isBelowMinimum = availableStock < minBusinessQuantity;
      }
    }

    // Prevent adding items with zero quantity (out of stock)
    if (effectiveQuantity <= 0) {
      return next(
        createError(
          "This product is currently out of stock and cannot be added to cart.",
          400
        )
      );
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart (must match both productId and variants)
    const existingItemIndex = cart.items.findIndex((item) => {
      // First check if productId matches
      if (String(item.productId) !== productIdStr) return false;

      // Then check if variants match
      return variantsMatch(item.variants, variants);
    });

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const existingQuantity = cart.items[existingItemIndex].quantity;
      let newQuantity: number;
      let newIsBelowMinimum = false;

      if (userType === "business") {
        // For business users, add requested quantity to existing quantity
        // Then enforce minimum and stock limits on the total
        const requestedTotal = existingQuantity + quantity;

        // If stock is limited, cap at available stock
        if (availableStock !== null && availableStock < requestedTotal) {
          newQuantity = availableStock;
          newIsBelowMinimum = availableStock < minBusinessQuantity;
        } else {
          // Stock is sufficient or unlimited
          // If total is below minimum, enforce minimum (but only if stock allows)
          if (requestedTotal < minBusinessQuantity) {
            if (
              availableStock !== null &&
              availableStock < minBusinessQuantity
            ) {
              // Stock is limited and below minimum - use available stock
              newQuantity = availableStock;
              newIsBelowMinimum = true;
            } else {
              // Stock is sufficient - enforce minimum
              newQuantity = minBusinessQuantity;
              newIsBelowMinimum = false;
            }
          } else {
            // Total is at or above minimum - use requested total
            newQuantity = requestedTotal;
            newIsBelowMinimum = false;
          }
        }
      } else {
        // For individual users, simply add to existing quantity
        newQuantity = existingQuantity + effectiveQuantity;
      }

      // Prevent updating items to zero quantity (out of stock)
      // If stock is 0, remove the item instead
      if (newQuantity <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = newQuantity;

        // Refresh server-authoritative fields (in case pricing/image changed)
        cart.items[existingItemIndex].price = String(effectivePrice);
        cart.items[existingItemIndex].name = effectiveName;
        cart.items[existingItemIndex].category = effectiveCategory;
        cart.items[existingItemIndex].image = effectiveImage;
        cart.items[existingItemIndex].slug = effectiveSlug;

        // Update business bulk buying fields
        (cart.items[existingItemIndex] as any).minBusinessQuantity =
          minBusinessQuantity;
        (cart.items[existingItemIndex] as any).isBelowMinimum =
          newIsBelowMinimum;

        // Always update variants from the request (even if empty) to avoid retaining stale variant data
        cart.items[existingItemIndex].variants = new Map<string, string>(
          Object.entries(variants || {}).map(([k, v]) => [k, String(v)])
        );
        cart.items[existingItemIndex].markModified("variants");
      }
    } else {
      // Add new item - use Mongoose's create method for subdocuments
      const newItem = {
        productId: productIdStr,
        slug: effectiveSlug,
        name: effectiveName,
        price: String(effectivePrice),
        image: effectiveImage,
        category: effectiveCategory,
        quantity: effectiveQuantity,
        inStock,
        variants:
          variants && Object.keys(variants).length > 0
            ? new Map<string, string>(
                Object.entries(variants).map(([k, v]) => [k, String(v)])
              )
            : new Map<string, string>(),
        minBusinessQuantity: minBusinessQuantity,
        isBelowMinimum: isBelowMinimum,
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
    const { quantity, variants: requestVariants } = req.body;

    if (quantity === undefined || quantity < 0) {
      return next(createError("Invalid quantity", 400));
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(createError("Cart not found", 404));
    }

    // Match by productId and variants (if variants are provided in request body)
    const variants = requestVariants || {};
    const itemIndex = cart.items.findIndex((item) => {
      // First check if productId matches
      if (String(item.productId) !== productId) return false;

      // If variants are provided, check if they match
      if (Object.keys(variants).length > 0) {
        return variantsMatch(item.variants, variants);
      }

      // If no variants provided, match items without variants
      const itemVariants =
        item.variants instanceof Map
          ? Object.fromEntries(item.variants)
          : item.variants || {};
      return Object.keys(itemVariants).length === 0;
    });

    if (itemIndex === -1) {
      return next(createError("Item not found in cart", 404));
    }

    // Check if user is a business user
    const userType: ShopperType =
      req.user?.userType === "business" ? "business" : "individual";

    // For business users, validate minimum quantity
    if (userType === "business" && quantity > 0) {
      const cartItem = cart.items[itemIndex];
      const minQuantity = (cartItem as any).minBusinessQuantity || 1;

      if (quantity < minQuantity) {
        return next(
          createError(
            `Business users must purchase at least ${minQuantity} units of this product. Use quantity 0 to remove the item from cart.`,
            400
          )
        );
      }
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

    // Parse variants from query params if present (format: ?variant_Size=M&variant_Color=Red)
    const variants: { [key: string]: string } = {};
    Object.keys(req.query).forEach((key) => {
      if (key.startsWith("variant_")) {
        const variantKey = key.replace("variant_", "");
        variants[variantKey] = String(req.query[key]);
      }
    });

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(createError("Cart not found", 404));
    }

    // Match by productId and variants (if variants are provided)
    const itemIndex = cart.items.findIndex((item) => {
      // First check if productId matches
      if (String(item.productId) !== productId) return false;

      // If variants are provided, check if they match
      if (Object.keys(variants).length > 0) {
        return variantsMatch(item.variants, variants);
      }

      // If no variants provided, match items without variants
      const itemVariants =
        item.variants instanceof Map
          ? Object.fromEntries(item.variants)
          : item.variants || {};
      return Object.keys(itemVariants).length === 0;
    });

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

    // Preload product docs to enforce minBusinessQuantity when not provided
    const productIds = items
      .map((item: any) => String(item.productId || "").split("_")[0])
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const products = productIds.length
      ? await Product.find({
          _id: { $in: productIds },
          isDeleted: false,
        }).select("_id minBusinessQuantity")
      : [];
    const productMap = new Map(
      products.map((p: any) => [p._id.toString(), p.minBusinessQuantity || 1])
    );

    if (!cart) {
      // Convert variants objects to Maps for new cart
      const itemsWithMaps = items.map((item: any) => ({
        ...item,
        variants:
          item.variants && Object.keys(item.variants).length > 0
            ? new Map(Object.entries(item.variants))
            : new Map(),
        minBusinessQuantity:
          item.minBusinessQuantity ??
          productMap.get(String(item.productId).split("_")[0]) ??
          1,
        isBelowMinimum: item.isBelowMinimum ?? false,
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
        minBusinessQuantity:
          item.minBusinessQuantity ??
          productMap.get(String(item.productId).split("_")[0]) ??
          1,
        isBelowMinimum: item.isBelowMinimum ?? false,
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
