import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

const NewHeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-28 overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
      {/* Background patterns and effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="absolute top-20 left-[10%] w-56 h-56 bg-accent rounded-full filter blur-[120px] opacity-15"></div>
      <div className="absolute bottom-40 right-[10%] w-72 h-72 bg-accent rounded-full filter blur-[100px] opacity-10"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Text content */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-center lg:text-left"
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
                className="px-8 py-4 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg text-lg shadow-lg inline-flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop Now
              </a>
              
              <a
                href="#products"
                className="px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-medium rounded-lg text-lg transition-colors duration-300"
              >
                Explore Collection
              </a>
            </div>
          </motion.div>
          
          {/* Image */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.4, 1)}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-full h-full bg-accent/10 rounded-2xl transform rotate-3"></div>
              <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                  alt="Anime collection showcase"
                  className="w-full h-auto transform hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                <div className="absolute top-4 left-4 bg-accent/90 text-white text-xs px-3 py-1 rounded-full">
                  NEW ARRIVALS
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Stats section */}
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
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent"></div>
    </section>
  );
};

export default NewHeroSection;