import { Request, Response } from "express";
import axios from "axios";
import {
  CONTROPAY_API_URL,
  CONTROPAY_API_KEY,
  INR_USD_RATE,
  hasContropayCredentials,
  isValidChainToken,
  SupportedChain,
} from "../config/contropay.js";
import Transaction from "../../../shared/models/Transaction.js";
import { Order } from "../../../shared/models/Order.js";
import { Cart } from "../../../shared/models/Cart.js";
import { reduceStockForOrder } from "../services/stockService.js";
import { isContropayEnabled } from "../services/paymentSettingsService.js";

// Contropay API client - use api_key as query param as alternative auth method
const contropayApi = axios.create({
  baseURL: CONTROPAY_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    api_key: CONTROPAY_API_KEY || "",
  },
});

// Helper to update order and transaction status
const updatePaymentStatus = async (
  paymentLinkId: string,
  contropayStatus: string,
  paymentDetails: any
) => {
  console.log(
    `Updating Contropay status for ${paymentLinkId}: ${contropayStatus}`
  );

  const transaction = await Transaction.findOne({
    contropayPaymentLinkId: paymentLinkId,
  });

  if (!transaction) {
    console.error(`Transaction not found for payment link: ${paymentLinkId}`);
    return null;
  }

  // Map Contropay status to internal status
  // Contropay statuses: pending → unconfirmed → completed (or expired/cancelled)
  let status: "PENDING" | "SUCCESS" | "FAILED";
  if (contropayStatus === "completed") {
    status = "SUCCESS";
  } else if (contropayStatus === "expired" || contropayStatus === "cancelled") {
    status = "FAILED";
  } else {
    // pending or unconfirmed
    status = "PENDING";
  }

  transaction.status = status;
  (transaction as any).callbackData = paymentDetails;

  await transaction.save();

  if (transaction.orderId) {
    const order = await Order.findById(transaction.orderId);
    if (order) {
      const previousStatus = order.status;
      const previousPaymentStatus = order.paymentStatus;

      if (status === "SUCCESS") {
        order.paymentStatus = "COMPLETED";
        order.status = "PAID";

        // Apply coupon if one was used (mark as used only after successful payment)
        if (order.couponCode) {
          try {
            const { applyCoupon } = await import(
              "../controllers/couponController.js"
            );
            const mockReq = {
              body: {
                code: order.couponCode,
                userId: transaction.userId?.toString(),
                orderId: order._id.toString(),
              },
            } as any;
            const mockRes = {
              json: (data: any) => data,
            } as any;
            await applyCoupon(mockReq, mockRes, () => {});
            console.log(`Coupon ${order.couponCode} marked as used for order ${order._id}`);
          } catch (error) {
            // Don't fail the order if coupon application fails
            console.error("Failed to apply coupon:", error);
          }
        }

        // Clear cart for the user
        try {
          const cart = await Cart.findOne({ userId: transaction.userId });
          if (cart) {
            cart.items.splice(0, cart.items.length);
            await cart.save();
            console.log(`Cart cleared for user ${transaction.userId}`);
          }
        } catch (err) {
          console.error("Failed to clear cart:", err);
        }

        // Reduce stock for successful payment
        try {
          await reduceStockForOrder(order._id);
          console.log(`Stock reduced for order ${order._id}`);
        } catch (err) {
          console.error(`Failed to reduce stock for order ${order._id}:`, err);
        }
      } else if (status === "FAILED") {
        order.paymentStatus = "FAILED";
        order.status = "PAYMENT_FAILED";
      }

      await order.save();
      console.log(
        `Order ${order._id} status updated: ${previousStatus} -> ${order.status}`
      );
      console.log(
        `Order ${order._id} paymentStatus updated: ${previousPaymentStatus} -> ${order.paymentStatus}`
      );
    } else {
      console.error(
        `Order not found for transaction, orderId: ${transaction.orderId}`
      );
    }
  } else {
    console.warn(`Transaction ${paymentLinkId} has no associated orderId`);
  }

  return { transaction, status };
};

export const initiateContropayPayment = async (req: Request, res: Response) => {
  try {
    // Check if Contropay is enabled in settings
    const contropayEnabled = await isContropayEnabled();
    if (!contropayEnabled) {
      return res.status(400).json({
        success: false,
        message: "Contropay payment gateway is currently disabled",
      });
    }

    if (!hasContropayCredentials) {
      return res.status(400).json({
        success: false,
        message: "Contropay credentials not configured",
        demo_mode: true,
      });
    }

    const {
      amount, // Amount in INR (paise)
      merchantTransactionId,
      redirectUrl,
      merchantOrderId,
      chain,
      token,
    } = req.body;

    if (!amount || !merchantTransactionId || !redirectUrl || !chain || !token) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: amount, merchantTransactionId, redirectUrl, chain, token",
      });
    }

    // Validate chain and token combination
    if (!isValidChainToken(chain, token)) {
      return res.status(400).json({
        success: false,
        message: `Invalid chain/token combination: ${chain}/${token}`,
      });
    }

    // Check for existing order
    let orderId = null;
    if (merchantOrderId) {
      console.log(`Looking for order with orderNumber: ${merchantOrderId}`);
      const order = await Order.findOne({ orderNumber: merchantOrderId });
      if (order) {
        orderId = order._id;
        console.log(`Found order: ${orderId}`);
      } else {
        console.log(`Order not found with orderNumber: ${merchantOrderId}`);
      }
    } else {
      console.log("No merchantOrderId provided");
    }

    // Convert amount from paise to INR, then to USD
    const amountInINR = amount / 100;
    const usdAmount = (amountInINR * INR_USD_RATE).toFixed(2);

    // Minimum amount check - Contropay requires at least $1 USD
    const MIN_USD_AMOUNT = 0.5;
    if (parseFloat(usdAmount) < MIN_USD_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Minimum payment amount for crypto is $${MIN_USD_AMOUNT} USD (approximately ₹${Math.ceil(
          MIN_USD_AMOUNT / INR_USD_RATE
        )}). Your order total is $${usdAmount} USD.`,
      });
    }

    console.log(`Creating Contropay payment link:`);
    console.log(`  INR Amount: ${amountInINR}`);
    console.log(`  USD Amount: ${usdAmount}`);
    console.log(`  Chain: ${chain}, Token: ${token}`);

    // Create payment link via Contropay API
    // Matching the exact format from the API docs test script (Section 7)
    // No metadata - keep it minimal to avoid validation issues
    const requestBody = {
      usdAmount: usdAmount, // String like "10.99"
      chain: chain, // String like "TRON"
      token: token, // String like "USDT"
    };

    console.log("Contropay API Request:", JSON.stringify(requestBody, null, 2));

    // Make direct axios request matching the test script format
    const fullUrl = `${CONTROPAY_API_URL}/payment-links`;
    console.log("Full URL:", fullUrl);
    console.log("Headers: X-API-Key:", CONTROPAY_API_KEY);

    const response = await axios.post(fullUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": CONTROPAY_API_KEY,
      },
    });

    console.log(
      "Contropay API Response:",
      JSON.stringify(response.data, null, 2)
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create payment link");
    }

    const paymentData = response.data.data;

    // Create transaction record
    console.log(
      `Creating transaction with orderId: ${orderId}, userId: ${req.user?.id}`
    );
    const newTransaction = await Transaction.create({
      userId: req.user?.id,
      orderId,
      merchantTransactionId,
      contropayPaymentLinkId: paymentData.id,
      contropayWalletAddress: paymentData.walletAddress,
      chain,
      token,
      amount: amountInINR,
      currency: "INR",
      paymentMethod: "CONTROPAY",
      status: "PENDING",
      redirectUrl,
      callbackUrl: redirectUrl, // Contropay uses redirect, not callback
    });
    console.log(
      `Transaction created: ${newTransaction._id}, orderId: ${newTransaction.orderId}`
    );

    // Update order with payment link ID
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        contropayPaymentLinkId: paymentData.id,
      });
      console.log(`Order ${orderId} updated with contropayPaymentLinkId: ${paymentData.id}`);
    }

    return res.json({
      success: true,
      merchantTransactionId,
      paymentLinkId: paymentData.id,
      paymentUrl: paymentData.paymentUrl,
      walletAddress: paymentData.walletAddress,
      chain,
      token,
      usdAmount,
    });
  } catch (error: any) {
    console.error("Contropay init payment error:");
    console.error("  Status:", error.response?.status);
    console.error("  Data:", JSON.stringify(error.response?.data, null, 2));
    console.error("  Message:", error.message);

    // Extract meaningful error message
    let errorMessage = "Payment initiation failed";
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      details: error.response?.data || null,
    });
  }
};

export const contropayRedirect = async (req: Request, res: Response) => {
  try {
    console.log("Contropay Redirect Handler Called:", req.method, req.url);
    console.log("Query params:", req.query);

    const paymentLinkId = req.query.paymentLinkId as string;
    const orderId = req.query.orderId as string;

    if (!paymentLinkId) {
      return res.redirect(`/dashboard?error=MissingPaymentLinkId`);
    }

    if (!hasContropayCredentials) {
      return res.redirect(`/dashboard?error=ConfigError`);
    }

    // Check payment status via Contropay API
    let contropayStatus = "pending";
    let paymentDetails = null;

    try {
      console.log(`Checking Contropay status for ${paymentLinkId}...`);

      // Small delay to ensure Contropay backend is consistent
      await new Promise((r) => setTimeout(r, 1500));

      const statusResponse = await contropayApi.get(
        `/payment-links/${paymentLinkId}/status`
      );
      console.log(
        "Contropay Status Response:",
        JSON.stringify(statusResponse.data, null, 2)
      );

      if (statusResponse.data.success && statusResponse.data.data) {
        contropayStatus = statusResponse.data.data.status;
        paymentDetails = statusResponse.data.data;
      }
    } catch (apiError: any) {
      console.error("Contropay API Status Check Failed:", apiError.message);
      // If API fails, try to get status from transaction
      const transaction = await Transaction.findOne({
        contropayPaymentLinkId: paymentLinkId,
      });
      if (transaction) {
        contropayStatus =
          transaction.status === "SUCCESS" ? "completed" : "pending";
      }
    }

    // Update payment status in database
    const result = await updatePaymentStatus(
      paymentLinkId,
      contropayStatus,
      paymentDetails
    );

    // Redirect user based on status
    if (contropayStatus === "completed") {
      let targetOrderId = orderId;
      if (!targetOrderId && result?.transaction?.orderId) {
        targetOrderId = result.transaction.orderId.toString();
      }

      if (targetOrderId) {
        return res.redirect(`/order-success?orderId=${targetOrderId}`);
      }
      return res.redirect(`/order-success?paymentLinkId=${paymentLinkId}`);
    } else if (
      contropayStatus === "expired" ||
      contropayStatus === "cancelled"
    ) {
      return res.redirect(
        `/dashboard?status=FAILED&message=${encodeURIComponent(
          "Payment " + contropayStatus
        )}`
      );
    } else {
      // Still pending or unconfirmed - redirect to a waiting page or dashboard
      return res.redirect(
        `/dashboard?status=PENDING&message=${encodeURIComponent(
          "Payment is being processed. Please check your orders for the latest status."
        )}&paymentLinkId=${paymentLinkId}`
      );
    }
  } catch (error: any) {
    console.error("Contropay Redirect Handler Error:", error);
    return res.redirect(`/dashboard?error=SystemError`);
  }
};

export const checkContropayPaymentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { paymentLinkId } = req.params;

    if (!hasContropayCredentials) {
      return res.status(400).json({
        success: false,
        message: "Contropay credentials not configured",
      });
    }

    // Check status via Contropay API
    const statusResponse = await contropayApi.get(
      `/payment-links/${paymentLinkId}/status`
    );

    if (!statusResponse.data.success) {
      throw new Error(
        statusResponse.data.error || "Failed to get payment status"
      );
    }

    const paymentData = statusResponse.data.data;
    console.log(`Contropay status for ${paymentLinkId}: ${paymentData.status}`);

    // Update local transaction if status changed
    if (paymentData.status) {
      const updateResult = await updatePaymentStatus(
        paymentLinkId,
        paymentData.status,
        paymentData
      );
      console.log(
        `Update result:`,
        updateResult ? `status=${updateResult.status}` : "null"
      );
    }

    return res.json({
      success: true,
      status: paymentData.status,
      data: paymentData,
    });
  } catch (error: any) {
    console.error(
      "Contropay status check error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error ||
        error.message ||
        "Failed to check payment status",
    });
  }
};

// Get supported chains and tokens for frontend
export const getContropayConfig = async (req: Request, res: Response) => {
  try {
    const contropayEnabled = await isContropayEnabled();

    // Import config values
    const {
      SUPPORTED_CHAINS,
      CHAIN_TOKENS,
      CHAIN_DISPLAY_NAMES,
      DEFAULT_CHAIN,
      DEFAULT_TOKEN,
      INR_USD_RATE,
    } = await import("../config/contropay.js");

    return res.json({
      success: true,
      enabled: contropayEnabled && hasContropayCredentials,
      chains: SUPPORTED_CHAINS,
      chainTokens: CHAIN_TOKENS,
      chainDisplayNames: CHAIN_DISPLAY_NAMES,
      defaultChain: DEFAULT_CHAIN,
      defaultToken: DEFAULT_TOKEN,
      inrUsdRate: INR_USD_RATE,
    });
  } catch (error: any) {
    console.error("Get Contropay config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get Contropay configuration",
    });
  }
};
