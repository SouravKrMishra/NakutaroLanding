import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[90vh] md:min-h-screen flex items-center pt-16 md:pt-20 hero-gradient overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        
        {/* Anime-inspired animated elements */}
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
        
        {/* Floating anime icons */}
        <motion.div
          className="absolute -top-10 -left-10 w-16 h-16 text-accent/20"
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
          className="absolute -bottom-10 -right-10 w-14 h-14 text-accent/15"
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div 
            variants={fadeIn('right', 'tween', 0.2, 1)}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6 text-sm"
            >
              <span className="text-accent font-medium">Premium Anime Collections</span>
            </motion.div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3 md:mb-4 relative">
              <div className="inline-block relative">
                <motion.span 
                  className="text-accent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  ANIME INDIA
                </motion.span>
                <motion.div 
                  className="absolute -z-10 inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ delay: 0.4, duration: 1 }}
                >
                  <div className="absolute top-0 -left-4 w-2 h-2 bg-accent rounded-full"></div>
                  <div className="absolute bottom-0 -right-4 w-2 h-2 bg-accent rounded-full"></div>
                </motion.div>
              </div>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 sm:mb-6 text-white relative">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block"
              >
                Celebrating
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block"
              >
                the
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-block"
              >
                Fandom!
              </motion.span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed relative z-10">
              <span className="relative">
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300">India's #1 Anime Store</span>{" "}
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300 delay-100">Bringing You the Best</span>{" "}
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300 delay-200">Anime Merch</span>{" "}
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300 delay-300">Without the Hassle!</span>
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-accent hover:bg-accent/80 text-white font-medium rounded-md transition duration-300 text-base sm:text-lg shadow-lg hover:shadow-xl inline-flex items-center justify-center w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop
              </a>
              <a
                href="#services"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2D2D2D] hover:bg-[#333333] text-white font-medium rounded-md transition duration-300 text-base sm:text-lg border border-gray-700 relative overflow-hidden group w-full sm:w-auto"
              >
                <span className="relative z-10">Explore Collections</span>
                <span className="absolute w-0 h-full theme-hover-effect left-0 top-0 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="hidden lg:block relative"
          >
            {/* Image container with animated border */}
            <div className="relative group">
              {/* Animated glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 to-accent/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              
              {/* Image with hexagonal clip-path mask */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-lg"></div>
                <div className="relative overflow-hidden rounded-lg p-1 bg-[#131313] border border-accent/30">
                  {/* Main image */}
                  <img
                    src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Anime illustration"
                    className="w-full h-auto object-cover rounded transform group-hover:scale-105 transition duration-700 z-10"
                  />
                  
                  {/* Overlay texture */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay"></div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent/5 rounded-tr-full"></div>
                </div>
              </div>
              
              {/* Animated corner decorations */}
              <motion.div 
                className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-accent/70"
                animate={{ rotate: [0, 90, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-accent/70"
                animate={{ rotate: [0, -90, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Floating badge */}
              <div className="absolute -right-3 top-1/4 bg-[#1A1A1A] px-3 py-1.5 rounded-full border border-accent/30 shadow-lg transform rotate-3 animate-bounce-slow">
                <span className="text-accent text-xs font-medium">Top Collection</span>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -left-3 bottom-1/4 bg-[#1A1A1A] px-3 py-1.5 rounded-full border border-accent/30 shadow-lg transform -rotate-3 animate-bounce-slow animation-delay-1000">
                <span className="text-accent text-xs font-medium">Limited Edition</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent"></div>
      
      {/* Anime-style decorative circles */}
      <div className="absolute top-10 right-10 w-4 h-4 border-2 border-accent/30 rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-6 h-6 border-2 border-accent/20 rounded-full"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/20 rounded-full"></div>
    </section>
  );
};

export default HeroSection;
