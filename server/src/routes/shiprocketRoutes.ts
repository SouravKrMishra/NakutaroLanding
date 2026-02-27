// Shiprocket Routes
// API routes for delivery serviceability checks and shipping webhooks

import { Router } from "express";
import {
  checkServiceability,
  getServiceStatus,
  handleShiprocketWebhook,
  getOrderTracking,
} from "../controllers/shiprocketController.js";
import { authenticateToken } from "../middleware/auth.js";

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

/**
 * POST /api/shiprocket/webhook
 * Webhook endpoint for Shiprocket shipping status updates
 * This is called by Shiprocket when shipment status changes
 * 
 * Note: This endpoint is public (no auth) as Shiprocket needs to call it
 */
router.post("/webhook", handleShiprocketWebhook);

/**
 * GET /api/shiprocket/tracking/:shipmentId
 * Get tracking by AWB code (shipmentId param is actually the AWB code)
 * Requires authentication
 */
router.get("/tracking/:shipmentId", authenticateToken, getOrderTracking);

export default router;
