import { Request, Response } from "express";
import crypto from "crypto";
import { razorpayClient, razorpayConfig, hasRazorpayCredentials } from "../config/razorpay.js";
import Transaction from "../../../shared/models/Transaction.js";
import { Order } from "../../../shared/models/Order.js";
import { Cart } from "../../../shared/models/Cart.js";
import { reduceStockForOrder } from "../services/stockService.js";
import { isRazorpayEnabled } from "../services/paymentSettingsService.js";

/**
 * Create a Razorpay order (server-side step before opening checkout)
 * Called after the internal DB order is already created
 */
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const razorpayEnabled = await isRazorpayEnabled();
    if (!razorpayEnabled) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment gateway is currently disabled",
      });
    }

    if (!hasRazorpayCredentials || !razorpayClient) {
      return res.status(400).json({
        success: false,
        message: "Razorpay credentials not configured",
        demo_mode: true,
      });
    }

    const { amount, currency = "INR", receipt, merchantTransactionId, orderId } = req.body;

    if (!amount || !receipt || !merchantTransactionId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayClient.orders.create({
      amount: Math.round(amount), // amount in paise (already converted by client)
      currency,
      receipt,
      notes: {
        merchantTransactionId,
        internalOrderId: orderId || "",
      },
    });

    // Create a transaction record in DB
    let internalOrderId = null;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) internalOrderId = order._id;
    }

    await Transaction.create({
      userId: req.user?.id,
      orderId: internalOrderId,
      merchantTransactionId,
      phonepeTransactionId: razorpayOrder.id, // reuse field to store razorpay order id
      amount,
      currency,
      paymentMethod: "RAZORPAY",
      status: "PENDING",
    });

    return res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayConfig.keyId,
    });
  } catch (error: any) {
    console.error("Razorpay create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
    });
  }
};

/**
 * Verify payment signature and mark order as paid
 * Called after the user completes payment in Razorpay checkout
 */
export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    if (!hasRazorpayCredentials || !razorpayConfig.keySecret) {
      return res.status(400).json({
        success: false,
        message: "Razorpay credentials not configured",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      merchantTransactionId,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", razorpayConfig.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Find transaction record
    const transaction = await Transaction.findOne({
      $or: [
        { merchantTransactionId },
        { phonepeTransactionId: razorpay_order_id },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction to SUCCESS
    transaction.status = "SUCCESS";
    (transaction as any).callbackData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };
    await transaction.save();

    // Find and update internal order
    const orderIdToUse = transaction.orderId || orderId;
    if (!orderIdToUse) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = await Order.findById(orderIdToUse);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only update if not already paid
    if (order.paymentStatus !== "COMPLETED") {
      order.paymentStatus = "COMPLETED";
      order.status = "ORDER_SUCCESS";
      order.notes = `Paid via Razorpay. Payment ID: ${razorpay_payment_id}`;

      // Apply coupon if used
      if (order.couponCode) {
        try {
          const { applyCoupon } = await import("../controllers/couponController.js");
          const mockReq = {
            body: {
              code: order.couponCode,
              userId: transaction.userId?.toString(),
              orderId: order._id.toString(),
            },
          } as any;
          const mockRes = { json: (data: any) => data } as any;
          await applyCoupon(mockReq, mockRes, () => {});
        } catch (e) {
          console.error("Failed to apply coupon after Razorpay payment:", e);
        }
      }

      await order.save();

      // Clear cart
      try {
        const cart = await Cart.findOne({ userId: transaction.userId });
        if (cart) {
          cart.items.splice(0, cart.items.length);
          await cart.save();
        }
      } catch (e) {
        console.error("Failed to clear cart after Razorpay payment:", e);
      }

      // Reduce stock
      if (!order.stockAdjusted) {
        try {
          await reduceStockForOrder(order._id);
          order.stockAdjusted = true;
          await order.save();
        } catch (e) {
          console.error("Failed to reduce stock for Razorpay order:", e);
        }
      }
    }

    return res.json({
      success: true,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("Razorpay verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

/**
 * Get Razorpay public key for client-side initialization
 */
export const getRazorpayConfig = async (req: Request, res: Response) => {
  const razorpayEnabled = await isRazorpayEnabled();
  return res.json({
    success: true,
    enabled: razorpayEnabled && hasRazorpayCredentials,
    keyId: hasRazorpayCredentials ? razorpayConfig.keyId : null,
  });
};
