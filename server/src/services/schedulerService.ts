import { OrderCleanupService } from "./orderCleanupService.js";
import { UserCleanupService } from "./userCleanupService.js";

/**
 * Service to handle scheduled tasks and background jobs
 */
export class SchedulerService {
  private static orderCleanupInterval: NodeJS.Timeout | null = null;
  private static userCleanupInterval: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Start the automatic cleanup scheduler
   * - Order cleanup: Runs every 30 minutes to check for expired pending orders
   * - User cleanup: Runs daily to delete unverified accounts older than 7 days
   */
  static startCleanupScheduler(): void {
    if (this.isRunning) {
      return;
    }

    // Delay initial run by 5 seconds to ensure database connection is established
    setTimeout(() => {
      this.runOrderCleanupTask();
      this.runUserCleanupTask();
    }, 5000);

    // Order cleanup: Run every 30 minutes
    this.orderCleanupInterval = setInterval(() => {
      this.runOrderCleanupTask();
    }, 30 * 60 * 1000); // 30 minutes

    // User cleanup: Run daily (24 hours)
    this.userCleanupInterval = setInterval(() => {
      this.runUserCleanupTask();
    }, 24 * 60 * 60 * 1000); // 24 hours

    this.isRunning = true;
    console.log("✅ Cleanup scheduler started:");
    console.log("   - Order cleanup: Every 30 minutes");
    console.log("   - User cleanup: Daily (unverified accounts > 7 days)");
  }

  /**
   * Stop the cleanup scheduler
   */
  static stopCleanupScheduler(): void {
    if (this.orderCleanupInterval) {
      clearInterval(this.orderCleanupInterval);
      this.orderCleanupInterval = null;
    }
    if (this.userCleanupInterval) {
      clearInterval(this.userCleanupInterval);
      this.userCleanupInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Run the order cleanup task
   */
  private static async runOrderCleanupTask(): Promise<void> {
    try {
      const stats = await OrderCleanupService.getPendingOrderStats();

      if (stats.expiredPending > 0) {
        const result = await OrderCleanupService.cancelExpiredPendingOrders();

        // Log details of cancelled orders
        if (result.cancelledOrders.length > 0) {
          console.log(
            `🧹 Order cleanup: Cancelled ${result.cancelledCount} expired pending orders`
          );
        }
      }
    } catch (error) {
      console.error("Error in order cleanup task:", error);
    }
  }

  /**
   * Run the user cleanup task
   */
  private static async runUserCleanupTask(): Promise<void> {
    try {
      const stats = await UserCleanupService.getUnverifiedUserStats();

      if (stats.expiredUnverified > 0) {
        const result =
          await UserCleanupService.deleteExpiredUnverifiedUsers();

        if (result.deletedCount > 0) {
          console.log(
            `🧹 User cleanup: Deleted ${result.deletedCount} unverified accounts older than 7 days`
          );
        }
      } else {
        console.log(
          `🧹 User cleanup: No expired unverified accounts to delete (${stats.totalUnverified} total unverified, ${stats.recentUnverified} recent)`
        );
      }
    } catch (error) {
      console.error("Error in user cleanup task:", error);
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
   * Force run order cleanup task (for testing or manual triggers)
   */
  static async forceOrderCleanup(): Promise<{
    success: boolean;
    message: string;
    cancelledCount: number;
  }> {
    try {
      return await OrderCleanupService.manualCleanup();
    } catch (error) {
      return {
        success: false,
        message: "Force order cleanup failed",
        cancelledCount: 0,
      };
    }
  }

  /**
   * Force run user cleanup task (for testing or manual triggers)
   */
  static async forceUserCleanup(): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    try {
      return await UserCleanupService.manualCleanup();
    } catch (error) {
      return {
        success: false,
        message: "Force user cleanup failed",
        deletedCount: 0,
      };
    }
  }
}
