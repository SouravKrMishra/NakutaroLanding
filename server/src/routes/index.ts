import { Router } from "express";
import productRoutes from "./productRoutes.ts";
import newsletterRoutes from "./newsletterRoutes.ts";
import authRoutes from "./authRoutes.ts";
import wishlistRoutes from "./wishlistRoutes.ts";
import recommendationRoutes from "./recommendationRoutes.ts";
import orderRoutes from "./orderRoutes.ts";
import cartRoutes from "./cartRoutes.ts";
import paymentRoutes from "./paymentRoutes.ts";

const router = Router();

// Mount route modules
router.use("/", productRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/auth", authRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/", recommendationRoutes);
router.use("/", orderRoutes);
router.use("/", cartRoutes);
router.use("/payments", paymentRoutes);

export default router;
