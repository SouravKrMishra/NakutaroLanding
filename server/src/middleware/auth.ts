import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    // Read JWT_SECRET directly from process.env as fallback
    const jwtSecret = process.env.JWT_SECRET?.trim() || config.jwt.secret;

    if (!jwtSecret) {
      return res.status(500).json({
        message:
          "JWT_SECRET is not configured. Please set JWT_SECRET in your .env file.",
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.userId, // Use userId instead of id
      email: decoded.email,
      name: decoded.name,
      userType: decoded.userType,
    };
    next();
  } catch (error: any) {
    // Handle specific JWT errors without logging (they're expected)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === "NotBeforeError") {
      return res.status(401).json({ message: "Token not active yet" });
    } else {
      return res.status(401).json({ message: "Authentication failed" });
    }
  }
};

// Optional authentication - attaches user if token is valid, but doesn't require it
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    // No token provided, continue without user
    next();
    return;
  }

  try {
    // Read JWT_SECRET directly from process.env as fallback
    const jwtSecret = process.env.JWT_SECRET?.trim() || config.jwt.secret;

    if (jwtSecret) {
      const decoded = jwt.verify(token, jwtSecret) as any;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        userType: decoded.userType,
      };
    }
  } catch (error) {
    // Token is invalid but we don't fail the request
    // Just continue without user
  }

  next();
};
