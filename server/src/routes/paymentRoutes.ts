import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  initiatePhonepePayment,
  checkPhonepePaymentStatus,
  phonepeCallback,
  phonepeRedirect,
  refundPhonepePayment,
  checkRefundStatus,
} from "../controllers/paymentController.js";
import { isPhonepeEnabled, isCODEnabled } from "../services/paymentSettingsService.js";

const router = express.Router();

// Public endpoint to get payment gateway statuses
router.get("/status", async (req, res) => {
  try {
    const [phonepeEnabled, codEnabled] = await Promise.all([
      isPhonepeEnabled(),
      isCODEnabled(),
    ]);

    res.json({
      success: true,
      phonepe: { enabled: phonepeEnabled },
      cod: { enabled: codEnabled },
    });
  } catch (error) {
    console.error("Error fetching payment gateway statuses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment gateway statuses",
    });
  }
});

// Test authentication endpoint
router.get("/phonepe/test-auth", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    user: req.user,
  });
});

// PhonePe payment routes
// Redirect route must be defined early to avoid conflicts with other routes
router.get("/phonepe/redirect", phonepeRedirect);
router.post("/phonepe/redirect", phonepeRedirect);

router.post("/phonepe/initiate", authenticateToken, initiatePhonepePayment);
router.get(
  "/phonepe/status/:transactionId",
  authenticateToken,
  checkPhonepePaymentStatus
);
router.post("/phonepe/callback", phonepeCallback); // No auth required for callback
router.post("/phonepe/refund", authenticateToken, refundPhonepePayment);

// Check refund status endpoint
router.get("/phonepe/refund/:refundId", authenticateToken, checkRefundStatus);

export default router;
