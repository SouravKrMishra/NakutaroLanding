// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
// Try multiple locations: project root (using process.cwd()), and relative to compiled file
const projectRoot = process.cwd();
const possibleEnvPaths = [
  path.resolve(projectRoot, ".env"), // Project root (most common in production)
  path.resolve(__dirname, "..", ".env"), // One level up from dist (if compiled structure preserved)
  path.resolve(__dirname, "..", "..", ".env"), // Two levels up (if dist/server structure)
];

import { existsSync } from "fs";

// Find the first existing .env file
let envPath: string | null = null;
for (const possiblePath of possibleEnvPaths) {
  if (existsSync(possiblePath)) {
    envPath = possiblePath;
    break;
  }
}

// If no .env found, use project root as default
if (!envPath) {
  envPath = possibleEnvPaths[0];
  console.warn(
    "⚠️  Warning: .env file not found. Tried:",
    possibleEnvPaths.join(", "),
  );
  console.warn("⚠️  Will attempt to load from:", envPath);
} else {
  console.log(`📄 Found .env file at: ${envPath}`);
}

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn("⚠️  Warning: Could not load .env file:", result.error.message);
  console.log("Looking for .env at:", envPath);
} else {
  console.log("✅ Environment variables loaded from:", envPath);

  // Log NODE_ENV status
  const nodeEnv = process.env.NODE_ENV || "development";
  console.log(`🔧 NODE_ENV: ${nodeEnv}`);
  if (nodeEnv !== "production" && !process.env.NODE_ENV) {
    console.warn("⚠️  Warning: NODE_ENV not set. Defaulting to 'development'.");
    console.warn(
      "⚠️  For production, ensure NODE_ENV=production is set in your environment or .env file",
    );
  }

  // Check critical environment variables
  const criticalVars = [
    "RECAPTCHA_SECRET_KEY",
    "RECAPTCHA_SITE_KEY",
    "JWT_SECRET",
  ];
  console.log("🔑 Critical environment variables check:");
  criticalVars.forEach((varName) => {
    const value = process.env[varName];
    if (varName.includes("SECRET") || varName.includes("KEY")) {
      console.log(`  ${varName}: ${value ? "✓ Set (hidden)" : "✗ Missing"}`);
    } else {
      console.log(`  ${varName}: ${value ? `✓ Set (${value})` : "✗ Missing"}`);
    }
  });
  // Log CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN || "Not set (using default)";
  console.log(`🌐 CORS_ORIGIN: ${corsOrigin}`);
}

import express from "express";
import { createServer } from "http";
import { logger } from "./src/middleware/logger.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import apiRoutes from "./src/routes/index.js";
import { setupVite, serveStatic } from "./vite.js";
import connectDB from "../shared/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { SchedulerService } from "./src/services/schedulerService.js";
import { logoutTokenOnShutdown } from "./src/services/shiprocketService.js";
// Import types to ensure global declarations are loaded
import "./src/types/index.js";
// Register Event model with Mongoose
import "../shared/models/Event.js";

// Helper function to get CORS origins from process.env (before config is loaded)
function getCorsOrigins(): string | string[] {
  // Read NODE_ENV at runtime to ensure we get the current value
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const defaultProductionOrigin = "https://animeindia.org";
  const defaultDevelopmentOrigin = "http://localhost:5173";

  if (process.env.CORS_ORIGIN) {
    const origins = process.env.CORS_ORIGIN.split(",").map((origin) =>
      origin.trim(),
    );
    // In production, ensure https://animeindia.org is always included
    if (
      isProduction &&
      !origins.includes(defaultProductionOrigin) &&
      !origins.includes("https://animeindia.org")
    ) {
      origins.push(defaultProductionOrigin);
    }
    return origins;
  }

  return isProduction ? defaultProductionOrigin : defaultDevelopmentOrigin;
}

const app = express();

// Trust proxy to get real client IP (important when behind nginx, load balancer, etc.)
app.set("trust proxy", true);

// CORS middleware - must be before other middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      const corsOrigins = getCorsOrigins();
      const allowedOrigins = Array.isArray(corsOrigins)
        ? corsOrigins
        : [corsOrigins];

      // Normalize origins for comparison (remove trailing slashes)
      const normalizeOrigin = (url: string) => url.replace(/\/$/, "");
      const normalizedOrigin = normalizeOrigin(origin);
      const normalizedAllowed = allowedOrigins.map(normalizeOrigin);

      if (normalizedAllowed.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        console.warn(`Allowed origins: ${allowedOrigins.join(", ")}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);
app.use(cookieParser());

// Serve uploaded files
// Use environment variable for upload path, or default to project root
const uploadsPath = process.env.UPLOAD_PATH
  ? process.env.UPLOAD_PATH
  : path.join(__dirname, "../uploads");

console.log(`Serving uploads from: ${uploadsPath}`);
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api", apiRoutes);

// 404 handler for API routes (catch any /api routes that weren't handled above)
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

(async () => {
  // Import config AFTER dotenv has been loaded (dynamic import to avoid hoisting)
  const { config } = await import("./src/config/index.js");

  // Connect to MongoDB
  await connectDB();

  const server = createServer(app);

  // Check NODE_ENV directly from process.env (already loaded by dotenv)
  // This ensures we use the correct value even if config was loaded before dotenv
  const nodeEnv = process.env.NODE_ENV || "development";

  if (nodeEnv === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const listenOptions: {
    port: number | string;
    host: string;
    reusePort?: boolean;
  } = {
    port: config.port,
    host: "0.0.0.0",
  };
  // reusePort is not supported on Windows; enable only on non-win32
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    console.log(`Server running on port ${config.port} in ${nodeEnv} mode`);
    const corsOrigins = getCorsOrigins();
    const allowedOrigins = Array.isArray(corsOrigins)
      ? corsOrigins
      : [corsOrigins];
    console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(", ")}`);

    // Start the order cleanup scheduler
    SchedulerService.startCleanupScheduler();
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down gracefully`);
    SchedulerService.stopCleanupScheduler();
    logoutTokenOnShutdown().finally(() => {
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();
