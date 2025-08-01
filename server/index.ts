import express from "express";
import { createServer } from "http";
import { config } from "./src/config/index";
import { logger } from "./src/middleware/logger";
import { errorHandler } from "./src/middleware/errorHandler";
import apiRoutes from "./src/routes/index";
import { setupVite, serveStatic } from "./vite";
import connectDB from "../shared/db";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

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

  server.listen(
    {
      port: config.port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(
        `Server running on port ${config.port} in ${config.nodeEnv} mode`
      );
    }
  );
})();
