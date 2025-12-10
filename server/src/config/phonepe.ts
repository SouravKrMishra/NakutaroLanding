// PhonePe Payment Gateway Configuration using Official SDK
// Following official documentation: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/integration-steps

import { config } from "dotenv";
import { StandardCheckoutClient, Env } from "pg-sdk-node";

config();

// PhonePe SDK Configuration
export const phonepeConfig = {
  // PhonePe Client ID (Get this from PhonePe dashboard)
  clientId: process.env.PHONEPE_CLIENT_ID,

  // PhonePe Client Secret (Get this from PhonePe dashboard)
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,

  // PhonePe Environment (UAT for testing, PROD for production)
  environment:
    process.env.PHONEPE_ENVIRONMENT === "PROD" ? Env.PRODUCTION : Env.SANDBOX,

  // Client Version
  clientVersion: 1,
};

// Check if we have usable credentials based on the resolved config values
// Use the finalized values from phonepeConfig so defaults or env both work
const hasRealCredentials =
  Boolean(phonepeConfig.clientId) &&
  Boolean(phonepeConfig.clientSecret) &&
  phonepeConfig.clientId !== "DEMO_CLIENT_ID" &&
  phonepeConfig.clientSecret !== "DEMO_CLIENT_SECRET";

// Initialize PhonePe SDK Client
let phonepeClient: StandardCheckoutClient | null = null;
if (hasRealCredentials) {
  try {
    console.log("Initializing PhonePe SDK with credentials...");
    console.log("Environment:", phonepeConfig.environment);

    phonepeClient = StandardCheckoutClient.getInstance(
      phonepeConfig.clientId || "",
      phonepeConfig.clientSecret || "",
      phonepeConfig.clientVersion,
      phonepeConfig.environment
    );
    console.log("PhonePe SDK initialized successfully");
  } catch (initError) {
    console.error("Error initializing PhonePe SDK:", initError);
    phonepeClient = null;
  }
} else {
  console.log("No PhonePe credentials found, SDK not initialized");
}

export { phonepeClient };

// Export flag to check if we have real credentials
export const hasPhonepeCredentials = hasRealCredentials;
