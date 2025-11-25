import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import { useRoute, Link } from "wouter";
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
  ZoomIn,
  X,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Copy,
  Check,
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
  regularPrice?: string;
  salePrice?: string;
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
  images?: { src: string; color?: string | null }[];
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
  const [activeTab, setActiveTab] = useState<"description" | "specifications">(
    "description"
  );
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [colorImages, setColorImages] = useState<{ [key: string]: string }>({});
  const [stockData, setStockData] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showImageModal, setShowImageModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
        buildApiUrl(`/api/products/${productId}`),
        {
          validateStatus: (status) => status >= 200 && status < 300,
        }
      );
      
      // Validate that response is JSON (not HTML error page)
      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Expected JSON response but received ${contentType}. The backend API may not be available.`
        );
      }
      
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
      console.error("Failed to fetch product:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        if (err.response.status === 404) {
          setError("This product is no longer available.");
        } else {
          setError(`Failed to fetch product details. Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        console.error("No response received from server. Is the backend running?");
        console.error("Request URL:", err.config?.url);
        setError("Failed to fetch product details. Backend server is not responding.");
      } else {
        console.error("Error setting up request:", err.message);
        setError("Failed to fetch product details. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    setStockLoading(true);
    try {
      const response = await axios.get(buildApiUrl("/api/stock-data"), {
        validateStatus: (status) => status >= 200 && status < 300,
      });
      
      // Validate that response is JSON (not HTML error page)
      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Expected JSON response but received ${contentType}. The backend API may not be available.`
        );
      }
      
      setStockData(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch stock data:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received from server for stock data");
        console.error("Request URL:", err.config?.url);
      } else {
        console.error("Error fetching stock data:", err.message);
      }
    } finally {
      setStockLoading(false);
    }
  };

  const fetchRelatedProducts = async (
    category: string,
    currentProductId: string
  ) => {
    if (!category) return;

    setRelatedLoading(true);
    try {
      const response = await axios.get(buildApiUrl("/api/products"), {
        params: {
          page: 1,
          per_page: 12, // Fetch more to have options after filtering
          category: category,
          stock_status: "instock",
        },
      });

      const { products } = response.data;

      // Filter out current product and limit to 6
      const filtered = products
        .filter((p: Product) => p.id !== currentProductId)
        .slice(0, 6)
        .map((p: any) => ({
          ...p,
          price: p.price?.toString() || "0",
          salePrice:
            p.salePrice !== undefined && p.salePrice !== null
              ? p.salePrice.toString()
              : undefined,
          regularPrice:
            p.regularPrice !== undefined && p.regularPrice !== null
              ? p.regularPrice.toString()
              : undefined,
          stock_status:
            p.stock?.status === "in_stock" || p.stock?.status === "low_stock"
              ? "instock"
              : "outofstock",
          average_rating: p.average_rating || "0",
          rating_count: p.rating_count || 0,
          categories: p.categories || [{ name: p.category || "Uncategorized" }],
        }));

      setRelatedProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch related products:", err);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchStockData(); // Fetch stock data for clothing items
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [productId]);

  // Reset image index when product changes and initialize selected color
  useEffect(() => {
    if (product) {
      setImageLoading(false);
      setColorImages({});

      // Fetch related products from same category
      const category = product.categories?.[0]?.name || product.category;
      if (category) {
        fetchRelatedProducts(category, product.id);
      }

      // Initialize selected color - get first available color from product data
      const availableColors = getAvailableColorsFromProduct();
      const colorAttribute = product.attributes?.find((attr) =>
        attr.name.toLowerCase().includes("color")
      );

      if (availableColors.length > 0 && product.images) {
        const primaryColor = availableColors[0];
        setSelectedColor(primaryColor);

        // Update selected variants if color attribute exists
        if (colorAttribute) {
          setSelectedVariants((prev) => ({
            ...prev,
            [colorAttribute.name]: primaryColor,
          }));
        }

        // Find the first image for the primary color
        // First try to find by image.color field
        const imageWithColor = product.images.find(
          (img: any) =>
            img.color &&
            img.color.toLowerCase().trim() === primaryColor.toLowerCase().trim()
        );

        if (imageWithColor) {
          const originalIndex = product.images.findIndex(
            (img) => img.src === imageWithColor.src
          );
          if (originalIndex !== -1) {
            setCurrentImageIndex(originalIndex);
            setActiveImage(originalIndex);
          } else {
            setCurrentImageIndex(0);
            setActiveImage(0);
          }
        } else {
          // Fallback to filename matching
          const filteredImages = getImagesForColor(
            primaryColor,
            product.images
          );
          if (filteredImages.length > 0) {
            const firstFilteredImage = filteredImages[0];
            const originalIndex = product.images.findIndex(
              (img) => img.src === firstFilteredImage.src
            );
            if (originalIndex !== -1) {
              setCurrentImageIndex(originalIndex);
              setActiveImage(originalIndex);
            } else {
              const colorImageIndex = findImageForColor(
                primaryColor,
                product.images
              );
              setCurrentImageIndex(
                colorImageIndex !== -1 ? colorImageIndex : 0
              );
              setActiveImage(colorImageIndex !== -1 ? colorImageIndex : 0);
            }
          } else {
            setCurrentImageIndex(0);
            setActiveImage(0);
          }
        }
      } else {
        setSelectedColor(null);
        setSelectedVariants({});
        setCurrentImageIndex(0);
        setActiveImage(0);
      }
    }
  }, [product]);

  // Keyboard support for image modal and prevent body scroll
  useEffect(() => {
    if (showImageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal || !product?.images) return;

      if (e.key === "Escape") {
        setShowImageModal(false);
      } else if (e.key === "ArrowLeft" && product.images.length > 1) {
        const newIndex =
          currentImageIndex > 0
            ? currentImageIndex - 1
            : product.images.length - 1;
        setCurrentImageIndex(newIndex);
        setActiveImage(newIndex);
      } else if (e.key === "ArrowRight" && product.images.length > 1) {
        const newIndex =
          currentImageIndex < product.images.length - 1
            ? currentImageIndex + 1
            : 0;
        setCurrentImageIndex(newIndex);
        setActiveImage(newIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showImageModal, currentImageIndex, product]);

  // Close share menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showShareMenu) {
        setShowShareMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShareMenu]);

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

  // Function to filter images by color
  const getImagesForColor = (
    color: string,
    images: { src: string }[]
  ): { src: string }[] => {
    if (!images || images.length === 0) return [];
    if (!color) return images;

    const colorLower = color.toLowerCase().trim();
    const filteredImages: { src: string }[] = [];

    // First priority: Check image.color field (most accurate)
    for (const image of images) {
      const img = image as any;
      if (img.color && typeof img.color === "string") {
        if (img.color.toLowerCase().trim() === colorLower) {
          filteredImages.push(image);
        }
      }
    }

    // If we found images by color field, return them
    if (filteredImages.length > 0) {
      return filteredImages;
    }

    // Second priority: Try to find images with the exact color in the filename
    for (const image of images) {
      const imageSrc = image.src.toLowerCase();
      if (imageSrc.includes(colorLower)) {
        filteredImages.push(image);
      }
    }

    // If we found images, return them
    if (filteredImages.length > 0) {
      return filteredImages;
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
      for (const image of images) {
        const imageSrc = image.src.toLowerCase();
        if (imageSrc.includes(variation) && !filteredImages.includes(image)) {
          filteredImages.push(image);
        }
      }
    }

    // If we found images with variations, return them
    if (filteredImages.length > 0) {
      return filteredImages;
    }

    // If still no match, try partial matches
    for (const image of images) {
      const imageSrc = image.src.toLowerCase();
      if (
        colorLower
          .split(" ")
          .some((word) => word.length > 2 && imageSrc.includes(word)) &&
        !filteredImages.includes(image)
      ) {
        filteredImages.push(image);
      }
    }

    // If still no match, return all images (fallback)
    return filteredImages.length > 0 ? filteredImages : images;
  };

  // Function to get the first image for a color (for color swatches)
  const getFirstImageForColor = (
    color: string,
    images: { src: string }[]
  ): string | null => {
    const colorImages = getImagesForColor(color, images);
    return colorImages.length > 0 ? colorImages[0].src : null;
  };

  // Function to get available colors from product data (database)
  const getAvailableColorsFromProduct = (): string[] => {
    if (!product) return [];

    // First priority: Use product.colors array (actual available colors from database)
    if (
      product.colors &&
      Array.isArray(product.colors) &&
      product.colors.length > 0
    ) {
      const filteredColors = product.colors.filter(
        (color: string) => color && color.trim() !== ""
      );
      if (filteredColors.length > 0) {
        return filteredColors;
      }
    }

    // Second priority: Extract unique colors from images (each image has a color field)
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const colorSet = new Set<string>();
      product.images.forEach((img: any) => {
        // Check the color field on the image object
        const imageColor = img.color;
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

  // Function to get available colors (colors that have images) - legacy function for filtering
  const getAvailableColors = (
    colorOptions: string[],
    images: { src: string }[]
  ): string[] => {
    if (!images || images.length === 0) return [];

    const availableColors: string[] = [];

    for (const color of colorOptions) {
      // First, try to find images that match the color name in filename
      const colorLower = color.toLowerCase().trim();
      let hasMatchingImage = images.some((img) => {
        const imageSrc = img.src.toLowerCase();

        // Check exact color name match
        if (imageSrc.includes(colorLower)) return true;

        // Check color variations
        const colorVariations: { [key: string]: string[] } = {
          red: ["red", "crimson", "scarlet", "burgundy", "cherry", "ruby"],
          blue: ["blue", "navy", "royal", "sky", "azure", "cobalt"],
          green: ["green", "emerald", "forest", "lime", "mint", "sage"],
          black: ["black", "dark", "charcoal", "ebony", "jet", "onyx"],
          white: ["white", "cream", "ivory", "pearl", "snow", "bone"],
          yellow: ["yellow", "gold", "amber", "lemon", "canary", "mustard"],
          pink: ["pink", "rose", "magenta", "coral", "salmon", "fuchsia"],
          purple: ["purple", "violet", "lavender", "plum", "mauve", "lilac"],
          orange: [
            "orange",
            "tangerine",
            "peach",
            "apricot",
            "pumpkin",
            "carrot",
          ],
          gray: ["gray", "grey", "silver", "ash", "slate", "pewter"],
          brown: ["brown", "tan", "beige", "coffee", "chocolate", "mocha"],
        };

        const variations = colorVariations[colorLower] || [colorLower];
        return variations.some((variation) => imageSrc.includes(variation));
      });

      // Also check if image has a color field that matches
      if (!hasMatchingImage) {
        hasMatchingImage = images.some((img: any) => {
          const imageColor = img.color;
          if (imageColor && typeof imageColor === "string") {
            return imageColor.toLowerCase().trim() === colorLower;
          }
          return false;
        });
      }

      if (hasMatchingImage) {
        availableColors.push(color);
      }
    }

    return availableColors;
  };

  // Handle color selection from swatches
  const handleColorSelect = (color: string) => {
    if (!product) return;

    setImageLoading(true);
    setSelectedColor(color);

    // Find color attribute name
    const colorAttribute = product.attributes?.find((attr) =>
      attr.name.toLowerCase().includes("color")
    );

    if (colorAttribute) {
      setSelectedVariants((prev) => ({
        ...prev,
        [colorAttribute.name]: color,
      }));
    }

    // Find and set the first image for the selected color
    if (product.images) {
      // Get filtered images for this color
      const filteredImages = getImagesForColor(color, product.images);

      if (filteredImages.length > 0) {
        // Find the index of the first filtered image in the original images array
        const firstFilteredImage = filteredImages[0];
        const originalIndex = product.images.findIndex(
          (img) => img.src === firstFilteredImage.src
        );

        if (originalIndex !== -1) {
          setCurrentImageIndex(originalIndex);
          setActiveImage(originalIndex);
        } else {
          // Fallback: try to find by color name
          const colorImageIndex = findImageForColor(color, product.images);
          if (colorImageIndex !== -1) {
            setCurrentImageIndex(colorImageIndex);
            setActiveImage(colorImageIndex);
          } else {
            // Try to find from variations
            const variationImage = findImageFromVariations(color);
            if (variationImage) {
              setColorImages((prev) => ({ ...prev, [color]: variationImage }));
              setCurrentImageIndex(-1);
              setActiveImage(-1);
            } else {
              // Fallback to first image
              setCurrentImageIndex(0);
              setActiveImage(0);
            }
          }
        }
      } else {
        // No images found for this color, try variations
        const variationImage = findImageFromVariations(color);
        if (variationImage) {
          setColorImages((prev) => ({ ...prev, [color]: variationImage }));
          setCurrentImageIndex(-1);
          setActiveImage(-1);
        } else {
          // Fallback to first image
          setCurrentImageIndex(0);
          setActiveImage(0);
        }
      }
    }

    // Reset loading state after a short delay
    setTimeout(() => setImageLoading(false), 300);
  };

  // Zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleImageClick = () => {
    setShowImageModal(true);
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

  const handleWishlistToggleForRelated = async (relatedProduct: Product) => {
    try {
      const isCurrentlyInWishlist = isInWishlist(relatedProduct.id);

      await addToWishlist({
        id: relatedProduct.id,
        name: relatedProduct.name,
        price: relatedProduct.price,
        image: relatedProduct.images?.[0]?.src || relatedProduct.image || "",
        category: relatedProduct.categories?.[0]?.name || "Uncategorized",
        rating: parseFloat(relatedProduct.average_rating || "0") || 0,
        reviews: relatedProduct.rating_count || 0,
      });

      toast({
        title: isCurrentlyInWishlist
          ? "Removed from Wishlist"
          : "Added to Wishlist ❤️",
        description: `${relatedProduct.name} has been ${
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

  // Social sharing functions
  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    return `Check out ${product?.name || "this product"} - ${
      product?.price ? `₹${product.price}` : ""
    }`;
  };

  const getShareImage = () => {
    return product?.images?.[0]?.src || product?.image || "";
  };

  // Web Share API (for mobile devices)
  const handleNativeShare = async () => {
    if (
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: product?.name || "",
          text: getShareText(),
          url: getShareUrl(),
        });
        setShowShareMenu(false);
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: show share menu
      setShowShareMenu(true);
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "width=600,height=400"
    );
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "width=600,height=400"
    );
    setShowShareMenu(false);
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(
      `Check out ${product?.name || "this product"}`
    );
    const body = encodeURIComponent(`${getShareText()}\n\n${getShareUrl()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Product link has been copied to clipboard.",
        variant: "default",
      });
      setTimeout(() => {
        setLinkCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getShareUrl();
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setLinkCopied(true);
        toast({
          title: "Link Copied!",
          description: "Product link has been copied to clipboard.",
          variant: "default",
        });
        setTimeout(() => {
          setLinkCopied(false);
          setShowShareMenu(false);
        }, 2000);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="product-detail-page pt-20 sm:pt-28 pb-12 sm:pb-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className="flex items-center text-xs sm:text-sm text-gray-400 overflow-x-auto pb-2">
          <a
            href="/"
            className="hover:text-accent transition-colors whitespace-nowrap"
          >
            Home
          </a>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 flex-shrink-0" />
          <a
            href="/products"
            className="hover:text-accent transition-colors whitespace-nowrap"
          >
            Products
          </a>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 flex-shrink-0" />
          <span className="text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
            {name}
          </span>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div>
            {/* Main image - full width on mobile */}
            <div className="mb-4 sm:mb-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Thumbnail images - hidden on mobile, shown on desktop */}
                {(() => {
                  const colorAttribute = attributes?.find((attr) =>
                    attr.name.toLowerCase().includes("color")
                  );
                  const filteredImages =
                    selectedColor && images
                      ? getImagesForColor(selectedColor, images)
                      : images || [];

                  return filteredImages.length > 1 ? (
                    <div className="hidden sm:flex flex-col gap-2 sm:gap-3 flex-shrink-0">
                      {filteredImages.map((image, index) => {
                        // Find the original index in the full images array
                        const originalIndex =
                          images?.findIndex((img) => img.src === image.src) ??
                          index;
                        const isActive = currentImageIndex === originalIndex;

                        return (
                          <button
                            key={`${selectedColor}-${index}`}
                            onClick={() => {
                              setActiveImage(originalIndex);
                              setCurrentImageIndex(originalIndex);
                            }}
                            className={`bg-[#1E1E1E] rounded-md overflow-hidden border w-16 sm:w-20 h-16 sm:h-20 hover:border-accent transition-colors flex-shrink-0 ${
                              isActive ? "border-accent" : "border-[#2D2D2D]"
                            }`}
                          >
                            <img
                              src={image.src}
                              alt={`${name} - view ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null;
                })()}

                {/* Main image */}
                <div
                  className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] h-[350px] sm:h-96 md:h-[450px] lg:h-[500px] w-full sm:flex-1 relative cursor-zoom-in group"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleImageClick}
                >
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
                    className={`w-full h-full object-contain transition-transform duration-200 ease-out ${
                      imageLoading ? "opacity-70" : "opacity-100"
                    }`}
                    style={{
                      transform: isZoomed ? `scale(2)` : "scale(1)",
                      transformOrigin: isZoomed
                        ? `${zoomPosition.x}% ${zoomPosition.y}%`
                        : "center center",
                    }}
                    onError={() => {
                      // Fallback to original image if color-specific image fails
                      if (currentImageIndex === -1) {
                        setCurrentImageIndex(0);
                        setActiveImage(0);
                      }
                    }}
                  />
                  {/* Zoom button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button
                      className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-lg p-2 text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageModal(true);
                      }}
                      title="Click to zoom"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Color indicator overlay */}
                  {selectedColor && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 z-10">
                      <span
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{
                          backgroundColor: getColorValue(selectedColor),
                        }}
                      />
                      <span className="text-white text-sm font-medium">
                        {selectedColor}
                      </span>
                    </div>
                  )}
                  {/* Zoom hint - hidden on mobile */}
                  {!isZoomed && (
                    <div className="hidden sm:block absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs z-10">
                      Hover to zoom • Click for fullscreen
                    </div>
                  )}
                  {/* Mobile tap hint */}
                  <div className="sm:hidden absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs z-10">
                    Tap to view fullscreen
                  </div>
                </div>
              </div>

              {/* Mobile thumbnails - shown below main image on mobile */}
              {(() => {
                const colorAttribute = attributes?.find((attr) =>
                  attr.name.toLowerCase().includes("color")
                );
                const filteredImages =
                  selectedColor && images
                    ? getImagesForColor(selectedColor, images)
                    : images || [];

                return filteredImages.length > 1 ? (
                  <div className="sm:hidden mt-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                      {filteredImages.map((image, index) => {
                        const originalIndex =
                          images?.findIndex((img) => img.src === image.src) ??
                          index;
                        const isActive = currentImageIndex === originalIndex;

                        return (
                          <button
                            key={`mobile-${selectedColor}-${index}`}
                            onClick={() => {
                              setActiveImage(originalIndex);
                              setCurrentImageIndex(originalIndex);
                            }}
                            className={`bg-[#1E1E1E] rounded-md overflow-hidden border flex-shrink-0 transition-colors ${
                              isActive ? "border-accent" : "border-[#2D2D2D]"
                            }`}
                            style={{ width: "80px", height: "80px" }}
                          >
                            <img
                              src={image.src}
                              alt={`${name} - view ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Color swatches under main image */}
            {(() => {
              // Get actual available colors from product data (database)
              const availableColors = getAvailableColorsFromProduct();

              if (!images || availableColors.length === 0) return null;

              return (
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <label className="text-sm sm:text-base font-medium text-gray-300">
                      Color:
                    </label>
                    {selectedColor && (
                      <span className="text-xs sm:text-sm text-gray-400 capitalize px-2 py-1 bg-[#2D2D2D] rounded">
                        {selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {availableColors.map((color) => {
                      // Find the first image for this color
                      // First try to find by image.color field
                      let colorImageUrl: string | null = null;
                      const imageWithColor = images.find(
                        (img: any) =>
                          img.color &&
                          img.color.toLowerCase().trim() ===
                            color.toLowerCase().trim()
                      );
                      if (imageWithColor) {
                        colorImageUrl = imageWithColor.src;
                      } else {
                        // Fallback to filename matching
                        colorImageUrl = getFirstImageForColor(color, images);
                      }

                      const isSelected = selectedColor === color;

                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 ${
                            isSelected
                              ? "border-accent ring-2 ring-accent/50 shadow-lg shadow-accent/20 scale-105"
                              : "border-[#2D2D2D] sm:hover:border-accent/50 sm:hover:shadow-md"
                          }`}
                          style={{
                            width: "60px",
                            height: "60px",
                          }}
                          title={color}
                        >
                          {colorImageUrl ? (
                            <img
                              src={colorImageUrl}
                              alt={color}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundColor: getColorValue(color),
                              }}
                            />
                          )}
                          {isSelected && (
                            <>
                              <div className="absolute inset-0 bg-accent/10" />
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            </>
                          )}
                          {/* Hover overlay */}
                          {!isSelected && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-[#2D2D2D]">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-2 leading-tight">
                {name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center">
                  {renderStars(parseFloat(average_rating))}
                  <span className="ml-2 text-gray-400 text-xs sm:text-sm">
                    ({parseFloat(average_rating).toFixed(1)}) {rating_count}{" "}
                    reviews
                  </span>
                </div>

                <span className="text-gray-400 hidden sm:inline">•</span>

                <div className="text-xs sm:text-sm">
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

              <div className="text-2xl sm:text-3xl font-bold text-accent mb-3 sm:mb-4">
                {hasValidSale ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span>₹{product.salePrice}</span>
                    <span className="text-base sm:text-lg text-gray-400 line-through">
                      ₹{product.regularPrice}
                    </span>
                  </div>
                ) : (
                  <span>₹{product.regularPrice ?? price}</span>
                )}
              </div>

              <div
                className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-none"
                dangerouslySetInnerHTML={{
                  __html: description || "No description available.",
                }}
              />
            </div>
            <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-[#2D2D2D]">
              {attributes
                ?.filter((attr) => !attr.name.toLowerCase().includes("color"))
                .map((attr) => (
                  <div className="mb-3 sm:mb-4" key={attr.name}>
                    <label className="block text-sm sm:text-base font-medium mb-2">
                      {attr.name}
                      {attr.name.toLowerCase().includes("size") ||
                      attr.name.toLowerCase().includes("variant") ? (
                        <span className="text-red-500 ml-1">*</span>
                      ) : null}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((option) => {
                        const isSelected =
                          selectedVariants[attr.name] === option;
                        const isSizeAttribute = attr.name
                          .toLowerCase()
                          .includes("size");

                        // Check availability for size-color combinations
                        let isAvailable = true;
                        if (isSizeAttribute && selectedColor) {
                          // Find color attribute name
                          const colorAttribute = attributes?.find((a) =>
                            a.name.toLowerCase().includes("color")
                          );
                          if (colorAttribute) {
                            isAvailable = isSizeColorAvailable(
                              option,
                              selectedColor
                            );
                          }
                        }

                        return (
                          <button
                            key={option}
                            onClick={() =>
                              handleVariantChange(attr.name, option)
                            }
                            disabled={!isAvailable}
                            className={`px-3 sm:px-4 py-2 border rounded-md text-sm font-medium transition-all duration-300 active:scale-95 ${
                              !isAvailable
                                ? "border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                                : isSelected
                                ? "border-accent bg-accent/10 text-accent shadow-lg shadow-accent/20"
                                : "border-[#2D2D2D] text-gray-300 sm:hover:border-gray-400 sm:hover:bg-[#2D2D2D]/50"
                            }`}
                          >
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
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center w-fit">
                  <button
                    onClick={decrementQuantity}
                    className="bg-[#2D2D2D] active:bg-[#3D3D3D] sm:hover:bg-[#3D3D3D] text-gray-300 w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-l-md transition-colors touch-manipulation"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-16 sm:w-16 h-12 sm:h-10 flex items-center justify-center text-center bg-[#1E1E1E] border-t border-b border-[#2D2D2D] text-base sm:text-sm font-medium">
                    {quantity}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    className="bg-[#2D2D2D] active:bg-[#3D3D3D] sm:hover:bg-[#3D3D3D] text-gray-300 w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-r-md transition-colors touch-manipulation"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-row gap-3 sm:gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_status !== "instock"}
                  className="flex-1 bg-accent hover:bg-accent/90 active:bg-accent/80 text-white font-medium py-2 h-12 rounded-md transition-all duration-300 text-sm touch-manipulation"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <div className="flex gap-2 sm:gap-4">
                  <Button
                    onClick={handleWishlistToggle}
                    className={`w-12 h-12 rounded-md flex items-center justify-center transition-all duration-300 touch-manipulation ${
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

                  <div className="relative">
                    <Button
                      onClick={() => {
                        // Try native share first (mobile)
                        if (
                          typeof navigator !== "undefined" &&
                          "share" in navigator &&
                          typeof navigator.share === "function"
                        ) {
                          handleNativeShare();
                        } else {
                          setShowShareMenu(!showShareMenu);
                        }
                      }}
                      className="w-12 h-12 bg-[#1E1E1E] border border-[#2D2D2D] hover:border-accent text-gray-300 rounded-md flex items-center justify-center transition-colors touch-manipulation"
                      variant="outline"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>

                    {/* Share Menu - Bottom Sheet on Mobile, Dropdown on Desktop */}
                    {showShareMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 bg-black/50 z-40 sm:z-40"
                          onClick={() => setShowShareMenu(false)}
                        />

                        {/* Mobile Bottom Sheet */}
                        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden transform transition-transform duration-300 ease-out">
                          <div className="bg-[#1E1E1E] border-t border-[#2D2D2D] rounded-t-2xl shadow-2xl">
                            {/* Handle bar */}
                            <div className="flex justify-center pt-3 pb-2">
                              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                            </div>

                            {/* Header */}
                            <div className="px-6 pb-4 border-b border-[#2D2D2D]">
                              <h3 className="text-lg font-semibold text-white">
                                Share Product
                              </h3>
                              <p className="text-sm text-gray-400 mt-1">
                                Share this product with others
                              </p>
                            </div>

                            {/* Share Options */}
                            <div className="p-4 space-y-2">
                              <button
                                onClick={handleShareFacebook}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#4D4D4D] transition-colors touch-manipulation"
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                  <Facebook className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="text-white text-base font-medium flex-1 text-left">
                                  Facebook
                                </span>
                              </button>

                              <button
                                onClick={handleShareTwitter}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#4D4D4D] transition-colors touch-manipulation"
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                                  <Twitter className="h-5 w-5 text-blue-400" />
                                </div>
                                <span className="text-white text-base font-medium flex-1 text-left">
                                  Twitter
                                </span>
                              </button>

                              <button
                                onClick={handleShareWhatsApp}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#4D4D4D] transition-colors touch-manipulation"
                              >
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                  <MessageCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <span className="text-white text-base font-medium flex-1 text-left">
                                  WhatsApp
                                </span>
                              </button>

                              <button
                                onClick={handleShareEmail}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#4D4D4D] transition-colors touch-manipulation"
                              >
                                <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                                  <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <span className="text-white text-base font-medium flex-1 text-left">
                                  Email
                                </span>
                              </button>

                              <div className="border-t border-[#2D2D2D] my-2" />

                              <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#4D4D4D] transition-colors touch-manipulation"
                              >
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                  {linkCopied ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Copy className="h-5 w-5 text-accent" />
                                  )}
                                </div>
                                <span
                                  className={`text-base font-medium flex-1 text-left ${
                                    linkCopied ? "text-green-500" : "text-white"
                                  }`}
                                >
                                  {linkCopied ? "Link Copied!" : "Copy Link"}
                                </span>
                              </button>
                            </div>

                            {/* Cancel Button */}
                            <div className="p-4 pt-2 border-t border-[#2D2D2D]">
                              <button
                                onClick={() => setShowShareMenu(false)}
                                className="w-full py-3 rounded-xl bg-[#2D2D2D] hover:bg-[#3D3D3D] active:bg-[#4D4D4D] text-white font-medium transition-colors touch-manipulation"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Dropdown */}
                        <div className="hidden sm:block absolute right-0 top-full mt-2 w-64 bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out">
                          <div className="p-2">
                            <div className="px-3 py-2 mb-1">
                              <h3 className="text-sm font-semibold text-white">
                                Share Product
                              </h3>
                            </div>

                            <button
                              onClick={handleShareFacebook}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2D2D2D] transition-colors text-left group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                                <Facebook className="h-4 w-4 text-blue-500" />
                              </div>
                              <span className="text-gray-300 text-sm font-medium">
                                Facebook
                              </span>
                            </button>

                            <button
                              onClick={handleShareTwitter}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2D2D2D] transition-colors text-left group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-400/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-400/30 transition-colors">
                                <Twitter className="h-4 w-4 text-blue-400" />
                              </div>
                              <span className="text-gray-300 text-sm font-medium">
                                Twitter
                              </span>
                            </button>

                            <button
                              onClick={handleShareWhatsApp}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2D2D2D] transition-colors text-left group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                              </div>
                              <span className="text-gray-300 text-sm font-medium">
                                WhatsApp
                              </span>
                            </button>

                            <button
                              onClick={handleShareEmail}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2D2D2D] transition-colors text-left group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-500/30 transition-colors">
                                <Mail className="h-4 w-4 text-gray-400" />
                              </div>
                              <span className="text-gray-300 text-sm font-medium">
                                Email
                              </span>
                            </button>

                            <div className="border-t border-[#2D2D2D] my-1" />

                            <button
                              onClick={handleCopyLink}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2D2D2D] transition-colors text-left group"
                            >
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                  linkCopied
                                    ? "bg-green-500/20 group-hover:bg-green-500/30"
                                    : "bg-accent/20 group-hover:bg-accent/30"
                                }`}
                              >
                                {linkCopied ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-accent" />
                                )}
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  linkCopied
                                    ? "text-green-500"
                                    : "text-gray-300"
                                }`}
                              >
                                {linkCopied ? "Link Copied!" : "Copy Link"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16">
        <div className="bg-[#1E1E1E] rounded-lg border border-[#2D2D2D]">
          {/* Tabs */}
          <div className="border-b border-[#2D2D2D]">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === "description"
                    ? "text-accent border-b-2 border-accent"
                    : "text-gray-400 active:text-gray-300 sm:hover:text-gray-300"
                }`}
              >
                Description
              </button>
              {product.specifications &&
                Object.keys(product.specifications).length > 0 && (
                  <button
                    onClick={() => setActiveTab("specifications")}
                    className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === "specifications"
                        ? "text-accent border-b-2 border-accent"
                        : "text-gray-400 active:text-gray-300 sm:hover:text-gray-300"
                    }`}
                  >
                    Specifications
                  </button>
                )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "description" && (
              <div
                className="text-sm sm:text-base text-gray-300 prose prose-invert max-w-none prose-sm sm:prose-base"
                dangerouslySetInnerHTML={{
                  __html: description || "No description available.",
                }}
              />
            )}

            {activeTab === "specifications" && product.specifications && (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row border-b border-[#2D2D2D] pb-3 gap-1 sm:gap-0"
                  >
                    <div className="w-full sm:w-1/3 font-medium text-gray-300 text-sm sm:text-base">
                      {key}
                    </div>
                    <div className="w-full sm:w-2/3 text-gray-400 text-sm sm:text-base">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16 mb-12 sm:mb-16">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
              You May Also Like
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Similar products you might be interested in
            </p>
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#1E1E1E] rounded-lg overflow-hidden"
                >
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {relatedProducts.map((relatedProduct) => {
                const hasSale =
                  relatedProduct.salePrice &&
                  relatedProduct.regularPrice &&
                  Number(relatedProduct.salePrice) <
                    Number(relatedProduct.regularPrice);

                return (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.id}`}
                    className="group bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#1E1E1E]">
                      <img
                        src={
                          relatedProduct.images?.[0]?.src ||
                          relatedProduct.image ||
                          ""
                        }
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {hasSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                      {relatedProduct.stock_status !== "instock" && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {/* Quick actions on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleWishlistToggleForRelated(relatedProduct);
                          }}
                          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                            isInWishlist(relatedProduct.id)
                              ? "bg-red-500 text-white"
                              : "bg-black/70 text-white hover:bg-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isInWishlist(relatedProduct.id)
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-200 mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(
                          parseFloat(relatedProduct.average_rating || "0")
                        )}
                        <span className="text-xs text-gray-400">
                          ({relatedProduct.rating_count || 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasSale ? (
                          <>
                            <span className="text-accent font-bold">
                              ₹{relatedProduct.salePrice}
                            </span>
                            <span className="text-gray-500 text-sm line-through">
                              ₹{relatedProduct.regularPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-accent font-bold">
                            ₹
                            {relatedProduct.regularPrice ||
                              relatedProduct.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Fullscreen Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors z-10 bg-black/50 hover:bg-black/70 rounded-full p-2"
            onClick={() => setShowImageModal(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
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
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Navigation arrows if multiple images */}
            {images && images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex =
                      currentImageIndex > 0
                        ? currentImageIndex - 1
                        : images.length - 1;
                    setCurrentImageIndex(newIndex);
                    setActiveImage(newIndex);
                  }}
                >
                  <ChevronRight className="h-6 w-6 rotate-180" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex =
                      currentImageIndex < images.length - 1
                        ? currentImageIndex + 1
                        : 0;
                    setCurrentImageIndex(newIndex);
                    setActiveImage(newIndex);
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
