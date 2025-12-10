import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  createOrderForPhonepe,
  getOrderForSuccessPage,
} from "../controllers/orderController.js";

const router = express.Router();

// Validation middleware for creating orders
const createOrderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.productId").notEmpty().withMessage("Product ID is required"),
  body("items.*.name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product name is required"),
  body("items.*.price")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Product price is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("shippingInfo.firstName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required"),
  body("shippingInfo.lastName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required"),
  body("shippingInfo.email").isEmail().withMessage("Valid email is required"),
  body("shippingInfo.phone")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Phone number is required"),
  body("shippingInfo.address")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Address is required"),
  body("shippingInfo.city")
    .trim()
    .isLength({ min: 1 })
    .withMessage("City is required"),
  body("shippingInfo.state")
    .trim()
    .isLength({ min: 1 })
    .withMessage("State is required"),
  body("shippingInfo.pincode")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Pincode is required"),
  body("paymentMethod")
    .isIn(["card", "cod", "PHONEPE"])
    .withMessage("Payment method must be either 'card', 'cod', or 'PHONEPE'"),
  body("total")
    .isFloat({ min: 0 })
    .withMessage("Total must be a non-negative number"),
];

// Validation middleware for updating order status
const updateOrderValidation = [
  body("status")
    .optional()
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status"),
  body("trackingNumber")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Tracking number cannot be empty"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

// Order routes (all require authentication)
router.use(authenticateToken);

// Create new order
router.post(
  "/orders",
  createOrderValidation,
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    createOrder(req, res, next);
  }
);

// Create order for PhonePe payment
router.post(
  "/orders/phonepe",
  createOrderValidation,
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    createOrderForPhonepe(req, res, next);
  }
);

// Get user's orders
router.get("/orders", getOrders);

// Get specific order
router.get("/orders/:orderId", getOrderById);

// Get order for success page validation
router.get("/orders/success/validate", getOrderForSuccessPage);

// Update order status
router.patch("/orders/:orderId", updateOrderValidation, updateOrderStatus);

export default router;
