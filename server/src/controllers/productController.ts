import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService.js";
import { createError } from "../middleware/errorHandler.js";
import { ProductFilters, CategoryFilters } from "../types/index.js";
import Stock from "../../../shared/models/Stock.js";

const STOCK_PRODUCT_TYPE_KEYS = ["tshirt", "hoodie", "sweatshirt"] as const;
type StockProductType = (typeof STOCK_PRODUCT_TYPE_KEYS)[number];

const STOCK_PRODUCT_TYPE_CONFIG: Record<
  StockProductType,
  {
    sizes: string[];
    colors: string[];
  }
> = {
  tshirt: {
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      "Black",
      "White",
      "Beige",
      "Lavender",
      "Pink",
      "Lime Green",
      "Dark Green",
    ],
  },
  hoodie: {
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White"],
  },
  sweatshirt: {
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White"],
  },
};

const resolveProductType = (value?: string | null): StockProductType => {
  if (value === "hoodie") return "hoodie";
  if (value === "sweatshirt") return "sweatshirt";
  return "tshirt";
};

const buildLegacyStockEntry = () => ({
  quantity: 0,
  lowStockThreshold: 5,
  available: false,
});

const createEmptyStockMap = (
  productType: StockProductType
): Record<
  string,
  { quantity: number; lowStockThreshold: number; available: boolean }
> => {
  const map: Record<
    string,
    { quantity: number; lowStockThreshold: number; available: boolean }
  > = {};
  const config = STOCK_PRODUCT_TYPE_CONFIG[productType];

  config.sizes.forEach((size) => {
    config.colors.forEach((color) => {
      const key = `${size}-${color}`;
      map[key] = buildLegacyStockEntry();
    });
  });

  return map;
};

const buildStockResponseSkeleton = () =>
  STOCK_PRODUCT_TYPE_KEYS.reduce(
    (acc, key) => {
      const type = key as StockProductType;
      acc[type] = {
        sizes: STOCK_PRODUCT_TYPE_CONFIG[type].sizes,
        colors: STOCK_PRODUCT_TYPE_CONFIG[type].colors,
        stock: createEmptyStockMap(type),
      };
      return acc;
    },
    {} as Record<
      StockProductType,
      {
        sizes: string[];
        colors: string[];
        stock: Record<
          string,
          { quantity: number; lowStockThreshold: number; available: boolean }
        >;
      }
    >
  );

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userType =
      req.user?.userType === "business" ? "business" : "individual";
    const product = await productService.getProductById(
      req.params.id,
      userType
    );
    res.json(product);
  } catch (error) {
    next(createError("Failed to fetch product", 500));
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userType =
      req.user?.userType === "business" ? "business" : "individual";
    const filters: ProductFilters = {
      page: Number(req.query.page) || 1,
      per_page: Number(req.query.per_page) || 12,
      orderby: req.query.orderby as string,
      category: req.query.category as string,
      min_price: Number(req.query.min_price),
      max_price: Number(req.query.max_price),
      min_rating: Number(req.query.min_rating),
      stock_status: req.query.stock_status as string,
      search: req.query.search as string,
    };

    const result = await productService.getProducts(filters, userType);
    res.json(result);
  } catch (error) {
    next(createError("Failed to fetch products", 500));
  }
};

export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userType =
      req.user?.userType === "business" ? "business" : "individual";
    const products = await productService.getFeaturedProducts(userType);
    res.json(products);
  } catch (error) {
    next(createError("Failed to fetch featured products", 500));
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: CategoryFilters = {
      hide_empty: req.query.hide_empty === "true",
    };
    const categories = await productService.getCategories(filters);
    res.json(categories);
  } catch (error) {
    next(createError("Failed to fetch categories", 500));
  }
};

export const getStockData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Filter out "All Sizes" entries - it's not a real size, just a frontend convenience
    const stocks = await Stock.find({
      size: { $ne: "All Sizes" },
    });
    const responseData = buildStockResponseSkeleton();

    stocks.forEach((stock) => {
      const productType = resolveProductType(stock.productType);
      const key = `${stock.size}-${stock.color}`;
      responseData[productType].stock[key] = {
        quantity: stock.quantity,
        lowStockThreshold: stock.lowStockThreshold,
        available: stock.quantity > 0,
      };
    });

    const defaultType: StockProductType = "tshirt";

    res.json({
      success: true,
      data: {
        sizes: responseData[defaultType].sizes,
        colors: responseData[defaultType].colors,
        stock: responseData[defaultType].stock,
        types: responseData,
      },
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    next(createError("Failed to fetch stock data", 500));
  }
};
