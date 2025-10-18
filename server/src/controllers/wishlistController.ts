import { Request, Response } from "express";
import { Wishlist } from "../../../shared/models/Wishlist.js";
import { validationResult } from "express-validator";

// Get user's wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    console.log(
      "Wishlist Controller: Getting wishlist for user:",
      req.user?.id
    );

    if (!req.user) {
      console.log("Wishlist Controller: No user in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log(
      "Wishlist Controller: Querying database for user ID:",
      req.user.id
    );
    const wishlistItems = await Wishlist.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    console.log("Wishlist Controller: Found", wishlistItems.length, "items");

    // Transform to match frontend interface
    const formattedItems = wishlistItems.map((item) => ({
      id: item.productId,
      name: item.productName,
      price: item.productPrice,
      image: item.productImage,
      category: item.productCategory,
      rating: item.productRating,
      reviews: item.productReviews,
      series: item.series,
      quantity: item.quantity,
      priority: item.priority,
      addedDate: item.addedDate.toISOString().split("T")[0],
      inStock: item.inStock,
    }));

    console.log(
      "Wishlist Controller: Returning formatted items:",
      formattedItems
    );
    res.json(formattedItems);
  } catch (error) {
    console.error("Wishlist Controller: Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

// Add item to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    console.log(
      "Wishlist Controller: Adding item to wishlist for user:",
      req.user?.id
    );
    console.log("Wishlist Controller: Request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Wishlist Controller: Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      console.log("Wishlist Controller: No user in request");
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
      series = "General",
      quantity = 1,
      priority = "Medium",
      inStock = true,
    } = req.body;

    console.log("Wishlist Controller: Extracted data:", {
      productId,
      name,
      price,
      image,
      category,
      rating,
      reviews,
      series,
      quantity,
      priority,
      inStock,
    });

    // Check if item already exists in wishlist
    console.log("Wishlist Controller: Checking for existing item...");
    const existingItem = await Wishlist.findOne({
      userId: req.user.id,
      productId: productId,
    });

    if (existingItem) {
      console.log(
        "Wishlist Controller: Item already exists in wishlist, removing it..."
      );
      await Wishlist.findOneAndDelete({
        userId: req.user.id,
        productId: productId,
      });
      return res.status(200).json({ message: "Item removed from wishlist" });
    }

    // Create new wishlist item
    console.log("Wishlist Controller: Creating new wishlist item...");
    const newWishlistItem = new Wishlist({
      userId: req.user.id,
      productId,
      productName: name,
      productPrice: price,
      productImage: image,
      productCategory: category,
      productRating: rating,
      productReviews: reviews,
      series,
      quantity,
      priority,
      inStock,
    });

    console.log("Wishlist Controller: Saving to database...");
    await newWishlistItem.save();
    console.log("Wishlist Controller: Item saved successfully");

    res.status(201).json({ message: "Item added to wishlist successfully" });
  } catch (error: any) {
    console.error("Wishlist Controller: Error adding to wishlist:", error);
    if (error.code === 11000) {
      console.log("Wishlist Controller: Duplicate key error");
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

    console.log(
      "Removing from wishlist - User:",
      req.user.id,
      "Product:",
      productId
    );

    const deletedItem = await Wishlist.findOneAndDelete({
      userId: req.user.id,
      productId: productId,
    });

    if (!deletedItem) {
      console.log("Item not found in wishlist");
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    console.log("Item removed from wishlist successfully");
    res.json({ message: "Item removed from wishlist successfully" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Failed to remove item from wishlist" });
  }
};

// Update wishlist item (e.g., priority, quantity)
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
    const { priority, quantity, inStock } = req.body;

    const updatedItem = await Wishlist.findOneAndUpdate(
      {
        userId: req.user.id,
        productId: productId,
      },
      {
        ...(priority && { priority }),
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
    console.error("Error updating wishlist item:", error);
    res.status(500).json({ message: "Failed to update wishlist item" });
  }
};
