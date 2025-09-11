import express from "express";
import { createServer } from "http";
import { config } from "./src/config/index.ts";
import { logger } from "./src/middleware/logger.ts";
import { errorHandler } from "./src/middleware/errorHandler.ts";
import apiRoutes from "./src/routes/index.ts";
import { setupVite, serveStatic } from "./vite.ts";
import connectDB from "../shared/db.ts";
import cookieParser from "cookie-parser";
import { SchedulerService } from "./src/services/schedulerService.ts";
// Import types to ensure global declarations are loaded
import "./src/types/index.ts";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);
app.use(cookieParser());

// Routes
app.use("/api", apiRoutes);

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
