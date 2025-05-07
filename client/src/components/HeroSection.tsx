import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 hero-gradient overflow-hidden">
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              Innovative <span className="text-gradient">Solutions</span> for Tomorrow's Challenges
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              Nakutaro helps businesses transform their digital presence with cutting-edge technology and strategic innovation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="#contact"
                className="px-8 py-3 bg-[#FF3B30] hover:bg-[#CC2F26] text-white font-medium rounded-md transition duration-300 text-lg shadow-lg hover:shadow-xl"
              >
                Get Started
              </a>
              <a
                href="#about"
                className="px-8 py-3 bg-[#2D2D2D] hover:bg-[#333333] text-white font-medium rounded-md transition duration-300 text-lg border border-gray-700"
              >
                Learn More
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn('left', 'tween', 0.4, 1)}
            className="hidden lg:block"
          >
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
              alt="Innovative technology visualization"
              className="rounded-lg shadow-2xl w-full h-auto transform hover:scale-105 transition duration-700"
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent"></div>
      <div className="absolute top-1/2 left-0 w-20 h-20 bg-[#FF3B30] rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#FF3B30] rounded-full filter blur-3xl opacity-5"></div>
    </section>
  );
};

export default HeroSection;
