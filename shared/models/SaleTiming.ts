import mongoose from "mongoose";

const saleTimingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
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
    selectionType: {
      type: String,
      enum: ["category", "tag", "individual"],
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
saleTimingSchema.index({ startDate: 1, endDate: 1 });
saleTimingSchema.index({ isActive: 1 });
saleTimingSchema.index({ selectionType: 1 });

export const SaleTiming = mongoose.model("SaleTiming", saleTimingSchema);
