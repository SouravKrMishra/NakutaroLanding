import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Validation middleware
const addToCartValidation = [
  body("productId")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product ID is required"),
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
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("inStock")
    .optional()
    .isBoolean()
    .withMessage("inStock must be a boolean"),
];

const updateCartItemValidation = [
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
];

const syncCartValidation = [
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.productId")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product ID is required"),
  body("items.*.name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product name is required"),
  body("items.*.price")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product price is required"),
  body("items.*.image")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product image is required"),
  body("items.*.category")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product category is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("items.*.inStock").isBoolean().withMessage("inStock must be a boolean"),
];

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get("/cart", getCart);

// Add item to cart
router.post("/cart", addToCartValidation, addToCart);

// Update cart item quantity
router.patch("/cart/:productId", updateCartItemValidation, updateCartItem);

// Remove item from cart
router.delete("/cart/:productId", removeFromCart);

// Clear cart
router.delete("/cart", clearCart);

// Sync cart (replace entire cart)
router.put("/cart", syncCartValidation, syncCart);

export default router;
