import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./src/config/index.js";
import { logger } from "./src/middleware/logger.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import apiRoutes from "./src/routes/index.js";
import { setupVite, serveStatic } from "./vite.js";
import connectDB from "../shared/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { SchedulerService } from "./src/services/schedulerService.js";
// Import types to ensure global declarations are loaded
import "./src/types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      const allowedOrigins = Array.isArray(config.cors.origin)
        ? config.cors.origin
        : [config.cors.origin];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
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

// 404 handler for API routes
app.use("/api/*", (req, res) => {
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
  // Connect to MongoDB
  await connectDB();

  const server = createServer(app);

  if (config.nodeEnv === "development") {
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

  // Alternative: If ZeroTier doesn't work with 0.0.0.0, uncomment and replace with your ZeroTier IP
  // const zeroTierIP = "192.168.192.189"; // Replace with your actual ZeroTier IP
  // listenOptions.host = zeroTierIP;

  server.listen(listenOptions, () => {
    console.log(
      `Server running on port ${config.port} in ${config.nodeEnv} mode`
    );

    // Start the order cleanup scheduler
    SchedulerService.startCleanupScheduler();
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    SchedulerService.stopCleanupScheduler();
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    SchedulerService.stopCleanupScheduler();
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });
})();
