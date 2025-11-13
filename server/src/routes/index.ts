import { Router } from "express";
import productRoutes from "./productRoutes.ts";
import newsletterRoutes from "./newsletterRoutes.ts";
import authRoutes from "./authRoutes.ts";
import wishlistRoutes from "./wishlistRoutes.ts";
import recommendationRoutes from "./recommendationRoutes.ts";
import orderRoutes from "./orderRoutes.ts";
import cartRoutes from "./cartRoutes.ts";
import paymentRoutes from "./paymentRoutes.ts";
import couponRoutes from "./couponRoutes.ts";

const router = Router();

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
