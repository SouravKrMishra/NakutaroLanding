import { Request, Response } from "express";
import { Wishlist } from "../../../shared/models/Wishlist.js";
import Product from "../../../shared/models/Product.js";
import { validationResult } from "express-validator";

// Get user's wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const wishlistItems = await Wishlist.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const productIds = wishlistItems.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
    }).select("_id isDeleted inventoryType stock");

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    );

    const isProductInStock = (product: any): boolean => {
      if (!product || product.isDeleted) return false;
      // T-shirts and other clothing use shared_stock – always considered in stock
      if (product.inventoryType === "shared_stock") return true;
      // individual_stock: use actual quantity/status
      const stock = product.stock;
      if (!stock) return true;
      if (typeof stock.quantity === "number") return stock.quantity > 0;
      if (stock.status === "out_of_stock") return false;
      return true;
    };

    const formattedItems = wishlistItems.map((item) => {
      const productIdStr = item.productId.toString();
      const product = productMap.get(productIdStr);
      const isDeleted = product ? !!product.isDeleted : false;
      const inStock = !isDeleted && isProductInStock(product || null);
      return {
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        image: item.productImage,
        category: item.productCategory,
        rating: item.productRating,
        reviews: item.productReviews,
        quantity: item.quantity,
        addedDate: item.addedDate.toISOString().split("T")[0],
        inStock,
        isDeleted,
        isAvailable: !isDeleted,
      };
    });

    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

// Add item to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const {
      productId,
      name,
      price,
      image,
      category,
      rating = 0,
      reviews = 0,
      quantity = 1,
      inStock = true,
    } = req.body;

    // Check if item already exists in wishlist
    const existingItem = await Wishlist.findOne({
      userId: req.user.id,
      productId: productId,
    });

    if (existingItem) {
      await Wishlist.findOneAndDelete({
        userId: req.user.id,
        productId: productId,
      });
      return res.status(200).json({ message: "Item removed from wishlist" });
    }

    // Check if product is deleted
    const product = await Product.findOne({ _id: productId });
    if (!product || product.isDeleted) {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Create new wishlist item
    const newWishlistItem = new Wishlist({
      userId: req.user.id,
      productId,
      productName: name,
      productPrice: price,
      productImage: image,
      productCategory: category,
      productRating: rating,
      productReviews: reviews,
      quantity,
      inStock,
    });

    await newWishlistItem.save();

    res.status(201).json({ message: "Item added to wishlist successfully" });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }
    res.status(500).json({ message: "Failed to add item to wishlist" });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { productId } = req.params;

    const deletedItem = await Wishlist.findOneAndDelete({
      userId: req.user.id,
      productId: productId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    res.json({ message: "Item removed from wishlist successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from wishlist" });
  }
};

// Update wishlist item (e.g., quantity)
export const updateWishlistItem = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { productId } = req.params;
    const { quantity, inStock } = req.body;

    const updatedItem = await Wishlist.findOneAndUpdate(
      {
        userId: req.user.id,
        productId: productId,
      },
      {
        ...(quantity && { quantity }),
        ...(inStock !== undefined && { inStock }),
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    res.json({ message: "Wishlist item updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist item" });
  }
};
