import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ShoppingBag, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-screen pt-16 md:pt-20 overflow-hidden bg-[#121212]">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        
        {/* Anime-inspired decorative elements */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-40 h-40 bg-accent rounded-full filter blur-[80px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-accent rounded-full filter blur-[100px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Flying elements */}
        <motion.div
          className="absolute -top-10 -left-10 w-20 h-20 text-accent/20"
          animate={{
            x: [0, window.innerWidth + 20],
            y: [0, window.innerHeight + 20],
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z" opacity="0.4"></path><path d="M10.14,13.79a1,1,0,0,0,1.72,0l2.41-4a1,1,0,0,0-1.72-1L10.85,12Z"></path></svg>
        </motion.div>
        
        <motion.div
          className="absolute -bottom-10 -right-10 w-16 h-16 text-accent/15"
          animate={{
            x: [window.innerWidth, -20],
            y: [window.innerHeight, -20],
            rotate: [0, -360]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21,7H3A1,1,0,0,0,2,8V16a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V8A1,1,0,0,0,21,7ZM11,14.71a.79.79,0,0,1-.71.29.83.83,0,0,1-.7-.29L7.33,12H9.21l1.05,1.29L14.79,9H10a1,1,0,0,1,0-2h5a1,1,0,0,1,.92.62,1,1,0,0,1-.21,1.09Z"></path></svg>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6"
            >
              <span className="text-accent font-medium text-sm">Premium Anime Collection</span>
            </motion.div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              <div className="inline-block">
                <span style={{ color: 'var(--theme-color-hex)' }}>ANIME INDIA</span>
                <div 
                  className="block h-1 rounded-full mt-1"
                  style={{ backgroundColor: 'var(--theme-color-hex)', opacity: 0.3 }}
                />
              </div>
              <div className="text-white block mt-2">Celebrating the Fandom!</div>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto px-2 sm:px-0"
            >
              India's #1 Anime Store Bringing You the Best Anime Merch Without the Hassle!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <a
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-md transition duration-300 text-base sm:text-lg shadow-lg hover:shadow-xl inline-flex items-center justify-center w-full sm:w-auto"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Shop
              </a>
              <a
                href="#products"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#1A1A1A] hover:bg-[#252525] text-white font-medium rounded-md transition duration-300 text-base sm:text-lg border border-[#333] relative overflow-hidden group w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center">
                  Explore Collections
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </motion.div>
            
            {/* Hero image for all screen sizes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="mt-12 sm:mt-16 max-w-4xl mx-auto w-full"
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl border border-[#333]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80"
                  alt="Anime collection showcase"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-0 w-full text-center z-20">
                  <span className="inline-block bg-accent/80 backdrop-blur-sm text-white text-sm font-medium px-4 py-1 rounded-full">
                    Featured Collection
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#121212] to-transparent"></div>
    </section>
  );
};

export default HeroSection;
