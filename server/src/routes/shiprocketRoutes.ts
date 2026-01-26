// Shiprocket Routes
// API routes for delivery serviceability checks

import { Router } from "express";
import {
  checkServiceability,
  getServiceStatus,
} from "../controllers/shiprocketController.js";

const router = Router();

// Public routes (no authentication required for checking delivery)

/**
 * POST /api/shiprocket/check-serviceability
 * Check if delivery is available to a given pincode and get estimated delivery date
 *
 * Request body:
 * {
 *   deliveryPincode: string (required) - 6-digit PIN code to check
 *   pickupPincode?: string - Override default warehouse pincode
 *   weight?: number - Product weight in kg (default: 0.5)
 *   cod?: boolean - Check COD availability (default: false)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   serviceable: boolean,
 *   estimatedDeliveryDate: string | null,
 *   estimatedDeliveryDays: number | null,
 *   message: string,
 *   courierName: string | null,
 *   shippingCost: number | null,
 *   codAvailable: boolean,
 *   allCouriers?: Array<{
 *     name: string,
 *     estimatedDays: number,
 *     estimatedDate: string,
 *     cost: number,
 *     codAvailable: boolean,
 *     rating: number
 *   }>
 * }
 */
router.post("/check-serviceability", checkServiceability);

/**
 * GET /api/shiprocket/status
 * Check if Shiprocket service is properly configured
 *
 * Response:
 * {
 *   success: boolean,
 *   configured: boolean,
 *   message: string
 * }
 */
router.get("/status", getServiceStatus);

export default router;
