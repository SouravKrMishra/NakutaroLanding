import { Router } from "express";
import { getPublicCategories, getPublicFAQs } from "../controllers/faqController.js";

const router = Router();

// Public routes - no authentication required

// Get all active FAQs with categories
router.get("/", getPublicFAQs);

// Get all active categories
router.get("/categories", getPublicCategories);

export default router;
