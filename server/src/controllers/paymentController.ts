// PhonePe Payment Controller using Official SDK
// Following official documentation: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/integration-steps

import { Request, Response } from "express";
import { phonepeClient, hasPhonepeCredentials } from "../config/phonepe.js";

import Transaction from "../../../shared/models/Transaction.js";
import { Order } from "../../../shared/models/Order.js";
import { Cart } from "../../../shared/models/Cart.js";
import {
  StandardCheckoutPayRequest,
  RefundRequest,
  PhonePeException,
  StandardCheckoutClient,
} from "pg-sdk-node";

// Initialize PhonePe payment
export const initiatePhonepePayment = async (req: Request, res: Response) => {
  try {
    console.log("PhonePe payment initiation started using official SDK");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User from request:", req.user);

    // Check if we have PhonePe credentials
    if (!hasPhonepeCredentials || !phonepeClient) {
      console.log("No PhonePe credentials found.");
      return res.status(400).json({
        success: false,
        message:
          "PhonePe credentials not configured. Please set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET environment variables.",
        demo_mode: true,
        instructions:
          "For testing, you can use the default test credentials. For production, visit https://business.phonepe.com/ to get your PhonePe merchant credentials.",
      });
    }

    // Check if user is authenticated
    if (!req.user?.id) {
      console.log("No user found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      amount,
      merchantTransactionId,
      merchantUserId,
      mobileNumber,
      callbackUrl,
      redirectUrl,
      merchantOrderId,
    } = req.body;

    // Validate required fields
    if (!amount || !merchantTransactionId || !merchantUserId || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate amount (minimum ₹1)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount should be ₹1",
      });
    }

    // Validate redirect URL
    if (!redirectUrl || !redirectUrl.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "Valid redirect URL is required",
      });
    }

    console.log("Initiating PhonePe payment using official SDK...");
    console.log("Payment request details:", {
      merchantOrderId: merchantOrderId || merchantTransactionId,
      amount,
      redirectUrl,
      callbackUrl,
    });

    // Build payment request using PhonePe SDK
    // Following the official documentation for Initiate Payment
    let payRequest;
    try {
      console.log("Building PhonePe request with parameters:", {
        merchantOrderId: merchantOrderId || merchantTransactionId,
        amount,
        redirectUrl,
      });

      payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId || merchantTransactionId)
        .amount(amount) // Amount in paise
        .redirectUrl(redirectUrl)
        .build();

      console.log("PhonePe payment request built successfully:", payRequest);
    } catch (buildError: any) {
      console.error("Error building PhonePe request:", buildError);
      console.error("Build error stack:", buildError.stack);
      throw new Error(`Failed to build payment request: ${buildError.message}`);
    }

    // Initiate payment using PhonePe SDK
    let response;
    try {
      console.log("Calling phonepeClient.pay()...");
      response = await phonepeClient.pay(payRequest);
      console.log("PhonePe SDK response received:", response);
    } catch (sdkError: any) {
      console.error("PhonePe SDK error:", sdkError);
      console.error("SDK error details:", {
        message: sdkError.message,
        type: sdkError.type,
        httpStatusCode: sdkError.httpStatusCode,
        code: sdkError.code,
        data: sdkError.data,
      });
      throw sdkError;
    }

    console.log("PhonePe SDK response:", response);

    // Find the order by merchantOrderId and link it to the transaction
    let orderId = null;
    if (merchantOrderId) {
      const order = await Order.findOne({ orderNumber: merchantOrderId });
      if (order) {
        orderId = order._id;
      }
    }

    // Store transaction details in database
    const transaction = new Transaction({
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

    await transaction.save();

    return res.json({
      success: true,
      message: "Payment initiated successfully",
      merchantTransactionId:
        (response as any).merchantTransactionId || merchantTransactionId,
      checkout_url: response.redirectUrl,
      instrument_response: response,
    });
  } catch (error: any) {
    console.error("PhonePe payment initiation error:", error);

    // Handle PhonePe SDK exceptions
    if (error instanceof PhonePeException) {
      console.error("PhonePe SDK Exception:", {
        message: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: error.message || "PhonePe SDK error",
      });
    }

    // Handle other errors
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal server error during payment initiation",
    });
  }
};

// Check PhonePe payment status
export const checkPhonepePaymentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    console.log(
      "Checking PhonePe payment status for transaction:",
      transactionId
    );

    // Check if we have PhonePe credentials
    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.status(400).json({
        success: false,
        message: "PhonePe credentials not configured",
        demo_mode: true,
      });
    }

    // Check order status using PhonePe SDK
    // Following the official documentation for Check Order Status
    const orderStatus = await phonepeClient.getOrderStatus(transactionId);

    console.log("PhonePe order status response:", orderStatus);

    return res.json({
      success: true,
      state: orderStatus.state,
      amount: orderStatus.amount,
      paymentDetails: orderStatus.paymentDetails,
    });
  } catch (error: any) {
    console.error("PhonePe order status check error:", error);

    // Handle PhonePe SDK exceptions
    if (error instanceof PhonePeException) {
      console.error("PhonePe SDK Exception:", {
        message: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: error.message || "PhonePe SDK error",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during status check",
    });
  }
};

// Handle PhonePe redirect (user browser returns here after payment)
export const phonepeRedirect = async (req: Request, res: Response) => {
  try {
    const { orderId, merchantTransactionId } = req.query as {
      orderId?: string;
      merchantTransactionId?: string;
    };

    if (!merchantTransactionId) {
      return res.status(400).send("Missing merchantTransactionId");
    }

    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.redirect(`/dashboard`);
    }

    // Verify order status with PhonePe
    let orderStatus;
    try {
      orderStatus = await phonepeClient.getOrderStatus(merchantTransactionId);
    } catch (e) {
      console.error("Error verifying PhonePe order status on redirect:", e);
      return res.redirect(`/dashboard`);
    }

    // Update transaction in DB
    const transaction = await Transaction.findOne({
      $or: [
        { phonepeTransactionId: merchantTransactionId },
        { merchantTransactionId: merchantTransactionId },
      ],
    });

    if (transaction) {
      transaction.status =
        orderStatus.state === "COMPLETED"
          ? "SUCCESS"
          : orderStatus.state === "FAILED"
          ? "FAILED"
          : "PENDING";
      (transaction as any).phonepeCode =
        (orderStatus as any)?.code || (transaction as any).phonepeCode;
      (transaction as any).phonepeMessage =
        (orderStatus as any)?.message || (transaction as any).phonepeMessage;
      (transaction as any).callbackData = orderStatus;
      await transaction.save();

      // If linked to order, update order status
      if (transaction.orderId) {
        const order = await Order.findById(transaction.orderId);
        if (order) {
          if (transaction.status === "SUCCESS") {
            order.paymentStatus = "COMPLETED";
            order.status = "PAID";
          } else if (transaction.status === "FAILED") {
            order.paymentStatus = "FAILED";
            order.status = "PENDING_PAYMENT";
          }
          await order.save();
        }
      }
    }

    // Prefer provided orderId, else try derive from transaction
    let finalOrderId = orderId as string | undefined;
    if (!finalOrderId && transaction?.orderId) {
      finalOrderId = transaction.orderId.toString();
    }

    if (orderStatus.state === "COMPLETED" && finalOrderId) {
      return res.redirect(`/order-success?orderId=${finalOrderId}`);
    }

    if (orderStatus.state === "COMPLETED") {
      return res.redirect(
        `/order-success?transactionId=${encodeURIComponent(
          merchantTransactionId
        )}`
      );
    }

    return res.redirect(`/dashboard`);
  } catch (error) {
    console.error("PhonePe redirect handler error:", error);
    return res.redirect(`/dashboard`);
  }
};

// Handle PhonePe callback/webhook
export const phonepeCallback = async (req: Request, res: Response) => {
  try {
    console.log("PhonePe callback received");
    console.log("Callback body:", JSON.stringify(req.body, null, 2));
    console.log("Callback headers:", req.headers);

    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "No response data in callback",
      });
    }

    // Check if we have PhonePe credentials
    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.status(400).json({
        success: false,
        message: "PhonePe credentials not configured",
        demo_mode: true,
      });
    }

    // Validate callback using PhonePe SDK
    // Following the official documentation for Webhook Handling
    const callbackResponse = phonepeClient.validateCallback(
      process.env.PHONEPE_CALLBACK_USERNAME || "default_username",
      process.env.PHONEPE_CALLBACK_PASSWORD || "default_password",
      req.headers.authorization || "",
      JSON.stringify(req.body)
    );

    console.log("PhonePe callback validation result:", callbackResponse);

    // Update transaction status in database
    const transaction = await Transaction.findOne({
      phonepeTransactionId:
        (callbackResponse.payload as any)?.merchantTransactionId ||
        callbackResponse.payload?.orderId,
    });

    if (transaction) {
      transaction.status =
        callbackResponse.payload?.state === "COMPLETED" ? "SUCCESS" : "FAILED";
      transaction.phonepeCode = (callbackResponse.payload as any)?.code || "";
      transaction.phonepeMessage =
        (callbackResponse.payload as any)?.message || "";
      transaction.callbackData = callbackResponse;
      await transaction.save();

      // Update order status if linked
      if (transaction.orderId) {
        const order = await Order.findById(transaction.orderId);
        if (order) {
          order.paymentStatus =
            transaction.status === "SUCCESS" ? "COMPLETED" : "FAILED";
          order.status =
            transaction.status === "SUCCESS" ? "PAID" : "PENDING_PAYMENT";
          await order.save();

          // Clear the user's cart if payment was successful
          if (transaction.status === "SUCCESS") {
            try {
              const cart = await Cart.findOne({ userId: transaction.userId });
              if (cart) {
                cart.items.splice(0, cart.items.length);
                await cart.save();
                console.log(
                  `Cart cleared for user ${transaction.userId} after successful payment`
                );
              }
            } catch (cartError) {
              console.error(
                "Error clearing cart after successful payment:",
                cartError
              );
              // Don't fail the callback if cart clearing fails
            }
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "Callback processed successfully",
      orderId: callbackResponse.payload?.orderId,
      state: callbackResponse.payload?.state,
    });
  } catch (error: any) {
    console.error("PhonePe callback processing error:", error);

    // Handle PhonePe SDK exceptions
    if (error instanceof PhonePeException) {
      console.error("PhonePe SDK Exception:", {
        message: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: error.message || "PhonePe SDK error",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during callback processing",
    });
  }
};

// Initiate PhonePe refund
export const refundPhonepePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, refundId, amount } = req.body;

    if (!orderId || !refundId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID, refund ID, and amount are required",
      });
    }

    console.log("Initiating PhonePe refund:", { orderId, refundId, amount });

    // Check if we have PhonePe credentials
    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.status(400).json({
        success: false,
        message: "PhonePe credentials not configured",
        demo_mode: true,
      });
    }

    // Build refund request using PhonePe SDK
    // Following the official documentation for Initiate Refund
    const refundRequest = RefundRequest.builder()
      .originalMerchantOrderId(orderId)
      .merchantRefundId(refundId)
      .amount(amount) // Amount in paise
      .build();

    console.log("PhonePe refund request built:", refundRequest);

    // Initiate refund using PhonePe SDK
    const response = await phonepeClient.refund(refundRequest);

    console.log("PhonePe refund response:", response);

    return res.json({
      success: true,
      message: "Refund initiated successfully",
      refundId: response.refundId || refundId,
      amount: response.amount,
      state: response.state,
    });
  } catch (error: any) {
    console.error("PhonePe refund initiation error:", error);

    // Handle PhonePe SDK exceptions
    if (error instanceof PhonePeException) {
      console.error("PhonePe SDK Exception:", {
        message: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: error.message || "PhonePe SDK error",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during refund initiation",
    });
  }
};

// Check refund status
export const checkRefundStatus = async (req: Request, res: Response) => {
  try {
    const { refundId } = req.params;

    if (!refundId) {
      return res.status(400).json({
        success: false,
        message: "Refund ID is required",
      });
    }

    console.log("Checking PhonePe refund status for refund:", refundId);

    // Check if we have PhonePe credentials
    if (!hasPhonepeCredentials || !phonepeClient) {
      return res.status(400).json({
        success: false,
        message: "PhonePe credentials not configured",
        demo_mode: true,
      });
    }

    // Check refund status using PhonePe SDK
    const refundStatus = await phonepeClient.getRefundStatus(refundId);

    console.log("PhonePe refund status response:", refundStatus);

    return res.json({
      success: true,
      refundId: (refundStatus as any).refundId || refundId,
      amount: refundStatus.amount,
      state: refundStatus.state,
      paymentDetails: refundStatus.paymentDetails,
    });
  } catch (error: any) {
    console.error("PhonePe refund status check error:", error);

    // Handle PhonePe SDK exceptions
    if (error instanceof PhonePeException) {
      console.error("PhonePe SDK Exception:", {
        message: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: error.message || "PhonePe SDK error",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during refund status check",
    });
  }
};
