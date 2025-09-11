import express from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import {
  getRecommendations,
  addPurchaseToHistory,
} from "../controllers/recommendationController.js";

const router = express.Router();

// Validation middleware for adding purchase to history
const addPurchaseValidation = [
  body("productId")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  body("productName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product name is required"),
  body("category")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Category is required"),
  body("series").trim().isLength({ min: 1 }).withMessage("Series is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("totalAmount")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be a non-negative number"),
];

// Recommendation routes (all require authentication)
router.use(authenticateToken);

// Get personalized recommendations
router.get("/recommendations", getRecommendations);

// Add purchase to history
router.post("/purchase-history", addPurchaseValidation, addPurchaseToHistory);

export default router;
