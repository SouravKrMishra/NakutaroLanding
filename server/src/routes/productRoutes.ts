import { Router } from "express";
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
} from "../controllers/productController";

const router = Router();

// Product routes
router.get("/products", getProducts);
router.get("/featured-products", getFeaturedProducts);
router.get("/categories", getCategories);

export default router;
