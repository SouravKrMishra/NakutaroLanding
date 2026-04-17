import { Router, Request, Response, NextFunction } from "express";
import { Event } from "../../../shared/models/Event.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find({ isActive: true })
      .sort({ featured: -1, order: 1, eventDate: -1 })
      .lean();
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

export default router;
