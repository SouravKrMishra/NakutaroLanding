import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups
otpSchema.index({ email: 1, expiresAt: 1 });

export const OTP = mongoose.model("OTP", otpSchema);

