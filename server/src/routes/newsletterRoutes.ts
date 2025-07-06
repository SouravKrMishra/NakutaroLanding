import { Router } from "express";
import {
  subscribeToNewsletter,
  getSubscriberCount,
} from "../controllers/newsletterController";

const router = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post("/subscribe", subscribeToNewsletter);

// GET /api/newsletter/subscribers/count - Get subscriber count (optional, for admin purposes)
router.get("/subscribers/count", getSubscriberCount);

export default router;
