import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService.ts";
import { createError } from "../middleware/errorHandler.ts";
import { ProductFilters, CategoryFilters } from "../types/index.ts";

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(Number(req.params.id));
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
