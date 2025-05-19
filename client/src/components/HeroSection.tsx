import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { ChevronRight, ShoppingBag } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#121212]">
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6"
              >
                <span className="text-accent font-medium text-sm">India's Premium Anime Store</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-none mb-4"
              >
                <span className="block">Discover The World Of</span>
                <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-accent via-accent/80 to-accent" style={{ textShadow: '0 0 20px rgba(var(--theme-color-rgb), 0.4)' }}>
                  Anime Merchandise
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-gray-400 text-lg md:text-xl max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 mb-8"
              >
                Premium quality anime collectibles, apparel, and accessories from your favorite series. 
                Officially licensed products with fast shipping across India.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6"
              >
                <a
                  href="https://shop.animeindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-8 py-3.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg text-lg transition-all duration-300 w-full sm:w-auto shadow-lg shadow-accent/20 hover:shadow-accent/30 transform hover:-translate-y-1"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  <span>Shop Now</span>
                </a>
                
                <a
                  href="#products"
                  className="flex items-center text-white hover:text-accent transition-colors duration-300 font-medium text-lg w-full sm:w-auto justify-center sm:justify-start"
                >
                  <span>Explore Collections</span>
                  <ChevronRight className="h-5 w-5 ml-1" />
                </a>
              </motion.div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full transform -translate-x-1/4 translate-y-1/4 opacity-30"></div>
              <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#333] shadow-xl relative">
                <img
                  src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80"
                  alt="Anime Collectibles"
                  className="rounded-xl w-full object-cover aspect-square shadow-lg transform hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute -bottom-4 -right-4 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  NEW COLLECTIONS
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-gray-400 text-sm mb-2">Scroll to explore</span>
        <motion.div
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center p-1"
        >
          <motion.div
            animate={{ 
              y: [0, 12, 0],
              opacity: [1, 0.5, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-1.5 h-3 bg-accent rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;