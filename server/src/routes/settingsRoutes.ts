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

// Public endpoint to get events images
router.get("/events/images", async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: "events_images" });

    // Default events images if not set
    const defaultImages = {
      images: [],
      autoScrollEnabled: true,
    };

    const imagesData = setting ? setting.value : defaultImages;

    res.json({
      success: true,
      ...imagesData,
    });
  } catch (error) {
    console.error("Error fetching events images:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events images",
    });
  }
});

export default router;
