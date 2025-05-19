import ProductsSection from "@/components/ProductsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useEffect, useState } from "react";
import { Filter, Grid, List, ChevronRight, Award, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  "Action Figures",
  "T-Shirts",
  "Accessories",
  "Hoodies"
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
  
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="flex items-center text-gray-300 hover:text-[#FF3B30] py-2 px-3 rounded hover:bg-[#FF3B30]/5 transition-colors duration-200"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-[#FF3B30]" />
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-[#2D2D2D]">
                <h3 className="font-bold text-lg mb-4">Filter By</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className="w-full accent-[#FF3B30]"
                        defaultValue="50"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>₹0</span>
                      <span>₹10,000+</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Rating</h4>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={`rating-${rating}`} 
                            className="mr-2 accent-[#FF3B30]"
                          />
                          <label htmlFor={`rating-${rating}`} className="flex items-center">
                            {Array(rating).fill(0).map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            ))}
                            {Array(5-rating).fill(0).map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-gray-600" />
                            ))}
                            <span className="ml-1 text-sm text-gray-400">& Up</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setView("list")}
                    className={`p-1 rounded ${view === "list" ? "bg-[#FF3B30] text-white" : "bg-[#2D2D2D] text-gray-400"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter className="h-3 w-3 mr-1" />
                    Filters
                  </Button>
                  <select className="bg-[#2D2D2D] text-gray-300 rounded p-1 text-sm border border-[#3D3D3D] focus:outline-none focus:ring-1 focus:ring-[#FF3B30]">
                    <option>Sort By: Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Rating: High to Low</option>
                    <option>Newest First</option>
                  </select>
                </div>
                <span className="text-sm text-gray-400">Showing 1-12 of 48 products</span>
              </div>
              
              <div className="border-t border-[#2D2D2D] pt-6">
                {/* Product Grid */}
                <ProductsSection showFullCatalog={true} />
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <div className="flex space-x-1">
                  <button className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 transform rotate-180" />
                  </button>
                  <button className="w-8 h-8 rounded bg-[#FF3B30] text-white flex items-center justify-center">1</button>
                  <button className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center">2</button>
                  <button className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center">3</button>
                  <button className="w-8 h-8 rounded bg-[#2D2D2D] flex items-center justify-center">
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