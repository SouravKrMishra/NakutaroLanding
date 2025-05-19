import ProductsSection from "@/components/ProductsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useEffect, useState } from "react";
import { Filter, Grid, List, ChevronRight, Award, Star, ShoppingBag, ChevronDown } from "lucide-react";
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

const featuredProducts = [
  {
    id: 1,
    name: "Naruto Uzumaki Sage Mode Figure",
    price: "₹3,999",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1608278047522-58806a6ac85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  },
  {
    id: 2,
    name: "Demon Slayer Tanjiro Premium Statue",
    price: "₹5,499",
    rating: 4.9,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1593642657768-a56ce2479fe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  },
  {
    id: 3,
    name: "My Hero Academia All Might T-Shirt",
    price: "₹999",
    rating: 4.6,
    reviews: 212,
    image: "https://images.unsplash.com/photo-1627237072130-a5f9d7e391c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
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
  
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const toggleCategory = (categoryName: string) => {
    setCategories(prev => prev.map(cat => 
      cat.name === categoryName ? {...cat, active: !cat.active} : cat
    ));
  };
  
  const handleRatingChange = (rating: number) => {
    setRatings(prev => ({...prev, [rating]: !prev[rating]}));
  };
  
  const clearFilters = () => {
    setCategories(initialCategories);
    setPriceRange(50);
    setRatings({5: false, 4: false, 3: false, 2: false, 1: false});
  };

  return (
    <div className="products-page pt-28 pb-16">
      {/* Hero Banner */}
      <div className="w-full bg-[#121212] relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[#FF3B30]/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.span
              variants={fadeIn("up", "tween", 0.1, 1)}
              className="text-[#FF3B30] font-semibold text-sm uppercase tracking-wider mb-2 block"
            >
              Best Collection
            </motion.span>
            <motion.h1
              variants={fadeIn("up", "tween", 0.2, 1)}
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            >
              Premium Anime <br />
              <span className="text-[#FF3B30]">Collectibles & Merchandise</span>
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
                className="bg-[#FF3B30] hover:bg-[#CC2F26] text-white"
              >
                Featured Items
              </Button>
              <Button 
                variant="outline"
                className="border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10"
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
              <Award className="text-[#FF3B30] mr-2 h-5 w-5" />
              Featured Products
            </h2>
            <a 
              href="#" 
              className="text-[#FF3B30] hover:text-[#FF6B61] flex items-center text-sm font-medium"
            >
              View All Featured
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <div 
                key={product.id}
                className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#2D2D2D] hover:border-[#FF3B30]/30 transition-all duration-300 group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-[#FF3B30] text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white group-hover:text-[#FF3B30] transition-colors duration-300">
                      {product.name}
                    </h3>
                    <span className="font-bold text-[#FF3B30]">{product.price}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <span>{product.reviews} reviews</span>
                  </div>
                  <button className="w-full bg-[#2D2D2D] hover:bg-[#FF3B30] text-white py-2 rounded flex items-center justify-center transition-colors duration-300">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Categories & All Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#2D2D2D] sticky top-24">
              <h3 className="font-bold text-lg mb-4">Product Categories</h3>
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
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter className="h-3 w-3 mr-1" />
                    Filters
                  </Button>
                  <div className="relative">
                    <select 
                      className="bg-[#2D2D2D] text-gray-300 appearance-none rounded px-3 py-1 text-sm border border-[#3D3D3D] focus:outline-none focus:ring-1 focus:ring-[#FF3B30] pr-8"
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
                {/* Product Grid */}
                <ProductsSection showFullCatalog={true} />
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