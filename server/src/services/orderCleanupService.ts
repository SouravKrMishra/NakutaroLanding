import { Order } from "../../../shared/models/Order.js";
import { createError } from "../middleware/errorHandler.js";

/**
 * Service to handle automatic cleanup of pending orders
 */
export class OrderCleanupService {
  /**
   * Cancel orders that have been in PENDING_PAYMENT status for more than 2 hours
   */
  static async cancelExpiredPendingOrders(): Promise<{
    cancelledCount: number;
    cancelledOrders: any[];
  }> {
    try {
      // Calculate the cutoff time (2 hours ago)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      // Find orders that are in PENDING_PAYMENT status and older than 2 hours
      const expiredOrders = await Order.find({
        status: "PENDING_PAYMENT",
        orderDate: { $lt: twoHoursAgo },
      });

      if (expiredOrders.length === 0) {
        console.log("No expired pending orders found");
        return { cancelledCount: 0, cancelledOrders: [] };
      }

      // Update the status to CANCELLED
      const updateResult = await Order.updateMany(
        {
          status: "PENDING_PAYMENT",
          orderDate: { $lt: twoHoursAgo },
        },
        {
          $set: {
            status: "cancelled",
            paymentStatus: "FAILED",
            notes: "Automatically cancelled due to payment timeout (2 hours)",
          },
        }
      );

      console.log(
        `Successfully cancelled ${updateResult.modifiedCount} expired pending orders`
      );

      // Get the updated orders for logging
      const cancelledOrders = await Order.find({
        status: "cancelled",
        notes: "Automatically cancelled due to payment timeout (2 hours)",
        orderDate: { $lt: twoHoursAgo },
      });

      return {
        cancelledCount: updateResult.modifiedCount,
        cancelledOrders: cancelledOrders,
      };
    } catch (error) {
      console.error("Error cancelling expired pending orders:", error);
      throw createError("Failed to cancel expired pending orders", 500);
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
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const [totalPending, expiredPending, recentPending] = await Promise.all([
        Order.countDocuments({ status: "PENDING_PAYMENT" }),
        Order.countDocuments({
          status: "PENDING_PAYMENT",
          orderDate: { $lt: twoHoursAgo },
        }),
        Order.countDocuments({
          status: "PENDING_PAYMENT",
          orderDate: { $gte: twoHoursAgo },
        }),
      ]);

      return {
        totalPending,
        expiredPending,
        recentPending,
      };
    } catch (error) {
      console.error("Error getting pending order stats:", error);
      throw createError("Failed to get pending order statistics", 500);
    }
  }

  /**
   * Manual cleanup method for testing or admin use
   */
  static async manualCleanup(): Promise<{
    success: boolean;
    message: string;
    cancelledCount: number;
  }> {
    try {
      const result = await this.cancelExpiredPendingOrders();

      return {
        success: true,
        message: `Successfully cancelled ${result.cancelledCount} expired pending orders`,
        cancelledCount: result.cancelledCount,
      };
    } catch (error) {
      console.error("Manual cleanup failed:", error);
      return {
        success: false,
        message: "Failed to perform manual cleanup",
        cancelledCount: 0,
      };
    }
  }
}
