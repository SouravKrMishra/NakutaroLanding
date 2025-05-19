import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { ShoppingBag, Calendar, Users, Mail } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-accent/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.7s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1.2s' }}></div>
        </div>
        
        {/* Large decorative circle */}
        <div className="absolute -bottom-40 -right-40 w-80 h-80 border-2 border-white/10 rounded-full"></div>
        <div className="absolute -top-20 -left-20 w-60 h-60 border-2 border-white/10 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative bg-[#0C0C0C]/70 backdrop-blur-lg rounded-2xl p-10 lg:p-14 shadow-2xl border border-accent/30 overflow-hidden max-w-5xl mx-auto">
          {/* Accent glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Heading section */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="inline-block bg-gradient-to-r from-white/10 to-white/5 px-4 py-1.5 rounded-full border border-white/20 mb-6"
              >
                <span className="text-white font-medium text-sm">JOIN OUR COMMUNITY</span>
              </motion.div>
              
              <motion.h2 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeIn('up', 'tween', 0.1, 1)}
                className="text-3xl md:text-5xl font-bold mb-6 text-white"
              >
                Your <span className="text-accent">Anime Adventure</span>
                <br />
                Starts Here!
              </motion.h2>
              
              <motion.p 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeIn('up', 'tween', 0.2, 1)}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Discover premium anime merchandise and connect with fellow 
                enthusiasts across India. From action figures to exclusive apparel!
              </motion.p>
            </div>
            
            {/* Features grid */}
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('up', 'tween', 0.3, 1)}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
              <div className="bg-[#181818]/70 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
                <div className="bg-accent/20 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Premium Products</h3>
                <p className="text-gray-400">Authentic anime merch, premium quality, best prices</p>
              </div>
              
              <div className="bg-[#181818]/70 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
                <div className="bg-accent/20 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Exciting Events</h3>
                <p className="text-gray-400">Join conventions, meet-ups, and exclusive fan gatherings</p>
              </div>
              
              <div className="bg-[#181818]/70 backdrop-blur-sm p-6 rounded-xl border border-white/10 text-center">
                <div className="bg-accent/20 w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Vibrant Community</h3>
                <p className="text-gray-400">Connect with passionate anime fans across the country</p>
              </div>
            </motion.div>
            
            {/* CTA buttons */}
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn('up', 'tween', 0.4, 1)}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="https://shop.animeindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-8 py-3.5 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105 w-full sm:w-auto"
              >
                <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <span className="absolute bottom-0 left-0 h-1 w-full bg-white opacity-10"></span>
                <span className="absolute right-0 -mt-3 h-16 w-16 rotate-45 translate-x-8 -translate-y-2 bg-white opacity-10"></span>
                <span className="relative flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Now
                </span>
              </a>
              
              <a
                href="#contact"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/30 bg-[#181818]/70 px-8 py-3.5 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105 w-full sm:w-auto"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-accent" />
                  Contact Us
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
