import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import { useRoute } from "wouter";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Package,
  RotateCcw,
  Truck,
  Clock,
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";
import { useWishlist } from "@/lib/WishlistContext.tsx";
import { useCart } from "@/lib/CartContext.tsx";
import { useAuth } from "@/lib/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast.ts";

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
  description?: string;
  attributes?: { name: string; options: string[] }[];
  sizes?: string[];
  colors?: string[];
  images?: { src: string }[];
  variations?: any[]; // WooCommerce variations
  stock_status?: string;
  deliveryInfo?: string;
  returnPolicy?: string;
  specifications?: { [key: string]: string };
  average_rating: string;
  rating_count: number;
  categories: { name: string }[];
  stock_quantity: null | number;
};

const ProductDetailPage = () => {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [colorImages, setColorImages] = useState<{ [key: string]: string }>({});
  const [stockData, setStockData] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);

  // Wishlist functionality
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        buildApiUrl(`/api/products/${productId}`)
      );
      const data = response.data;

      // Transform MongoDB product to match frontend expectations
      const transformedProduct = {
        ...data,
        price: data.price?.toString() || "0",
        salePrice:
          data.salePrice !== undefined && data.salePrice !== null
            ? data.salePrice.toString()
            : undefined,
        regularPrice:
          data.regularPrice !== undefined && data.regularPrice !== null
            ? data.regularPrice.toString()
            : undefined,
        stock_status:
          data.stock?.status === "in_stock" ||
          data.stock?.status === "low_stock"
            ? "instock"
            : "outofstock",
        average_rating: data.average_rating || "0",
        rating_count: data.rating_count || 0,
        categories: data.categories || [
          { name: data.category || "Uncategorized" },
        ],
      };

      setProduct(transformedProduct);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("This product is no longer available.");
      } else {
        setError("Failed to fetch product details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    setStockLoading(true);
    try {
      const response = await axios.get(buildApiUrl("/api/stock-data"));
      setStockData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchStockData(); // Fetch stock data for clothing items
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [productId]);

  // Reset image index when product changes
  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setActiveImage(0);
      setSelectedVariants({});
      setImageLoading(false);
      setColorImages({});
    }
  }, [product]);

  if (loading) {
    return (
      <div className="pt-28 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 pb-16 text-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const {
    name,
    price,
    description,
    images,
    average_rating,
    rating_count,
    stock_status,
    categories,
    attributes,
  } = product;

  const hasValidSale =
    product &&
    product.salePrice &&
    product.regularPrice &&
    Number(product.salePrice) < Number(product.regularPrice);

  // Function to check if a size-color combination is available
  const isSizeColorAvailable = (size: string, color: string): boolean => {
    if (!stockData) return true; // Default to available if no stock data
    const key = `${size}-${color}`;
    return stockData.stock[key]?.available || false;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-400"
            }`}
          />
        ))}
      </div>
    );
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleVariantChange = (attributeName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [attributeName]: option,
    }));

    // Handle color change to update product image
    if (attributeName.toLowerCase().includes("color") && product?.images) {
      setImageLoading(true);

      // First, try to find image from variations
      const variationImage = findImageFromVariations(option);
      if (variationImage) {
        setColorImages((prev) => ({ ...prev, [option]: variationImage }));
        setCurrentImageIndex(-1);
        setActiveImage(-1);
      } else {
        // Try to find an image that matches the selected color
        const colorImageIndex = findImageForColor(option, product.images);

        if (colorImageIndex !== -1 && colorImageIndex !== currentImageIndex) {
          setCurrentImageIndex(colorImageIndex);
          setActiveImage(colorImageIndex);
        } else {
          // Try to generate a color-specific image URL
          if (product.images && product.images.length > 0) {
            const baseImageUrl = product.images[0].src;
            const colorImageUrl = generateColorImageUrl(baseImageUrl, option);
            setColorImages((prev) => ({ ...prev, [option]: colorImageUrl }));
            setCurrentImageIndex(-1);
            setActiveImage(-1);
          } else {
            // Fallback: cycle to next image
            const nextIndex = (currentImageIndex + 1) % product.images.length;
            setCurrentImageIndex(nextIndex);
            setActiveImage(nextIndex);
          }
        }
      }

      // Reset loading state after a short delay
      setTimeout(() => setImageLoading(false), 300);
    }
  };

  // Function to get a fallback index for colors when no filename match is found
  const getColorIndex = (color: string): number => {
    const colorOrder = [
      "black",
      "white",
      "red",
      "blue",
      "green",
      "yellow",
      "pink",
      "purple",
      "orange",
      "gray",
      "brown",
      "navy",
      "beige",
      "cream",
      "maroon",
      "teal",
    ];
    return colorOrder.indexOf(color);
  };

  // Function to get color value for color swatches
  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#22c55e",
      black: "#000000",
      white: "#ffffff",
      yellow: "#eab308",
      pink: "#ec4899",
      purple: "#a855f7",
      orange: "#f97316",
      gray: "#6b7280",
      grey: "#6b7280",
      navy: "#1e3a8a",
      brown: "#a3a3a3",
      beige: "#f5f5dc",
      cream: "#f5f5dc",
      maroon: "#800000",
      teal: "#14b8a6",
      cyan: "#06b6d4",
      lime: "#84cc16",
      indigo: "#6366f1",
      violet: "#8b5cf6",
      magenta: "#d946ef",
      coral: "#ff7f50",
      gold: "#fbbf24",
      silver: "#9ca3af",
      bronze: "#cd7f32",
      copper: "#b87333",
    };

    const normalizedColor = colorName.toLowerCase().trim();
    return colorMap[normalizedColor] || "#6b7280"; // Default to gray if color not found
  };

  // Function to generate color-specific image URL
  const generateColorImageUrl = (
    baseImageUrl: string,
    color: string
  ): string => {
    const colorLower = color.toLowerCase().trim();
    const baseUrl = baseImageUrl.split("?")[0]; // Remove query parameters

    // Try different patterns
    const patterns = [
      `${baseUrl}?color=${colorLower}`,
      `${baseUrl}?variant=${colorLower}`,
      `${baseUrl}_${colorLower}`,
      `${baseUrl}-${colorLower}`,
      baseUrl.replace(/(\.[^.]+)$/, `_${colorLower}$1`),
      baseUrl.replace(/(\.[^.]+)$/, `-${colorLower}$1`),
    ];

    return patterns[0]; // Return the first pattern as default
  };

  // Function to find image from variations
  const findImageFromVariations = (color: string): string | null => {
    if (!product?.variations) return null;

    const colorLower = color.toLowerCase().trim();

    for (const variation of product.variations) {
      // Check if this variation has the selected color
      if (variation.attributes) {
        for (const attr of variation.attributes) {
          if (
            attr.name.toLowerCase().includes("color") &&
            attr.option.toLowerCase().includes(colorLower)
          ) {
            // Check if variation has images
            if (variation.image && variation.image.src) {
              return variation.image.src;
            }
          }
        }
      }
    }

    return null;
  };

  // Function to find the best matching image for a color
  const findImageForColor = (
    color: string,
    images: { src: string }[]
  ): number => {
    if (!images || images.length === 0) return 0;

    const colorLower = color.toLowerCase().trim();

    // First, try to find an image with the exact color in the filename
    for (let i = 0; i < images.length; i++) {
      const imageSrc = images[i].src.toLowerCase();
      if (imageSrc.includes(colorLower)) {
        return i;
      }
    }

    // If no exact match, try common color variations and synonyms
    const colorVariations: { [key: string]: string[] } = {
      red: ["red", "crimson", "scarlet", "burgundy", "cherry", "ruby"],
      blue: ["blue", "navy", "royal", "sky", "azure", "cobalt"],
      green: ["green", "emerald", "forest", "lime", "mint", "sage"],
      black: ["black", "dark", "charcoal", "ebony", "jet", "onyx"],
      white: ["white", "cream", "ivory", "pearl", "snow", "bone"],
      yellow: ["yellow", "gold", "amber", "lemon", "canary", "mustard"],
      pink: ["pink", "rose", "magenta", "coral", "salmon", "fuchsia"],
      purple: ["purple", "violet", "lavender", "plum", "mauve", "lilac"],
      orange: ["orange", "tangerine", "peach", "apricot", "pumpkin", "carrot"],
      gray: ["gray", "grey", "silver", "ash", "slate", "pewter"],
      brown: ["brown", "tan", "beige", "coffee", "chocolate", "mocha"],
    };

    const variations = colorVariations[colorLower] || [colorLower];

    // Try each variation
    for (const variation of variations) {
      for (let i = 0; i < images.length; i++) {
        const imageSrc = images[i].src.toLowerCase();
        if (imageSrc.includes(variation)) {
          return i;
        }
      }
    }

    // Try partial matches (e.g., "dark blue" should match "blue")
    for (let i = 0; i < images.length; i++) {
      const imageSrc = images[i].src.toLowerCase();
      if (
        colorLower
          .split(" ")
          .some((word) => word.length > 2 && imageSrc.includes(word))
      ) {
        return i;
      }
    }

    // If still no match, try to cycle through images based on color selection
    const colorIndex = getColorIndex(colorLower);
    if (colorIndex !== -1 && colorIndex < images.length) {
      return colorIndex;
    }

    // If still no match, return the first image
    return 0;
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      const isCurrentlyInWishlist = isInWishlist(product.id);

      await addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.src || "",
        category: product.categories?.[0]?.name || "Uncategorized",
        rating: parseFloat(product.average_rating) || 0,
        reviews: product.rating_count || 0,
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

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if all required variants are selected
    const requiredAttributes =
      product.attributes?.filter(
        (attr) =>
          attr.name.toLowerCase().includes("size") ||
          attr.name.toLowerCase().includes("color") ||
          attr.name.toLowerCase().includes("variant")
      ) || [];

    const missingVariants = requiredAttributes.filter(
      (attr) => !selectedVariants[attr.name]
    );

    if (missingVariants.length > 0) {
      toast({
        title: "Please Select Options",
        description: `Please select ${missingVariants
          .map((attr) => attr.name)
          .join(", ")} before adding to cart.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a unique cart item ID that includes variants
      const variantString = Object.entries(selectedVariants)
        .map(([key, value]) => `${key}:${value}`)
        .join("|");
      const cartItemId = `${product.id}_${variantString}`;

      await addToCart(
        {
          id: cartItemId,
          productId: product.id, // Keep original product ID for reference
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.src || "",
          category: product.categories?.[0]?.name || "Uncategorized",
          inStock: product.stock_status === "instock",
          variants: selectedVariants, // Include selected variants
        },
        quantity
      );

      const variantText = Object.entries(selectedVariants)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      toast({
        title: "Added to Cart 🛒",
        description: `${quantity}x ${product.name}${
          variantText ? ` (${variantText})` : ""
        } has been added to your cart.`,
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

  return (
    <div className="product-detail-page pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center text-sm text-gray-400">
          <a href="/" className="hover:text-accent transition-colors">
            Home
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/products" className="hover:text-accent transition-colors">
            Products
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-500 truncate max-w-[200px]">{name}</span>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] h-80 sm:h-96 md:h-[450px] lg:h-[500px] mb-4 relative">
              {imageLoading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={
                  currentImageIndex === -1 && selectedVariants
                    ? colorImages[
                        Object.entries(selectedVariants).find(([key]) =>
                          key.toLowerCase().includes("color")
                        )?.[1] || ""
                      ] ||
                      images?.[0]?.src ||
                      ""
                    : images?.[currentImageIndex]?.src || ""
                }
                alt={name}
                className={`w-full h-full object-contain transition-all duration-300 ${
                  imageLoading ? "opacity-70" : "opacity-100"
                }`}
                onError={() => {
                  // Fallback to original image if color-specific image fails
                  if (currentImageIndex === -1) {
                    setCurrentImageIndex(0);
                    setActiveImage(0);
                  }
                }}
              />
              {/* Color indicator overlay */}
              {selectedVariants &&
                Object.keys(selectedVariants).some((key) =>
                  key.toLowerCase().includes("color")
                ) && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{
                        backgroundColor: getColorValue(
                          Object.entries(selectedVariants).find(([key]) =>
                            key.toLowerCase().includes("color")
                          )?.[1] || ""
                        ),
                      }}
                    />
                    <span className="text-white text-sm font-medium">
                      {Object.entries(selectedVariants).find(([key]) =>
                        key.toLowerCase().includes("color")
                      )?.[1] || ""}
                    </span>
                  </div>
                )}
            </div>

            {images && images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveImage(index);
                      setCurrentImageIndex(index);
                    }}
                    className={`bg-[#1E1E1E] rounded-md overflow-hidden border h-20 sm:h-24 hover:border-accent transition-colors ${
                      currentImageIndex === index
                        ? "border-accent"
                        : "border-[#2D2D2D]"
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={`${name} - view ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-5 pb-5 border-b border-[#2D2D2D]">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{name}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(parseFloat(average_rating))}
                  <span className="ml-2 text-gray-400 text-sm">
                    ({parseFloat(average_rating).toFixed(1)}) {rating_count}{" "}
                    reviews
                  </span>
                </div>

                <span className="text-gray-400">•</span>

                <div className="text-sm">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      stock_status === "instock"
                        ? "bg-green-900/20 text-green-500"
                        : "bg-red-900/20 text-red-500"
                    }`}
                  >
                    {stock_status === "instock" ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="text-3xl font-bold text-accent mb-4">
                {hasValidSale ? (
                  <div className="flex items-center gap-3">
                    <span>₹{product.salePrice}</span>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.regularPrice}
                    </span>
                  </div>
                ) : (
                  <span>₹{product.regularPrice ?? price}</span>
                )}
              </div>

              <div
                className="text-gray-400 mb-6"
                dangerouslySetInnerHTML={{
                  __html: description || "No description available.",
                }}
              />
            </div>
            <div className="mb-5 pb-5 border-b border-[#2D2D2D]">
              {attributes?.map((attr) => (
                <div className="mb-4" key={attr.name}>
                  <label className="block text-sm font-medium mb-2">
                    {attr.name}
                    {attr.name.toLowerCase().includes("size") ||
                    attr.name.toLowerCase().includes("color") ||
                    attr.name.toLowerCase().includes("variant") ? (
                      <span className="text-red-500 ml-1">*</span>
                    ) : null}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((option) => {
                      const isSelected = selectedVariants[attr.name] === option;
                      const isColorAttribute = attr.name
                        .toLowerCase()
                        .includes("color");
                      const isSizeAttribute = attr.name
                        .toLowerCase()
                        .includes("size");

                      // Check availability for size-color combinations
                      let isAvailable = true;
                      if (isSizeAttribute && selectedVariants.Color) {
                        isAvailable = isSizeColorAvailable(
                          option,
                          selectedVariants.Color
                        );
                      } else if (isColorAttribute && selectedVariants.Size) {
                        isAvailable = isSizeColorAvailable(
                          selectedVariants.Size,
                          option
                        );
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => handleVariantChange(attr.name, option)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-300 ${
                            !isAvailable
                              ? "border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                              : isSelected
                              ? "border-accent bg-accent/10 text-accent shadow-lg shadow-accent/20"
                              : "border-[#2D2D2D] text-gray-300 hover:border-gray-400 hover:bg-[#2D2D2D]/50"
                          }`}
                        >
                          {isColorAttribute && (
                            <span
                              className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-600"
                              style={{
                                backgroundColor: getColorValue(option),
                                boxShadow: isSelected
                                  ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                                  : "none",
                              }}
                            />
                          )}
                          {option}
                          {!isAvailable && (
                            <span className="ml-1 text-xs text-red-400">
                              (Out of Stock)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    className="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-gray-300 w-10 h-10 flex items-center justify-center rounded-l-md transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-16 h-10 flex items-center justify-center text-center bg-[#1E1E1E] border-t border-b border-[#2D2D2D]">
                    {quantity}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    className="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-gray-300 w-10 h-10 flex items-center justify-center rounded-r-md transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_status !== "instock"}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white font-medium py-2 h-12 rounded-md transition-all duration-300"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <Button
                  onClick={handleWishlistToggle}
                  className={`w-12 h-12 rounded-md flex items-center justify-center transition-all duration-300 ${
                    isInWishlist(product.id)
                      ? "bg-red-500 border border-red-500 text-white hover:bg-red-600"
                      : "bg-[#1E1E1E] border border-[#2D2D2D] hover:border-red-500 hover:bg-red-500/10 text-gray-300 hover:text-red-500"
                  }`}
                  variant="outline"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id) ? "fill-current" : ""
                    }`}
                  />
                </Button>

                <Button
                  className="w-12 h-12 bg-[#1E1E1E] border border-[#2D2D2D] hover:border-accent text-gray-300 rounded-md flex items-center justify-center transition-colors"
                  variant="outline"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
