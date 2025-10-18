import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productRating: {
      type: Number,
      default: 0,
    },
    productReviews: {
      type: Number,
      default: 0,
    },
    series: {
      type: String,
      default: "General",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    addedDate: {
      type: Date,
      default: Date.now,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one wishlist item per user per product
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
