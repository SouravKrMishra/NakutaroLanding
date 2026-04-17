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
      `User ${user._id} has no userType. This is a data integrity issue.`,
    );
  }

  const response: any = {
    id: user._id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    phoneNumber: user.phoneNumber,
    addresses: user.addresses || [],
  };

  // Only include business fields for business users
  if (user.userType === "business") {
    response.companyName = user.companyName;
    response.businessType = user.businessType;
    response.industry = user.industry;
    response.companySize = user.companySize;
    response.website = user.website;
    response.description = user.description;
  }

  return response;
};

const signAuthToken = (user: any) => {
  // Read JWT_SECRET directly from process.env as fallback
  const jwtSecret = process.env.JWT_SECRET?.trim() || config.jwt.secret;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured. Please set JWT_SECRET in your .env file.",
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
    },
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
        0.5,
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
      config.bcrypt.saltRounds,
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
      // Store address in addresses array as "Address 1"
      addresses:
        address && city && state && pincode
          ? [
              {
                name: "Address 1",
                address: address.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim(),
              },
            ]
          : [],
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
        0.5,
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
      // Automatically send a new OTP email for unverified accounts
      let emailSentSuccessfully = false;
      try {
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
          console.error("Failed to send OTP email during login for:", email);
        } else {
          emailSentSuccessfully = true;
        }
      } catch (otpError) {
        // Log error but don't fail the request - user can use resend OTP button
        console.error("Error sending OTP during login:", otpError);
      }

      // If email sending failed, inform the user
      if (!emailSentSuccessfully) {
        return res.status(503).json({
          message:
            "Your account is not verified. We attempted to send a verification code to your email, but the email service is currently unavailable. Please try again after some time or use the 'Resend OTP' option.",
          requiresVerification: true,
          email: user.email,
          emailSendFailed: true,
        });
      }

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
        0.5,
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
      config.bcrypt.saltRounds,
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
      },
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
        (e: any) => e.message,
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
        0.5,
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
      // Automatically send a new OTP email for unverified accounts
      let emailSentSuccessfully = false;
      try {
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
          console.error("Failed to send OTP email during login for:", email);
        } else {
          emailSentSuccessfully = true;
        }
      } catch (otpError) {
        // Log error but don't fail the request - user can use resend OTP button
        console.error("Error sending OTP during login:", otpError);
      }

      // If email sending failed, inform the user
      if (!emailSentSuccessfully) {
        return res.status(503).json({
          message:
            "Your account is not verified. We attempted to send a verification code to your email, but the email service is currently unavailable. Please try again after some time or use the 'Resend OTP' option.",
          requiresVerification: true,
          email: user.email,
          emailSendFailed: true,
        });
      }

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
      phoneNumber: user.phoneNumber,
      country: "India", // Default to India
      companyName: user.companyName,
      businessType: user.businessType,
      industry: user.industry,
      companySize: user.companySize,
      website: user.website,
      description: user.description,
      addresses: user.addresses || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      phoneNumber,
      // Business fields
      companyName,
      businessType,
      industry,
      companySize,
      website,
      description,
    } = req.body;

    // Build update object based on user type
    const updateFields: any = {};
    const unsetFields: any = {};

    // Update basic fields (allowed for all users) - only if non-empty
    if (name && name.trim() !== "") {
      updateFields.name = name.trim();
    }
    if (phoneNumber !== undefined && phoneNumber !== null) {
      // Allow empty string for phoneNumber (optional for individual users)
      updateFields.phoneNumber = phoneNumber.trim();
    }

    // Handle business fields based on user type
    if (user.userType === "business") {
      // Only update business fields if they have non-empty values (don't save empty strings)
      if (companyName !== undefined && companyName !== null) {
        const trimmed = companyName.trim();
        if (trimmed !== "") updateFields.companyName = trimmed;
      }
      if (businessType !== undefined && businessType !== null) {
        const trimmed = businessType.trim();
        if (trimmed !== "") updateFields.businessType = trimmed;
      }
      if (industry !== undefined && industry !== null) {
        const trimmed = industry.trim();
        if (trimmed !== "") updateFields.industry = trimmed;
      }
      if (companySize !== undefined && companySize !== null) {
        const trimmed = companySize.trim();
        if (trimmed !== "") updateFields.companySize = trimmed;
      }
      if (website !== undefined && website !== null) {
        const trimmed = website.trim();
        if (trimmed !== "") updateFields.website = trimmed;
      }
      if (description !== undefined && description !== null) {
        const trimmed = description.trim();
        if (trimmed !== "") updateFields.description = trimmed;
      }
    } else if (user.userType === "individual") {
      // Always unset business fields for individual users
      unsetFields.companyName = "";
      unsetFields.businessType = "";
      unsetFields.industry = "";
      unsetFields.companySize = "";
      unsetFields.website = "";
      unsetFields.description = "";
    }

    // Build the update query
    const updateQuery: any = {};
    if (Object.keys(updateFields).length > 0) {
      updateQuery.$set = updateFields;
    }
    if (Object.keys(unsetFields).length > 0) {
      updateQuery.$unset = unsetFields;
    }

    // Use updateOne to avoid Mongoose applying defaults
    if (Object.keys(updateQuery).length > 0) {
      await User.updateOne({ _id: user._id }, updateQuery);
      // Reload user to get updated data
      const updatedUser = await User.findById(userId);
      if (updatedUser) {
        Object.assign(user, updatedUser.toObject());
      }
    } else {
      // If no fields to update, just save (shouldn't happen, but safety check)
      await user.save();
    }

    res.json({
      message: "Profile updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
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
        },
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

// Add new address
export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, address, city, state, pincode } = req.body;

    // Validate required fields
    if (
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message:
          "All address fields are required (address, city, state, pincode)",
      });
    }

    // Check address limit based on user type
    const maxAddresses = user.userType === "business" ? 2 : 5;
    const currentAddresses = user.addresses || [];

    if (currentAddresses.length >= maxAddresses) {
      return res.status(400).json({
        message: `Maximum ${maxAddresses} addresses allowed for ${user.userType} users`,
      });
    }

    // Generate default name if not provided
    const addressName =
      name?.trim() || `Address ${currentAddresses.length + 1}`;

    const newAddress = {
      name: addressName,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    // Add the new address
    await User.updateOne({ _id: userId }, { $push: { addresses: newAddress } });

    // Reload user to get updated addresses
    const updatedUser = await User.findById(userId).select("-password");

    res.status(201).json({
      message: "Address added successfully",
      user: buildUserResponse(updatedUser),
    });
  } catch (error: any) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update existing address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.addressId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, address, city, state, pincode } = req.body;

    // Validate required fields
    if (
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message:
          "All address fields are required (address, city, state, pincode)",
      });
    }

    // Find the address to update
    const addressIndex = (user.addresses || []).findIndex(
      (addr: any) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Update the address
    const updatePath = `addresses.${addressIndex}`;
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          [`${updatePath}.name`]:
            name?.trim() || user.addresses[addressIndex].name,
          [`${updatePath}.address`]: address.trim(),
          [`${updatePath}.city`]: city.trim(),
          [`${updatePath}.state`]: state.trim(),
          [`${updatePath}.pincode`]: pincode.trim(),
        },
      },
    );

    // Reload user to get updated addresses
    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Address updated successfully",
      user: buildUserResponse(updatedUser),
    });
  } catch (error: any) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.addressId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the address to delete
    const addressIndex = (user.addresses || []).findIndex(
      (addr: any) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Business users cannot delete Address 1 (first address)
    if (user.userType === "business" && addressIndex === 0) {
      return res.status(400).json({
        message:
          "Business users cannot delete their primary address (Address 1)",
      });
    }

    // Remove the address
    await User.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } },
    );

    // Reload user to get updated addresses
    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Address deleted successfully",
      user: buildUserResponse(updatedUser),
    });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
