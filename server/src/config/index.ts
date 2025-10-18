import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "supersecretjwtkey",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY!,
    siteKey: process.env.RECAPTCHA_SITE_KEY!,
  },
} as const;
