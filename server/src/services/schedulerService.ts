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
      return;
    }

    // Delay initial run by 5 seconds to ensure database connection is established
    setTimeout(() => {
      this.runCleanupTask();
    }, 5000);

    // Then run every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.runCleanupTask();
    }, 30 * 60 * 1000); // 30 minutes

    this.isRunning = true;
  }

  /**
   * Stop the cleanup scheduler
   */
  static stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.isRunning = false;
    }
  }

  /**
   * Run the cleanup task
   */
  private static async runCleanupTask(): Promise<void> {
    try {
      const stats = await OrderCleanupService.getPendingOrderStats();

      if (stats.expiredPending > 0) {
        const result = await OrderCleanupService.cancelExpiredPendingOrders();

        // Log details of cancelled orders
        if (result.cancelledOrders.length > 0) {
        }
      } else {
      }
    } catch (error) {}
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
      return await OrderCleanupService.manualCleanup();
    } catch (error) {
      return {
        success: false,
        message: "Force cleanup failed",
        cancelledCount: 0,
      };
    }
  }
}
