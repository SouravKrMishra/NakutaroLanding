import nodemailer from "nodemailer";
import { config } from "../config/index.js";

// Check if email credentials are configured
// Read directly from process.env to avoid config object issues
const isEmailConfigured = (): boolean => {
  const host = process.env.EMAIL_HOST?.trim() || config.email.host?.trim();
  // Use EMAIL_FROM as fallback for EMAIL_USER if not set (they're often the same)
  const user =
    process.env.EMAIL_USER?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    config.email.user?.trim();
  const password =
    process.env.EMAIL_PASSWORD?.trim() || config.email.password?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    config.email.from?.trim();

  const isConfigured = !!(host && user && password && from);

  if (!isConfigured) {
    console.log("📧 Email configuration check:");
    console.log("  EMAIL_HOST:", host ? `✓ Set (${host})` : "✗ Missing");
    console.log("  EMAIL_USER:", user ? `✓ Set (${user})` : "✗ Missing");
    console.log("  EMAIL_PASSWORD:", password ? "✓ Set (hidden)" : "✗ Missing");
    console.log("  EMAIL_FROM:", from ? `✓ Set (${from})` : "✗ Missing");
    console.log(
      "  process.env.EMAIL_HOST:",
      process.env.EMAIL_HOST ? `"${process.env.EMAIL_HOST}"` : "undefined"
    );
    console.log(
      "  process.env.EMAIL_USER:",
      process.env.EMAIL_USER ? `"${process.env.EMAIL_USER}"` : "undefined"
    );
    console.log(
      "  process.env.EMAIL_PASSWORD:",
      process.env.EMAIL_PASSWORD ? "***exists***" : "undefined"
    );
    console.log(
      "  process.env.EMAIL_FROM:",
      process.env.EMAIL_FROM ? `"${process.env.EMAIL_FROM}"` : "undefined"
    );
  }

  return isConfigured;
};

// Create reusable transporter only if credentials are available
let transporter: nodemailer.Transporter | null = null;
let transporterInitialized = false;

// Initialize transporter lazily (when first needed, not at module load time)
const initializeTransporter = (): void => {
  if (transporterInitialized) return;
  transporterInitialized = true;

  if (isEmailConfigured()) {
    // Read directly from process.env for reliability
    const host =
      process.env.EMAIL_HOST?.trim() || config.email.host?.trim() || "";
    const port = parseInt(process.env.EMAIL_PORT || "465", 10);
    const secure = process.env.EMAIL_SECURE !== "false";
    // Use EMAIL_FROM as fallback for EMAIL_USER if not set
    const user =
      process.env.EMAIL_USER?.trim() ||
      process.env.EMAIL_FROM?.trim() ||
      config.email.user?.trim() ||
      "";
    const password =
      process.env.EMAIL_PASSWORD?.trim() || config.email.password?.trim() || "";

    transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true for 465, false for other ports
      auth: {
        user,
        pass: password,
      },
      // For Hostinger, ensure TLS is properly configured
      tls: {
        rejectUnauthorized: false, // Set to true in production if you have valid SSL certificate
      },
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error("Email service configuration error:", error);
        console.error(
          "Please check your EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM environment variables."
        );
      } else {
        console.log("Email service is ready to send messages");
      }
    });
  } else {
    console.warn(
      "⚠️  Email service is not configured. Please set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM environment variables."
    );
  }
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Initialize transporter on first use (lazy initialization)
  if (!transporterInitialized) {
    initializeTransporter();
  }

  if (!isEmailConfigured() || !transporter) {
    console.error(
      "Cannot send email: Email service is not configured. Please set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM environment variables."
    );
    return false;
  }

  try {
    // Read from process.env directly for reliability
    const from =
      process.env.EMAIL_FROM?.trim() ||
      process.env.EMAIL_USER?.trim() ||
      config.email.from ||
      "";

    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error: any) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.command) {
      console.error("Failed command:", error.command);
    }
    return false;
  }
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<boolean> => {
  const subject = "Verify Your Account - OTP Code";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0;">Verify Your Account</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px;">Hello ${name},</p>
        <p style="font-size: 16px;">Thank you for registering with us! To complete your registration and activate your account, please verify your email address using the OTP code below:</p>
        <div style="background: #ffffff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0;">${otp}</p>
        </div>
        <p style="font-size: 14px; color: #666;">This OTP will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>The Team</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Account
    
    Hello ${name},
    
    Thank you for registering with us! To complete your registration and activate your account, please verify your email address using the OTP code below:
    
    OTP Code: ${otp}
    
    This OTP will expire in 10 minutes. If you didn't request this code, please ignore this email.
    
    Best regards,
    The Team
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};
