import { Request, Response } from "express";
import { phonepeClient, hasPhonepeCredentials } from "../config/phonepe.js";
import Transaction from "../../../shared/models/Transaction.js";
import { Order } from "../../../shared/models/Order.js";
import { Cart } from "../../../shared/models/Cart.js";
import {
  StandardCheckoutPayRequest,
  RefundRequest,
  PhonePeException,
} from "pg-sdk-node";
import { reduceStockForOrder } from "../services/stockService.js";
import { isPhonepeEnabled } from "../services/paymentSettingsService.js";

// Helper to update order and transaction status
const updatePaymentStatus = async (
  merchantTransactionId: string,
  state: string,
  paymentDetails: any,
  code?: string,
  message?: string
) => {
  console.log(`Updating status for ${merchantTransactionId}: ${state}`);

  const transaction = await Transaction.findOne({
    $or: [
      { phonepeTransactionId: merchantTransactionId },
      { merchantTransactionId: merchantTransactionId },
    ],
  });

  if (!transaction) {
    console.error(`Transaction not found: ${merchantTransactionId}`);
    return null;
  }

  const status =
    state === "COMPLETED"
      ? "SUCCESS"
      : state === "FAILED"
      ? "FAILED"
      : "PENDING";

  transaction.status = status;
  if (code) (transaction as any).phonepeCode = code;
  if (message) (transaction as any).phonepeMessage = message;
  if (paymentDetails) (transaction as any).callbackData = paymentDetails;

  await transaction.save();

  if (transaction.orderId) {
    const order = await Order.findById(transaction.orderId);
    if (order) {
      const previousStatus = order.status;
      const previousPaymentStatus = order.paymentStatus;

      if (status === "SUCCESS") {
        order.paymentStatus = "COMPLETED";
        order.status = "PAID";

        // Clear cart for the user
        try {
          const cart = await Cart.findOne({ userId: transaction.userId });
          if (cart) {
            cart.items.splice(0, cart.items.length); // Clear array in place
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
        order.status = "PENDING_PAYMENT";
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
        `Order not found for transaction ${merchantTransactionId}, orderId: ${transaction.orderId}`
      );
    }
  } else {
    console.warn(
      `Transaction ${merchantTransactionId} has no associated orderId`
    );
  }

  return { transaction, status };
};

export const initiatePhonepePayment = async (req: Request, res: Response) => {
  try {
    // Check if PhonePe is enabled in settings
    const phonepeEnabled = await isPhonepeEnabled();
    if (!phonepeEnabled) {
      return res.status(400).json({
        success: false,
        message: "PhonePe payment gateway is currently disabled",
      });
    }

    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.status(400).json({
        success: false,
        message: "PhonePe credentials not configured",
        demo_mode: true,
      });
    }

    const {
      amount,
      merchantTransactionId,
      mobileNumber,
      redirectUrl,
      callbackUrl,
      merchantOrderId,
    } = req.body;

    if (
      !amount ||
      !merchantTransactionId ||
      !mobileNumber ||
      !redirectUrl ||
      !callbackUrl
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Check for existing order
    let orderId = null;
    if (merchantOrderId) {
      const order = await Order.findOne({ orderNumber: merchantOrderId });
      if (order) orderId = order._id;
    }

    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantTransactionId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    const response = await phonepeClient.pay(payRequest);

    // Create transaction record
    await Transaction.create({
      userId: req.user?.id,
      orderId,
      merchantTransactionId,
      phonepeTransactionId:
        (response as any).merchantTransactionId || merchantTransactionId,
      amount,
      currency: "INR",
      paymentMethod: "PHONEPE",
      status: "PENDING",
      redirectUrl,
      callbackUrl,
    });

    return res.json({
      success: true,
      merchantTransactionId:
        (response as any).merchantTransactionId || merchantTransactionId,
      checkout_url: response.redirectUrl,
    });
  } catch (error: any) {
    console.error("Init payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment initiation failed",
    });
  }
};

export const phonepeRedirect = async (req: Request, res: Response) => {
  try {
    console.log("PhonePe Redirect Handler Called:", req.method, req.url);
    console.log("Query params:", req.query);
    console.log("Body:", req.body);

    // 1. Extract Data
    const merchantTransactionId =
      (req.query.merchantTransactionId as string) ||
      req.body.merchantTransactionId;

    const orderId = (req.query.orderId as string) || req.body.orderId;

    if (!merchantTransactionId) {
      return res.redirect(`/dashboard?error=MissingTransactionId`);
    }

    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.redirect(`/dashboard?error=ConfigError`);
    }

    // 2. Determine Status
    // Priority: API Check (most reliable) > POST body > Query params
    let state = "PENDING";
    let code = "";
    let message = "";
    let paymentDetails = null;

    // Method 1: Server-to-Server API Check (Most Secure, Authoritative)
    // This is the most reliable way to check payment status
    try {
      console.log(`Checking API status for ${merchantTransactionId}...`);
      // Small delay to ensure PhonePe backend is consistent
      await new Promise((r) => setTimeout(r, 1500));

      const statusResponse = await phonepeClient.getOrderStatus(
        merchantTransactionId
      );
      console.log(
        "API Status Response:",
        JSON.stringify(statusResponse, null, 2)
      );

      if (statusResponse && statusResponse.state) {
        // PhonePe API returns state as "PAYMENT_SUCCESS", "PAYMENT_PENDING", "PAYMENT_ERROR", etc.
        // Map to our internal state format
        const apiState = statusResponse.state.toUpperCase();
        if (
          apiState === "PAYMENT_SUCCESS" ||
          apiState === "COMPLETED" ||
          apiState === "SUCCESS"
        ) {
          state = "COMPLETED";
        } else if (
          apiState === "PAYMENT_ERROR" ||
          apiState === "PAYMENT_FAILURE" ||
          apiState === "FAILED"
        ) {
          state = "FAILED";
        } else {
          state = "PENDING";
        }

        paymentDetails = statusResponse;
        // Extract code and message from API response if available
        // Use type assertion since PhonePe SDK types may not include all fields
        const responseData = statusResponse as any;
        if (responseData.code) {
          code = responseData.code;
        }
        if (responseData.message) {
          message = responseData.message;
        }
        console.log(
          `Payment status from API: ${statusResponse.state} -> mapped to ${state}`
        );
      } else {
        console.warn("API response missing state field:", statusResponse);
      }
    } catch (apiError: any) {
      console.error("API Status Check Failed:", apiError.message);
      console.error("API Error Details:", apiError);

      // Fallback to request data if API fails
      // Method 2: Trust POST Request Data
      if (req.method === "POST" && req.body.code) {
        code = req.body.code;
        state = code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED";
        message = req.body.message || "";
        paymentDetails = req.body;
        console.log(`Using POST body data: state=${state}, code=${code}`);
      }
      // Method 3: Trust Query Params (Last resort)
      else if (req.query.code) {
        code = req.query.code as string;
        state = code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED";
        message = (req.query.message as string) || "";
        paymentDetails = req.query;
        console.log(`Using query params: state=${state}, code=${code}`);
      } else {
        // If API failed and no fallback data, we can't determine status
        console.error(
          "Cannot determine payment status: API failed and no fallback data"
        );
        // Still proceed to update with PENDING status, but log the issue
      }
    }

    // 3. Update System
    const result = await updatePaymentStatus(
      merchantTransactionId,
      state,
      paymentDetails,
      code,
      message
    );

    // 4. Redirect User
    if (state === "COMPLETED") {
      // Find orderId if not in params
      let targetOrderId = orderId;
      if (!targetOrderId && result?.transaction?.orderId) {
        targetOrderId = result.transaction.orderId.toString();
      }

      if (targetOrderId) {
        return res.redirect(`/order-success?orderId=${targetOrderId}`);
      }
      return res.redirect(
        `/order-success?transactionId=${merchantTransactionId}`
      );
    } else {
      return res.redirect(
        `/dashboard?status=${state}&message=${encodeURIComponent(
          message || "Payment failed"
        )}`
      );
    }
  } catch (error: any) {
    console.error("Redirect Handler Error:", error);
    return res.redirect(`/dashboard?error=SystemError`);
  }
};

export const phonepeCallback = async (req: Request, res: Response) => {
  try {
    console.log("PhonePe Callback:", JSON.stringify(req.body));

    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.status(500).json({ message: "Config missing" });
    }

    // Validate X-VERIFY if needed, but client.validateCallback does it
    const { response } = req.body;
    if (!response) return res.status(400).json({ message: "Invalid callback" });

    // Validate (Optional: PhonePe SDK might throw if invalid)
    // const isValid = phonepeClient.validateCallback(...)

    // Decode payload (PhonePe sends base64 payload in 'response')
    const decodedData = Buffer.from(response, "base64").toString("utf-8");
    const payload = JSON.parse(decodedData);

    console.log("Decoded Callback Payload:", payload);

    const merchantTransactionId = payload.data.merchantTransactionId;
    const state =
      payload.data.state ||
      (payload.code === "PAYMENT_SUCCESS" ? "COMPLETED" : "FAILED");

    await updatePaymentStatus(
      merchantTransactionId,
      state,
      payload.data,
      payload.code,
      payload.message
    );

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Callback Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const checkPhonepePaymentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { transactionId } = req.params;
    if (!hasPhonepeCredentials || !phonepeClient)
      throw new Error("Config missing");

    const status = await phonepeClient.getOrderStatus(transactionId);
    return res.json({ success: true, state: status.state, data: status });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refundPhonepePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, refundId, amount } = req.body;
    if (!hasPhonepeCredentials || !phonepeClient)
      throw new Error("Config missing");

    const request = RefundRequest.builder()
      .originalMerchantOrderId(orderId)
      .merchantRefundId(refundId)
      .amount(amount)
      .build();

    const response = await phonepeClient.refund(request);
    return res.json({ success: true, data: response });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkRefundStatus = async (req: Request, res: Response) => {
  try {
    const { refundId } = req.params;
    if (!hasPhonepeCredentials || !phonepeClient)
      throw new Error("Config missing");

    const status = await phonepeClient.getRefundStatus(refundId);
    return res.json({ success: true, data: status });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
