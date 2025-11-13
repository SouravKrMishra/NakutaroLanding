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
    shortDescription: {
      type: String,
      default: "",
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
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ createdAt: -1 });

// Generate slug from name if not provided
productSchema.pre("save", async function (next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (true) {
      const existingProduct = await mongoose.model("Product").findOne({ slug });
      if (!existingProduct || existingProduct._id.equals(this._id)) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Set inventory type based on category
  if (!this.inventoryType) {
    this.inventoryType = ["T-Shirts", "Hoodies"].includes(this.category)
      ? "shared_stock"
      : "individual_stock";
  }

  // Update stock status based on inventory type and quantity
  if (this.inventoryType === "individual_stock" && this.stock) {
    if (this.stock.quantity === 0) {
      this.stock.status = "out_of_stock";
    } else if (this.stock.quantity <= this.stock.lowStockThreshold) {
      this.stock.status = "low_stock";
    } else {
      this.stock.status = "in_stock";
    }
  } else if (this.inventoryType === "shared_stock") {
    // Shared stock items don't use individual stock field
    // Remove stock field if it exists for shared stock items
    this.stock = undefined;
  }

  next();
});

// Notifications removed

export const Product = mongoose.model("Product", productSchema);
