// Shiprocket Controller
// Handles delivery serviceability check requests and shipping webhooks

import { Request, Response, NextFunction } from "express";
import { shiprocketService } from "../services/shiprocketService.js";
import { createError } from "../middleware/errorHandler.js";
import { Order } from "../../../shared/models/Order.js";

function extractTrackUrlFromShiprocket(data: any): string | null {
  if (!data || typeof data !== "object") {
    console.warn("[Shiprocket] Invalid tracking data received:", data);
    return null;
  }

  const trackingData = data.tracking_data;
  if (trackingData && typeof trackingData === "object") {
    const trackUrl = trackingData.track_url || trackingData.trackUrl || trackingData.realtime_tracking;
    if (typeof trackUrl === "string" && trackUrl.trim()) {
      console.log("[Shiprocket] Found track_url in tracking_data:", trackUrl.trim());
      return trackUrl.trim();
    }
  }

  // Fallback: root level track_url
  const rootUrl = data.track_url || data.trackUrl || data.realtime_tracking;
  if (typeof rootUrl === "string" && rootUrl.trim()) {
    console.log("[Shiprocket] Found track_url at root:", rootUrl.trim());
    return rootUrl.trim();
  }

  // Last resort: shipment_track array
  if (trackingData?.shipment_track && Array.isArray(trackingData.shipment_track)) {
    const firstShipment = trackingData.shipment_track[0];
    if (firstShipment) {
      const shipmentUrl = firstShipment.track_url || firstShipment.trackUrl || firstShipment.realtime_tracking;
      if (typeof shipmentUrl === "string" && shipmentUrl.trim()) {
        console.log("[Shiprocket] Found track_url in shipment_track[0]:", shipmentUrl.trim());
        return shipmentUrl.trim();
      }
    }
  }

  console.warn("[Shiprocket] No track_url found in response. Available keys:", Object.keys(data));
  if (trackingData) {
    console.warn("[Shiprocket] tracking_data keys:", Object.keys(trackingData));
  }
  return null;
}

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

/**
 * Shiprocket Webhook Handler
 * POST /api/shiprocket/webhook
 * 
 * Shiprocket sends webhooks for various shipping events:
 * - Pickup Scheduled (status_code: 1)
 * - Pickup Queued (status_code: 2)
 * - Pickup Cancelled (status_code: 3)
 * - Out for Pickup (status_code: 4)
 * - Pickup Error/Exception (status_code: 5)
 * - In Transit (status_code: 6)
 * - Delivered (status_code: 7)
 * - Cancelled (status_code: 8)
 * - RTO Initiated (status_code: 9)
 * - RTO Delivered (status_code: 10)
 * - etc.
 */
export const handleShiprocketWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("[Shiprocket Webhook] Received:", JSON.stringify(req.body, null, 2));

    const {
      awb,
      current_status,
      current_status_id,
      shipment_status,
      shipment_status_id,
      order_id,
      etd,
      courier_name,
    } = req.body;

    // Validate webhook data
    if (!awb && !order_id) {
      console.warn("[Shiprocket Webhook] Missing AWB and order_id");
      return res.json({ success: true, message: "No order identifier provided" });
    }

    // Find order by AWB code or Shiprocket order ID
    let order;
    if (awb) {
      order = await Order.findOne({ awbCode: awb });
    }
    if (!order && order_id) {
      order = await Order.findOne({ shiprocketOrderId: String(order_id) });
    }
    // Try matching by order number as fallback
    if (!order && order_id) {
      order = await Order.findOne({ orderNumber: String(order_id) });
    }

    if (!order) {
      console.warn(`[Shiprocket Webhook] Order not found for AWB: ${awb}, order_id: ${order_id}`);
      return res.json({ success: true, message: "Order not found" });
    }

    console.log(`[Shiprocket Webhook] Processing for order: ${order.orderNumber}`);

    // Get the status code (prefer shipment_status_id, fallback to current_status_id)
    const statusCode = shipment_status_id || current_status_id;
    const statusText = shipment_status || current_status;

    // Map Shiprocket status codes to our order statuses
    // Reference: https://apidocs.shiprocket.in/#track-through-awb
    let newOrderStatus: string | null = null;
    let notes = "";

    switch (statusCode) {
      case 1: // Pickup Scheduled
      case 2: // Pickup Queued
      case 4: // Out for Pickup
        // Order is being picked up - still in PROCESSING
        notes = `Shiprocket: ${statusText}`;
        break;
      
      case 6: // Shipped / In Transit
      case 17: // Out for Delivery
      case 38: // Reached Destination Hub
      case 41: // Shipment on hold
        newOrderStatus = "SHIPPED";
        notes = `Shipped via ${courier_name || "courier"}. ${statusText}`;
        break;
      
      case 7: // Delivered
        newOrderStatus = "DELIVERED";
        notes = `Delivered successfully. ${statusText}`;
        break;
      
      case 8: // Cancelled
      case 3: // Pickup Cancelled
        // Don't automatically cancel the order, just log
        notes = `Shiprocket: ${statusText}. Manual review required.`;
        console.warn(`[Shiprocket Webhook] Order ${order.orderNumber} shipment cancelled/pickup cancelled`);
        break;
      
      case 5: // Pickup Error/Exception
      case 12: // Lost
      case 13: // Damaged
        notes = `Shiprocket issue: ${statusText}. Manual review required.`;
        console.warn(`[Shiprocket Webhook] Order ${order.orderNumber} has shipping issue: ${statusText}`);
        break;
      
      case 9: // RTO Initiated
      case 10: // RTO Delivered
      case 14: // RTO Acknowledged
      case 15: // RTO In Transit
        notes = `RTO: ${statusText}. Order being returned.`;
        console.warn(`[Shiprocket Webhook] Order ${order.orderNumber} RTO: ${statusText}`);
        break;
      
      default:
        notes = `Shiprocket status update: ${statusText} (code: ${statusCode})`;
    }

    // Update order
    const updateData: any = {
      notes: notes,
    };

    // Update AWB only if not already set (prefer AWB from shipment booking; webhook as fallback)
    if (awb && !order.awbCode) {
      updateData.awbCode = awb;
    }

    // Update courier name if provided
    if (courier_name) {
      updateData.courierName = courier_name;
    }

    // Update order status if changed
    if (newOrderStatus && order.status !== newOrderStatus) {
      updateData.status = newOrderStatus;
      console.log(`[Shiprocket Webhook] Updating order ${order.orderNumber} status: ${order.status} -> ${newOrderStatus}`);
    }

    await Order.updateOne({ _id: order._id }, { $set: updateData });

    console.log(`[Shiprocket Webhook] Order ${order.orderNumber} updated successfully`);

    return res.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("[Shiprocket Webhook] Error:", error);
    // Return 200 to prevent Shiprocket from retrying
    return res.json({ success: false, error: error.message });
  }
};

/**
 * Get tracking details by AWB code or Shiprocket shipment id.
 * GET /api/shiprocket/tracking/:identifier (AWB or shiprocketShipmentId)
 * Finds order by AWB or shipment id; if AWB is missing, tries to fetch it from Shiprocket.
 */
export const getOrderTracking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identifier = req.params.shipmentId?.trim();
    if (!identifier) {
      return next(createError("AWB or shipment identifier is required", 400));
    }

    // Find order by AWB code or by Shiprocket shipment id
    let order = await Order.findOne({ awbCode: identifier });
    if (!order) {
      order = await Order.findOne({ shiprocketShipmentId: identifier });
    }
    if (!order) {
      return next(createError("Order not found for this shipment", 404));
    }

    let awbToUse = order.awbCode;

    // If we found by shipment id and order has no AWB yet, try to fetch from Shiprocket
    if (!awbToUse && order.shiprocketOrderId) {
      console.log(`[Shiprocket] Order has no AWB, fetching from Shiprocket order ${order.shiprocketOrderId}`);
      const shiprocketOrder = await shiprocketService.getOrderByShiprocketId(order.shiprocketOrderId);
      if (shiprocketOrder?.awb_code) {
        awbToUse = shiprocketOrder.awb_code;
        await Order.updateOne(
          { _id: order._id },
          { $set: { awbCode: awbToUse } }
        );
        console.log(`[Shiprocket] Updated order ${order.orderNumber} with AWB: ${awbToUse}`);
      }
    }

    if (!awbToUse) {
      return res.json({
        success: true,
        tracking: null,
        trackUrl: undefined,
        awbCode: null,
        courierName: order.courierName,
        message: "Tracking not available yet. AWB may be assigned when the shipment is picked up.",
      });
    }

    try {
      console.log(`[Shiprocket] Fetching tracking for AWB: ${awbToUse}`);
      const trackingData = await shiprocketService.getTracking(awbToUse);
      const trackUrl = extractTrackUrlFromShiprocket(trackingData);
      
      console.log(`[Shiprocket] Extracted track_url: ${trackUrl || "null"}`);
      
      return res.json({
        success: true,
        tracking: trackingData,
        trackUrl: trackUrl || undefined,
        awbCode: awbToUse,
        courierName: order.courierName,
      });
    } catch (trackingError: any) {
      console.error("[Shiprocket] Error fetching tracking:", trackingError.message);
      return res.json({
        success: true,
        tracking: null,
        trackUrl: undefined,
        awbCode: awbToUse,
        courierName: order.courierName,
        message: "Could not fetch live tracking. AWB: " + awbToUse,
      });
    }
  } catch (error: any) {
    console.error("[Shiprocket Controller] Error fetching tracking:", error);
    next(createError(error.message || "Failed to get tracking details", 500));
  }
};
