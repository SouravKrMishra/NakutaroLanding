export interface Product {
  id: number;
  name: string;
  price: string;
  average_rating?: string;
  rating_count: number;
  images: Array<{ src: string }>;
  categories: Array<{ name: string }>;
  on_sale: boolean;
}

export interface ProductFilters {
  page?: number;
  per_page?: number;
  orderby?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  stock_status?: string;
}

export interface ProductResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

export interface CategoryFilters {
  hide_empty?: boolean;
}

export interface Category {
  id: number;
  name: string;
  count: number;
}

// Extend Express Request interface for authentication
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}
