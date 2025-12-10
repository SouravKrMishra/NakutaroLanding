import {
  Product,
  ProductFilters,
  ProductResponse,
  CategoryFilters,
} from "../types/index.js";
import ProductModel from "../../../shared/models/Product.js";

class ProductService {
  async getProducts(filters: ProductFilters): Promise<ProductResponse> {
    const page = filters.page || 1;
    const per_page = filters.per_page || 12;
    const skip = (page - 1) * per_page;

    // Build query with $and to properly combine conditions
    const query: any = {
      status: "published", // Only show published products
      isDeleted: { $ne: true }, // Exclude soft-deleted products
    };
    const andConditions: any[] = [];

    // Category filter (comma-separated category names)
    if (filters.category) {
      const categories = filters.category.split(",").map((c) => c.trim());
      if (categories.length === 1) {
        query.category = categories[0];
      } else if (categories.length > 1) {
        query.category = { $in: categories };
      }
    }

    // Price filter - filter on the effective price (salePrice if exists, otherwise price)
    // Only apply filter if it's not the default full range (0-10000)
    const hasCustomPriceFilter =
      (filters.min_price !== undefined && filters.min_price > 0) ||
      (filters.max_price !== undefined && filters.max_price < 10000);

    if (hasCustomPriceFilter) {
      // Build an $or query to check both price and salePrice fields
      const regularPriceCondition: any = {};
      if (filters.min_price !== undefined && filters.min_price > 0) {
        regularPriceCondition.$gte = filters.min_price;
      }
      if (filters.max_price !== undefined && filters.max_price < 10000) {
        regularPriceCondition.$lte = filters.max_price;
      }

      // Check sale price (when it exists)
      const salePriceCondition: any = { $exists: true };
      if (filters.min_price !== undefined && filters.min_price > 0) {
        salePriceCondition.$gte = filters.min_price;
      }
      if (filters.max_price !== undefined && filters.max_price < 10000) {
        salePriceCondition.$lte = filters.max_price;
      }

      // Products match if either:
      // 1. Regular price is in range and no sale price exists
      // 2. Sale price is in range (regardless of regular price)
      andConditions.push({
        $or: [
          { price: regularPriceCondition, salePrice: { $exists: false } },
          { salePrice: salePriceCondition },
        ],
      });
    }

    // Stock status filter
    // Handle both inventory types:
    // - shared_stock: Always considered in stock (no stock field)
    // - individual_stock: Check stock.status field
    if (filters.stock_status && filters.stock_status !== "any") {
      if (filters.stock_status === "instock") {
        // Products are in stock if:
        // 1. They use shared_stock (inventoryType = "shared_stock")
        // 2. OR they have individual stock with status = "in_stock" or "low_stock"
        andConditions.push({
          $or: [
            { inventoryType: "shared_stock" },
            { "stock.status": { $in: ["in_stock", "low_stock"] } },
          ],
        });
      } else if (filters.stock_status === "outofstock") {
        // Only individual_stock items can be out of stock
        query.inventoryType = "individual_stock";
        query["stock.status"] = "out_of_stock";
      }
    }

    // Combine all $and conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Rating filter
    if (filters.min_rating) {
      query["ratings.average"] = { $gte: filters.min_rating };
    }

    // Build sort
    let sort: any = { createdAt: -1 }; // Default: newest first
    if (filters.orderby) {
      switch (filters.orderby) {
        case "price-asc":
          sort = { price: 1 };
          break;
        case "price-desc":
          sort = { price: -1 };
          break;
        case "rating":
          sort = { "ratings.average": -1 };
          break;
        case "date":
          sort = { createdAt: -1 };
          break;
      }
    }

    const products = await ProductModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(per_page)
      .lean();

    const totalProducts = await ProductModel.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / per_page);

    // Debug: Check how many products would match without stock filter
    if (filters.stock_status && filters.stock_status !== "any") {
      const queryWithoutStock = { ...query };
      delete queryWithoutStock["stock.status"];
      const totalWithoutStockFilter = await ProductModel.countDocuments(
        queryWithoutStock
      );
      if (totalWithoutStockFilter > totalProducts) {
      }
    }

    // Transform products to match frontend expectations
    const transformedProducts = products.map(this.transformProduct);

    return {
      products: transformedProducts,
      totalProducts,
      totalPages,
    };
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await ProductModel.find({
      status: "published",
      featured: true,
      isDeleted: { $ne: true }, // Exclude soft-deleted products
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return products.map(this.transformProduct);
  }

  async getCategories(filters: CategoryFilters): Promise<any[]> {
    // Get distinct categories from products
    const pipeline: any[] = [
      {
        $match: {
          status: "published",
          isDeleted: { $ne: true }, // Exclude soft-deleted products
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    // If hide_empty is true, only show categories with products
    if (filters.hide_empty) {
      pipeline.push({
        $match: {
          count: { $gt: 0 },
        },
      });
    }

    const categories = await ProductModel.aggregate(pipeline);

    // Transform to match frontend expectations
    return categories.map((cat, index) => ({
      id: index + 1, // Generate sequential IDs
      name: cat._id,
      count: cat.count,
    }));
  }

  async getProductById(idOrSlug: string): Promise<Product> {
    // Try to find by slug first, then by ID
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    
    const query: any = {
      isDeleted: { $ne: true }, // Exclude soft-deleted products
    };

    if (isObjectId) {
      // If it looks like an ObjectId, try both ID and slug
      query.$or = [
        { _id: idOrSlug },
        { slug: idOrSlug },
      ];
    } else {
      // If it's not an ObjectId, assume it's a slug
      query.slug = idOrSlug;
    }

    const product = await ProductModel.findOne(query).lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return this.transformProduct(product);
  }

  // Transform MongoDB product to match frontend expectations
  private transformProduct(product: any): Product {
    // Determine stock status based on inventory type
    let stockStatus;
    if (product.inventoryType === "shared_stock") {
      // Shared stock items (clothing) are always in stock
      stockStatus = { status: "in_stock", quantity: 999 }; // High quantity to indicate always available
    } else if (product.inventoryType === "individual_stock" && product.stock) {
      // Individual stock items use their actual stock data
      stockStatus = {
        status: product.stock.status,
        quantity: product.stock.quantity,
      };
    } else {
      // Default fallback
      stockStatus = { status: "in_stock", quantity: 0 };
    }

    // Generate attributes for clothing items
    let attributes: any[] = [];
    const isClothingItem = ["T-Shirts", "Hoodies"].includes(product.category);

    if (isClothingItem) {
      // Define available sizes and colors
      const sizes = ["S", "M", "L", "XL", "XXL"];
      const colors = [
        "Black",
        "White",
        "Beige",
        "Lavender",
        "Pink",
        "Lime Green",
        "Dark Green",
      ];

      attributes = [
        {
          name: "Size",
          options: sizes,
          required: true,
        },
        {
          name: "Color",
          options: colors,
          required: true,
        },
      ];
    }

    return {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.salePrice || product.price,
      regularPrice: product.regularPrice || product.price,
      salePrice: product.salePrice,
      onSale: !!product.salePrice,
      average_rating: product.ratings?.average?.toString() || "0",
      rating_count: product.ratings?.count || 0,
      images:
        product.images?.map((img: any) => ({
          src: img.url,
          alt: img.alt || product.name,
          isPrimary: img.isPrimary || false,
          color: img.color || null,
          isPrimaryForColor: img.isPrimaryForColor || false,
        })) || [],
      categories: [{ id: 1, name: product.category || "Uncategorized" }],
      category: product.category || "Uncategorized",
      colors: product.colors || [],
      sizes: product.sizes || [],
      defaultColor: product.defaultColor || null,
      stock: stockStatus,
      sku: product.sku,
      featured: product.featured || false,
      tags: product.tags || [],
      attributes: attributes,
      specifications: product.specifications || {},
      keyHighlights: product.keyHighlights || [],
    };
  }
}

export const productService = new ProductService();
