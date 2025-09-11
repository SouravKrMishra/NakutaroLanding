import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Heart,
  Sparkles,
  Tag,
  TrendingUp,
  CircleArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

// Import product images
import actionFigures1 from "@assets/actionfigures.jpg";
import kakashi from "@assets/kakashi.JPG";
import tshirtBack from "@assets/tshirt-back.jpg";
import tshirtFront from "@assets/tshirt-front.jpg";
import hoodieBack from "@assets/hoodie-back.jpg";
import hoodieFront from "@assets/hoodie-front.jpg";
import beserk from "@assets/beserk.jpg";
import vagabond from "@assets/vagabond.jpg";

interface ProductsSectionProps {
  showFullCatalog?: boolean;
}

const ProductsSection = ({ showFullCatalog = false }: ProductsSectionProps) => {
  // State to track current image index for each product
  const [currentImageIndices, setCurrentImageIndices] = useState<{
    [key: number]: number;
  }>({});

  const handleImageClick = (productIndex: number, totalImages: number) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [productIndex]: ((prev[productIndex] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (
    productIndex: number,
    totalImages: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setCurrentImageIndices((prev) => ({
      ...prev,
      [productIndex]:
        ((prev[productIndex] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const handleNextImage = (
    productIndex: number,
    totalImages: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setCurrentImageIndices((prev) => ({
      ...prev,
      [productIndex]: ((prev[productIndex] || 0) + 1) % totalImages,
    }));
  };

  const featuredProducts = [
    {
      title: "Action Figures",
      description:
        "Premium collectible action figures featuring your favorite anime characters",
      price: "₹1,299 - ₹4,599",
      badge: "New Arrivals",
      images: [actionFigures1, kakashi],
    },
    {
      title: "Anime T-Shirts",
      description:
        "Stylish and comfortable t-shirts with exclusive anime designs",
      price: "₹599 - ₹999",
      badge: "Best Seller",
      images: [tshirtBack, tshirtFront],
    },
    {
      title: "Anime Hoodies",
      description:
        "Premium hoodies featuring iconic anime artwork and characters",
      price: "₹1,199 - ₹2,499",
      badge: "Limited Edition",
      images: [hoodieBack, hoodieFront],
    },
    {
      title: "Manga Collection",
      description:
        "Complete manga series in premium quality print with special edition covers",
      price: "₹499 - ₹7,999",
      badge: "Popular",
      images: [beserk, vagabond],
    },
  ];

  // const additionalProducts = [
  //   {
  //     title: "Anime Posters",
  //     description:
  //       "High-quality prints and posters to decorate your space with anime art",
  //     price: "₹299 - ₹1,499",
  //     badge: "New Collection",
  //     images: [
  //       "https://images.unsplash.com/photo-1543589067-47d16999c54f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
  //       "https://images.unsplash.com/photo-1540714323673-d74c355eb58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
  //     ],
  //   },
  // ];

  // Determine which products to show based on the showFullCatalog prop
  const products = showFullCatalog
    ? [...featuredProducts] //use spread operator to add additional products
    : featuredProducts;

  // Product categories for filters
  const categories = [
    { name: "All Products", icon: <ShoppingBag className="h-4 w-4" /> },
    { name: "New Arrivals", icon: <Sparkles className="h-4 w-4" /> },
    { name: "Best Sellers", icon: <TrendingUp className="h-4 w-4" /> },
    { name: "Limited Edition", icon: <Star className="h-4 w-4" /> },
    { name: "Sale Items", icon: <Tag className="h-4 w-4" /> },
  ];

  return (
    <section id="products" className="py-20 relative overflow-hidden">
      {/* Background elements - static, no animations */}
      <div className="absolute inset-0 bg-[#0A0A0A] overflow-hidden">
        {/* Static geometric elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full"></div>
        <div className="absolute top-40 left-[15%] w-6 h-6 border border-accent/30 rounded-full"></div>
        <div className="absolute bottom-40 right-[20%] w-8 h-8 border border-white/20 rounded-sm"></div>
        <div className="absolute top-1/2 right-[10%] w-4 h-4 bg-accent/10 rounded-md"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Collection Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mb-16"
        >
          {/* Collection Header */}
          <motion.div
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="mb-12 text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="inline-block bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 mb-6"
            >
              <span className="text-accent font-medium text-sm flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-2" />
                PREMIUM COLLECTION
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
              Premium <span className="text-accent">Anime</span>
            </h2>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Collectibles & <span className="text-accent">Merchandise</span>
            </h2>

            <motion.div
              variants={fadeIn("up", "tween", 0.2, 1)}
              className="max-w-2xl mx-auto lg:mx-0"
            >
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Discover authentic anime merchandise from your favorite series.
                From action figures to apparel, we have everything an anime fan
                could want.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn("up", "tween", 0.3, 1)}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <a
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <span className="absolute bottom-0 left-0 h-1 w-full bg-white opacity-10"></span>
                <span className="absolute right-0 -mt-3 h-16 w-16 rotate-45 translate-x-8 -translate-y-2 bg-white opacity-10"></span>
                <span className="relative flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Featured Items
                </span>
              </a>

              <a
                href="/categories"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                  View Categories
                </span>
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={index}
              variants={fadeIn(
                "up",
                "tween",
                0.1 + Math.min(index * 0.05, 0.3),
                1
              )}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden group hover:border-accent/30 transition-all duration-300 shadow-lg will-change-transform border border-accent/40"
            >
              <div className="relative h-60 sm:h-60 md:h-72 overflow-hidden">
                {/* Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <div className="bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                    {product.badge}
                  </div>
                </div>

                {/* Favorite Actions */}
                {/* <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-2 rounded-full shadow-lg transition-colors duration-300">
                    <Heart className="h-4 w-4" />
                  </button>
                </div> */}

                {/* Images with slider functionality */}
                <div
                  className="relative h-full cursor-pointer"
                  onClick={() => handleImageClick(index, product.images.length)}
                >
                  {/* Previous button */}
                  <button
                    onClick={(e) =>
                      handlePrevImage(index, product.images.length, e)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Next button */}
                  <button
                    onClick={(e) =>
                      handleNextImage(index, product.images.length, e)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Current image with smooth transition */}
                  <motion.div
                    key={currentImageIndices[index] || 0}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Blurred background image */}
                    <div className="absolute inset-0">
                      <img
                        src={product.images[currentImageIndices[index] || 0]}
                        alt={`${product.title} background`}
                        className="w-full h-full object-cover blur-sm opacity-20 scale-110"
                      />
                    </div>
                    {/* Main product image */}
                    <img
                      src={product.images[currentImageIndices[index] || 0]}
                      alt={`${product.title} ${
                        (currentImageIndices[index] || 0) + 1
                      }`}
                      loading="lazy"
                      decoding="async"
                      className="relative w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 will-change-transform"
                    />
                  </motion.div>

                  {/* Image counter */}
                  <div className="absolute bottom-2 right-2 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {(currentImageIndices[index] || 0) + 1} /{" "}
                    {product.images.length}
                  </div>
                </div>
              </div>

              <div className="p-6 relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors duration-300">
                    {product.title}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm text-gray-300 ml-1">4.9</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-accent">
                    {product.price}
                  </div>

                  {showFullCatalog ? (
                    <a
                      href="https://shop.animeindia.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors duration-300"
                    >
                      <CircleArrowRight className="h-5 w-5" />
                    </a>
                  ) : (
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors duration-300"
                    >
                      <CircleArrowRight className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View more button */}
        {!showFullCatalog && (
          <motion.div
            variants={fadeIn("up", "tween", 0.6, 1)}
            className="mt-16 text-center"
          >
            <Link
              href="/products"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
            >
              <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
              </span>
              <span className="relative flex items-center">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Static accent elements - removed animated elements */}
      <div className="absolute top-1/4 left-8 w-2 h-2 bg-accent rounded-full opacity-30"></div>
      <div className="absolute bottom-1/4 right-8 w-2 h-2 bg-accent rounded-full opacity-30"></div>
      <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-white rounded-full opacity-20"></div>

      {/* Accent glows */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-accent rounded-full opacity-[0.02] filter blur-[100px]"></div>
    </section>
  );
};

export default ProductsSection;
