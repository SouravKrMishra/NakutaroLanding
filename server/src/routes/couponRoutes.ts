import { Router } from "express";
import { validateCoupon, applyCoupon } from "../controllers/couponController.js";

const router = Router();

// IMPORTANT: These routes are PUBLIC and do NOT require authentication
// Validate coupon (public - no auth required)
router.post("/validate", validateCoupon);

// Apply coupon (public - called during order creation)
router.post("/apply", applyCoupon);

export default router;

