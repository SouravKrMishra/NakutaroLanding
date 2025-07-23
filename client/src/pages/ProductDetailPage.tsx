import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
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
import { Button } from "@/components/ui/button";
import axios from "axios";
import { buildApiUrl } from "@/lib/api";

type Product = {
  id: number;
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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          buildApiUrl(`/api/products/${productId}`)
        );
        setProduct(response.data);
      } catch (err) {
        setError("Failed to fetch product details.");
      }
      setLoading(false);
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

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
              <img
                src={images?.[activeImage]?.src || ""}
                alt={name}
                className="w-full h-full object-contain"
              />
            </div>

            {images && images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`bg-[#1E1E1E] rounded-md overflow-hidden border h-20 sm:h-24 hover:border-accent transition-colors ${
                      activeImage === index
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

              <div
                className="text-3xl font-bold text-accent mb-4"
                dangerouslySetInnerHTML={{ __html: price }}
              />

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
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((option) => (
                      <button
                        key={option}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors border-[#2D2D2D] text-gray-300 hover:border-gray-400`}
                      >
                        {option}
                      </button>
                    ))}
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
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-white font-medium py-2 h-12 rounded-md transition-all duration-300">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <Button
                  className="w-12 h-12 bg-[#1E1E1E] border border-[#2D2D2D] hover:border-accent text-gray-300 rounded-md flex items-center justify-center transition-colors"
                  variant="outline"
                >
                  <Heart className="h-5 w-5" />
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
