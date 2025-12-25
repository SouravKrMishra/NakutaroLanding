import { Request, Response } from "express";
import { User } from "../../../shared/models/User.js";
import { OTP } from "../../../shared/models/OTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { validationResult } from "express-validator";
import { verifyRecaptcha } from "../services/recaptchaService.js";
import { sendOTPEmail } from "../services/emailService.js";

const buildUserResponse = (user: any) => {
  // userType should always be explicitly set during registration
  // If missing, this indicates a data integrity issue
  if (!user.userType) {
    console.error(
      `User ${user._id} has no userType. This is a data integrity issue.`
    );
  }

  const response: any = {
    id: user._id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    phoneNumber: user.phoneNumber,
  };

  // Only include business fields for business users
  if (user.userType === "business") {
    response.companyName = user.companyName;
    response.businessType = user.businessType;
    response.industry = user.industry;
    response.companySize = user.companySize;
    response.website = user.website;
    response.description = user.description;
    response.address = user.address;
    response.city = user.city;
    response.state = user.state;
    response.pincode = user.pincode;
  }

  return response;
};

const signAuthToken = (user: any) => {
  // Read JWT_SECRET directly from process.env as fallback
  const jwtSecret = process.env.JWT_SECRET?.trim() || config.jwt.secret;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured. Please set JWT_SECRET in your .env file."
    );
  }

  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType || "business",
    },
    jwtSecret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN ||
        config.jwt.expiresIn ||
        "7d") as any,
    }
  );
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    // Verify reCAPTCHA when token is provided
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
      // If user exists but is not verified, resend OTP instead of blocking
      if (!existingUser.isVerified || !existingUser.isActive) {
        // Generate new OTP (but don't save to DB yet)
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Try to send OTP email FIRST before modifying database
        const emailSent = await sendOTPEmail(email, otpCode, existingUser.name);
        if (!emailSent) {
          console.error("Failed to send OTP email to:", email);
          // Don't delete old OTP - user can still use existing OTP if it's valid
          return res.status(500).json({
            message:
              "Failed to send verification email. Please try again later or contact support if the problem persists.",
          });
        }

        // Email sent successfully - now update database
        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Save new OTP
        const otp = new OTP({
          email,
          otp: otpCode,
          expiresAt,
        });
        await otp.save();

        return res.status(202).json({
          message:
            "A new verification code has been sent to your email. Please check your inbox.",
          email: email,
          requiresVerification: true,
        });
      }
      // User exists and is verified - email already in use
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
    );

    // Create user with all business information
    const user = new User({
      userType: "business",
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

    // Generate OTP (but don't save to DB yet)
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try to send OTP email FIRST before saving OTP to database
    const emailSent = await sendOTPEmail(email, otpCode, name);
    if (!emailSent) {
      console.error("Failed to send OTP email to:", email);
      // Clean up: delete the user since email sending failed
      // No need to delete OTP since it was never saved
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try registering again or contact support if the problem persists.",
      });
    }

    // Email sent successfully - now save OTP to database
    // Delete any existing OTP for this email first
    await OTP.deleteMany({ email });

    // Save new OTP
    const otp = new OTP({
      email,
      otp: otpCode,
      expiresAt,
    });
    await otp.save();

    res.status(201).json({
      message:
        "Business account registered successfully. Please check your email for OTP verification.",
      email: email, // Return email for frontend to use in verification
      requiresVerification: true,
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
    // Verify reCAPTCHA when token is provided
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

    if (user.userType !== "business") {
      return res
        .status(403)
        .json({ message: "Please use the individual login page." });
    }

    // Verify password FIRST before checking verification status
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user account is verified and active (only after password is verified)
    if (!user.isVerified || !user.isActive) {
      return res.status(403).json({
        message:
          "Please verify your email address to activate your account. Check your email for the OTP code.",
        requiresVerification: true,
        email: user.email,
      });
    }
    // Generate JWT
    const token = signAuthToken(user);
    // Set httpOnly cookie (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res.status(200).json({
      message: "Signed in successfully",
      user: buildUserResponse(user),
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const signupIndividual = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { email, password, name, phoneNumber, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA when token is provided
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(
        recaptchaToken,
        "register_individual",
        0.5
      );
      if (!recaptchaResult.success) {
        return res.status(400).json({
          message: recaptchaResult.message || "reCAPTCHA verification failed",
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified, resend OTP instead of blocking
      if (!existingUser.isVerified || !existingUser.isActive) {
        // Generate new OTP (but don't save to DB yet)
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Try to send OTP email FIRST before modifying database
        const emailSent = await sendOTPEmail(email, otpCode, existingUser.name);
        if (!emailSent) {
          console.error("Failed to send OTP email to:", email);
          // Don't delete old OTP - user can still use existing OTP if it's valid
          return res.status(500).json({
            message:
              "Failed to send verification email. Please try again later or contact support if the problem persists.",
          });
        }

        // Email sent successfully - now update database
        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Save new OTP
        const otp = new OTP({
          email,
          otp: otpCode,
          expiresAt,
        });
        await otp.save();

        return res.status(202).json({
          message:
            "A new verification code has been sent to your email. Please check your inbox.",
          email: email,
          requiresVerification: true,
        });
      }
      // User exists and is verified - email already in use
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
    );

    // Only include fields that are relevant for individual users
    const userData: any = {
      userType: "individual",
      email,
      password: hashedPassword,
      name,
    };

    // Only add phoneNumber if provided
    if (phoneNumber && phoneNumber.trim()) {
      userData.phoneNumber = phoneNumber.trim();
    }

    // Create user without unwanted fields
    const user = await User.create(userData);

    // Unset fields that shouldn't be stored for individual users
    // This prevents Mongoose from applying default empty strings
    await User.updateOne(
      { _id: user._id },
      {
        $unset: {
          companyName: 1,
          businessType: 1,
          industry: 1,
          companySize: 1,
          website: 1,
          description: 1,
          address: 1,
          city: 1,
          state: 1,
          pincode: 1,
        },
      }
    );

    // Refresh user document to get updated version
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) {
      throw new Error("Failed to create user");
    }

    // Generate OTP (but don't save to DB yet)
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try to send OTP email FIRST before saving OTP to database
    const emailSent = await sendOTPEmail(email, otpCode, name);
    if (!emailSent) {
      console.error("Failed to send OTP email to:", email);
      // Clean up: delete the user since email sending failed
      // No need to delete OTP since it was never saved
      await User.deleteOne({ _id: updatedUser._id });
      return res.status(500).json({
        message:
          "Failed to send verification email. Please try registering again or contact support if the problem persists.",
      });
    }

    // Email sent successfully - now save OTP to database
    // Delete any existing OTP for this email first
    await OTP.deleteMany({ email });

    // Save new OTP
    const otp = new OTP({
      email,
      otp: otpCode,
      expiresAt,
    });
    await otp.save();

    res.status(201).json({
      message:
        "Individual account registered successfully. Please check your email for OTP verification.",
      email: email, // Return email for frontend to use in verification
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error("Error in signupIndividual:", error);
    // Return more specific error message
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (e: any) => e.message
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({
      message: error.message || "Server error",
      ...(process.env.NODE_ENV === "development" && { error: error.stack }),
    });
  }
};

export const signinIndividual = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, recaptchaToken } = req.body;
  try {
    // Verify reCAPTCHA when token is provided
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(
        recaptchaToken,
        "login_individual",
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

    if (user.userType !== "individual") {
      return res
        .status(403)
        .json({ message: "Please use the business login page." });
    }

    // Verify password FIRST before checking verification status
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user account is verified and active (only after password is verified)
    if (!user.isVerified || !user.isActive) {
      return res.status(403).json({
        message:
          "Please verify your email address to activate your account. Check your email for the OTP code.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = signAuthToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "Signed in successfully",
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Read JWT_SECRET directly from process.env as fallback
    const jwtSecret = process.env.JWT_SECRET?.trim() || config.jwt.secret;

    if (!jwtSecret) {
      return res.status(500).json({
        message:
          "JWT_SECRET is not configured. Please set JWT_SECRET in your .env file.",
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      userType: string;
    };
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user account is verified and active
    if (!user.isVerified || !user.isActive) {
      return res.status(403).json({
        message: "Please verify your email address to activate your account.",
        requiresVerification: true,
        email: user.email,
      });
    }

    res.status(200).json({
      user: buildUserResponse(user),
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
      userType: user.userType || "business",
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

// Verify OTP and activate account
export const verifyOTP = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;

  try {
    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message:
          "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        attemptsRemaining: otpRecord.maxAttempts - otpRecord.attempts,
      });
    }

    // OTP is valid, activate user account
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user status using updateOne to avoid Mongoose applying defaults
    const updateData: any = {
      isVerified: true,
      isActive: true,
    };

    // If user is individual, ensure business fields remain unset
    if (user.userType === "individual") {
      await User.updateOne(
        { _id: user._id },
        {
          $set: updateData,
          $unset: {
            companyName: 1,
            businessType: 1,
            industry: 1,
            companySize: 1,
            website: 1,
            description: 1,
            address: 1,
            city: 1,
            state: 1,
            pincode: 1,
          },
        }
      );
    } else {
      await User.updateOne({ _id: user._id }, { $set: updateData });
    }

    // Refresh user document to get updated version
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update" });
    }

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const token = signAuthToken(updatedUser);

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.status(200).json({
      message: "Email verified successfully. Your account is now active.",
      user: buildUserResponse(updatedUser),
      token,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already verified
    if (user.isVerified && user.isActive) {
      return res.status(400).json({
        message: "Email is already verified. You can log in now.",
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    const otp = new OTP({
      email,
      otp: otpCode,
      expiresAt,
    });
    await otp.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otpCode, user.name);
    if (!emailSent) {
      // Clean up the OTP record since email sending failed
      await OTP.deleteOne({ _id: otp._id });
      return res.status(500).json({
        message:
          "Failed to send OTP email. Please try again later or contact support if the problem persists.",
      });
    }

    res.status(200).json({
      message: "OTP has been resent to your email address.",
    });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};
