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
    // Business (B2B) pricing - optional; if unset, we fall back to individual pricing
    businessPrice: {
      type: Number,
      min: 0,
    },
    businessSalePrice: {
      type: Number,
      min: 0,
    },
    businessRegularPrice: {
      type: Number,
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

// Slug generation function
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
}

// Pre-save hook to generate slug from name if not provided
productSchema.pre("save", async function (next) {
  // Always generate slug if it doesn't exist, is empty, or name has changed
  if (!this.slug || this.slug.trim() === "" || this.isModified("name")) {
    let baseSlug = generateSlug(this.name);

    // Ensure slug is not empty
    if (!baseSlug || baseSlug.trim() === "") {
      baseSlug = `product-${this._id}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists (excluding current document if updating)
    const query: any = { slug };
    if (!this.isNew) {
      query._id = { $ne: this._id };
    }

    while (await mongoose.model("Product").findOne(query)) {
      slug = `${baseSlug}-${counter}`;
      query.slug = slug;
      counter++;
    }

    this.slug = slug;
  }

  // Keep business pricing sane:
  // - If businessRegularPrice is missing, default it to regularPrice
  // - If businessSalePrice is missing, default it to salePrice (or undefined)
  // - Keep businessPrice as "effective" business price (sale if present else regular)
  // This preserves backward compatibility for existing products and allows partial updates.
  const hasBusinessRegular =
    typeof (this as any).businessRegularPrice === "number" &&
    (this as any).businessRegularPrice >= 0;
  if (!hasBusinessRegular && typeof (this as any).regularPrice === "number") {
    (this as any).businessRegularPrice = (this as any).regularPrice;
  }

  // Treat 0 (or negative) sale prices as "unset" to match app validation expectations.
  if (
    typeof (this as any).businessSalePrice === "number" &&
    (this as any).businessSalePrice <= 0
  ) {
    (this as any).businessSalePrice = undefined;
  }

  const hasBusinessSale =
    typeof (this as any).businessSalePrice === "number" &&
    (this as any).businessSalePrice > 0;
  if (!hasBusinessSale) {
    // If salePrice exists, mirror it; otherwise leave undefined
    if (
      typeof (this as any).salePrice === "number" &&
      (this as any).salePrice > 0
    ) {
      (this as any).businessSalePrice = (this as any).salePrice;
    } else {
      (this as any).businessSalePrice = undefined;
    }
  }

  // businessPrice mirrors existing "price" behavior (effective price)
  const brp =
    typeof (this as any).businessRegularPrice === "number"
      ? (this as any).businessRegularPrice
      : undefined;
  const bsp =
    typeof (this as any).businessSalePrice === "number"
      ? (this as any).businessSalePrice
      : undefined;
  if (typeof brp === "number") {
    (this as any).businessPrice =
      typeof bsp === "number" && bsp > 0 ? bsp : brp;
  }

  next();
});

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });

export default mongoose.model("Product", productSchema);
