// Shiprocket Controller
// Handles delivery serviceability check requests

import { Request, Response, NextFunction } from "express";
import { shiprocketService } from "../services/shiprocketService.js";
import { createError } from "../middleware/errorHandler.js";

/**
 * Check delivery serviceability for a given pincode
 * POST /api/shiprocket/check-serviceability
 *
 * Request body:
 * {
 *   deliveryPincode: string (required) - 6-digit PIN code
 *   pickupPincode?: string - Override default pickup pincode
 *   weight?: number - Weight in kg (default: 0.5)
 *   cod?: boolean - Check for COD availability
 * }
 */
export const checkServiceability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deliveryPincode, pickupPincode, weight, cod } = req.body;

    // Validate required fields
    if (!deliveryPincode) {
      return next(createError("Delivery pincode is required", 400));
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(deliveryPincode)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: "Please enter a valid 6-digit PIN code",
      });
    }

    // Check serviceability
    const result = await shiprocketService.checkServiceability(deliveryPincode, {
      pickupPincode,
      weight,
      cod,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[Shiprocket Controller] Error:", error);
    next(createError(error.message || "Failed to check delivery serviceability", 500));
  }
};

/**
 * Check if Shiprocket service is configured
 * GET /api/shiprocket/status
 */
export const getServiceStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isConfigured = shiprocketService.isConfigured();

    res.json({
      success: true,
      configured: isConfigured,
      message: isConfigured
        ? "Shiprocket service is configured and ready"
        : "Shiprocket service is not configured. Fallback delivery estimates will be used.",
    });
  } catch (error: any) {
    next(createError("Failed to check service status", 500));
  }
};
