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
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3 md:mb-4">
              <div className="inline-block">
                <span style={{ color: 'var(--theme-color-hex)' }}>ANIME INDIA</span>
                <div 
                  className="block h-1 rounded-full mt-1"
                  style={{ backgroundColor: 'var(--theme-color-hex)', opacity: 0.3 }}
                />
              </div>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 sm:mb-6 text-gray-300">Celebrating the Fandom!</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
              India's #1 Anime Store Bringing You the Best Anime Merch Without the Hassle!
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
            <div className="absolute -inset-4 bg-accent/5 rounded-lg blur-md"></div>
            <img
              src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Anime illustration"
              className="rounded-lg shadow-2xl w-full h-auto transform hover:scale-105 transition duration-700 border-2 border-accent/20 relative z-10"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/10 rounded-full"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-accent/10 rounded-full"></div>
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
