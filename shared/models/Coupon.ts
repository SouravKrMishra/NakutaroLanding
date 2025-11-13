import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
      min: 0,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    // Product selection similar to SaleTiming
    selectionType: {
      type: String,
      enum: ["all", "category", "tag", "individual"],
      default: "all",
    },
    selectedCategories: [
      {
        type: String,
      },
    ],
    selectedTags: [
      {
        type: String,
      },
    ],
    selectedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Track usage
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
// Note: 'code' field already has unique: true, which creates an index automatically
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ selectionType: 1 });

// Virtual to check if coupon is valid
couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  const isTimeValid = this.startDate <= now && this.endDate >= now;
  const isUsageValid = !this.usageLimit || this.usedCount < this.usageLimit;
  return this.isActive && isTimeValid && isUsageValid;
});

export const Coupon = mongoose.model("Coupon", couponSchema);

