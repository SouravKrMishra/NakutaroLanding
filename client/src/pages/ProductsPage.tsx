import axios from "axios";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
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
  Shirt,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { FeaturedProductsSkeleton } from "@/components/FeaturedProductsSkeleton";

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
  id: number;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isNew?: boolean;
  onSale?: boolean;
};

const ProductsPage = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number[]>([]);
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
  const [sizes, setSizes] = useState<{ [key: string]: boolean }>({
    S: false,
    M: false,
    L: false,
    XL: false,
    XXL: false,
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
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);
  const pageSize = 12;

  const debouncedPriceRange = useDebounce(committedPriceRange, 1000);
  const debouncedRatings = useDebounce(ratings, 1000);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setFeaturedLoading(true);
      try {
        const response = await axios.get("/api/featured-products");
        const mappedFeaturedProducts = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          rating: item.average_rating ? parseFloat(item.average_rating) : 0,
          reviews: item.rating_count,
          image: item.images[0]?.src || "",
          category: item.categories[0]?.name || "Uncategorized",
          isNew: false,
          onSale: item.on_sale,
        }));
        setFeaturedProducts(mappedFeaturedProducts);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
      setFeaturedLoading(false);
    };
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories", {
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
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [includeOutOfStock]);

  useEffect(() => {
    const fetchProducts = async () => {
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

        const response = await axios.get("/api/products", {
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
                item.price !== ""
              );
            }
            // If including out of stock, allow all
            return true;
          })
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            rating: item.average_rating ? parseFloat(item.average_rating) : 0,
            reviews: item.rating_count,
            image: item.images[0]?.src || "",
            category: item.categories[0]?.name || "Uncategorized",
            isNew: false,
            onSale: item.on_sale,
          }));

        setProducts(mappedProducts);
        setTotalProducts(totalProducts);
        setTotalPages(totalPages);
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

  const handleCategoryClick = (categoryId: number) => {
    setActiveCategory((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setRatings((prev) => ({ ...prev, [rating]: !prev[rating] }));
    setCurrentPage(1);
  };

  const isClothingCategorySelected = () => {
    const clothingKeywords = ["clothing", "hoodie", "t-shirt", "oversized"];
    return activeCategory.some((catId) => {
      const category = categories.find((cat) => cat.id === catId);
      return (
        category &&
        clothingKeywords.some((keyword) =>
          category.name.toLowerCase().includes(keyword)
        )
      );
    });
  };

  const handleSizeChange = (size: string) => {
    setSizes((prev) => ({ ...prev, [size]: !prev[size] }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    // Check if filters are already in default state
    const isDefaultState =
      activeCategory.length === 0 &&
      priceRange[0] === 0 &&
      priceRange[1] === 10000 &&
      committedPriceRange[0] === 0 &&
      committedPriceRange[1] === 10000 &&
      Object.values(ratings).every((rating) => !rating) &&
      Object.values(sizes).every((size) => !size) &&
      sortBy === "Relevance" &&
      !includeOutOfStock;

    // Only update state if not already in default state
    if (!isDefaultState) {
      setActiveCategory([]);
      setPriceRange([0, 10000]);
      setCommittedPriceRange([0, 10000]);
      setRatings({ 5: false, 4: false, 3: false, 2: false, 1: false });
      setSizes({ S: false, M: false, L: false, XL: false, XXL: false });
      setSortBy("Relevance");
      setCurrentPage(1);
      setIncludeOutOfStock(false);
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
                  <div className="h-48 sm:h-56 md:h-64 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-all duration-500"
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
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="flex flex-col items-start mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-accent transition-colors duration-300 mb-1">
                          {product.name}
                        </h3>
                        <span className="font-bold text-accent">
                          ₹{product.price}
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>{product.rating}</span>
                        </div>
                        <span className="mx-2">•</span>
                        <span>{product.reviews} reviews</span>
                      </div>
                    </div>
                    <button className="w-full bg-[#2D2D2D] hover:bg-accent text-white py-1.5 sm:py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm sm:text-base">
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
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium ${
                              activeCategory.includes(category.id)
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

                  {/* Size Filter - Only show for clothing categories */}
                  {isClothingCategorySelected() && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Shirt className="h-4 w-4 text-accent" />
                        Size
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(sizes).map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSizeChange(size)}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium ${
                              sizes[size]
                                ? "bg-accent text-white border-accent shadow-lg shadow-accent/25"
                                : "bg-[#181818] text-gray-300 border-[#2D2D2D] hover:bg-accent/10 hover:text-accent hover:border-accent/50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
                          className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group flex flex-col"
                        >
                          <div className="h-48 sm:h-56 md:h-64 overflow-hidden relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-all duration-500"
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
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <div className="flex-grow">
                              <div className="flex flex-col items-start mb-2">
                                <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-accent transition-colors duration-300 mb-1">
                                  {product.name}
                                </h3>
                                <span className="font-bold text-accent">
                                  ₹{product.price}
                                </span>
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                  <span>{product.rating}</span>
                                </div>
                                <span className="mx-2">•</span>
                                <span>{product.reviews} reviews</span>
                              </div>
                            </div>
                            <button className="w-full bg-[#2D2D2D] hover:bg-accent text-white py-1.5 sm:py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm sm:text-base">
                              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Add to Cart
                            </button>
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
                          className="flex flex-col md:flex-row bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-accent/30 transition-all duration-300 group"
                        >
                          <div className="md:w-1/4 h-48 md:h-auto overflow-hidden relative">
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
                              Premium quality {product.category.toLowerCase()}{" "}
                              featuring your favorite anime characters.
                              Officially licensed merchandise with the best
                              quality and authentic designs.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                              <button className="bg-[#2D2D2D] hover:bg-accent text-white px-6 py-2 rounded flex items-center justify-center transition-colors duration-300">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Add to Cart
                              </button>
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
