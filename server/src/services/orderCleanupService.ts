import { Order } from "../../../shared/models/Order.js";
import Transaction from "../../../shared/models/Transaction.js";
import { phonepeClient, hasPhonepeCredentials } from "../config/phonepe.js";
import { hasContropayCredentials, CONTROPAY_API_URL, CONTROPAY_API_KEY } from "../config/contropay.js";
import { reduceStockForOrder } from "./stockService.js";
import { createZohoInvoiceForOrderIfNeeded } from "./zohoInvoiceService.js";
import { createError } from "../middleware/errorHandler.js";
import axios from "axios";

/**
 * Service to handle automatic cleanup of pending orders
 */
export class OrderCleanupService {
  /**
   * Check PhonePe API for actual payment status before cancelling
   */
  static async checkPhonepeStatus(
    merchantTransactionId: string
  ): Promise<"COMPLETED" | "FAILED" | "PENDING"> {
    if (!hasPhonepeCredentials || !phonepeClient) {
      return "PENDING"; // Can't verify, don't cancel
    }

    try {
      const statusResponse = await phonepeClient.getOrderStatus(
        merchantTransactionId
      );

      if (statusResponse && statusResponse.state) {
        const apiState = statusResponse.state.toUpperCase();
        if (
          apiState === "PAYMENT_SUCCESS" ||
          apiState === "COMPLETED" ||
          apiState === "SUCCESS"
        ) {
          return "COMPLETED";
        } else if (
          apiState === "PAYMENT_ERROR" ||
          apiState === "PAYMENT_FAILURE" ||
          apiState === "FAILED" ||
          apiState === "PAYMENT_FAILED"
        ) {
          return "FAILED";
        }
      }
      return "PENDING";
    } catch (error) {
      console.error(
        `Error checking PhonePe status for ${merchantTransactionId}:`,
        error
      );
      return "PENDING"; // On error, don't cancel - let it retry later
    }
  }

  /**
   * Cancel orders that have been in PENDING_PAYMENT status for more than 24 hours
   * IMPORTANT: Before cancelling, we check PhonePe API to ensure payment hasn't succeeded
   */
  static async cancelExpiredPendingOrders(): Promise<{
    cancelledCount: number;
    cancelledOrders: any[];
    completedCount: number;
  }> {
    try {
      // Check if database is connected
      const mongoose = await import("mongoose");
      if (mongoose.default.connection.readyState !== 1) {
        return { cancelledCount: 0, cancelledOrders: [], completedCount: 0 };
      }

      // Calculate the cutoff time (24 hours ago - extended from 2 hours)
      // PhonePe pending payments can take several hours to resolve
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find orders that are in PENDING_PAYMENT status and older than 24 hours
      const expiredOrders = await Order.find({
        status: "PENDING_PAYMENT",
        orderDate: { $lt: twentyFourHoursAgo },
      });

      if (expiredOrders.length === 0) {
        return { cancelledCount: 0, cancelledOrders: [], completedCount: 0 };
      }

      let cancelledCount = 0;
      let completedCount = 0;
      const cancelledOrders: any[] = [];

      // Process each order individually - check PhonePe status before cancelling
      for (const order of expiredOrders) {
        try {
          // Find the transaction for this order
          const transaction = await Transaction.findOne({ orderId: order._id });

          if (transaction && transaction.merchantTransactionId) {
            // Check actual PhonePe status
            const phonepeStatus = await this.checkPhonepeStatus(
              transaction.merchantTransactionId
            );

            if (phonepeStatus === "COMPLETED") {
              // Payment actually succeeded! Update order to ORDER_SUCCESS
              console.log(
                `Order ${order.orderNumber}: Payment completed on PhonePe - marking as ORDER_SUCCESS`
              );

              // Reduce stock if not already done
              const orderDoc = order as any;
              if (!orderDoc.stockAdjusted) {
                try {
                  await reduceStockForOrder(order._id);
                  console.log(`Stock reduced for order ${order.orderNumber}`);
                } catch (stockErr) {
                  console.error(
                    `Failed to reduce stock for order ${order.orderNumber}:`,
                    stockErr
                  );
                }
              }

              await Order.updateOne(
                { _id: order._id },
                {
                  $set: {
                    status: "ORDER_SUCCESS",
                    paymentStatus: "COMPLETED",
                    stockAdjusted: true,
                    notes: "Payment confirmed via PhonePe API check",
                  },
                }
              );
              transaction.status = "SUCCESS";
              await transaction.save();
              createZohoInvoiceForOrderIfNeeded(order).catch((err) =>
                console.error("[Zoho Invoice] Cleanup create failed:", err)
              );
              completedCount++;
            } else if (phonepeStatus === "FAILED") {
              // Payment definitively failed - mark as ORDER_FAILED
              console.log(
                `Order ${order.orderNumber}: Payment failed on PhonePe - marking as ORDER_FAILED`
              );
              await Order.updateOne(
                { _id: order._id },
                {
                  $set: {
                    status: "ORDER_FAILED",
                    paymentStatus: "FAILED",
                    notes:
                      "Order failed - payment confirmed as failed via PhonePe API",
                  },
                }
              );
              transaction.status = "FAILED";
              await transaction.save();
              cancelledCount++;
              cancelledOrders.push(order);
            } else {
              // Still PENDING on PhonePe - don't cancel yet, PhonePe may still process it
              console.log(
                `Order ${order.orderNumber}: Still pending on PhonePe - skipping cancellation`
              );
            }
          } else {
            // No transaction found - mark as ORDER_FAILED (likely a system error)
            console.log(
              `Order ${order.orderNumber}: No transaction found - marking as ORDER_FAILED`
            );
            await Order.updateOne(
              { _id: order._id },
              {
                $set: {
                  status: "ORDER_FAILED",
                  paymentStatus: "FAILED",
                  notes: "Order failed - no payment transaction found",
                },
              }
            );
            cancelledCount++;
            cancelledOrders.push(order);
          }

          // Small delay between API calls to avoid rate limiting
          await new Promise((r) => setTimeout(r, 500));
        } catch (orderError) {
          console.error(
            `Error processing order ${order.orderNumber}:`,
            orderError
          );
          // Continue with next order
        }
      }

      return {
        cancelledCount,
        cancelledOrders,
        completedCount,
      };
    } catch (error) {
      // Return default values instead of throwing error to prevent scheduler crashes
      console.error("Error in cancelExpiredPendingOrders:", error);
      return { cancelledCount: 0, cancelledOrders: [], completedCount: 0 };
    }
  }

  /**
   * Check Contropay API for actual payment status
   */
  static async checkContropayStatus(
    paymentLinkId: string
  ): Promise<"COMPLETED" | "FAILED" | "PENDING" | "EXPIRED"> {
    if (!hasContropayCredentials || !CONTROPAY_API_KEY) {
      return "PENDING"; // Can't verify, don't cancel
    }

    try {
      const response = await axios.get(
        `${CONTROPAY_API_URL}/payment-links/${paymentLinkId}/status`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": CONTROPAY_API_KEY,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const contropayStatus = response.data.data.status;
        if (contropayStatus === "completed") {
          return "COMPLETED";
        } else if (contropayStatus === "expired" || contropayStatus === "cancelled") {
          return "EXPIRED";
        } else if (contropayStatus === "failed") {
          return "FAILED";
        }
      }
      return "PENDING";
    } catch (error) {
      console.error(
        `Error checking Contropay status for ${paymentLinkId}:`,
        error
      );
      return "PENDING"; // On error, don't cancel - let it retry later
    }
  }

  /**
   * Cancel crypto (Contropay) orders that have exceeded the 11-minute payment window
   * (10 minutes payment window + 1 minute buffer)
   */
  static async cancelExpiredCryptoOrders(): Promise<{
    cancelledCount: number;
    cancelledOrders: any[];
    completedCount: number;
  }> {
    try {
      // Check if database is connected
      const mongoose = await import("mongoose");
      if (mongoose.default.connection.readyState !== 1) {
        return { cancelledCount: 0, cancelledOrders: [], completedCount: 0 };
      }

      // 11 minutes = 10 min payment window + 1 min buffer
      const elevenMinutesAgo = new Date(Date.now() - 11 * 60 * 1000);

      // Find crypto orders that are still pending and payment link was created more than 11 minutes ago
      const expiredCryptoOrders = await Order.find({
        paymentMethod: "CONTROPAY",
        status: "PENDING_PAYMENT",
        paymentLinkCreatedAt: { $lt: elevenMinutesAgo, $ne: null },
      });

      if (expiredCryptoOrders.length === 0) {
        return { cancelledCount: 0, cancelledOrders: [], completedCount: 0 };
      }

      console.log(`[Crypto Cleanup] Found ${expiredCryptoOrders.length} expired crypto orders to check`);

      let cancelledCount = 0;
      let completedCount = 0;
      const cancelledOrders: any[] = [];

      for (const order of expiredCryptoOrders) {
        try {
          const orderDoc = order as any;
          const paymentLinkId = orderDoc.contropayPaymentLinkId;

          if (paymentLinkId) {
            // Check actual Contropay status before cancelling
            const contropayStatus = await this.checkContropayStatus(paymentLinkId);

            if (contropayStatus === "COMPLETED") {
              // Payment actually succeeded! Update order to ORDER_SUCCESS
              console.log(
                `[Crypto Cleanup] Order ${order.orderNumber}: Payment completed on Contropay - marking as ORDER_SUCCESS`
              );

              // Reduce stock if not already done
              if (!orderDoc.stockAdjusted) {
                try {
                  await reduceStockForOrder(order._id);
                  console.log(`[Crypto Cleanup] Stock reduced for order ${order.orderNumber}`);
                } catch (stockErr) {
                  console.error(
                    `[Crypto Cleanup] Failed to reduce stock for order ${order.orderNumber}:`,
                    stockErr
                  );
                }
              }

              await Order.updateOne(
                { _id: order._id },
                {
                  $set: {
                    status: "ORDER_SUCCESS",
                    paymentStatus: "COMPLETED",
                    stockAdjusted: true,
                    notes: "Payment confirmed via Contropay API check",
                  },
                }
              );

              // Update transaction if exists
              const transaction = await Transaction.findOne({ orderId: order._id });
              if (transaction) {
                transaction.status = "SUCCESS";
                await transaction.save();
              }

              createZohoInvoiceForOrderIfNeeded(order).catch((err) =>
                console.error("[Zoho Invoice] Cleanup create failed:", err)
              );
              completedCount++;
            } else if (contropayStatus === "EXPIRED" || contropayStatus === "FAILED") {
              // Payment expired or failed - mark as ORDER_FAILED
              console.log(
                `[Crypto Cleanup] Order ${order.orderNumber}: Crypto payment ${contropayStatus.toLowerCase()} - marking as ORDER_FAILED`
              );

              await Order.updateOne(
                { _id: order._id },
                {
                  $set: {
                    status: "ORDER_FAILED",
                    paymentStatus: "FAILED",
                    notes: `Crypto payment ${contropayStatus.toLowerCase()} - 10 minute payment window exceeded`,
                  },
                }
              );

              // Update transaction if exists
              const transaction = await Transaction.findOne({ orderId: order._id });
              if (transaction) {
                transaction.status = "FAILED";
                await transaction.save();
              }

              cancelledCount++;
              cancelledOrders.push(order);
            } else {
              // Still PENDING - check if it's been way too long (more than 30 minutes)
              // In this case, mark as failed anyway since crypto links expire
              const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
              if (orderDoc.paymentLinkCreatedAt < thirtyMinutesAgo) {
                console.log(
                  `[Crypto Cleanup] Order ${order.orderNumber}: Crypto payment pending for over 30 minutes - marking as ORDER_FAILED`
                );

                await Order.updateOne(
                  { _id: order._id },
                  {
                    $set: {
                      status: "ORDER_FAILED",
                      paymentStatus: "FAILED",
                      notes: "Crypto payment expired - payment window exceeded (30+ minutes)",
                    },
                  }
                );

                cancelledCount++;
                cancelledOrders.push(order);
              } else {
                console.log(
                  `[Crypto Cleanup] Order ${order.orderNumber}: Still pending on Contropay after 11 min - skipping for now`
                );
              }
            }
          } else {
            // No payment link ID - mark as failed
            console.log(
              `[Crypto Cleanup] Order ${order.orderNumber}: No payment link ID found - marking as ORDER_FAILED`
            );

            await Order.updateOne(
              { _id: order._id },
              {
                $set: {
                  status: "ORDER_FAILED",
                  paymentStatus: "FAILED",
                  notes: "Order failed - no crypto payment link found",
                },
              }
            );

            cancelledCount++;
            cancelledOrders.push(order);
          }

          // Small delay between API calls to avoid rate limiting
          await new Promise((r) => setTimeout(r, 300));
        } catch (orderError) {
          console.error(
            `[Crypto Cleanup] Error processing order ${order.orderNumber}:`,
            orderError
          );
          // Continue with next order
        }
      }

      console.log(
        `[Crypto Cleanup] Completed: ${completedCount} orders confirmed paid, ${cancelledCount} orders marked as failed`
      );

      return {
        cancelledCount,
        cancelledOrders,
        completedCount,
      };
    } catch (error) {
      console.error("[Crypto Cleanup] Error in cancelExpiredCryptoOrders:", error);
      return { cancelledCount: 0, cancelledOrders: [], completedCount: 0 };
    }
  }

  /**
   * Get statistics about pending orders
   */
  static async getPendingOrderStats(): Promise<{
    totalPending: number;
    expiredPending: number;
    recentPending: number;
  }> {
    try {
      // Check if database is connected
      const mongoose = await import("mongoose");
      if (mongoose.default.connection.readyState !== 1) {
        return {
          totalPending: 0,
          expiredPending: 0,
          recentPending: 0,
        };
      }

      // 24 hours cutoff (matching the cancellation logic)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [totalPending, expiredPending, recentPending] = await Promise.all([
        Order.countDocuments({ status: "PENDING_PAYMENT" }),
        Order.countDocuments({
          status: "PENDING_PAYMENT",
          orderDate: { $lt: twentyFourHoursAgo },
        }),
        Order.countDocuments({
          status: "PENDING_PAYMENT",
          orderDate: { $gte: twentyFourHoursAgo },
        }),
      ]);

      return {
        totalPending,
        expiredPending,
        recentPending,
      };
    } catch (error) {
      // Return default values instead of throwing error to prevent scheduler crashes
      return {
        totalPending: 0,
        expiredPending: 0,
        recentPending: 0,
      };
    }
  }

  /**
   * Manual cleanup method for testing or admin use
   * Runs both PhonePe and Crypto cleanup
   */
  static async manualCleanup(): Promise<{
    success: boolean;
    message: string;
    cancelledCount: number;
    cryptoCancelledCount: number;
  }> {
    try {
      // Run both cleanup processes
      const [phonepeResult, cryptoResult] = await Promise.all([
        this.cancelExpiredPendingOrders(),
        this.cancelExpiredCryptoOrders(),
      ]);

      const totalCancelled = phonepeResult.cancelledCount + cryptoResult.cancelledCount;
      const totalCompleted = phonepeResult.completedCount + cryptoResult.completedCount;

      return {
        success: true,
        message: `Cleanup complete: ${totalCancelled} orders failed, ${totalCompleted} orders confirmed successful`,
        cancelledCount: phonepeResult.cancelledCount,
        cryptoCancelledCount: cryptoResult.cancelledCount,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to perform manual cleanup",
        cancelledCount: 0,
        cryptoCancelledCount: 0,
      };
    }
  }

  /**
   * Run all cleanup tasks (called by scheduler)
   */
  static async runAllCleanupTasks(): Promise<void> {
    console.log("[OrderCleanup] Running all cleanup tasks...");
    
    try {
      // Run PhonePe expired orders cleanup (24 hour timeout)
      const phonepeResult = await this.cancelExpiredPendingOrders();
      console.log(
        `[OrderCleanup] PhonePe cleanup: ${phonepeResult.cancelledCount} failed, ${phonepeResult.completedCount} completed`
      );

      // Run crypto expired orders cleanup (11 minute timeout)
      const cryptoResult = await this.cancelExpiredCryptoOrders();
      console.log(
        `[OrderCleanup] Crypto cleanup: ${cryptoResult.cancelledCount} failed, ${cryptoResult.completedCount} completed`
      );
    } catch (error) {
      console.error("[OrderCleanup] Error running cleanup tasks:", error);
    }
  }
}
