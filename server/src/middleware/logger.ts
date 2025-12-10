import { Request, Response, NextFunction } from "express";

// Helper function to format date in IST (UTC+5:30)
const getISTTimestamp = (): string => {
  const now = new Date();

  // Use Intl.DateTimeFormat to get IST time
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const second = parts.find((p) => p.type === "second")?.value;

  return `${year}-${month}-${day} ${hour}:${minute}:${second} +05:30`;
};

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Get client IP address, handling proxies
      const forwardedFor = req.headers["x-forwarded-for"];
      const clientIp = forwardedFor
        ? Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(",")[0].trim()
        : req.ip || req.socket.remoteAddress || "unknown";

      let logLine = `[${getISTTimestamp()}] ${req.method} ${path} ${
        res.statusCode
      } in ${duration}ms [${clientIp}]`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
};
