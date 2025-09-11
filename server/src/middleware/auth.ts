import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as any;
    req.user = {
      id: decoded.userId, // Use userId instead of id
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error: any) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
