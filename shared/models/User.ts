import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // Business Information
  companyName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  companySize: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  // Address Information
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  // Account Status
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Admin privileges
  power: {
    type: Boolean,
    default: false,
  },
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model("User", userSchema);
