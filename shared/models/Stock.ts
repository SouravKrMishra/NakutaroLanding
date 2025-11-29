import mongoose, { Schema, Document } from "mongoose";

export interface IStock extends Document {
  productType: "tshirt" | "hoodie";
  size: string;
  color: string;
  quantity: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    productType: {
      type: String,
      required: true,
      enum: ["tshirt", "hoodie"],
      default: "tshirt",
    },
    size: {
      type: String,
      required: true,
      enum: ["S", "M", "L", "XL", "XXL", "All Sizes"],
    },
    color: {
      type: String,
      required: true,
      enum: [
        "Black",
        "White",
        "Beige",
        "Lavender",
        "Pink",
        "Lime Green",
        "Dark Green",
      ],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure unique productType-size-color combinations
StockSchema.index({ productType: 1, size: 1, color: 1 }, { unique: true });

export default mongoose.model<IStock>("Stock", StockSchema);
