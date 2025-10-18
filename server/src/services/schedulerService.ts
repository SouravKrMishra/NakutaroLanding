import { OrderCleanupService } from "./orderCleanupService.js";

/**
 * Service to handle scheduled tasks and background jobs
 */
export class SchedulerService {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Start the automatic cleanup scheduler
   * Runs every 30 minutes to check for expired pending orders
   */
  static startCleanupScheduler(): void {
    if (this.isRunning) {
      console.log("Cleanup scheduler is already running");
      return;
    }

    console.log("Starting order cleanup scheduler...");

    // Delay initial run by 5 seconds to ensure database connection is established
    setTimeout(() => {
      this.runCleanupTask();
    }, 5000);

    // Then run every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.runCleanupTask();
    }, 30 * 60 * 1000); // 30 minutes

    this.isRunning = true;
    console.log("Order cleanup scheduler started - running every 30 minutes");
  }

  /**
   * Stop the cleanup scheduler
   */
  static stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.isRunning = false;
      console.log("Order cleanup scheduler stopped");
    }
  }

  /**
   * Run the cleanup task
   */
  private static async runCleanupTask(): Promise<void> {
    try {
      console.log("Running scheduled order cleanup task...");

      const stats = await OrderCleanupService.getPendingOrderStats();
      console.log("Pending order stats:", stats);

      if (stats.expiredPending > 0) {
        const result = await OrderCleanupService.cancelExpiredPendingOrders();
        console.log(
          `Cleanup completed: ${result.cancelledCount} orders cancelled`
        );

        // Log details of cancelled orders
        if (result.cancelledOrders.length > 0) {
          console.log(
            "Cancelled orders:",
            result.cancelledOrders.map((order) => ({
              orderNumber: order.orderNumber,
              userId: order.userId,
              total: order.total,
              orderDate: order.orderDate,
            }))
          );
        }
      } else {
        console.log("No expired pending orders to clean up");
      }
    } catch (error) {
      console.error("Error in scheduled cleanup task:", error);
    }
  }

  /**
   * Get scheduler status
   */
  static getStatus(): {
    isRunning: boolean;
    nextRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      // Note: We can't easily track next run time with setInterval
      // In a production environment, you might want to use a proper job scheduler like node-cron
    };
  }

  /**
   * Force run cleanup task (for testing or manual triggers)
   */
  static async forceCleanup(): Promise<{
    success: boolean;
    message: string;
    cancelledCount: number;
  }> {
    try {
      console.log("Force running cleanup task...");
      return await OrderCleanupService.manualCleanup();
    } catch (error) {
      console.error("Force cleanup failed:", error);
      return {
        success: false,
        message: "Force cleanup failed",
        cancelledCount: 0,
      };
    }
  }
}
