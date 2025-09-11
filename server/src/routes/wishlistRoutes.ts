import express from "express";
import { body, param } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
} from "../controllers/wishlistController.js";

const router = express.Router();

// Validation middleware for adding to wishlist
const addToWishlistValidation = [
  body("productId")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product name is required"),
  body("price")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product price is required"),
  body("image")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product image is required"),
  body("category")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product category is required"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),
  body("reviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reviews must be a non-negative integer"),
  body("series")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Series must not be empty"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("priority")
    .optional()
    .isIn(["High", "Medium", "Low"])
    .withMessage("Priority must be High, Medium, or Low"),
  body("inStock")
    .optional()
    .isBoolean()
    .withMessage("inStock must be a boolean"),
];

// Validation middleware for updating wishlist item
const updateWishlistValidation = [
  param("productId")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  body("priority")
    .optional()
    .isIn(["High", "Medium", "Low"])
    .withMessage("Priority must be High, Medium, or Low"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("inStock")
    .optional()
    .isBoolean()
    .withMessage("inStock must be a boolean"),
];

// Validation middleware for removing from wishlist
const removeFromWishlistValidation = [
  param("productId")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
];

// All wishlist routes require authentication
router.use(authenticateToken);

// GET /api/wishlist - Get user's wishlist
router.get("/", getWishlist);

// POST /api/wishlist - Add item to wishlist
router.post("/", addToWishlistValidation, addToWishlist);

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete("/:productId", removeFromWishlistValidation, removeFromWishlist);

// PUT /api/wishlist/:productId - Update wishlist item
router.put("/:productId", updateWishlistValidation, updateWishlistItem);

export default router;
