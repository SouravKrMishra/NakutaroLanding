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
  next();
});

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });

export default mongoose.model("Product", productSchema);
