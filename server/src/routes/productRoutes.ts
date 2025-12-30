import { Router } from "express";
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  getStockData,
} from "../controllers/productController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// Product routes
router.get("/products", optionalAuth, getProducts);
router.get("/products/:id", optionalAuth, getProductById);
router.get("/featured-products", optionalAuth, getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/stock-data", getStockData);

export default router;
