import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useLocation, useRoute } from "wouter";
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
  attributes?: { [key: string]: string };
  sizes?: string[];
  colors?: string[];
  images?: string[];
  stock?: string;
  deliveryInfo?: string;
  returnPolicy?: string;
  specifications?: { [key: string]: string };
};

// Mock reviews data
const reviews = [
  {
    id: 1,
    username: "AnimeLovers22",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    date: "May 10, 2024",
    verified: true,
    title: "Amazing Quality and Detail",
    content:
      "The figure's quality exceeds my expectations. The details are incredibly accurate and the paint work is flawless. Definitely worth the price!",
  },
  {
    id: 2,
    username: "MangaCollector",
    avatar: "https://i.pravatar.cc/150?img=2",
    rating: 4,
    date: "April 28, 2024",
    verified: true,
    title: "Great addition to my collection",
    content:
      "Really happy with this purchase. The figure is well-made and looks exactly like the character. Packaging was secure and it arrived in perfect condition.",
  },
  {
    id: 3,
    username: "OtakuWorld",
    avatar: "https://i.pravatar.cc/150?img=3",
    rating: 5,
    date: "April 15, 2024",
    verified: true,
    title: "Absolutely stunning",
    content:
      "This is now the centerpiece of my collection. The attention to detail is remarkable. Highly recommend to any serious collector.",
  },
];

// Sample product details
const productDetails: Product[] = [
  {
    id: 1,
    name: "Naruto Uzumaki Sage Mode Figure",
    price: "₹3,999",
    rating: 4.8,
    reviews: 124,
    category: "Action Figures",
    image: "https://i.imgur.com/1mQWQdB.jpg",
    isNew: true,
    description:
      "High-quality PVC figure of Naruto Uzumaki in Sage Mode. This premium collectible stands 25cm tall and features incredible detail with a dynamic pose showcasing Naruto's Rasengan technique. The figure includes a detailed base with Japanese calligraphy and is made from high-grade materials.",
    attributes: {
      Material: "PVC & ABS",
      Height: "25cm",
      Weight: "800g",
      Manufacturer: "Bandai Spirits",
      "Release Date": "2024",
      Scale: "1/8",
      Articulation: "Fixed Pose",
    },
    sizes: ["Standard"],
    colors: ["Full Color"],
    images: [
      "https://i.imgur.com/1mQWQdB.jpg",
      "https://i.imgur.com/aFBUKmN.jpg",
      "https://i.imgur.com/JJQQsvL.jpg",
      "https://i.imgur.com/xVDWG0R.jpg",
    ],
    stock: "In Stock",
    deliveryInfo: "Ships within 2-3 business days",
    returnPolicy: "30-day return policy for unopened items",
    specifications: {
      "Box Contents": "Figure, Display Base, Authentication Card",
      "Care Instructions":
        "Keep away from direct sunlight and extreme temperatures",
      "Country of Origin": "Japan",
      Warranty: "No manufacturer warranty",
    },
  },
  {
    id: 2,
    name: "Demon Slayer Tanjiro Premium Statue",
    price: "₹5,499",
    rating: 4.9,
    reviews: 87,
    category: "Action Figures",
    image: "https://i.imgur.com/0N0xC6p.jpg",
    description:
      "Premium quality Tanjiro Kamado statue from Demon Slayer, featuring incredible detail with Tanjiro in his iconic Water Breathing stance. The figure stands 30cm tall and comes with LED light effects in the base to highlight the water effects. Made with high-quality materials for a stunning display piece.",
    attributes: {
      Material: "PVC & Resin",
      Height: "30cm",
      Weight: "1.2kg",
      Manufacturer: "Aniplex",
      "Release Date": "2024",
      Scale: "1/7",
      Articulation: "Fixed Pose",
    },
    sizes: ["Standard"],
    colors: ["Full Color"],
    images: [
      "https://i.imgur.com/0N0xC6p.jpg",
      "https://i.imgur.com/yQeK1vJ.jpg",
      "https://i.imgur.com/F2Aq0RZ.jpg",
      "https://i.imgur.com/tnSGcCR.jpg",
    ],
    stock: "In Stock",
    deliveryInfo: "Ships within 2-3 business days",
    returnPolicy: "30-day return policy for unopened items",
    specifications: {
      "Box Contents":
        "Figure, Display Base with LED effects, Authentication Card, Batteries",
      "Care Instructions":
        "Keep away from direct sunlight and extreme temperatures",
      "Country of Origin": "Japan",
      Warranty: "No manufacturer warranty",
    },
  },
];

const ProductDetailPage = () => {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ? parseInt(params.id) : 1;
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [, navigate] = useLocation();

  // Fetch product details
  useEffect(() => {
    // Reset scroll position when page loads
    window.scrollTo(0, 0);

    // Find the product by ID
    const product = productDetails.find((p) => p.id === productId);

    if (product) {
      setCurrentProduct(product);
      setActiveSize(product.sizes?.[0] || null);
      setActiveColor(product.colors?.[0] || null);

      // Find related products (same category)
      const related = productDetails
        .filter((p) => p.id !== productId && p.category === product.category)
        .slice(0, 4);
      setRelatedProducts(related);
    } else {
      // Product not found, navigate to 404 or products page
      navigate("/products");
    }
  }, [productId, navigate]);

  if (!currentProduct) {
    return (
      <div className="pt-28 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading product details...</p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = Math.round(currentProduct.rating * 10) / 10;

  // Stars rendering helper
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : star - 0.5 <= rating
                ? "text-yellow-500 fill-yellow-500 opacity-50"
                : "text-gray-400"
            }`}
          />
        ))}
      </div>
    );
  };

  // Handle quantity changes
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="product-detail-page pt-28 pb-16 overflow-hidden">
      {/* Breadcrumbs */}
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
          <a
            href={`/products?category=${currentProduct.category}`}
            className="hover:text-accent transition-colors"
          >
            {currentProduct.category}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-500 truncate max-w-[200px]">
            {currentProduct.name}
          </span>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] h-80 sm:h-96 md:h-[450px] lg:h-[500px] mb-4 relative">
              {currentProduct.isNew && (
                <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  NEW
                </div>
              )}
              {currentProduct.onSale && (
                <div className="absolute top-4 left-4 bg-[#ff7b00] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  SALE
                </div>
              )}
              <img
                src={
                  currentProduct.images?.[activeImage] || currentProduct.image
                }
                alt={currentProduct.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail gallery */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {currentProduct.images.map((image, index) => (
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
                      src={image}
                      alt={`${currentProduct.name} - view ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-5 pb-5 border-b border-[#2D2D2D]">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {currentProduct.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(currentProduct.rating)}
                  <span className="ml-2 text-gray-400 text-sm">
                    ({averageRating}) {currentProduct.reviews} reviews
                  </span>
                </div>

                <span className="text-gray-400">•</span>

                <div className="text-sm">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      currentProduct.stock === "In Stock"
                        ? "bg-green-900/20 text-green-500"
                        : "bg-red-900/20 text-red-500"
                    }`}
                  >
                    {currentProduct.stock || "Check Availability"}
                  </span>
                </div>
              </div>

              <div className="text-3xl font-bold text-accent mb-4">
                {currentProduct.price}
              </div>

              <p className="text-gray-400 mb-6">{currentProduct.description}</p>
            </div>

            {/* Product attributes */}
            <div className="mb-5 pb-5 border-b border-[#2D2D2D]">
              {currentProduct.attributes &&
                Object.entries(currentProduct.attributes).length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.entries(currentProduct.attributes)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-500 text-sm">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                  </div>
                )}

              {/* Sizes */}
              {currentProduct.sizes && currentProduct.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setActiveSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          activeSize === size
                            ? "border-accent text-accent bg-accent/10"
                            : "border-[#2D2D2D] text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {currentProduct.colors && currentProduct.colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setActiveColor(color)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          activeColor === color
                            ? "border-accent text-accent bg-accent/10"
                            : "border-[#2D2D2D] text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
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

              {/* Action Buttons */}
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

            {/* Shipping Information */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#1E1E1E] rounded-full flex items-center justify-center mr-3">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">Free Shipping</div>
                  <div className="text-gray-400">For orders over ₹999</div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#1E1E1E] rounded-full flex items-center justify-center mr-3">
                  <RotateCcw className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-gray-400">
                    {currentProduct.returnPolicy}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#1E1E1E] rounded-full flex items-center justify-center mr-3">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium">Fast Shipping</div>
                  <div className="text-gray-400">
                    {currentProduct.deliveryInfo}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-[#1E1E1E] rounded-lg border border-[#2D2D2D] overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#2D2D2D]">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "description"
                  ? "border-b-2 border-accent text-accent"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("specifications")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "specifications"
                  ? "border-b-2 border-accent text-accent"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Specifications
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "reviews"
                  ? "border-b-2 border-accent text-accent"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Reviews ({currentProduct.reviews})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div>
                <p className="text-gray-300 mb-6">
                  {currentProduct.description}
                </p>

                {currentProduct.attributes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(currentProduct.attributes).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-start">
                          <div className="w-36 text-gray-500">{key}:</div>
                          <div className="flex-1 font-medium">{value}</div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div>
                {currentProduct.specifications &&
                Object.entries(currentProduct.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(currentProduct.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-start">
                          <div className="w-48 text-gray-500">{key}:</div>
                          <div className="flex-1 font-medium">{value}</div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No specifications available for this product.
                  </p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {/* Review Summary */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-[#2D2D2D]">
                  <div className="flex flex-col items-center justify-center md:w-48">
                    <div className="text-5xl font-bold mb-2">
                      {averageRating}
                    </div>
                    <div className="flex mb-2">
                      {renderStars(currentProduct.rating)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Based on {currentProduct.reviews} reviews
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        // Calculate percentage (mock data)
                        const percentage =
                          star === 5
                            ? 70
                            : star === 4
                            ? 20
                            : star === 3
                            ? 8
                            : star === 2
                            ? 1
                            : 1;

                        return (
                          <div key={star} className="flex items-center gap-2">
                            <div className="flex items-center w-16">
                              <span className="text-sm font-medium mr-1">
                                {star}
                              </span>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>

                            <div className="flex-1 h-2 bg-[#2D2D2D] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>

                            <div className="w-12 text-right text-sm text-gray-400">
                              {percentage}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-6 border-b border-[#2D2D2D] last:border-none"
                    >
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center">
                          <img
                            src={review.avatar}
                            alt={review.username}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                          />
                          <div>
                            <div className="font-medium flex items-center">
                              {review.username}
                              {review.verified && (
                                <span className="ml-2 bg-green-900/30 text-green-500 text-xs px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {review.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>

                      <h4 className="font-bold mb-2">{review.title}</h4>
                      <p className="text-gray-300 text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>

                {/* Write a review button */}
                <div className="mt-8 text-center">
                  <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white">
                    Write a Review
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <a
              href="/products"
              className="text-accent hover:text-accent/80 flex items-center text-sm font-medium"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group"
              >
                <a href={`/product/${product.id}`} className="block">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                    />
                    {product.isNew && (
                      <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                        NEW
                      </div>
                    )}
                    {product.onSale && (
                      <div className="absolute top-2 right-2 bg-[#ff7b00] text-white text-xs font-bold px-2 py-1 rounded">
                        SALE
                      </div>
                    )}
                  </div>
                </a>
                <div className="p-4">
                  <a href={`/product/${product.id}`} className="block">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white group-hover:text-accent transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </h3>
                      <span className="font-bold text-accent whitespace-nowrap ml-2">
                        {product.price}
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center text-xs text-gray-400 mb-3">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{product.reviews} reviews</span>
                  </div>
                  <button className="w-full bg-[#2D2D2D] hover:bg-accent text-white py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Recently Viewed</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border border-[#2D2D2D] rounded-md"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border border-[#2D2D2D] rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* For now using related products as recently viewed */}
          {relatedProducts.length > 0 ? (
            relatedProducts.map((product) => (
              <div
                key={`recent-${product.id}`}
                className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group"
              >
                <a href={`/product/${product.id}`} className="block">
                  <div className="h-32 md:h-40 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                    />
                  </div>
                </a>
                <div className="p-3 md:p-4">
                  <a href={`/product/${product.id}`} className="block">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-sm text-white group-hover:text-accent transition-colors duration-300 line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="font-bold text-sm text-accent whitespace-nowrap ml-2">
                        {product.price}
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center text-xs text-gray-400">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Viewed recently</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-10 text-gray-400">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No recently viewed products</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
