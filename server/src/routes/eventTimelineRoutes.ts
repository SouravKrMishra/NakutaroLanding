import { Router, Request, Response, NextFunction } from "express";
import { Event } from "../../../shared/models/Event.js";
import { EventNotification } from "../../../shared/models/EventNotification.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendEmail } from "../services/emailService.js";

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

router.post(
  "/:id/notify",
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id).lean();

      if (!event || !event.isActive) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      if (event.category !== "upcoming") {
        return res
          .status(400)
          .json({ success: false, message: "Notifications are only available for upcoming events" });
      }

      const requestedEmail =
        typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const recipientEmail = req.user?.email?.trim().toLowerCase() || requestedEmail;

      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required for guest notifications",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({ success: false, message: "Please provide a valid email address" });
      }

      const alreadyExists = await EventNotification.findOne({
        eventId: event._id,
        email: recipientEmail,
      }).lean();

      if (alreadyExists) {
        return res.json({
          success: true,
          alreadySubscribed: true,
          message: "You are already subscribed to this event.",
        });
      }

      const start = new Date(event.eventDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const end = event.eventEndDate
        ? new Date(event.eventEndDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";
      const dateLabel = end ? `${start} - ${end}` : start;

      const subject = `Upcoming Event Reminder: ${event.title}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #222;">
          <h2 style="margin-bottom: 8px;">You're subscribed for event updates!</h2>
          <p style="margin-top: 0; color: #555;">We'll keep you posted about this upcoming event:</p>
          <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; background: #fafafa;">
            <h3 style="margin: 0 0 10px 0;">${event.title}</h3>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${dateLabel}</p>
            <p style="margin: 6px 0;"><strong>Time:</strong> ${event.time || "TBA"}</p>
            <p style="margin: 6px 0;"><strong>Location:</strong> ${event.location || "TBA"}</p>
            <p style="margin: 10px 0 0 0;"><strong>Details:</strong> ${event.description || "Details will be shared soon."}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 14px;">Thanks for staying connected with Anime India.</p>
        </div>
      `;

      const text = `You're subscribed for event updates!\n\n${event.title}\nDate: ${dateLabel}\nTime: ${event.time || "TBA"}\nLocation: ${event.location || "TBA"}\nDetails: ${event.description || "Details will be shared soon."}\n\nThanks for staying connected with Anime India.`;

      const sent = await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text,
      });

      if (!sent) {
        return res.status(500).json({
          success: false,
          message: "Could not send email right now. Please try again later.",
        });
      }

      try {
        await EventNotification.create({
          eventId: event._id,
          email: recipientEmail,
          userId: req.user?.id || "",
          source: req.user?.id ? "registered" : "guest",
        });
      } catch (saveError: any) {
        // Handle race-condition duplicate insert safely.
        if (saveError?.code === 11000) {
          return res.json({
            success: true,
            alreadySubscribed: true,
            message: "You are already subscribed to this event.",
          });
        }
        throw saveError;
      }

      return res.json({
        success: true,
        alreadySubscribed: false,
        message: `Notification details sent to ${recipientEmail}`,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
