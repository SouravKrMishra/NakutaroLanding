import { Router } from "express";
import {
  signup,
  signin,
  verify,
  getUserProfile,
} from "../controllers/authController.ts";
import { authenticateToken } from "../middleware/auth.js";
import { body } from "express-validator";

const router = Router();

// Signup route
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    body("companyName").notEmpty().withMessage("Company name is required"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("businessType").notEmpty().withMessage("Business type is required"),
    body("industry").notEmpty().withMessage("Industry is required"),
    body("companySize").notEmpty().withMessage("Company size is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pincode").notEmpty().withMessage("Pincode is required"),
  ],
  signup
);

// Signin route
router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  signin
);

// Verify route
router.get("/verify", verify);

// Get user profile route
router.get("/user/profile", authenticateToken, getUserProfile);

export default router;
