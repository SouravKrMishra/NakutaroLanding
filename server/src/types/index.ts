export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale?: boolean;
  average_rating?: string;
  rating_count: number;
  images: Array<{
    src: string;
    alt?: string;
    isPrimary?: boolean;
    color?: string | null;
    isPrimaryForColor?: boolean;
  }>;
  categories: Array<{ id: number; name: string }>;
  category?: string;
  sizes?: string[];
  colors?: string[];
  defaultColor?: string | null;
  stock?: {
    quantity: number;
    status: string;
    lowStockThreshold?: number;
  };
  sku?: string;
  featured?: boolean;
  tags?: string[];
  attributes?: any[];
  specifications?: any;
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
