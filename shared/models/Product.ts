import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "T-Shirts",
        "Hoodies",
        "Action Figures",
        "Wigs",
        "Accessories",
        "Other",
      ],
      default: "Other",
    },
    subcategory: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
        color: {
          type: String,
          default: null,
        },
        isPrimaryForColor: {
          type: Boolean,
          default: false,
        },
      },
    ],
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    defaultColor: {
      type: String,
      default: null,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    keyHighlights: [
      {
        title: String,
        value: String,
      },
    ],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: {
        type: String,
        enum: ["cm", "inch"],
        default: "cm",
      },
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
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
    // Inventory management
    inventoryType: {
      type: String,
      enum: ["shared_stock", "individual_stock"],
      default: "individual_stock", // Default to individual_stock, will be set by pre-save hook
    },
    // Individual stock (only for non-clothing items)
    stock: {
      quantity: {
        type: Number,
        min: 0,
        default: 0,
      },
      status: {
        type: String,
        enum: ["in_stock", "out_of_stock", "low_stock"],
        default: "in_stock",
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });

export default mongoose.model("Product", productSchema);
