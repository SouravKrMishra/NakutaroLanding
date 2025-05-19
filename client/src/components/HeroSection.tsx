import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 hero-gradient overflow-hidden w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
              <span className="text-gradient">ANIME INDIA</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl font-medium mb-6 text-gray-300">Celebrating the Fandom!</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              India's #1 Anime Store Bringing You the Best Anime Merch Without the Hassle!
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-accent hover:bg-accent/80 text-white font-medium rounded-md transition duration-300 text-lg shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop
              </a>
              <a
                href="#services"
                className="px-8 py-3 bg-[#2D2D2D] hover:bg-[#333333] text-white font-medium rounded-md transition duration-300 text-lg border border-gray-700 relative overflow-hidden group"
              >
                <span className="relative z-10">Explore Collections</span>
                <span className="absolute w-0 h-full theme-hover-effect left-0 top-0 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="hidden lg:block"
          >
            <img
              src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Anime illustration"
              className="rounded-lg shadow-2xl w-full h-auto transform hover:scale-105 transition duration-700 border-2 border-accent/20"
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent"></div>
      <div className="absolute top-1/2 left-0 w-20 h-20 bg-accent rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-accent rounded-full filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default HeroSection;
