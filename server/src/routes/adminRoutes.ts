import { Router } from "express";
import { OrderCleanupService } from "../services/orderCleanupService.js";
import { SchedulerService } from "../services/schedulerService.js";
import { createError } from "../middleware/errorHandler.js";

const router = Router();

/**
 * Get pending order statistics
 * GET /api/admin/pending-orders/stats
 */
router.get("/pending-orders/stats", async (req, res, next) => {
  try {
    const stats = await OrderCleanupService.getPendingOrderStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Manually trigger cleanup of expired pending orders
 * POST /api/admin/pending-orders/cleanup
 */
router.post("/pending-orders/cleanup", async (req, res, next) => {
  try {
    const result = await OrderCleanupService.manualCleanup();

    res.json({
      success: result.success,
      message: result.message,
      data: {
        cancelledCount: result.cancelledCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get scheduler status
 * GET /api/admin/scheduler/status
 */
router.get("/scheduler/status", async (req, res, next) => {
  try {
    const status = SchedulerService.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Force run cleanup task
 * POST /api/admin/scheduler/force-cleanup
 */
router.post("/scheduler/force-cleanup", async (req, res, next) => {
  try {
    const result = await SchedulerService.forceCleanup();

    res.json({
      success: result.success,
      message: result.message,
      data: {
        cancelledCount: result.cancelledCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
