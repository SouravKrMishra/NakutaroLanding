import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService.js";
import { createError } from "../middleware/errorHandler.js";
import { ProductFilters, CategoryFilters } from "../types/index.js";
import Stock from "../../../shared/models/Stock.js";

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(req.params.id);
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
    const filters: ProductFilters = {
      page: Number(req.query.page) || 1,
      per_page: Number(req.query.per_page) || 12,
      orderby: req.query.orderby as string,
      category: req.query.category as string,
      min_price: Number(req.query.min_price),
      max_price: Number(req.query.max_price),
      min_rating: Number(req.query.min_rating),
      stock_status: req.query.stock_status as string,
    };

    const result = await productService.getProducts(filters);
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
    const products = await productService.getFeaturedProducts();
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
    // Fetch all stock data from database
    const stocks = await Stock.find({});

    // Convert to the format expected by frontend
    const stockData: Record<
      string,
      { quantity: number; lowStockThreshold: number; available: boolean }
    > = {};

    stocks.forEach((stock) => {
      const key = `${stock.size}-${stock.color}`;
      stockData[key] = {
        quantity: stock.quantity,
        lowStockThreshold: stock.lowStockThreshold,
        available: stock.quantity > 0,
      };
    });

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

    res.json({
      success: true,
      data: {
        sizes,
        colors,
        stock: stockData,
      },
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    next(createError("Failed to fetch stock data", 500));
  }
};
