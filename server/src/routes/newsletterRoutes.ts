import { Router } from "express";
import {
  subscribeToNewsletter,
  getSubscriberCount,
  getAllSubscribers,
} from "../controllers/newsletterController.ts";

const router = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post("/subscribe", subscribeToNewsletter);

// GET /api/newsletter/subscribers/count - Get subscriber count (optional, for admin purposes)
router.get("/subscribers/count", getSubscriberCount);

// GET /api/newsletter/subscribers - Get all subscribers with pagination (admin only)
router.get("/subscribers", getAllSubscribers);

export default router;
