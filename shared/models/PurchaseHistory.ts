import mongoose from "mongoose";

const purchaseHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  series: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
});

// Index for efficient queries
purchaseHistorySchema.index({ userId: 1, orderDate: -1 });
purchaseHistorySchema.index({ userId: 1, category: 1 });
purchaseHistorySchema.index({ userId: 1, series: 1 });

export const PurchaseHistory = mongoose.model(
  "PurchaseHistory",
  purchaseHistorySchema
);
