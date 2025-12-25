import mongoose from "mongoose";

type UserType = "business" | "individual";

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ["business", "individual"],
    required: true, // Must be explicitly set during registration
    index: true,
  },
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
  // Business Information (optional for individual users)
  companyName: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  phoneNumber: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  businessType: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  industry: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  companySize: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
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
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  city: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  state: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  pincode: {
    type: String,
    required: function () {
      return (this as any).userType === "business";
    },
    default: "",
  },
  // Account Status
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false, // Account is inactive until email is verified
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
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

export const User = mongoose.model("User", userSchema);
