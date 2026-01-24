// Contropay Crypto Payment Gateway Configuration
// API Documentation: https://contropay.com/api-docs

import { config } from "dotenv";

config();

// Contropay API Configuration
export const CONTROPAY_API_URL = "https://api.contropay.com/v1";
export const CONTROPAY_API_KEY = process.env.CONTROPAY_API_KEY;

// INR to USD exchange rate (stored in env for easy updates)
export const INR_USD_RATE = parseFloat(process.env.INR_USD_RATE || "0.012");

// Supported blockchain networks
export const SUPPORTED_CHAINS = [
  "BSC",
  "ETH",
  "POLYGON",
  "TRON",
  "BTC",
  "LITECOIN",
] as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

// Chain to tokens mapping
export const CHAIN_TOKENS: Record<SupportedChain, string[]> = {
  BSC: ["USDT", "BNB"],
  ETH: ["USDT", "ETH", "DAI"],
  POLYGON: ["USDT"],
  TRON: ["USDT", "TRX"],
  BTC: ["BTC"],
  LITECOIN: ["LTC"],
};

// Chain display names for UI
export const CHAIN_DISPLAY_NAMES: Record<SupportedChain, string> = {
  BSC: "BNB Smart Chain",
  ETH: "Ethereum",
  POLYGON: "Polygon",
  TRON: "Tron",
  BTC: "Bitcoin",
  LITECOIN: "Litecoin",
};

// Default chain and token (USDT on TRON - lowest fees)
export const DEFAULT_CHAIN: SupportedChain = "TRON";
export const DEFAULT_TOKEN = "USDT";

// Check if we have valid Contropay credentials
const hasRealCredentials =
  Boolean(CONTROPAY_API_KEY) &&
  CONTROPAY_API_KEY !== "sk_test_xxx" &&
  CONTROPAY_API_KEY !== "sk_live_xxx";

// Export flag to check if we have real credentials
export const hasContropayCredentials = hasRealCredentials;

// Helper to validate chain and token combination
export const isValidChainToken = (chain: string, token: string): boolean => {
  if (!SUPPORTED_CHAINS.includes(chain as SupportedChain)) {
    return false;
  }
  return CHAIN_TOKENS[chain as SupportedChain].includes(token);
};

// Helper to get default token for a chain
export const getDefaultTokenForChain = (chain: SupportedChain): string => {
  const tokens = CHAIN_TOKENS[chain];
  // Prefer USDT if available, otherwise first token
  return tokens.includes("USDT") ? "USDT" : tokens[0];
};

// Log configuration status
if (hasRealCredentials) {
  console.log("Contropay API configured with credentials");
  console.log("INR to USD rate:", INR_USD_RATE);
} else {
  console.log("No Contropay credentials found, crypto payments not available");
}
