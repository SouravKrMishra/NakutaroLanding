import { Request, Response, NextFunction } from "express";
import { recommendationService } from "../services/recommendationService.js";
import { createError } from "../middleware/errorHandler.js";

export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const limit = Number(req.query.limit) || 6;
    const recommendations =
      await recommendationService.getRecommendationsForUser(userId, limit);

    res.json({ recommendations });
  } catch (error) {
    next(createError("Failed to fetch recommendations", 500));
  }
};

export const addPurchaseToHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(createError("User not authenticated", 401));
    }

    const {
      productId,
      productName,
      category,
      series,
      quantity,
      price,
      totalAmount,
    } = req.body;

    // Validate required fields
    if (
      !productId ||
      !productName ||
      !category ||
      !series ||
      !quantity ||
      !price ||
      !totalAmount
    ) {
      return next(createError("Missing required fields", 400));
    }

    await recommendationService.addPurchaseToHistory(userId, {
      productId,
      productName,
      category,
      series,
      quantity,
      price,
      totalAmount,
    });

    res.json({ message: "Purchase added to history successfully" });
  } catch (error) {
    next(createError("Failed to add purchase to history", 500));
  }
};
