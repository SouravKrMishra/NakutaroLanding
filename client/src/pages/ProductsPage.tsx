import ProductsSection from "@/components/ProductsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useEffect } from "react";

const ProductsPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="products-page pt-28 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h1
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="text-4xl font-bold mb-4"
          >
            Our Products
          </motion.h1>
          <motion.p
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-gray-400 text-lg"
          >
            Discover our wide range of premium anime merchandise, collectibles, 
            and apparel at Anime India - the ultimate destination for anime fans.
          </motion.p>
        </motion.div>
      </div>

      <ProductsSection showFullCatalog={true} />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default ProductsPage;