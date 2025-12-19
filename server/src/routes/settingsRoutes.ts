import { Router } from "express";
import { Settings } from "../../../shared/models/Settings.js";

const router = Router();

// Public endpoint to get products page banner settings
router.get("/banner/products", async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: "products_banner" });

    // Default banner settings if not set
    const defaultBanner = {
      enabled: false,
      banners: [],
    };

    const bannerData = setting ? setting.value : defaultBanner;

    res.json({
      success: true,
      ...bannerData,
    });
  } catch (error) {
    console.error("Error fetching products banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products banner",
    });
  }
});

export default router;
