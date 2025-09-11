import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  initiatePhonepePayment,
  checkPhonepePaymentStatus,
  phonepeCallback,
  refundPhonepePayment,
  checkRefundStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

// Test authentication endpoint
router.get("/phonepe/test-auth", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    user: req.user,
  });
});

// PhonePe payment routes
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
