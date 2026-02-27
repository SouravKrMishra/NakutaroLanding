import mongoose from "mongoose";

type UserType = "business" | "individual";

// Address sub-schema for multiple addresses
const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Address 1",
  },
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
}, { _id: true });

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
  // Multiple addresses array
  // Individual users: max 5 addresses, Business users: max 2 addresses
  addresses: {
    type: [addressSchema],
    default: [],
    validate: {
      validator: function(this: any, addresses: any[]) {
        const maxAddresses = this.userType === "business" ? 2 : 5;
        return addresses.length <= maxAddresses;
      },
      message: function(this: any) {
        const maxAddresses = (this as any).userType === "business" ? 2 : 5;
        return `Maximum ${maxAddresses} addresses allowed for ${(this as any).userType} users`;
      }
    }
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
