import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { ShoppingBag, Calendar, Users, Mail, Sparkles, ArrowRight, Heart, Gift, Star, Globe, Zap } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Particle animations in the background */}
      <div className="absolute inset-0">
        {/* Floating shapes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-16 md:w-24 md:h-24 opacity-10"
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: Math.random() * 100 - 50 + "%",
              rotate: Math.random() * 360,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 5 + 10,
              ease: "easeInOut"
            }}
            style={{
              background: i % 2 === 0 ? 
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" : 
                "linear-gradient(135deg, rgba(255,84,79,0.15) 0%, rgba(255,84,79,0) 70%)",
              borderRadius: i % 3 === 0 ? "30% 70% 70% 30% / 30% 30% 70% 70%" : "50%",
              filter: "blur(8px)",
              border: i % 4 === 0 ? "1px solid rgba(255,84,79,0.1)" : "none"
            }}
          />
        ))}
      </div>
      
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-accent/5 to-purple-500/5 rounded-full blur-[120px]"
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "backOut", delay: 0.2 }}
              className="inline-block bg-gradient-to-r from-accent/20 to-purple-500/20 px-4 py-1.5 rounded-full border border-accent/20 mb-6"
            >
              <span className="text-accent font-medium text-sm flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-2" />
                JOIN THE COMMUNITY
              </span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="text-white">Your</span> 
              <span className="relative mx-4 inline-block">
                <span className="text-accent">Anime</span>
                <motion.span 
                  className="absolute -bottom-2 left-0 w-full h-1 bg-accent/30"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                />
              </span>
              <span className="text-white">Adventure</span>
            </h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Discover premium anime merchandise, connect with fellow enthusiasts, and 
              immerse yourself in Japan's rich pop culture across India
            </motion.p>
          </motion.div>
          
          {/* Main CTA Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card with Glow Effect */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 via-purple-500/50 to-accent/50 rounded-2xl opacity-30 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              
              {/* Main Card */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#141414] to-[#080808] p-0.5 overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/noise-pattern.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-20"></div>
                
                {/* Card Content */}
                <div className="relative p-8 sm:p-10 md:p-12 lg:p-16 overflow-hidden rounded-2xl backdrop-blur-sm">
                  {/* Animated Accent Line */}
                  <motion.div 
                    className="absolute left-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 mb-14">
                    {[
                      {
                        icon: <Gift className="h-7 w-7" />,
                        title: "Premium Products",
                        description: "Authentic anime merchandise, premium quality, best prices",
                        color: "from-pink-500 to-rose-500"
                      },
                      {
                        icon: <Calendar className="h-7 w-7" />,
                        title: "Exciting Events",
                        description: "Join conventions, meetups, and exclusive fan gatherings",
                        color: "from-blue-500 to-cyan-500"
                      },
                      {
                        icon: <Users className="h-7 w-7" />,
                        title: "Vibrant Community",
                        description: "Connect with passionate anime fans across the country",
                        color: "from-accent to-yellow-500"
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                        className="relative group/card"
                      >
                        <div className="absolute -inset-px bg-gradient-to-r rounded-xl opacity-50 blur-sm group-hover/card:opacity-100 transition duration-300" style={{ backgroundImage: `linear-gradient(to right, ${feature.color})` }}></div>
                        <div className="relative h-full bg-[#0F0F0F] rounded-lg p-6 lg:p-8 border border-white/5 overflow-hidden group-hover/card:border-accent/20 transition-colors duration-300">
                          {/* Icon with gradient */}
                          <div className="inline-flex items-center justify-center p-3 rounded-xl mb-4 bg-gradient-to-br opacity-90 text-white" style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.color})` }}>
                            {feature.icon}
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-3 group-hover/card:text-accent transition-colors duration-300">
                            {feature.title}
                          </h3>
                          
                          <p className="text-gray-400 group-hover/card:text-gray-300 transition-colors duration-300">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Stats Row */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14 border-y border-white/10 py-10"
                  >
                    {[
                      { value: "500+", label: "Products", icon: <Gift className="h-5 w-5 text-accent" /> },
                      { value: "10K+", label: "Happy Customers", icon: <Heart className="h-5 w-5 text-accent" /> },
                      { value: "15+", label: "Cities", icon: <Globe className="h-5 w-5 text-accent" /> },
                      { value: "24/7", label: "Customer Support", icon: <Zap className="h-5 w-5 text-accent" /> }
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {stat.icon}
                          <span className="text-accent text-2xl md:text-3xl font-bold">{stat.value}</span>
                        </div>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </motion.div>
                  
                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                  >
                    <a
                      href="https://shop.animeindia.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group overflow-hidden rounded-lg bg-gradient-to-r from-accent via-accent/90 to-accent px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1 flex-1 sm:flex-none w-full sm:w-auto text-center"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-accent/80 via-purple-500/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></span>
                      <span className="relative flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 mr-3" />
                        Explore Shop
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </a>
                    
                    <a 
                      href="#events"
                      className="relative group overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 flex-1 sm:flex-none w-full sm:w-auto text-center"
                    >
                      <span className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center justify-center">
                        <Calendar className="h-5 w-5 mr-3 text-accent" />
                        Upcoming Events
                      </span>
                    </a>
                    
                    <a 
                      href="#contact"
                      className="relative group overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 flex-1 sm:flex-none w-full sm:w-auto text-center"
                    >
                      <span className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center justify-center">
                        <Mail className="h-5 w-5 mr-3 text-accent" />
                        Contact Us
                      </span>
                    </a>
                  </motion.div>
                  
                  {/* Rating Badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.9, type: "spring" }}
                    className="absolute -top-6 right-8 sm:right-12 bg-gradient-to-r from-accent to-accent/80 rounded-full px-5 py-2.5 flex items-center shadow-lg shadow-accent/20"
                  >
                    <Star className="h-5 w-5 text-white fill-white mr-2" />
                    <span className="text-white font-bold">4.9 / 5</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Additional Animations */}
      <style jsx>{`
        @keyframes tilt {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        
        .animate-tilt {
          animation: tilt 10s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default CTASection;
