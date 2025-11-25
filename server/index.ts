import express from "express";
import { createServer } from "http";
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

const app = express();

// CORS middleware - must be before other middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);
app.use(cookieParser());

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
