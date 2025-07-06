import { Router } from "express";
import productRoutes from "./productRoutes";
import newsletterRoutes from "./newsletterRoutes";

const router = Router();

// Mount route modules
router.use("/", productRoutes);
router.use("/newsletter", newsletterRoutes);

export default router;
