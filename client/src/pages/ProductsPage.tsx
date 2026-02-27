import axios from "axios";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";
import ProductsBanner from "@/components/ProductsBanner.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import React, { useEffect, useState, useRef } from "react";

import { useDebounce } from "@/hooks/use-debounce.ts";
import { buildApiUrl } from "@/lib/api.ts";
import {
  Filter,
  Grid,
  List,
  ChevronRight,
  Award,
  Star,
  ShoppingBag,
  ChevronDown,
  X,
  Tag,
  CheckSquare,
  Heart,
  Folder,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu.tsx";
import { ProductSkeleton } from "@/components/ProductSkeleton.tsx";
import { FeaturedProductsSkeleton } from "@/components/FeaturedProductsSkeleton.tsx";
import { Link, useLocation, useSearch } from "wouter";
import { useWishlist } from "@/lib/WishlistContext.tsx";
import { useCart } from "@/lib/CartContext.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";

type Category = {
  id: number;
  name: string;
  count: number;
};

type SortOption =
  | "Relevance"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Rating: High to Low"
  | "Newest First";

const sortOptions: SortOption[] = [
  "Relevance",
  "Price: Low to High",
  "Price: High to Low",
  "Rating: High to Low",
  "Newest First",
];

type ProductImage = {
  id?: number;
  src: string;
  url?: string;
  color?: string | null;
  colour?: string | null;
  isPrimary?: boolean;
  isPrimaryForColor?: boolean;
};

type Product = {
  id: string;
  slug?: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isNew?: boolean;
  onSale?: boolean;
  attributes?: { name: string; options: string[] }[];
  colors?: string[];
  images?: ProductImage[];
  defaultColor?: string;
  description?: string;
};

// Helper function to get the default color's primary image
const getDefaultColorPrimaryImage = (item: any): string => {
  if (!item.images || item.images.length === 0) return "";

  // For products with colors (clothing items), use color-based primary image
  if (item.defaultColor || (item.colors && item.colors.length > 0)) {
    // Try to find the primary image for the default color
    if (item.defaultColor) {
      const primaryForDefaultColor = item.images.find(
        (img: any) =>
          img.color === item.defaultColor && img.isPrimaryForColor === true
      );
      if (primaryForDefaultColor)
        return primaryForDefaultColor.src || primaryForDefaultColor.url || "";

      // If no primary image for default color, get the first image of that color
      const firstOfDefaultColor = item.images.find(
        (img: any) => img.color === item.defaultColor
      );
      if (firstOfDefaultColor)
        return firstOfDefaultColor.src || firstOfDefaultColor.url || "";
    }
  }

  // Fallback to any primary image for color (check regardless of whether colors exist)
  // This preserves the original fallback behavior for edge cases
  const anyPrimaryForColor = item.images.find(
    (img: any) => img.isPrimaryForColor === true
  );
  if (anyPrimaryForColor)
    return anyPrimaryForColor.src || anyPrimaryForColor.url || "";

  // For non-clothing products (no colors), use isPrimary flag
  const primaryImage = item.images.find((img: any) => img.isPrimary === true);
  if (primaryImage) return primaryImage.src || primaryImage.url || "";

  // Final fallback to first image
  return item.images[0]?.src || item.images[0]?.url || "";
};

// Helper function to extract available colors from product data
const getAvailableColors = (item: any): string[] => {
  // First, try to get colors from the colors array (this contains actual available colors)
  if (item.colors && Array.isArray(item.colors) && item.colors.length > 0) {
    const filteredColors = item.colors.filter(
      (color: string) => color && color.trim() !== ""
    );
    if (filteredColors.length > 0) {
      return filteredColors;
    }
  }

  // If no colors array, extract unique colors from images (each image has a color field)
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const colorSet = new Set<string>();
    item.images.forEach((img: any) => {
      // Check both 'color' and 'url' fields (some APIs might use different field names)
      const imageColor = img.color || img.colour;
      if (
        imageColor &&
        typeof imageColor === "string" &&
        imageColor.trim() !== ""
      ) {
        colorSet.add(imageColor.trim());
      }
    });
    const colorsFromImages = Array.from(colorSet);
    if (colorsFromImages.length > 0) {
      return colorsFromImages;
    }
  }

  // Don't use attributes as they contain all possible color options, not actual available colors
  return [];
};

const orderColorsByDefault = (
  colors: string[],
  defaultColor?: string
): string[] => {
  if (!defaultColor) return colors;

  const normalizedDefault = defaultColor.toLowerCase().trim();
  const index = colors.findIndex(
    (color) => color?.toLowerCase().trim() === normalizedDefault
  );

  if (index <= 0) return colors;

  const orderedColors = [...colors];
  const [defaultEntry] = orderedColors.splice(index, 1);
  return [defaultEntry, ...orderedColors];
};

// Helper function to map color names to hex values for display
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    black: "#000000",
    white: "#FFFFFF",
    beige: "#F5F5DC",
    lavender: "#E6E6FA",
    pink: "#FFC0CB",
    "lime green": "#32CD32",
    "dark green": "#006400",
    red: "#FF0000",
    blue: "#0000FF",
    green: "#008000",
    yellow: "#FFFF00",
    orange: "#FFA500",
    purple: "#800080",
    gray: "#808080",
    grey: "#808080",
    brown: "#A52A2A",
    navy: "#000080",
    maroon: "#800000",
    teal: "#008080",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
  };

  const normalizedName = colorName.toLowerCase().trim();
  return colorMap[normalizedName] || "#CCCCCC"; // Default gray if color not found
};

const normalizeColorName = (color?: string | null) =>
  color?.toString().trim().toLowerCase() || "";

// Helper function to strip HTML tags from description
const stripHtml = (html: string | undefined): string => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Helper function to get image for a specific color
const getImageForColor = (product: Product, colorName: string): string => {
  if (!product.images || product.images.length === 0) {
    return "";
  }

  const normalizedTarget = normalizeColorName(colorName);

  const primaryForColor = product.images.find((img) => {
    const imageColor = normalizeColorName(img.color || img.colour);
    return imageColor === normalizedTarget && img.isPrimaryForColor;
  });
  if (primaryForColor) {
    return primaryForColor.src || primaryForColor.url || "";
  }

  const firstOfColor = product.images.find((img) => {
    const imageColor = normalizeColorName(img.color || img.colour);
    return imageColor === normalizedTarget;
  });
  if (firstOfColor) {
    return firstOfColor.src || firstOfColor.url || "";
  }

  return "";
};

// URL parameter management functions
const parseUrlParams = (search: string) => {
  const params = new URLSearchParams(search);

  return {
    categories: params.get("categories")?.split(",").filter(Boolean) || [],
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : 0,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : 10000,
    ratings:
      params.get("ratings")?.split(",").map(Number).filter(Boolean) || [],
    sortBy: (params.get("sortBy") as SortOption) || "Relevance",
    page: params.get("page") ? Number(params.get("page")) : 1,
    includeOutOfStock: params.get("includeOutOfStock") === "true",
    view: (params.get("view") as "grid" | "list") || "grid",
    searchQuery: params.get("search") || "",
  };
};

const buildUrlParams = (filters: {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  ratings: number[];
  sortBy: SortOption;
  page: number;
  includeOutOfStock: boolean;
  view: "grid" | "list";
  searchQuery: string;
}) => {
  const params = new URLSearchParams();

  if (filters.categories.length > 0) {
    params.set("categories", filters.categories.join(","));
  }
  if (filters.minPrice !== 0) {
    params.set("minPrice", filters.minPrice.toString());
  }
  if (filters.maxPrice !== 10000) {
    params.set("maxPrice", filters.maxPrice.toString());
  }
  if (filters.ratings.length > 0) {
    params.set("ratings", filters.ratings.join(","));
  }
  if (filters.sortBy !== "Relevance") {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.page !== 1) {
    params.set("page", filters.page.toString());
  }
  if (filters.includeOutOfStock) {
    params.set("includeOutOfStock", "true");
  }
  if (filters.view !== "grid") {
    params.set("view", filters.view);
  }
  if (filters.searchQuery.trim()) {
    params.set("search", filters.searchQuery.trim());
  }

  return params.toString();
};

const ProductsPage = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [committedPriceRange, setCommittedPriceRange] = useState<number[]>([
    0, 10000,
  ]);
  const [ratings, setRatings] = useState<{ [key: number]: boolean }>({
    5: false,
    4: false,
    3: false,
    2: false,
    1: false,
  });
  const [sortBy, setSortBy] = useState<SortOption>("Relevance");
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false); // Default false - hide out of stock items by default
  const [searchQuery, setSearchQuery] = useState<string>(""); // Input value
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>(""); // Actual search term sent to API
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [productId: string]: { [attributeName: string]: string };
  }>({});
  const [showAttributeSelection, setShowAttributeSelection] = useState<{
    [productId: string]: boolean;
  }>({});
  const [selectedProductColors, setSelectedProductColors] = useState<{
    [productId: string]: string;
  }>({});
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const pageSize = 12;
  const isUpdatingFromUrl = useRef(false);
  const hasInitialized = useRef(false);
  const urlInitCompleteRef = useRef(false);
  const [urlInitComplete, setUrlInitComplete] = useState(false);
  const lastFetchParamsRef = useRef<string>("");
  const lastFetchTimeRef = useRef<number>(0);

  // Wishlist functionality
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleWishlistToggle = async (product: Product) => {
    try {
      const isCurrentlyInWishlist = isInWishlist(product.id);

      await addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating,
        reviews: product.reviews,
      });

      toast({
        title: isCurrentlyInWishlist
          ? "Removed from Wishlist"
          : "Added to Wishlist ❤️",
        description: `${product.name} has been ${
          isCurrentlyInWishlist ? "removed from" : "added to"
        } your wishlist.`,
        variant: isCurrentlyInWishlist ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: (
          <span>
            Please{" "}
            <button
              onClick={() => setLocation("/login/individual")}
              className="underline underline-offset-2 hover:text-white hover:bg-white/20 hover:px-1.5 hover:py-0.5 hover:rounded transition-all duration-200 cursor-pointer font-medium"
            >
              log in
            </button>{" "}
            to add items to your cart.
          </span>
        ),
        variant: "destructive",
      });
      return;
    }

    // Check if this is a clothing item (T-Shirts, Hoodies, or Sweatshirt) that requires size selection
    const isClothingItem = ["T-Shirts", "Hoodies", "Sweatshirt"].includes(
      product.category
    );

    if (isClothingItem) {
      // Redirect to product detail page for size selection
      toast({
        title: "Size Selection Required",
        description: "Please select a size on the product detail page.",
        variant: "default",
      });
      setLocation(`/product/${product.slug || product.id}`);
      return;
    }

    // Check if product has required attributes (size, color, etc.)
    const requiredAttributes =
      product.attributes?.filter(
        (attr) =>
          attr.name.toLowerCase().includes("size") ||
          attr.name.toLowerCase().includes("color") ||
          attr.name.toLowerCase().includes("variant")
      ) || [];

    if (requiredAttributes.length > 0) {
      // Product has required attributes, show attribute selection
      setShowAttributeSelection((prev) => ({ ...prev, [product.id]: true }));
      return;
    }

    try {
      await addToCart({
        id: product.id,
        productId: product.id,
        productSlug: product.slug,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        inStock: true,
        variants: {}, // No variants selected from product listing
      });
      toast({
        title: "Added to Cart 🛒",
        description: `${product.name} has been added to your cart.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAttributeSelect = (
    productId: string,
    attributeName: string,
    value: string
  ) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [attributeName]: value,
      },
    }));
  };

  const handleAddToCartWithAttributes = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: (
          <span>
            Please{" "}
            <button
              onClick={() => setLocation("/login/individual")}
              className="underline underline-offset-2 hover:text-white hover:bg-white/20 hover:px-1.5 hover:py-0.5 hover:rounded transition-all duration-200 cursor-pointer font-medium"
            >
              log in
            </button>{" "}
            to add items to your cart.
          </span>
        ),
        variant: "destructive",
      });
      return;
    }

    const requiredAttributes =
      product.attributes?.filter(
        (attr) =>
          attr.name.toLowerCase().includes("size") ||
          attr.name.toLowerCase().includes("color") ||
          attr.name.toLowerCase().includes("variant")
      ) || [];

    // Check if all required attributes are selected
    const productAttributes = selectedAttributes[product.id] || {};
    const missingAttributes = requiredAttributes.filter(
      (attr) => !productAttributes[attr.name]
    );

    if (missingAttributes.length > 0) {
      toast({
        title: "Selection Required",
        description: `Please select ${missingAttributes
          .map((attr) => attr.name)
          .join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create variant ID with selected attributes
      const variantId = `${product.id}_${Object.entries(productAttributes)
        .map(([key, value]) => `${key}:${value}`)
        .join("|")}`;

      await addToCart({
        id: variantId,
        productId: product.id,
        productSlug: product.slug,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        inStock: true,
        variants: productAttributes,
      });

      toast({
        title: "Added to Cart 🛒",
        description: `${product.name} has been added to your cart.`,
        variant: "default",
      });

      // Hide attribute selection and reset selections
      setShowAttributeSelection((prev) => ({ ...prev, [product.id]: false }));
      setSelectedAttributes((prev) => ({ ...prev, [product.id]: {} }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAttributeSelection = (productId: string) => {
    setShowAttributeSelection((prev) => ({ ...prev, [productId]: false }));
    setSelectedAttributes((prev) => ({ ...prev, [productId]: {} }));
  };

  const handleColorClick = (
    productId: string,
    color: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedProductColors((prev) => {
      const next = { ...prev };
      if (prev[productId] === color) {
        delete next[productId];
      } else {
        next[productId] = color;
      }
      return next;
    });
  };

  const getProductImage = (product: Product): string => {
    const selectedColor = selectedProductColors[product.id];
    if (selectedColor) {
      const colorImage = getImageForColor(product, selectedColor);
      if (colorImage) {
        return colorImage;
      }
    }
    return product.image;
  };

  // Preload all color images for a product
  const preloadProductColorImages = (product: Product) => {
    if (!product.colors || product.colors.length === 0) return;

    product.colors.forEach((color: string) => {
      const imageUrl = getImageForColor(product, color);
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
      }
    });
  };

  const debouncedPriceRange = useDebounce(committedPriceRange, 1000);
  const debouncedRatings = useDebounce(ratings, 1000);

  // Function to update URL with current filter state
  const updateUrl = () => {
    const activeRatings = Object.entries(ratings)
      .filter(([_, isActive]) => isActive)
      .map(([rating, _]) => parseInt(rating));

    const urlParams = buildUrlParams({
      categories: activeCategory,
      minPrice: committedPriceRange[0],
      maxPrice: committedPriceRange[1],
      ratings: activeRatings,
      sortBy,
      page: currentPage,
      includeOutOfStock,
      view,
      searchQuery: activeSearchQuery,
    });

    const newUrl = urlParams ? `?${urlParams}` : "";
    setLocation(`/products${newUrl}`, { replace: true });
  };

  // Initialize state from URL parameters
  useEffect(() => {
    isUpdatingFromUrl.current = true;
    hasInitialized.current = false; // Reset to prevent fetches during URL initialization
    urlInitCompleteRef.current = false; // Reset ref
    setUrlInitComplete(false); // Reset to trigger fetch after initialization
    const urlParams = parseUrlParams(search);

    // Set ratings from URL first
    const newRatings: { [key: number]: boolean } = {
      5: false,
      4: false,
      3: false,
      2: false,
      1: false,
    };
    urlParams.ratings.forEach((rating) => {
      if (rating >= 1 && rating <= 5) {
        newRatings[rating] = true;
      }
    });

    // Update all state variables at once to minimize re-renders
    // Explicitly default includeOutOfStock to false if not in URL
    const includeOutOfStockFromUrl = urlParams.includeOutOfStock;
    setActiveCategory(urlParams.categories);
    setPriceRange([urlParams.minPrice, urlParams.maxPrice]);
    setCommittedPriceRange([urlParams.minPrice, urlParams.maxPrice]);
    setSortBy(urlParams.sortBy);
    setCurrentPage(urlParams.page);
    setIncludeOutOfStock(includeOutOfStockFromUrl); // Will be false if not explicitly "true" in URL
    setView(urlParams.view);
    setRatings(newRatings);
    setSearchQuery(urlParams.searchQuery);
    setActiveSearchQuery(urlParams.searchQuery);

    // Reset the flag after a delay to allow state updates and debounced values to settle
    // Use a longer delay to ensure debounced values have time to stabilize
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
      setUrlInitComplete(true); // Trigger fetch effect by updating state
      // Don't reset hasInitialized here - let the first successful fetch set it to true
    }, 1200); // Wait longer than debounce delay (1000ms) to ensure debounced values have settled
  }, [search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setFeaturedLoading(true);
      try {
        const response = await axios.get(buildApiUrl("/api/featured-products"));
        const mappedFeaturedProducts = response.data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          price: item.price?.toString() || "0",
          rating: item.average_rating ? parseFloat(item.average_rating) : 0,
          reviews: item.rating_count || 0,
          image: getDefaultColorPrimaryImage(item),
          category:
            item.category || item.categories?.[0]?.name || "Uncategorized",
          isNew: false,
          onSale: item.onSale || false,
          attributes: item.attributes || [],
          colors: orderColorsByDefault(
            getAvailableColors(item),
            item.defaultColor
          ),
          defaultColor: item.defaultColor,
          images: item.images || [],
          description: item.description || "",
        }));
        setFeaturedProducts(mappedFeaturedProducts);
      } catch (err) {}
      setFeaturedLoading(false);
    };
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(buildApiUrl("/api/categories"), {
          params: {
            hide_empty: !includeOutOfStock,
          },
        });
        const fetchedCategories = response.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          count: cat.count,
        }));
        setCategories(fetchedCategories);
      } catch (err) {}
    };

    // Debounce the categories fetch to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 300); // Wait 300ms after includeOutOfStock changes

    return () => clearTimeout(timeoutId);
  }, [includeOutOfStock]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Prevent duplicate calls during URL initialization
      // Block ALL fetches while updating from URL, regardless of hasInitialized state
      if (isUpdatingFromUrl.current) {
        return;
      }

      // If URL initialization just completed, we need to fetch
      // But we also need to prevent duplicate fetches from debounced values changing at the same time
      // Use a ref to track if we've already handled the post-init fetch
      if (urlInitComplete && !urlInitCompleteRef.current) {
        urlInitCompleteRef.current = true;
      }

      // Request deduplication: Skip if same params were fetched recently (within 2000ms)
      const fetchParams = JSON.stringify({
        page: currentPage,
        sortBy,
        category: activeCategory.join(","),
        min_price: debouncedPriceRange[0],
        max_price: debouncedPriceRange[1],
        ratings: Object.entries(debouncedRatings)
          .filter(([_, isActive]) => isActive)
          .map(([rating]) => rating),
        includeOutOfStock,
        search: activeSearchQuery.trim(),
      });
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      const paramsMatch = lastFetchParamsRef.current === fetchParams;
      const isDuplicate = paramsMatch && timeSinceLastFetch < 2000;

      if (isDuplicate) {
        return;
      }

      // Update refs IMMEDIATELY before making the call to prevent race conditions
      lastFetchParamsRef.current = fetchParams;
      lastFetchTimeRef.current = now;

      setLoading(true);
      setError(null);
      try {
        let sortParams = {};
        switch (sortBy) {
          case "Price: Low to High":
            sortParams = { orderby: "price-asc" };
            break;
          case "Price: High to Low":
            sortParams = { orderby: "price-desc" };
            break;
          case "Rating: High to Low":
            sortParams = { orderby: "rating" };
            break;
          case "Newest First":
            sortParams = { orderby: "date" };
            break;
          case "Relevance":
          default:
            // No specific sorting, let WooCommerce use default
            break;
        }

        const token = localStorage.getItem("authToken");
        const response = await axios.get(buildApiUrl("/api/products"), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: {
            page: currentPage,
            per_page: pageSize,
            category:
              activeCategory.length > 0 ? activeCategory.join(",") : undefined,
            min_price: debouncedPriceRange[0],
            max_price: debouncedPriceRange[1],
            min_rating:
              Object.entries(debouncedRatings)
                .filter(([_, isActive]) => isActive)
                .map(([rating, _]) => parseInt(rating))
                .sort((a, b) => b - a)[0] || undefined,
            stock_status: includeOutOfStock ? "any" : "instock",
            search: activeSearchQuery.trim() || undefined,
            ...sortParams,
          },
        });

        const { products, totalProducts, totalPages } = response.data;
        const mappedProducts = products
          .filter((item: any) => {
            // If not including out of stock, filter out products that are out of stock
            if (!includeOutOfStock) {
              // Check price (products with no price are typically out of stock)
              const hasValidPrice =
                item.price !== undefined &&
                item.price !== null &&
                item.price !== "" &&
                item.price !== 0;

              if (!hasValidPrice) {
                return false;
              }

              // Check stock status
              // If stock object exists, check its status
              if (item.stock && item.stock.status) {
                // Explicitly check if status is "out_of_stock"
                if (item.stock.status === "out_of_stock") {
                  return false;
                }
                // Allow "in_stock" and "low_stock"
                if (
                  item.stock.status === "in_stock" ||
                  item.stock.status === "low_stock"
                ) {
                  return true;
                }
              }

              // If no stock object or status, assume in stock (for shared_stock items like clothing)
              // This handles clothing items that don't have individual stock tracking
              return true;
            }
            // If including out of stock, allow all
            return true;
          })
          .map((item: any) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            price: item.price?.toString() || "0",
            rating: item.average_rating ? parseFloat(item.average_rating) : 0,
            reviews: item.rating_count || 0,
            image: getDefaultColorPrimaryImage(item),
            category:
              item.category || item.categories?.[0]?.name || "Uncategorized",
            isNew: false,
            onSale: item.onSale || false,
            attributes: item.attributes || [],
            colors: orderColorsByDefault(
              getAvailableColors(item),
              item.defaultColor
            ),
            defaultColor: item.defaultColor,
            images: item.images || [],
            description: item.description || "",
          }));

        setProducts(mappedProducts);
        setTotalProducts(totalProducts);
        setTotalPages(totalPages);
        hasInitialized.current = true;
      } catch (err: any) {
        setError("Failed to load products.");
      }
      setLoading(false);
    };

    fetchProducts();
  }, [
    currentPage,
    sortBy,
    activeCategory,
    pageSize,
    debouncedPriceRange,
    debouncedRatings,
    includeOutOfStock,
    activeSearchQuery,
    urlInitComplete, // Include to trigger fetch after URL init completes
  ]);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
    setCurrentPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setRatings((prev) => ({ ...prev, [rating]: !prev[rating] }));
    setCurrentPage(1);
  };

  // Update URL when filters change (but not when updating from URL)
  useEffect(() => {
    if (!isUpdatingFromUrl.current) {
      updateUrl();
    }
  }, [
    activeCategory,
    committedPriceRange,
    ratings,
    sortBy,
    currentPage,
    includeOutOfStock,
    view,
    activeSearchQuery,
  ]);

  const clearFilters = () => {
    // Check if filters are already in default state
    const isDefaultState =
      activeCategory.length === 0 &&
      priceRange[0] === 0 &&
      priceRange[1] === 10000 &&
      committedPriceRange[0] === 0 &&
      committedPriceRange[1] === 10000 &&
      Object.values(ratings).every((rating) => !rating) &&
      sortBy === "Relevance" &&
      !includeOutOfStock &&
      activeSearchQuery.trim() === "";

    // Only update state if not already in default state
    if (!isDefaultState) {
      setActiveCategory([]);
      setPriceRange([0, 10000]);
      setCommittedPriceRange([0, 10000]);
      setRatings({ 5: false, 4: false, 3: false, 2: false, 1: false });
      setSortBy("Relevance");
      setCurrentPage(1);
      setIncludeOutOfStock(false);
      setView("grid");
      setSearchQuery("");
      setActiveSearchQuery("");
    }
  };

  const scrollToTop = () => {
    // Scroll to the "All Products" section with offset for navigation bar
    const productsSection = document.querySelector(".ProductStart");
    if (productsSection) {
      const navBarHeight = 112;
      const elementTop =
        productsSection.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementTop - navBarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    scrollToTop();
  };

  const firstProductNum =
    totalProducts > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const lastProductNum =
    totalProducts > 0 ? (currentPage - 1) * pageSize + products.length : 0;

  return (
    <div className="products-page pt-28 pb-16 overflow-hidden">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Promotional Banner Carousel */}
        <ProductsBanner />

        {/* Featured Products */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <Award className="text-accent mr-2 h-5 w-5" />
              Featured Products
            </h2>
            <a
              href="#"
              className="text-accent hover:text-accent/80 flex items-center text-sm font-medium"
            >
              View All Featured
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>

          {featuredLoading ? (
            <FeaturedProductsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group flex flex-col"
                >
                  <Link href={`/product/${product.slug || product.id}`}>
                    <div className="w-full flex items-center justify-center">
                      <div className="relative inline-block overflow-hidden">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          loading="lazy"
                          className="w-auto h-auto max-h-80 md:max-h-none max-w-full object-contain group-hover:scale-110 transition-all duration-500"
                        />
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded z-10">
                            NEW
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleWishlistToggle(product);
                          }}
                          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                            isInWishlist(product.id)
                              ? "opacity-100 bg-red-500 text-white"
                              : "opacity-0 group-hover:opacity-100 bg-black/50 text-white hover:bg-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isInWishlist(product.id) ? "fill-current" : ""
                            }`}
                          />
                        </button>
                        {/* Color Palette */}
                        {product.colors && product.colors.length > 1 && (
                          <div
                            className="absolute bottom-2 right-2 flex gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/10 z-10"
                            onMouseEnter={() =>
                              preloadProductColorImages(product)
                            }
                          >
                            {product.colors
                              .slice(0, 4)
                              .map((color: string, idx: number) => (
                                <div
                                  key={`${color}-${idx}`}
                                  onClick={(e) =>
                                    handleColorClick(product.id, color, e)
                                  }
                                  className={`w-4 h-4 rounded-full border cursor-pointer transition-transform duration-200 ${
                                    selectedProductColors[product.id] === color
                                      ? "border-white border-2 shadow-lg scale-110"
                                      : "border-white/30 shadow-sm hover:scale-110"
                                  }`}
                                  style={{
                                    backgroundColor: getColorHex(color),
                                  }}
                                  title={`Show ${color}`}
                                />
                              ))}
                            {product.colors.length > 4 && (
                              <div className="w-4 h-4 rounded-full bg-[#2D2D2D] border border-white/30 flex items-center justify-center text-[10px] text-white font-semibold">
                                +{product.colors.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <Link href={`/product/${product.slug || product.id}`}>
                        <div className="flex flex-col items-start mb-2">
                          <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-accent transition-colors duration-300 mb-1">
                            {product.name}
                          </h3>
                          <span className="font-bold text-accent">
                            ₹{product.price}
                          </span>
                        </div>
                      </Link>
                      <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>{product.rating}</span>
                        </div>
                        <span className="mx-2">•</span>
                        <span>{product.reviews} reviews</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-[#2D2D2D] hover:bg-accent text-white py-1.5 sm:py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm sm:text-base"
                    >
                      <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories & All Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {/* Right Content - All Products */}
          <div className="lg:col-span-4">
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#2D2D2D] mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* Mobile: First row with All Products and Showing count on same line */}
                <div className="flex-1 flex flex-row items-center justify-between sm:flex-row sm:items-center sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
                  <h2 className="text-xl font-bold">All Products</h2>
                  {/* Mobile: Show count on right side */}
                  <div className="text-xs text-gray-400 whitespace-nowrap sm:hidden">
                    {totalProducts > 0
                      ? `Showing ${firstProductNum}–${lastProductNum} of ${totalProducts}`
                      : "0–0 of 0"}
                  </div>
                  {/* Desktop: Show count next to All Products (left side) */}
                  <div className="hidden sm:block text-xs sm:text-sm text-gray-400">
                    {totalProducts > 0
                      ? `Showing ${firstProductNum}–${lastProductNum} of ${totalProducts} products`
                      : "Showing 0–0 of 0 products"}
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sort:</span>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 bg-transparent border-[#444] hover:bg-[#2D2D2D] hover:border-accent/50 text-xs sm:text-sm h-8 min-w-[140px] justify-between"
                        >
                          <span className="truncate">{sortBy}</span>
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1E1E1E] border-[#2D2D2D]">
                        {sortOptions.map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onSelect={() => setSortBy(option)}
                            className="text-gray-300 hover:!bg-[#2D2D2D] hover:!text-white"
                          >
                            {option}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* View toggle - visible on both mobile and desktop */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 hidden sm:inline">
                      View:
                    </span>
                    <button
                      onClick={() => setView("grid")}
                      className={`p-1.5 rounded transition-colors ${
                        view === "grid"
                          ? "bg-accent text-white"
                          : "bg-[#2D2D2D] text-gray-400 hover:bg-[#3D3D3D]"
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`p-1.5 rounded transition-colors ${
                        view === "list"
                          ? "bg-accent text-white"
                          : "bg-[#2D2D2D] text-gray-400 hover:bg-[#3D3D3D]"
                      }`}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sleek Filter Bar */}
              <div className="w-full bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#0D0D0D] rounded-xl p-4 sm:p-5 border border-[#2D2D2D]/50 mb-6 shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
                        <Filter className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-sm font-semibold text-white">
                        Filters
                      </span>
                    </div>
                    {activeCategory.length > 0 ||
                    committedPriceRange[0] !== 0 ||
                    committedPriceRange[1] !== 10000 ||
                    Object.values(ratings).some((r) => r) ||
                    activeSearchQuery.trim() !== "" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs text-gray-400 hover:text-white hover:bg-accent/10 hover:border-accent/30 border border-transparent rounded-md h-7 px-3 transition-all duration-200"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Clear All
                      </Button>
                    ) : null}
                  </div>

                  {/* Filter Controls - Compact Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search Bar */}
                    <div className="relative col-span-2 sm:col-span-2 lg:col-span-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Batch state updates to prevent double fetch
                            // Only update currentPage if it's not already 1
                            const newSearchQuery = e.currentTarget.value;
                            if (currentPage !== 1) {
                              setCurrentPage(1);
                            }
                            setActiveSearchQuery(newSearchQuery);
                            e.currentTarget.blur();
                          }
                        }}
                        className="pl-10 h-10 bg-[#181818]/80 border-[#2D2D2D] text-gray-300 placeholder:text-gray-500 focus:border-accent/50 focus:ring-accent/20 text-sm"
                      />
                    </div>
                    {/* Category Dropdown */}
                    <DropdownMenu 
                      modal={false} 
                      open={categoryDropdownOpen} 
                      onOpenChange={setCategoryDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-between gap-2 bg-[#181818]/80 border-[#2D2D2D] hover:bg-[#2D2D2D] hover:border-accent/50 text-gray-300 hover:text-white text-sm h-10 w-full"
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-accent" />
                            <span className="text-sm">
                              {activeCategory.length > 0
                                ? `${activeCategory.length} Selected`
                                : "Categories"}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-[#1E1E1E] border-[#2D2D2D] p-2 w-[calc(100vw-2rem)] sm:w-64 max-w-sm max-h-[400px] overflow-y-auto"
                        align="start"
                        side="bottom"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-300 px-2 py-1.5">
                            Select Categories
                          </div>
                          {categories
                            .filter((category) => category.count > 0)
                            .map((category) => (
                              <DropdownMenuCheckboxItem
                                key={category.name}
                                checked={activeCategory.includes(category.name)}
                                onCheckedChange={() => {
                                  handleCategoryClick(category.name);
                                }}
                                onSelect={(e) => {
                                  // Prevent dropdown from closing when clicking checkbox
                                  e.preventDefault();
                                }}
                                className="text-sm text-gray-300 hover:bg-[#2D2D2D] hover:text-white focus:bg-[#2D2D2D] focus:text-white cursor-pointer"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{category.name}</span>
                                  <span className="text-xs text-gray-400 ml-2">
                                    ({category.count})
                                  </span>
                                </div>
                              </DropdownMenuCheckboxItem>
                            ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Price Range Dropdown */}
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-between gap-2 bg-[#181818]/80 border-[#2D2D2D] hover:bg-[#2D2D2D] hover:border-accent/50 text-gray-300 hover:text-white text-sm h-10 w-full"
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-accent" />
                            <span className="text-sm truncate">
                              ₹{committedPriceRange[0].toLocaleString()} - ₹
                              {committedPriceRange[1].toLocaleString()}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-[#1E1E1E] border-[#2D2D2D] p-4 w-[calc(100vw-2rem)] sm:w-80 max-w-sm"
                        align="start"
                        side="bottom"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300 font-medium">
                              Price Range
                            </span>
                            <span className="text-xs text-gray-400">
                              ₹{priceRange[0].toLocaleString()} - ₹
                              {priceRange[1].toLocaleString()}
                            </span>
                          </div>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            onValueCommit={setCommittedPriceRange}
                            min={0}
                            max={10000}
                            step={500}
                            minStepsBetweenThumbs={1}
                            className="w-full"
                          />
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Rating Filter Dropdown */}
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-between gap-2 bg-[#181818]/80 border-[#2D2D2D] hover:bg-[#2D2D2D] hover:border-accent/50 text-gray-300 hover:text-white text-sm h-10 w-full"
                        >
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-accent" />
                            <span className="text-sm truncate">
                              {Object.entries(ratings)
                                .filter(([_, isActive]) => isActive)
                                .map(([rating, _]) => `${rating}+`)
                                .join(", ") || "Rating"}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-[#1E1E1E] border-[#2D2D2D] p-3 w-[calc(100vw-2rem)] sm:w-56 max-w-xs"
                        align="start"
                        side="bottom"
                      >
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-300 mb-2">
                            Minimum Rating
                          </div>
                          {[4, 3, 2, 1].map((rating) => (
                            <label
                              key={rating}
                              className="flex items-center cursor-pointer group touch-manipulation py-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={ratings[rating]}
                                onChange={() => handleRatingChange(rating)}
                                className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent focus:ring-opacity-25 bg-gray-800"
                              />
                              <div className="flex items-center ml-3 group-hover:text-accent transition-colors duration-200">
                                <div className="flex">
                                  {Array(rating)
                                    .fill(0)
                                    .map((_, i) => (
                                      <Star
                                        key={i}
                                        className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"
                                      />
                                    ))}
                                </div>
                                <span className="ml-2 text-xs text-gray-400 group-hover:text-accent">
                                  & up
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Availability Checkbox */}
                    <label className="flex items-center cursor-pointer group h-10 px-3 rounded-lg border border-[#2D2D2D] bg-[#181818]/80 hover:bg-[#2D2D2D] hover:border-accent/50 transition-all duration-200 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={includeOutOfStock}
                        onChange={() => {
                          setIncludeOutOfStock((prev) => !prev);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent focus:ring-opacity-25 bg-gray-800 shrink-0"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-300 group-hover:text-white">
                        <CheckSquare className="h-3.5 w-3.5 inline mr-1.5 text-accent" />
                        Out of Stock
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="ProductStart border-t border-[#2D2D2D] pt-6">
              {/* No Results Message */}
              {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-24 h-24 bg-[#2D2D2D] rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-400 text-center max-w-md mb-6">
                    {activeCategory.length > 0 ||
                    committedPriceRange[0] !== 0 ||
                    committedPriceRange[1] !== 10000 ||
                    Object.values(ratings).some((r) => r) ||
                    activeSearchQuery.trim() !== ""
                      ? "We couldn't find any products matching your filters. Try adjusting your search criteria or clearing some filters."
                      : "There are currently no products available."}
                  </p>
                  {(activeCategory.length > 0 ||
                    committedPriceRange[0] !== 0 ||
                    committedPriceRange[1] !== 10000 ||
                    Object.values(ratings).some((r) => r) ||
                    activeSearchQuery.trim() !== "") && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={clearFilters}
                        className="bg-accent hover:bg-accent/80 text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="border-[#444] text-gray-300 hover:bg-[#2D2D2D] hover:text-white"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Clear Search
                      </Button>
                    </div>
                  )}
                  {/* Show active filters */}
                  {(activeCategory.length > 0 ||
                    committedPriceRange[0] !== 0 ||
                    committedPriceRange[1] !== 10000 ||
                    Object.values(ratings).some((r) => r) ||
                    activeSearchQuery.trim() !== "") && (
                    <div className="mt-8 w-full max-w-2xl">
                      <p className="text-sm text-gray-400 mb-3 text-center">
                        Active Filters:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {activeSearchQuery.trim() && (
                          <div className="bg-[#2D2D2D] border border-[#444] rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <Search className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-300">
                              Search: "{activeSearchQuery}"
                            </span>
                          </div>
                        )}
                        {activeCategory.map((cat) => (
                          <div
                            key={cat}
                            className="bg-[#2D2D2D] border border-[#444] rounded-lg px-3 py-1.5 flex items-center gap-2"
                          >
                            <Folder className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-300">{cat}</span>
                          </div>
                        ))}
                        {(committedPriceRange[0] !== 0 ||
                          committedPriceRange[1] !== 10000) && (
                          <div className="bg-[#2D2D2D] border border-[#444] rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-300">
                              ₹{committedPriceRange[0].toLocaleString()} - ₹
                              {committedPriceRange[1].toLocaleString()}
                            </span>
                          </div>
                        )}
                        {Object.entries(ratings)
                          .filter(([_, isActive]) => isActive)
                          .map(([rating, _]) => (
                            <div
                              key={rating}
                              className="bg-[#2D2D2D] border border-[#444] rounded-lg px-3 py-1.5 flex items-center gap-2"
                            >
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm text-gray-300">
                                {rating}+ Stars
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                      : "space-y-4 sm:space-y-6"
                  }
                >
                  {Array.from({ length: pageSize }, (_, i) => (
                    <ProductSkeleton key={i} view={view} />
                  ))}
                </div>
              )}

              {/* Grid View */}
              {!loading && products.length > 0 && view === "grid" && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {products.map((product) => (
                        <div
                          key={product.id}
                          className="relative bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group flex flex-col"
                        >
                          <Link href={`/product/${product.slug || product.id}`}>
                            <div className="w-full flex items-center justify-center">
                              <div className="relative inline-block overflow-hidden">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  loading="lazy"
                                  className="w-auto h-auto max-h-80 md:max-h-none max-w-full object-contain group-hover:scale-110 transition-all duration-500"
                                />
                                {product.isNew && (
                                  <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded z-10">
                                    NEW
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleWishlistToggle(product);
                                  }}
                                  className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                                    isInWishlist(product.id)
                                      ? "opacity-100 bg-red-500 text-white"
                                      : "opacity-0 group-hover:opacity-100 bg-black/50 text-white hover:bg-red-500"
                                  }`}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      isInWishlist(product.id)
                                        ? "fill-current"
                                        : ""
                                    }`}
                                  />
                                </button>
                                {/* Color Palette */}
                                {product.colors &&
                                  product.colors.length > 1 && (
                                    <div
                                      className="absolute bottom-2 right-2 flex gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1.5 transition-opacity duration-300 z-10"
                                      onMouseEnter={() =>
                                        preloadProductColorImages(product)
                                      }
                                    >
                                      {product.colors
                                        .slice(0, 4)
                                        .map((color: string, idx: number) => (
                                          <div
                                            key={`${color}-${idx}`}
                                            onClick={(e) =>
                                              handleColorClick(
                                                product.id,
                                                color,
                                                e
                                              )
                                            }
                                            className={`w-4 h-4 rounded-full border cursor-pointer transition-transform duration-200 ${
                                              selectedProductColors[
                                                product.id
                                              ] === color
                                                ? "border-white border-2 shadow-lg scale-110"
                                                : "border-white/30 shadow-sm hover:scale-110"
                                            }`}
                                            style={{
                                              backgroundColor:
                                                getColorHex(color),
                                            }}
                                            title={color}
                                          />
                                        ))}
                                      {product.colors.length > 4 && (
                                        <div className="w-4 h-4 rounded-full bg-[#2D2D2D] border border-white/30 flex items-center justify-center text-[10px] text-white font-semibold">
                                          +{product.colors.length - 4}
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </Link>
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <div className="flex-grow">
                              <Link
                                href={`/product/${product.slug || product.id}`}
                              >
                                <div className="flex flex-col items-start mb-2">
                                  <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-accent transition-colors duration-300 mb-1">
                                    {product.name}
                                  </h3>
                                  <span className="font-bold text-accent">
                                    ₹{product.price}
                                  </span>
                                </div>
                              </Link>
                              <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                  <span>{product.rating}</span>
                                </div>
                                <span className="mx-2">•</span>
                                <span>{product.reviews} reviews</span>
                              </div>
                            </div>

                            <div className="relative">
                              {showAttributeSelection[product.id] ? (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, y: -10 }}
                                  animate={{ opacity: 1, height: "auto", y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0, 0.2, 1],
                                  }}
                                  className="absolute top-full left-0 right-0 z-30 bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] border border-accent/60 rounded-xl shadow-2xl backdrop-blur-sm p-5 space-y-4 mt-2"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                      Select Options
                                    </h4>
                                    <button
                                      onClick={() =>
                                        handleCancelAttributeSelection(
                                          product.id
                                        )
                                      }
                                      className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-accent/20"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  {product.attributes
                                    ?.filter(
                                      (attr) =>
                                        attr.name
                                          .toLowerCase()
                                          .includes("size") ||
                                        attr.name
                                          .toLowerCase()
                                          .includes("color") ||
                                        attr.name
                                          .toLowerCase()
                                          .includes("variant")
                                    )
                                    .map((attr) => (
                                      <div
                                        key={attr.name}
                                        className="space-y-2"
                                      >
                                        <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                          {attr.name
                                            .toLowerCase()
                                            .includes("size") && (
                                            <svg
                                              className="w-4 h-4 text-accent"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                              />
                                            </svg>
                                          )}
                                          {attr.name
                                            .toLowerCase()
                                            .includes("color") && (
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
                                          )}
                                          {attr.name}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                          {attr.options.map((option) => (
                                            <button
                                              key={option}
                                              onClick={() =>
                                                handleAttributeSelect(
                                                  product.id,
                                                  attr.name,
                                                  option
                                                )
                                              }
                                              className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                                                selectedAttributes[
                                                  product.id
                                                ]?.[attr.name] === option
                                                  ? "bg-gradient-to-r from-accent to-accent/80 text-white border-accent shadow-lg shadow-accent/30 scale-105 ring-2 ring-accent/20"
                                                  : "bg-[#1A1A1A] text-gray-200 border-[#333] hover:border-accent/60 hover:bg-[#2A2A2A] hover:text-white hover:scale-105 hover:shadow-md hover:shadow-accent/10"
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  <div className="flex gap-3 pt-3 border-t border-accent/20">
                                    <button
                                      onClick={() =>
                                        handleAddToCartWithAttributes(product)
                                      }
                                      className="flex-1 bg-gradient-to-r from-accent via-accent/90 to-accent/80 hover:from-accent/95 hover:via-accent/85 hover:to-accent/75 text-white py-3 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                      <ShoppingBag className="w-4 h-4" />
                                      Add to Cart
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="w-full bg-[#2D2D2D] hover:bg-accent text-white py-1.5 sm:py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm sm:text-base"
                                >
                                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              )}

              {/* List View */}
              {!loading && products.length > 0 && view === "list" && (
                <div className="space-y-4 sm:space-y-6">
                  {products.map((product) => (
                        <div
                          key={product.id}
                          className="relative flex flex-col md:flex-row bg-[#1E1E1E] rounded-lg overflow-visible border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group"
                        >
                          <Link
                            href={`/product/${product.slug || product.id}`}
                            className="md:w-48 aspect-[3/4] md:aspect-auto md:h-48 overflow-hidden relative cursor-pointer bg-[#1E1E1E] flex items-center justify-center"
                          >
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-contain group-hover:scale-110 transition-all duration-500"
                            />
                            {product.isNew && (
                              <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                                NEW
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleWishlistToggle(product);
                              }}
                              className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                                isInWishlist(product.id)
                                  ? "opacity-100 bg-red-500 text-white"
                                  : "opacity-0 group-hover:opacity-100 bg-black/50 text-white hover:bg-red-500"
                              }`}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  isInWishlist(product.id) ? "fill-current" : ""
                                }`}
                              />
                            </button>
                            {/* Color Palette */}
                            {product.colors && product.colors.length > 1 && (
                              <div
                                className="absolute bottom-2 right-2 flex gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1.5 transition-opacity duration-300"
                                onMouseEnter={() =>
                                  preloadProductColorImages(product)
                                }
                              >
                                {product.colors
                                  .slice(0, 4)
                                  .map((color: string, idx: number) => (
                                    <div
                                      key={`${color}-${idx}`}
                                      onClick={(e) =>
                                        handleColorClick(product.id, color, e)
                                      }
                                      className={`w-4 h-4 rounded-full border cursor-pointer transition-transform duration-200 ${
                                        selectedProductColors[product.id] ===
                                        color
                                          ? "border-white border-2 shadow-lg scale-110"
                                          : "border-white/30 shadow-sm hover:scale-110"
                                      }`}
                                      style={{
                                        backgroundColor: getColorHex(color),
                                      }}
                                      title={color}
                                    />
                                  ))}
                                {product.colors.length > 4 && (
                                  <div className="w-4 h-4 rounded-full bg-[#2D2D2D] border border-white/30 flex items-center justify-center text-[10px] text-white font-semibold">
                                    +{product.colors.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </Link>
                          <div className="md:w-3/4 p-6 flex flex-col">
                            <div className="flex flex-col items-start mb-2">
                              <h3 className="text-xl font-semibold text-white group-hover:text-accent transition-colors duration-300 mb-1">
                                {product.name}
                              </h3>
                              <span className="font-bold text-xl text-accent">
                                ₹{product.price}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400 mb-4">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                <span>{product.rating}</span>
                              </div>
                              <span className="mx-2">•</span>
                              <span>{product.reviews} reviews</span>
                              <span className="mx-2">•</span>
                              <span className="text-gray-500">
                                {product.category}
                              </span>
                            </div>
                            <p className="text-gray-400 mb-4 flex-grow line-clamp-3">
                              {stripHtml(product.description) ||
                                `Premium quality ${product.category.toLowerCase()} featuring your favorite anime characters. Officially licensed merchandise with the best quality and authentic designs.`}
                            </p>
                            <div className="relative flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                              {showAttributeSelection[product.id] ? (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, y: -10 }}
                                  animate={{ opacity: 1, height: "auto", y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0, 0.2, 1],
                                  }}
                                  className="absolute top-full left-0 right-0 z-30 bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] border border-accent/60 rounded-xl shadow-2xl backdrop-blur-sm p-5 space-y-4 mt-2"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                      Select Options
                                    </h4>
                                    <button
                                      onClick={() =>
                                        handleCancelAttributeSelection(
                                          product.id
                                        )
                                      }
                                      className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-accent/20"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  {product.attributes
                                    ?.filter(
                                      (attr) =>
                                        attr.name
                                          .toLowerCase()
                                          .includes("size") ||
                                        attr.name
                                          .toLowerCase()
                                          .includes("color") ||
                                        attr.name
                                          .toLowerCase()
                                          .includes("variant")
                                    )
                                    .map((attr) => (
                                      <div
                                        key={attr.name}
                                        className="space-y-2"
                                      >
                                        <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                          {attr.name
                                            .toLowerCase()
                                            .includes("size") && (
                                            <svg
                                              className="w-4 h-4 text-accent"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                              />
                                            </svg>
                                          )}
                                          {attr.name
                                            .toLowerCase()
                                            .includes("color") && (
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
                                          )}
                                          {attr.name}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                          {attr.options.map((option) => (
                                            <button
                                              key={option}
                                              onClick={() =>
                                                handleAttributeSelect(
                                                  product.id,
                                                  attr.name,
                                                  option
                                                )
                                              }
                                              className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                                                selectedAttributes[
                                                  product.id
                                                ]?.[attr.name] === option
                                                  ? "bg-gradient-to-r from-accent to-accent/80 text-white border-accent shadow-lg shadow-accent/30 scale-105 ring-2 ring-accent/20"
                                                  : "bg-[#1A1A1A] text-gray-200 border-[#333] hover:border-accent/60 hover:bg-[#2A2A2A] hover:text-white hover:scale-105 hover:shadow-md hover:shadow-accent/10"
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  <div className="flex gap-3 pt-3 border-t border-accent/20">
                                    <button
                                      onClick={() =>
                                        handleAddToCartWithAttributes(product)
                                      }
                                      className="flex-1 bg-gradient-to-r from-accent via-accent/90 to-accent/80 hover:from-accent/95 hover:via-accent/85 hover:to-accent/75 text-white py-3 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                      <ShoppingBag className="w-4 h-4" />
                                      Add to Cart
                                    </button>
                                  </div>
                                </motion.div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="bg-[#2D2D2D] hover:bg-accent text-white px-6 py-2 rounded flex items-center justify-center transition-colors duration-300"
                                >
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </div>

            {/* Pagination - Only show if there are products */}
            {!loading && products.length > 0 && totalPages > 0 && (
            <div className="flex justify-center mt-8 mb-8">
              <div className="flex space-x-1">
                <button
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                  disabled={currentPage === 1 || totalPages === 0}
                    className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center text-gray-400 hover:bg-[#3D3D3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronRight className="h-4 w-4 transform rotate-180" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded ${
                        page === currentPage
                          ? "bg-accent text-white"
                          : "bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]"
                      } flex items-center justify-center transition-colors`}
                      aria-label={`Page ${page}`}
                        aria-current={
                          page === currentPage ? "page" : undefined
                        }
                      disabled={totalPages === 0}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                    className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center text-gray-400 hover:bg-[#3D3D3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      <FAQSection />
    </div>
  );
};

export default ProductsPage;
