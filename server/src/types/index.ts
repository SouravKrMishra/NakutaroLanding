export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
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
  keyHighlights?: Array<{ title: string; value: string }>;
}

export interface ProductFilters {
  page?: number;
  per_page?: number;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  search?: string;
  featured?: boolean;
  on_sale?: boolean;
  stock_status?: string;
  orderby?: string;
  min_rating?: number;
}

export interface CategoryFilters {
  hide_empty?: boolean;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    per_page: number;
    totalProducts?: number;
    totalPages?: number;
  };
  totalProducts?: number;
  totalPages?: number;
}

export interface ProductResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}
