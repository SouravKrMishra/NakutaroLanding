import { config } from "dotenv";
import Razorpay from "razorpay";

config();

export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
};

const hasRealCredentials =
  Boolean(razorpayConfig.keyId) &&
  Boolean(razorpayConfig.keySecret) &&
  razorpayConfig.keyId !== "DEMO_KEY_ID" &&
  razorpayConfig.keySecret !== "DEMO_KEY_SECRET";

let razorpayClient: Razorpay | null = null;

if (hasRealCredentials) {
  try {
    console.log("Initializing Razorpay with credentials...");
    razorpayClient = new Razorpay({
      key_id: razorpayConfig.keyId!,
      key_secret: razorpayConfig.keySecret!,
    });
    console.log("Razorpay initialized successfully");
  } catch (initError) {
    console.error("Error initializing Razorpay:", initError);
    razorpayClient = null;
  }
} else {
  console.log("No Razorpay credentials found, SDK not initialized");
}

export { razorpayClient };
export const hasRazorpayCredentials = hasRealCredentials;
