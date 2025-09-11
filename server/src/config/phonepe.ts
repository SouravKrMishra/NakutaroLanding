// PhonePe Payment Gateway Configuration using Official SDK
// Following official documentation: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/integration-steps

import { config } from "dotenv";
import { StandardCheckoutClient, Env } from "pg-sdk-node";

config();

// PhonePe SDK Configuration
export const phonepeConfig = {
  // PhonePe Client ID (Get this from PhonePe dashboard)
  clientId: process.env.PHONEPE_CLIENT_ID || "DEMO_CLIENT_ID",

  // PhonePe Client Secret (Get this from PhonePe dashboard)
  clientSecret: process.env.PHONEPE_CLIENT_SECRET || "DEMO_CLIENT_SECRET",

  // PhonePe Environment (UAT for testing, PROD for production)
  environment:
    process.env.PHONEPE_ENVIRONMENT === "PROD" ? Env.PRODUCTION : Env.SANDBOX,

  // Client Version
  clientVersion: 1,
};

// Check if we have real credentials
const hasRealCredentials =
  process.env.PHONEPE_CLIENT_ID &&
  process.env.PHONEPE_CLIENT_SECRET &&
  process.env.PHONEPE_CLIENT_ID !== "DEMO_CLIENT_ID" &&
  process.env.PHONEPE_CLIENT_SECRET !== "DEMO_CLIENT_SECRET" &&
  process.env.PHONEPE_CLIENT_ID.length > 10 && // Real client IDs are longer
  process.env.PHONEPE_CLIENT_SECRET.length > 20; // Real secrets are longer

// Initialize PhonePe SDK Client only if we have real credentials
let phonepeClient: StandardCheckoutClient | null = null;
if (hasRealCredentials) {
  try {
    console.log("Initializing PhonePe SDK with credentials...");
    phonepeClient = StandardCheckoutClient.getInstance(
      phonepeConfig.clientId,
      phonepeConfig.clientSecret,
      phonepeConfig.clientVersion,
      phonepeConfig.environment
    );
    console.log("PhonePe SDK initialized successfully");
  } catch (initError) {
    console.error("Error initializing PhonePe SDK:", initError);
    phonepeClient = null;
  }
} else {
  console.log("No real PhonePe credentials found, SDK not initialized");
}

export { phonepeClient };

// Export flag to check if we have real credentials
export const hasPhonepeCredentials = hasRealCredentials;

// Instructions for getting PhonePe credentials:
// 1. Sign up for PhonePe Business account at https://business.phonepe.com/
// 2. Complete KYC and get merchant approval
// 3. Get your Client ID and Client Secret from the PhonePe dashboard
// 4. Replace the values above with your actual credentials
// 5. For testing, use UAT environment. For production, use PROD environment
// 6. The SDK handles all API communication securely
