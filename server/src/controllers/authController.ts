import { Request, Response } from "express";
import { User } from "../../../shared/models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.ts";
import { validationResult } from "express-validator";
import { verifyRecaptcha } from "../services/recaptchaService.js";

export const signup = async (req: Request, res: Response) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    email,
    password,
    name,
    companyName,
    phoneNumber,
    businessType,
    industry,
    companySize,
    website,
    description,
    address,
    city,
    state,
    pincode,
    recaptchaToken,
  } = req.body;

  try {
    // Verify reCAPTCHA
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(
        recaptchaToken,
        "register",
        0.5
      );
      if (!recaptchaResult.success) {
        return res.status(400).json({
          message: recaptchaResult.message || "reCAPTCHA verification failed",
        });
      }
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
    );

    // Create user with all business information
    const user = new User({
      email,
      password: hashedPassword,
      name,
      companyName,
      phoneNumber,
      businessType,
      industry,
      companySize,
      website: website || "",
      description: description || "",
      address,
      city,
      state,
      pincode,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      config.jwt.secret as string,
      { expiresIn: "7d" }
    );

    // Set httpOnly cookie (optional, for extra security)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.status(201).json({
      message: "Business account registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        phoneNumber: user.phoneNumber,
        businessType: user.businessType,
        industry: user.industry,
        companySize: user.companySize,
        website: user.website,
        description: user.description,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password, recaptchaToken } = req.body;
  try {
    // Verify reCAPTCHA
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(
        recaptchaToken,
        "login",
        0.5
      );
      if (!recaptchaResult.success) {
        return res.status(400).json({
          message: recaptchaResult.message || "reCAPTCHA verification failed",
        });
      }
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      config.jwt.secret as string,
      { expiresIn: "7d" }
    );
    // Set httpOnly cookie (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res.status(200).json({
      message: "Signed in successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        phoneNumber: user.phoneNumber,
        businessType: user.businessType,
        industry: user.industry,
        companySize: user.companySize,
        website: user.website,
        description: user.description,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, config.jwt.secret as string) as {
      userId: string;
      email: string;
    };
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user account is still active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Please contact support." });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        phoneNumber: user.phoneNumber,
        businessType: user.businessType,
        industry: user.industry,
        companySize: user.companySize,
        website: user.website,
        description: user.description,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the httpOnly cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phoneNumber,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      country: "India", // Default to India
      companyName: user.companyName,
      businessType: user.businessType,
      industry: user.industry,
      companySize: user.companySize,
      website: user.website,
      description: user.description,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
