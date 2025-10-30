import { Router } from "express";
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  getStockData,
} from "../controllers/productController.ts";

const router = Router();

// Product routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/featured-products", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/stock-data", getStockData);

export default router;
