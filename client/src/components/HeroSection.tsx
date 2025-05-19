import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Dark overlay with animated pattern */}
      <div className="absolute inset-0 bg-[#0A0A0A] z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>
      
      {/* Background effect elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-[10%] w-56 h-56 bg-accent rounded-full filter blur-[120px] opacity-20"></div>
        
        <div className="absolute bottom-40 right-[10%] w-72 h-72 bg-accent rounded-full filter blur-[100px] opacity-15"></div>
        
        <motion.div 
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent rounded-full filter blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
          transition={{ 
            duration: 10, 
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
      
      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row lg:items-center">
            {/* Text content */}
            <motion.div 
              variants={fadeIn('up', 'tween', 0.2, 1)}
              className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
            >
              <div className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6">
                <span className="text-accent font-medium text-sm">India's Premier Anime Store</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <div className="inline-block mb-2">
                  <span style={{ color: 'var(--theme-color-hex)' }}>ANIME INDIA</span>
                  <div 
                    className="block h-1 rounded-full mt-1 w-full"
                    style={{ backgroundColor: 'var(--theme-color-hex)', opacity: 0.3 }}
                  />
                </div>
                <div className="text-white block">Celebrating The Otaku Culture</div>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Discover authentic anime merchandise, exclusive collectibles, and limited edition items 
                from your favorite series — all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <a
                  href="https://shop.animeindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative px-8 py-4 bg-accent overflow-hidden text-white font-medium rounded-lg text-lg shadow-lg group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Shop Now
                  </span>
                  <span className="absolute bottom-0 left-0 h-1 bg-white group-hover:h-full w-full transition-all duration-300 ease-in-out opacity-20"></span>
                </a>
                
                <a
                  href="#products"
                  className="relative px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-medium rounded-lg text-lg transition duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Explore Collection</span>
                  <span className="absolute bottom-0 left-0 h-0 bg-gradient-to-r from-white/10 to-white/20 group-hover:h-full w-full transition-all duration-300 ease-in-out"></span>
                </a>
              </div>
            </motion.div>
            
            {/* Image / Visual component */}
            <motion.div 
              variants={fadeIn('up', 'tween', 0.4, 1)}
              className="lg:w-1/2 flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -top-10 -right-10 w-full h-full bg-accent/10 rounded-2xl transform rotate-3 z-0"></div>
                <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Anime collection showcase"
                    className="w-full h-auto transform hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 bg-accent/90 text-white text-xs px-3 py-1 rounded-full">
                    NEW ARRIVALS
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg border border-white/20">
                    20+ Exclusive Items
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Stats/Features section */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.6, 1)}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center"
          >
            {[
              { number: "5000+", label: "Happy Customers" },
              { number: "500+", label: "Unique Products" },
              { number: "50+", label: "Anime Series" },
              { number: "24/7", label: "Customer Support" }
            ].map((stat, index) => (
              <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#121212] to-transparent"></div>
    </section>
  );
};

export default HeroSection;
