// Note: dotenv.config() is now called in server/index.ts before this file is imported
// This ensures environment variables are loaded before any config values are read

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : process.env.NODE_ENV === "production"
      ? "https://animeindia.org"
      : "http://localhost:5173",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY?.trim() || undefined,
    siteKey: process.env.RECAPTCHA_SITE_KEY?.trim() || undefined,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "465", 10),
    secure: process.env.EMAIL_SECURE !== "false", // Default to true for Hostinger (port 465 uses SSL)
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },
} as const;
