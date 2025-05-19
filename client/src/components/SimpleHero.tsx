import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

interface SimpleHeroProps {
  title: string;
  subtitle: string;
  description: string;
  showButtons?: boolean;
  hasImage?: boolean;
  tagText?: string;
}

const SimpleHero = ({
  title,
  subtitle,
  description,
  showButtons = true,
  hasImage = true,
  tagText = "India's Premier Anime Store"
}: SimpleHeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center pt-28 pb-16 bg-[#0A0A0A] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0"></div>
      
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full" 
           style={{
             backgroundColor: 'var(--theme-color-hex)',
             opacity: 0.1,
             filter: 'blur(100px)'
           }}></div>
           
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full" 
           style={{
             backgroundColor: 'var(--theme-color-hex)',
             opacity: 0.05,
             filter: 'blur(100px)'
           }}></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col lg:flex-row gap-12 items-center"
        >
          {/* Text content */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="lg:w-1/2 text-center lg:text-left"
          >
            {tagText && (
              <div className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6">
                <span className="text-accent font-medium text-sm">{tagText}</span>
              </div>
            )}
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <div className="inline-block mb-2">
                <span style={{ color: 'var(--theme-color-hex)' }}>{title}</span>
                <div 
                  className="block h-1 rounded-full mt-1 w-full"
                  style={{ backgroundColor: 'var(--theme-color-hex)', opacity: 0.3 }}
                />
              </div>
              <div className="text-white block mt-2">{subtitle}</div>
            </h1>
            
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0">
              {description}
            </p>
            
            {showButtons && (
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <a
                  href="https://shop.animeindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 text-white font-medium rounded-lg text-lg shadow-lg inline-flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-color-hex)' }}
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
            )}
          </motion.div>
          
          {/* Image */}
          {hasImage && (
            <motion.div 
              variants={fadeIn('up', 'tween', 0.4, 1)}
              className="lg:w-1/2 hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -top-5 -right-5 w-full h-full rounded-xl" 
                     style={{
                       backgroundColor: 'var(--theme-color-hex)',
                       opacity: 0.1,
                       transform: 'rotate(3deg)'
                     }}></div>
                <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1627672360124-4ed09583e14c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                    alt="Anime collection showcase"
                    className="w-full h-auto transform hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent"></div>
    </section>
  );
};

export default SimpleHero;