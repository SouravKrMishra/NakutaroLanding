import {
  Product,
  ProductFilters,
  ProductResponse,
  CategoryFilters,
} from "../types/index.js";
import ProductModel from "../../../shared/models/Product.js";

type ShopperType = "business" | "individual";

class ProductService {
  async getProducts(
    filters: ProductFilters,
    userType: ShopperType = "individual"
  ): Promise<ProductResponse> {
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

    // For business users, price filtering/sorting must respect businessPrice, but fall back to price
    // for older products that don't have businessPrice yet.
    // For individual users, price sorting must respect effective price (salePrice if > 0, else price)
    // to match what transformProduct returns.
    const needsAggregationForPrice =
      (userType === "business" &&
        (hasCustomPriceFilter ||
          filters.orderby === "price-asc" ||
          filters.orderby === "price-desc")) ||
      (userType === "individual" &&
        (filters.orderby === "price-asc" || filters.orderby === "price-desc"));

    if (hasCustomPriceFilter && !needsAggregationForPrice) {
      // Build an $or query to check both price and salePrice fields
      const regularPriceCondition: any = {};
      if (filters.min_price !== undefined && filters.min_price > 0) {
        regularPriceCondition.$gte = filters.min_price;
      }
      if (filters.max_price !== undefined && filters.max_price < 10000) {
        regularPriceCondition.$lte = filters.max_price;
      }

      // Check sale price (when it exists and is > 0)
      // Treat <=0 sale prices as invalid to match transformProduct logic
      const salePriceCondition: any = { $exists: true, $gt: 0 };
      if (filters.min_price !== undefined && filters.min_price > 0) {
        salePriceCondition.$gte = filters.min_price;
      }
      if (filters.max_price !== undefined && filters.max_price < 10000) {
        salePriceCondition.$lte = filters.max_price;
      }

      // Products match if either:
      // 1. Regular price is in range and (no sale price exists OR sale price is <= 0)
      // 2. Sale price exists, is > 0, and is in range (regardless of regular price)
      andConditions.push({
        $or: [
          {
            $and: [
              { price: regularPriceCondition },
              {
                $or: [
                  { salePrice: { $exists: false } },
                  { salePrice: { $lte: 0 } },
                ],
              },
            ],
          },
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

    // Rating filter
    if (filters.min_rating) {
      query["ratings.average"] = { $gte: filters.min_rating };
    }

    // Search filter - search in name, description, and tags
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      const searchRegex = new RegExp(searchTerm, "i"); // Case-insensitive search
      andConditions.push({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { slug: searchRegex },
        ],
      });
    }

    // Combine all $and conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
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

    // If we need business effective price filtering/sorting, use an aggregation pipeline with $ifNull.
    // Also use aggregation for individual users when sorting by price to match effective price logic.
    if (needsAggregationForPrice) {
      // IMPORTANT: effectivePrice expression must match transformProduct() logic,
      // otherwise filtering/sorting can be done on a different value than what we return.
      //
      // transformProduct() logic:
      // - Individual users: effectivePrice = salePrice (if > 0) ?? price
      // - Business users: effectivePrice = businessPrice ?? effectiveSalePrice ?? price ?? effectiveRegularPrice
      //
      // We also treat <=0 sale prices as "unset" (null) for consistency.
      // IMPORTANT: Must check salePrice > 0 before using it,
      // since $ifNull only treats null/missing as triggers, not 0 values.

      let effectivePriceExpr: any;

      if (userType === "individual") {
        // For individual users: salePrice (if > 0) ?? price
        effectivePriceExpr = {
          $cond: [
            {
              $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }],
            },
            "$salePrice",
            "$price",
          ],
        };
      } else {
        // For business users: full fallback chain
        effectivePriceExpr = {
          $let: {
            vars: {
              effectiveRegular: {
                $ifNull: [
                  "$businessRegularPrice",
                  { $ifNull: ["$regularPrice", "$price"] },
                ],
              },
              // Check businessSalePrice > 0 first, then fall back to salePrice > 0
              // This matches transformProduct's getValidSalePrice logic
              effectiveSale: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$businessSalePrice", null] },
                      { $gt: ["$businessSalePrice", 0] },
                    ],
                  },
                  "$businessSalePrice",
                  {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$salePrice", null] },
                          { $gt: ["$salePrice", 0] },
                        ],
                      },
                      "$salePrice",
                      null,
                    ],
                  },
                ],
              },
            },
            in: {
              $ifNull: [
                "$businessPrice",
                {
                  $ifNull: [
                    "$$effectiveSale",
                    { $ifNull: ["$price", "$$effectiveRegular"] },
                  ],
                },
              ],
            },
          },
        };
      }

      const pipeline: any[] = [
        { $match: query },
        { $addFields: { effectivePrice: effectivePriceExpr } },
      ];

      if (hasCustomPriceFilter) {
        const priceMatch: any = {};
        if (filters.min_price !== undefined && filters.min_price > 0) {
          priceMatch.$gte = filters.min_price;
        }
        if (filters.max_price !== undefined && filters.max_price < 10000) {
          priceMatch.$lte = filters.max_price;
        }
        pipeline.push({ $match: { effectivePrice: priceMatch } });
      }

      // Build sort for aggregation
      let aggSort: any = { createdAt: -1 };
      switch (filters.orderby) {
        case "price-asc":
          aggSort = { effectivePrice: 1, createdAt: -1 };
          break;
        case "price-desc":
          aggSort = { effectivePrice: -1, createdAt: -1 };
          break;
        case "rating":
          aggSort = { "ratings.average": -1 };
          break;
        case "date":
          aggSort = { createdAt: -1 };
          break;
      }
      pipeline.push({ $sort: aggSort }, { $skip: skip }, { $limit: per_page });

      const countPipeline = pipeline
        .filter((stage) => !stage.$skip && !stage.$limit && !stage.$sort)
        .concat([{ $count: "total" }]);

      const [products, countResult] = await Promise.all([
        ProductModel.aggregate(pipeline),
        ProductModel.aggregate(countPipeline),
      ]);

      const totalProducts = countResult?.[0]?.total || 0;
      const totalPages = Math.ceil(totalProducts / per_page);

      const transformedProducts = products.map((p: any) =>
        this.transformProduct(p, userType)
      );

      return {
        products: transformedProducts,
        totalProducts,
        totalPages,
      };
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
    const transformedProducts = products.map((p: any) =>
      this.transformProduct(p, userType)
    );

    return {
      products: transformedProducts,
      totalProducts,
      totalPages,
    };
  }

  async getFeaturedProducts(
    userType: ShopperType = "individual"
  ): Promise<Product[]> {
    const products = await ProductModel.find({
      status: "published",
      featured: true,
      isDeleted: { $ne: true }, // Exclude soft-deleted products
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return products.map((p: any) => this.transformProduct(p, userType));
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

  async getProductById(
    idOrSlug: string,
    userType: ShopperType = "individual"
  ): Promise<Product> {
    // Try to find by slug first, then by ID
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const query: any = {
      isDeleted: { $ne: true }, // Exclude soft-deleted products
    };

    if (isObjectId) {
      // If it looks like an ObjectId, try both ID and slug
      query.$or = [{ _id: idOrSlug }, { slug: idOrSlug }];
    } else {
      // If it's not an ObjectId, assume it's a slug
      query.slug = idOrSlug;
    }

    const product = await ProductModel.findOne(query).lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return this.transformProduct(product, userType);
  }

  // Transform MongoDB product to match frontend expectations
  private transformProduct(
    product: any,
    userType: ShopperType = "individual"
  ): Product {
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

    const isBusiness = userType === "business";
    const effectiveRegularPrice = isBusiness
      ? product.businessRegularPrice ?? product.regularPrice ?? product.price
      : product.regularPrice ?? product.price;

    // Treat <=0 sale prices as "unset" (null/undefined) to match aggregation pipeline logic
    // This ensures consistency: products filtered/sorted by aggregation use the same price logic as transformProduct
    const getValidSalePrice = (salePrice: any): number | undefined => {
      if (typeof salePrice === "number" && salePrice > 0) return salePrice;
      return undefined;
    };

    const effectiveSalePrice = isBusiness
      ? getValidSalePrice(product.businessSalePrice) ??
        getValidSalePrice(product.salePrice)
      : getValidSalePrice(product.salePrice);

    const effectivePrice = isBusiness
      ? product.businessPrice ??
        effectiveSalePrice ??
        product.price ??
        effectiveRegularPrice
      : effectiveSalePrice ?? product.price;

    return {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: effectivePrice,
      regularPrice: effectiveRegularPrice,
      salePrice: effectiveSalePrice,
      onSale: !!effectiveSalePrice,
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
      minBusinessQuantity: product.minBusinessQuantity || 1,
    };
  }
}

export const productService = new ProductService();
