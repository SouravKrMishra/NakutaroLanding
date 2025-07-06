import axios from "axios";
import {
  Product,
  ProductFilters,
  ProductResponse,
  CategoryFilters,
} from "../types";

class ProductService {
  private readonly baseUrl = "https://shop.animeindia.org/wp-json/wc/v3";
  private readonly auth = {
    username: process.env.CONSUMER_KEY!,
    password: process.env.CONSUMER_SECRET!,
  };

  async getProducts(filters: ProductFilters): Promise<ProductResponse> {
    const params: any = {
      page: filters.page || 1,
      per_page: filters.per_page || 12,
      category: filters.category,
      min_price: filters.min_price,
      max_price: filters.max_price,
    };

    if (filters.stock_status && filters.stock_status !== "any") {
      params.stock_status = filters.stock_status;
    }

    // Handle sorting
    if (filters.orderby) {
      switch (filters.orderby) {
        case "price-asc":
          params.orderby = "price";
          params.order = "asc";
          break;
        case "price-desc":
          params.orderby = "price";
          params.order = "desc";
          break;
        case "rating":
          params.orderby = "rating";
          params.order = "desc";
          break;
        case "date":
          params.orderby = "date";
          params.order = "desc";
          break;
      }
    }

    const response = await axios.get(`${this.baseUrl}/products`, {
      auth: this.auth,
      params,
    });

    let filteredProducts = response.data;
    let totalProducts = Number(response.headers["x-wp-total"]);
    let totalPages = Number(response.headers["x-wp-totalpages"]);

    // Filter by rating if specified
    if (filters.min_rating) {
      const minRatingNum = Number(filters.min_rating);
      filteredProducts = filteredProducts.filter(
        (product: any) =>
          product.average_rating &&
          parseFloat(product.average_rating) >= minRatingNum
      );

      // Recalculate pagination for filtered results
      totalProducts = filteredProducts.length;
      totalPages = Math.ceil(totalProducts / Number(filters.per_page || 12));

      // Apply pagination to filtered results
      const startIndex =
        (Number(filters.page || 1) - 1) * Number(filters.per_page || 12);
      const endIndex = startIndex + Number(filters.per_page || 12);
      filteredProducts = filteredProducts.slice(startIndex, endIndex);
    }

    return {
      products: filteredProducts,
      totalProducts,
      totalPages,
    };
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}/products`, {
      auth: this.auth,
      params: {
        per_page: 4,
        orderby: "date",
        order: "desc",
      },
    });

    return response.data;
  }

  async getCategories(filters: CategoryFilters): Promise<any[]> {
    const params: any = {
      per_page: 100,
    };

    if (filters.hide_empty) {
      params.hide_empty = true;
    }

    const response = await axios.get(`${this.baseUrl}/products/categories`, {
      auth: this.auth,
      params,
    });
    return response.data;
  }
}

export const productService = new ProductService();
