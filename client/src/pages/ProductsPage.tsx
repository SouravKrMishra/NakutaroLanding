import ProductsSection from "@/components/ProductsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useEffect, useState } from "react";
import { Filter, Grid, List, ChevronRight, Award, Star, ShoppingBag, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = {
  name: string;
  count: number;
  active: boolean;
};

type SortOption = 
  | "Featured" 
  | "Price: Low to High" 
  | "Price: High to Low" 
  | "Rating: High to Low" 
  | "Newest First";

const initialCategories: Category[] = [
  { name: "Action Figures", count: 18, active: false },
  { name: "T-Shirts", count: 12, active: false },
  { name: "Accessories", count: 9, active: false },
  { name: "Hoodies", count: 8, active: false }
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

const allProducts: Product[] = [
  // Action Figures
  {
    id: 1,
    name: "Naruto Uzumaki Sage Mode Figure",
    price: "₹3,999",
    rating: 4.8,
    reviews: 124,
    category: "Action Figures",
    image: "https://i.imgur.com/1mQWQdB.jpg",
    isNew: true
  },
  {
    id: 2,
    name: "Demon Slayer Tanjiro Premium Statue",
    price: "₹5,499",
    rating: 4.9,
    reviews: 87,
    category: "Action Figures",
    image: "https://i.imgur.com/0N0xC6p.jpg"
  },
  {
    id: 3,
    name: "Attack on Titan Levi Figure",
    price: "₹4,299",
    rating: 4.7,
    reviews: 92,
    category: "Action Figures",
    image: "https://i.imgur.com/zCPXQl9.jpg"
  },
  {
    id: 4,
    name: "Dragon Ball Goku Ultra Instinct Statue",
    price: "₹6,999",
    rating: 4.9,
    reviews: 156,
    category: "Action Figures",
    image: "https://i.imgur.com/q8VaLQK.jpg",
    isNew: true
  },
  
  // T-Shirts
  {
    id: 5,
    name: "My Hero Academia All Might T-Shirt",
    price: "₹999",
    rating: 4.6,
    reviews: 212,
    category: "T-Shirts",
    image: "https://i.imgur.com/pBbwJqK.jpg"
  },
  {
    id: 6,
    name: "One Piece Straw Hat Pirates Tee",
    price: "₹1,199",
    rating: 4.3,
    reviews: 178,
    category: "T-Shirts",
    image: "https://i.imgur.com/s6M8PQf.jpg",
    onSale: true
  },
  {
    id: 7,
    name: "Chainsaw Man Pochita T-Shirt",
    price: "₹899",
    rating: 4.4,
    reviews: 89,
    category: "T-Shirts",
    image: "https://i.imgur.com/mOGGYQY.jpg"
  },
  
  // Accessories
  {
    id: 8,
    name: "Anime Character Keychains Set",
    price: "₹499",
    rating: 4.2,
    reviews: 124,
    category: "Accessories",
    image: "https://i.imgur.com/A8a3QWR.jpg"
  },
  {
    id: 9,
    name: "Anime Logo Enamel Pin Collection",
    price: "₹799",
    rating: 4.1,
    reviews: 67,
    category: "Accessories",
    image: "https://i.imgur.com/eMhCgYX.jpg"
  },
  {
    id: 10,
    name: "Anime Characters Phone Case",
    price: "₹599",
    rating: 3.9,
    reviews: 152,
    category: "Accessories",
    image: "https://i.imgur.com/MaQFDZF.jpg",
    isNew: true
  },
  
  // Hoodies
  {
    id: 11,
    name: "Naruto Akatsuki Clouds Hoodie",
    price: "₹2,499",
    rating: 4.7,
    reviews: 203,
    category: "Hoodies",
    image: "https://i.imgur.com/1KqzRQl.jpg",
    onSale: true
  },
  {
    id: 12,
    name: "Attack on Titan Scout Regiment Hoodie",
    price: "₹2,299",
    rating: 4.5,
    reviews: 156,
    category: "Hoodies",
    image: "https://i.imgur.com/FvA5FOD.jpg"
  }
];

const ProductsPage = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [priceRange, setPriceRange] = useState<number>(50);
  const [ratings, setRatings] = useState<{[key: number]: boolean}>({
    5: false, 
    4: false, 
    3: false, 
    2: false, 
    1: false
  });
  const [sortBy, setSortBy] = useState<SortOption>("Featured");
  const [showingProducts, setShowingProducts] = useState<number>(12);
  const [totalProducts, setTotalProducts] = useState<number>(48);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState<boolean>(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(allProducts.slice(0, 3));
  
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Apply filters whenever filter settings change
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Filter by active categories
    const activeCategories = categories.filter(c => c.active).map(c => c.name);
    if (activeCategories.length > 0) {
      filtered = filtered.filter(product => activeCategories.includes(product.category));
    }
    
    // Filter by price range
    const maxPrice = 10000;
    const priceThreshold = (priceRange / 100) * maxPrice;
    filtered = filtered.filter(product => parseInt(product.price.replace(/[^\d]/g, '')) <= priceThreshold);
    
    // Filter by rating
    const activeRatings = Object.entries(ratings)
      .filter(([_, isActive]) => isActive)
      .map(([rating, _]) => parseInt(rating));
    
    if (activeRatings.length > 0) {
      filtered = filtered.filter(product => 
        activeRatings.some(rating => product.rating >= rating)
      );
    }
    
    // Apply sorting
    if (sortBy === "Price: Low to High") {
      filtered.sort((a, b) => 
        parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''))
      );
    } else if (sortBy === "Price: High to Low") {
      filtered.sort((a, b) => 
        parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''))
      );
    } else if (sortBy === "Rating: High to Low") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Newest First") {
      filtered.sort((a, b) => (a.isNew ? -1 : 1) - (b.isNew ? -1 : 1));
    }
    
    setFilteredProducts(filtered);
    setShowingProducts(Math.min(filtered.length, 12));
    setTotalProducts(filtered.length);
  }, [categories, priceRange, ratings, sortBy]);
  
  const toggleCategory = (categoryName: string) => {
    setCategories(prev => prev.map(cat => 
      cat.name === categoryName ? {...cat, active: !cat.active} : cat
    ));
  };
  
  const handleRatingChange = (rating: number) => {
    setRatings(prev => ({...prev, [rating]: !prev[rating]}));
  };
  
  const clearFilters = () => {
    setCategories(initialCategories.map(cat => ({ ...cat, active: false })));
    setPriceRange(50);
    setRatings({5: false, 4: false, 3: false, 2: false, 1: false});
  };
  
  const toggleFilterSidebar = () => {
    setFilterSidebarOpen(!filterSidebarOpen);
  };

  return (
    <div className="products-page pt-28 pb-16">
      {/* Hero Banner */}
      <div className="w-full bg-[#121212] relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-accent/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.span
              variants={fadeIn("up", "tween", 0.1, 1)}
              className="text-accent font-semibold text-sm uppercase tracking-wider mb-2 block"
            >
              Best Collection
            </motion.span>
            <motion.h1
              variants={fadeIn("up", "tween", 0.2, 1)}
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            >
              Premium Anime <br />
              <span className="text-accent">Collectibles & Merchandise</span>
            </motion.h1>
            <motion.p
              variants={fadeIn("up", "tween", 0.3, 1)}
              className="text-gray-400 text-lg mb-8"
            >
              Discover authentic anime merchandise from your favorite series. 
              From action figures to apparel, we have everything an anime fan could want.
            </motion.p>
            <motion.div
              variants={fadeIn("up", "tween", 0.4, 1)}
              className="flex space-x-4"
            >
              <Button 
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Featured Items
              </Button>
              <Button 
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
              >
                View Categories
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {filteredProducts.slice(0, 4).map(product => (
              <div 
                key={product.id}
                className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-[#FF3B30]/30 transition-all duration-300 group"
              >
                <div className="h-36 sm:h-40 md:h-48 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-all duration-500"
                  />
                  {product.isNew && (
                    <div className="absolute top-2 right-2 bg-[#FF3B30] text-white text-xs font-bold px-2 py-1 rounded">
                      NEW
                    </div>
                  )}
                  {product.onSale && (
                    <div className="absolute top-2 right-2 bg-[#ff7b00] text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#FF3B30] transition-colors duration-300 mb-1 sm:mb-0">
                      {product.name}
                    </h3>
                    <span className="font-bold text-[#FF3B30]">{product.price}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{product.reviews} reviews</span>
                  </div>
                  <button className="w-full bg-[#2D2D2D] hover:bg-[#FF3B30] text-white py-1.5 sm:py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm sm:text-base">
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Categories & All Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {/* Left Sidebar - Categories */}
          <div className={`lg:col-span-1 ${filterSidebarOpen ? 'block filter-sidebar-animate-in' : 'hidden lg:block'}`}>
            <div className="bg-[#1E1E1E] rounded-lg p-4 sm:p-5 md:p-6 border border-[#2D2D2D] sticky top-20 md:top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Product Categories</h3>
                <button 
                  onClick={toggleFilterSidebar}
                  className="lg:hidden bg-[#2D2D2D] hover:bg-[#3D3D3D] p-1 rounded text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category.name}>
                    <button 
                      onClick={() => toggleCategory(category.name)}
                      className={`flex items-center w-full text-left ${category.active ? 'text-[#FF3B30]' : 'text-gray-300'} hover:text-[#FF3B30] py-2 px-2 rounded hover:bg-[#FF3B30]/5 transition-colors duration-200`}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-[#FF3B30]" />
                      <span className="flex-1">{category.name}</span>
                      {category.count > 0 && (
                        <span className="text-xs text-gray-500">({category.count})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-[#2D2D2D]">
                <h3 className="font-bold text-lg mb-4">Filter By</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#FF3B30]"
                        value={priceRange}
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #FF3B30 0%, #FF3B30 ${priceRange}%, #444 ${priceRange}%, #444 100%)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>₹0</span>
                      <span>₹10,000+</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={`rating-${rating}`}
                            checked={ratings[rating]}
                            onChange={() => handleRatingChange(rating)}
                            className="w-4 h-4 rounded border-gray-600 text-[#FF3B30] focus:ring-[#FF3B30] focus:ring-opacity-25 bg-gray-800"
                          />
                          <label htmlFor={`rating-${rating}`} className="flex items-center ml-2 cursor-pointer">
                            {Array(rating).fill(0).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                            {Array(5-rating).fill(0).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-gray-600" />
                            ))}
                            <span className="ml-1 text-sm text-gray-400">& Up</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearFilters}
                    className="w-full text-gray-300 border-gray-600 hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] hover:border-[#FF3B30]"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - All Products */}
          <div className="lg:col-span-3">
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#2D2D2D] mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Products</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">View:</span>
                  <button 
                    onClick={() => setView("grid")}
                    className={`p-1 rounded ${view === "grid" ? "bg-[#FF3B30] text-white" : "bg-[#2D2D2D] text-gray-400"}`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setView("list")}
                    className={`p-1 rounded ${view === "list" ? "bg-[#FF3B30] text-white" : "bg-[#2D2D2D] text-gray-400"}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center lg:hidden bg-[#2D2D2D] hover:bg-[#3D3D3D] py-2 px-3"
                    onClick={toggleFilterSidebar}
                  >
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span>{filterSidebarOpen ? 'Hide Filters' : 'Show Filters'}</span>
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-300 ${filterSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </Button>
                  <div className="relative max-w-[140px] sm:max-w-none">
                    <select 
                      className="bg-[#2D2D2D] text-gray-300 appearance-none rounded px-2 sm:px-3 py-1 text-xs sm:text-sm border border-[#3D3D3D] focus:outline-none focus:ring-1 focus:ring-[#FF3B30] pr-6 sm:pr-8 w-full"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                      <option value="Featured">Sort By: Featured</option>
                      <option value="Price: Low to High">Price: Low to High</option>
                      <option value="Price: High to Low">Price: High to Low</option>
                      <option value="Rating: High to Low">Rating: High to Low</option>
                      <option value="Newest First">Newest First</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <span className="text-sm text-gray-400">Showing 1-{showingProducts} of {totalProducts} products</span>
              </div>
              
              <div className="border-t border-[#2D2D2D] pt-6">
                {/* Grid View */}
                {view === "grid" && (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-[#FF3B30]/30 transition-all duration-300 group"
                      >
                        <div className="h-36 sm:h-40 md:h-48 overflow-hidden relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-contain sm:object-cover group-hover:scale-110 transition-all duration-500"
                          />
                          {product.isNew && (
                            <div className="absolute top-2 right-2 bg-[#FF3B30] text-white text-xs font-bold px-2 py-1 rounded">
                              NEW
                            </div>
                          )}
                          {product.onSale && (
                            <div className="absolute top-2 right-2 bg-[#ff7b00] text-white text-xs font-bold px-2 py-1 rounded">
                              SALE
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#FF3B30] transition-colors duration-300 mb-1 sm:mb-0">
                              {product.name}
                            </h3>
                            <span className="font-bold text-[#FF3B30]">{product.price}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span>{product.rating}</span>
                            </div>
                            <span className="mx-2">•</span>
                            <span>{product.reviews} reviews</span>
                          </div>
                          <button className="w-full bg-[#2D2D2D] hover:bg-[#FF3B30] text-white py-1.5 sm:py-2 rounded flex items-center justify-center transition-colors duration-300 text-sm sm:text-base">
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
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        className="flex flex-col md:flex-row bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-[#FF3B30]/30 transition-all duration-300 group"
                      >
                        <div className="md:w-1/4 h-48 md:h-auto overflow-hidden relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          />
                          {product.isNew && (
                            <div className="absolute top-2 right-2 bg-[#FF3B30] text-white text-xs font-bold px-2 py-1 rounded">
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
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold text-white group-hover:text-[#FF3B30] transition-colors duration-300">
                              {product.name}
                            </h3>
                            <span className="font-bold text-xl text-[#FF3B30]">{product.price}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400 mb-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span>{product.rating}</span>
                            </div>
                            <span className="mx-2">•</span>
                            <span>{product.reviews} reviews</span>
                            <span className="mx-2">•</span>
                            <span className="text-gray-500">{product.category}</span>
                          </div>
                          <p className="text-gray-400 mb-4 flex-grow">
                            Premium quality {product.category.toLowerCase()} featuring your favorite anime characters.
                            Officially licensed merchandise with the best quality and authentic designs.
                          </p>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button className="bg-[#2D2D2D] hover:bg-[#FF3B30] text-white px-6 py-2 rounded flex items-center justify-center transition-colors duration-300">
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
                    className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center text-gray-400 hover:bg-[#3D3D3D] transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronRight className="h-4 w-4 transform rotate-180" />
                  </button>
                  
                  {[1, 2, 3, 4].map(page => (
                    <button 
                      key={page}
                      className={`w-8 h-8 rounded ${page === 1 ? 'bg-[#FF3B30] text-white' : 'bg-[#2D2D2D] text-gray-300 hover:bg-[#3D3D3D]'} flex items-center justify-center transition-colors`}
                      aria-label={`Page ${page}`}
                      aria-current={page === 1 ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
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
      </div>

      <FAQSection />
      <CTASection />
    </div>
  );
};

export default ProductsPage;