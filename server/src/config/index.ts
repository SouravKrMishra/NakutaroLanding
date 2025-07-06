import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  wooCommerce: {
    baseUrl: "https://shop.animeindia.org/wp-json/wc/v3",
    consumerKey: process.env.CONSUMER_KEY!,
    consumerSecret: process.env.CONSUMER_SECRET!,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
} as const;
