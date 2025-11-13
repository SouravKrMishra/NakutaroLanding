import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  merchantTransactionId: string;
  phonepeTransactionId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  phonepeCode?: string;
  phonepeMessage?: string;
  callbackData?: any;
  redirectUrl: string;
  callbackUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    merchantTransactionId: {
      type: String,
      required: true,
      unique: true, // unique already creates an index automatically
    },
    phonepeTransactionId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["PHONEPE", "CARD", "COD"],
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    phonepeCode: {
      type: String,
    },
    phonepeMessage: {
      type: String,
    },
    callbackData: {
      type: Schema.Types.Mixed,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    callbackUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
