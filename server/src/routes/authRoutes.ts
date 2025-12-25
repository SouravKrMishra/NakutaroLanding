import { Router } from "express";
import {
  signup,
  signin,
  signupIndividual,
  signinIndividual,
  verify,
  logout,
  getUserProfile,
  verifyOTP,
  resendOTP,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validation.js";

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
  handleValidationErrors,
  signup
);

// Individual Signup route
router.post(
  "/signup/individual",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    body("phoneNumber")
      .optional({ values: "falsy" })
      .custom((value) => {
        if (!value || value === "") return true; // Allow empty string
        return /^[6-9]\d{9}$/.test(value.replace(/\D/g, "")); // Validate Indian mobile format
      })
      .withMessage("Invalid phone number"),
  ],
  handleValidationErrors,
  signupIndividual
);

// Signin route
router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  signin
);

// Individual Signin route
router.post(
  "/signin/individual",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  signinIndividual
);

// Verify route
router.get("/verify", verify);

// Logout route
router.post("/logout", logout);

// Get user profile route
router.get("/user/profile", authenticateToken, getUserProfile);

// OTP Verification route
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),
  ],
  handleValidationErrors,
  verifyOTP
);

// Resend OTP route
router.post(
  "/resend-otp",
  [body("email").isEmail().withMessage("Invalid email address")],
  handleValidationErrors,
  resendOTP
);

export default router;
