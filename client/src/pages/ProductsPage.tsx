import axios from "axios";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";
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
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

type Product = {
  id: string;
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
  images?: Array<{ src: string; color?: string | null }>;
  description?: string;
  shortDescription?: string;
};

// Helper function to get the default color's primary image
const getDefaultColorPrimaryImage = (item: any): string => {
  if (!item.images || item.images.length === 0) return "";

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

  // Fallback to any primary image
  const anyPrimary = item.images.find(
    (img: any) => img.isPrimaryForColor === true
  );
  if (anyPrimary) return anyPrimary.src || anyPrimary.url || "";

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
  const [includeOutOfStock, setIncludeOutOfStock] = useState(true); // Default true for print-on-demand
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [productId: string]: { [attributeName: string]: string };
  }>({});
  const [showAttributeSelection, setShowAttributeSelection] = useState<{
    [productId: string]: boolean;
  }>({});
  const pageSize = 12;
  const isUpdatingFromUrl = useRef(false);
  const hasInitialized = useRef(false);

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
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a clothing item (T-Shirts or Hoodies) that requires size selection
    const isClothingItem = ["T-Shirts", "Hoodies"].includes(product.category);

    if (isClothingItem) {
      // Redirect to product detail page for size selection
      toast({
        title: "Size Selection Required",
        description: "Please select a size on the product detail page.",
        variant: "default",
      });
      setLocation(`/product/${product.id}`);
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
        description: "Please log in to add items to your cart.",
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
    });

    const newUrl = urlParams ? `?${urlParams}` : "";
    setLocation(`/products${newUrl}`, { replace: true });
  };

  // Initialize state from URL parameters
  useEffect(() => {
    isUpdatingFromUrl.current = true;
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
    setActiveCategory(urlParams.categories);
    setPriceRange([urlParams.minPrice, urlParams.maxPrice]);
    setCommittedPriceRange([urlParams.minPrice, urlParams.maxPrice]);
    setSortBy(urlParams.sortBy);
    setCurrentPage(urlParams.page);
    setIncludeOutOfStock(urlParams.includeOutOfStock);
    setView(urlParams.view);
    setRatings(newRatings);

    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
      hasInitialized.current = false; // Reset initialization flag
    }, 100);
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
          colors: getAvailableColors(item),
          images: item.images || [],
          description: item.description || "",
          shortDescription: item.shortDescription || "",
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
      if (isUpdatingFromUrl.current && !hasInitialized.current) {
        return;
      }

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

        const response = await axios.get(buildApiUrl("/api/products"), {
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
            ...sortParams,
          },
        });

        const { products, totalProducts, totalPages } = response.data;
        const mappedProducts = products
          .filter((item: any) => {
            // If not including out of stock, filter out products with empty price (out of stock)
            if (!includeOutOfStock) {
              return (
                item.price !== undefined &&
                item.price !== null &&
                item.price !== "" &&
                item.price !== 0
              );
            }
            // If including out of stock, allow all
            return true;
          })
          .map((item: any) => ({
            id: item.id,
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
            colors: getAvailableColors(item),
            images: item.images || [],
            description: item.description || "",
            shortDescription: item.shortDescription || "",
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
      !includeOutOfStock;

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
                  <Link href={`/product/${product.id}`}>
                    <div className="h-48 sm:h-56 md:h-64 overflow-hidden relative cursor-pointer">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-all duration-500"
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
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                          isInWishlist(product.id)
                            ? "bg-red-500 text-white"
                            : "bg-black/50 text-white hover:bg-red-500"
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
                        <div className="absolute bottom-2 right-2 flex gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/10 z-10">
                          {product.colors
                            .slice(0, 4)
                            .map((color: string, idx: number) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-white/30 shadow-sm hover:scale-110 transition-transform duration-200"
                                style={{ backgroundColor: getColorHex(color) }}
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
                  </Link>
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <Link href={`/product/${product.id}`}>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Products</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">View:</span>
                  <button
                    onClick={() => setView("grid")}
                    className={`p-1 rounded ${
                      view === "grid"
                        ? "bg-accent text-white"
                        : "bg-[#2D2D2D] text-gray-400"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-1 rounded ${
                      view === "list"
                        ? "bg-accent text-white"
                        : "bg-[#2D2D2D] text-gray-400"
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 border-b border-[#2D2D2D] py-4">
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent border-[#444] hover:bg-[#2D2D2D] hover:border-accent/50"
                      >
                        Sort By: {sortBy}
                        <ChevronDown className="h-4 w-4" />
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
                <div className="text-sm text-gray-400">
                  {totalProducts > 0
                    ? `Showing ${firstProductNum}–${lastProductNum} of ${totalProducts} products`
                    : "Showing 0–0 of 0 products"}
                </div>
              </div>

              {/* Horizontal Filter Bar */}
              <div className="w-full bg-gradient-to-r from-[#1A1A1A] to-[#0D0D0D] rounded-xl p-6 border border-[#2D2D2D] mb-8 shadow-lg">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Filter className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Filter Products
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-white bg-accent/10 border-accent hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Filter Content */}
                <div className="space-y-6">
                  {/* Categories Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-accent" />
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categories
                        .filter((category) => category.count > 0)
                        .map((category) => (
                          <button
                            key={category.name}
                            onClick={() => handleCategoryClick(category.name)}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium ${
                              activeCategory.includes(category.name)
                                ? "bg-accent text-white border-accent shadow-lg shadow-accent/25"
                                : "bg-[#181818] text-gray-300 border-[#2D2D2D] hover:bg-accent/10 hover:text-accent hover:border-accent/50"
                            }`}
                          >
                            {category.name}
                            <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                              {category.count}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-accent" />
                      Availability
                    </h4>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={includeOutOfStock}
                        onChange={() => {
                          setIncludeOutOfStock((prev) => !prev);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-gray-600 text-accent focus:ring-accent focus:ring-opacity-25 bg-gray-800"
                      />
                      <span className="ml-3 text-sm text-gray-300 group-hover:text-accent">
                        Include Out of Stock
                      </span>
                    </label>
                  </div>

                  {/* Price and Rating Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price Range */}
                    <div className="bg-[#181818] rounded-lg p-4 border border-[#2D2D2D]">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-accent" />
                        Price Range
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            ₹{priceRange[0].toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400">
                            ₹{priceRange[1].toLocaleString()}
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
                    </div>

                    {/* Rating Filter */}
                    <div className="bg-[#181818] rounded-lg p-4 border border-[#2D2D2D]">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" />
                        Rating Filter
                      </h4>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                          <label
                            key={rating}
                            className="flex items-center cursor-pointer group"
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
                                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                                    />
                                  ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-400 group-hover:text-accent">
                                & up
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ProductStart border-t border-[#2D2D2D] pt-6">
              {/* Grid View */}
              {view === "grid" && (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {loading
                    ? Array.from({ length: pageSize }, (_, i) => (
                        <ProductSkeleton key={i} view="grid" />
                      ))
                    : products.map((product) => (
                        <div
                          key={product.id}
                          className="relative bg-[#1E1E1E] rounded-lg overflow-visible border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group flex flex-col"
                        >
                          <Link href={`/product/${product.id}`}>
                            <div className="h-48 sm:h-56 md:h-64 overflow-hidden relative cursor-pointer">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-all duration-500"
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
                                className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                                  isInWishlist(product.id)
                                    ? "bg-red-500 text-white"
                                    : "bg-black/50 text-white hover:bg-red-500"
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
                              {product.colors && product.colors.length > 1 && (
                                <div className="absolute bottom-2 right-2 flex gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {product.colors
                                    .slice(0, 4)
                                    .map((color: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
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
                            </div>
                          </Link>
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <div className="flex-grow">
                              <Link href={`/product/${product.id}`}>
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
              {view === "list" && (
                <div className="space-y-4 sm:space-y-6">
                  {loading
                    ? Array.from({ length: pageSize }, (_, i) => (
                        <ProductSkeleton key={i} view="list" />
                      ))
                    : products.map((product) => (
                        <div
                          key={product.id}
                          className="relative flex flex-col md:flex-row bg-[#1E1E1E] rounded-lg overflow-visible border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group"
                        >
                          <Link
                            href={`/product/${product.id}`}
                            className="md:w-1/4 h-48 md:h-auto overflow-hidden relative cursor-pointer"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
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
                              className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                                isInWishlist(product.id)
                                  ? "bg-red-500 text-white"
                                  : "bg-black/50 text-white hover:bg-red-500"
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
                              <div className="absolute bottom-2 right-2 flex gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {product.colors
                                  .slice(0, 4)
                                  .map((color: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
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
                            <p className="text-gray-400 mb-4 flex-grow">
                              {product.shortDescription ||
                                product.description ||
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

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1 || totalPages === 0}
                  className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center text-gray-400 hover:bg-[#3D3D3D] transition-colors"
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
                      aria-current={page === currentPage ? "page" : undefined}
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
                  className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center text-gray-400 hover:bg-[#3D3D3D] transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FAQSection />
      <CTASection />
    </div>
  );
};

export default ProductsPage;
