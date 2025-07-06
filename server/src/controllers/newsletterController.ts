import { Request, Response } from "express";

// In a real application, you would store this in a database
// For now, we'll use a simple in-memory array (this will reset when server restarts)
const newsletterSubscribers: string[] = [];

export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check if email is already subscribed
    if (newsletterSubscribers.includes(email.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    // Add email to subscribers list
    newsletterSubscribers.push(email.toLowerCase());

    // In a real application, you would:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Integrate with email service (Mailchimp, SendGrid, etc.)
    // 4. Add to CRM system

    console.log(`New newsletter subscription: ${email}`);

    res.status(200).json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe to newsletter. Please try again.",
    });
  }
};

export const getSubscriberCount = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      count: newsletterSubscribers.length,
    });
  } catch (error) {
    console.error("Get subscriber count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get subscriber count",
    });
  }
};
