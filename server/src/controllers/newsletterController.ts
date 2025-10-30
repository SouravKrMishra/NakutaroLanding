import { Request, Response } from "express";
import { Newsletter } from "../../../shared/models/Newsletter.ts";

export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const existingSubscriber = await Newsletter.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
    if (existingSubscriber) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    // Create new newsletter subscription
    const newSubscriber = new Newsletter({
      email: email.toLowerCase(),
      source: req.body.source || "footer",
      metadata: {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        timestamp: new Date(),
      },
    });

    await newSubscriber.save();

    res.status(200).json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to subscribe to newsletter. Please try again.",
    });
  }
};

export const getSubscriberCount = async (req: Request, res: Response) => {
  try {
    const count = await Newsletter.countDocuments({ isActive: true });
    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get subscriber count",
    });
  }
};

export const getAllSubscribers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, active = true } = req.query;

    const query = active === "false" ? {} : { isActive: true };

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select("-__v"); // Exclude version key

    const total = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      subscribers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get subscribers",
    });
  }
};
