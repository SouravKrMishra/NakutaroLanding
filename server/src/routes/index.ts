import { Router } from "express";
import productRoutes from "./productRoutes.js";
import newsletterRoutes from "./newsletterRoutes.js";
import authRoutes from "./authRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import orderRoutes from "./orderRoutes.js";
import cartRoutes from "./cartRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import couponRoutes from "./couponRoutes.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Mount route modules
// Mount specific routes first to avoid conflicts
router.use("/coupons", couponRoutes);
router.use("/payments", paymentRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/auth", authRoutes);
router.use("/wishlist", wishlistRoutes);
// Mount catch-all routes last
router.use("/", productRoutes);
router.use("/", recommendationRoutes);
router.use("/", orderRoutes);
router.use("/", cartRoutes);

export default router;
