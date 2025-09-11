import { Router } from "express";
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
} from "../controllers/productController.ts";

const router = Router();

// Product routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/featured-products", getFeaturedProducts);
router.get("/categories", getCategories);

export default router;
