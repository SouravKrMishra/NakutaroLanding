import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import { Mail, Phone, Clock, MessageSquare } from "lucide-react";

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState<string>("contact");
  
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: "contact", label: "Contact Us", icon: <Mail className="w-5 h-5 mr-2" /> },
    { id: "faq", label: "FAQ", icon: <MessageSquare className="w-5 h-5 mr-2" /> }
  ];
  
  // Animated background elements
  const floatingElements = [
    { icon: <Mail className="w-full h-full text-accent/10" />, size: 48, delay: 0 },
    { icon: <Phone className="w-full h-full text-accent/10" />, size: 56, delay: 1.5 },
    { icon: <Clock className="w-full h-full text-accent/10" />, size: 64, delay: 0.8 },
    { icon: <MessageSquare className="w-full h-full text-accent/10" />, size: 52, delay: 2.2 }
  ];

  return (
    <div className="contact-page pt-28 pb-16 overflow-hidden">
      {/* Hero Section with Animated Background */}
      <div className="relative h-[60vh] sm:h-[65vh] md:h-[70vh] min-h-[400px] sm:min-h-[450px] md:min-h-[500px] mb-12 sm:mb-16 md:mb-20 overflow-hidden bg-[#121212]">
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
            <Mail className="w-full h-full" />
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
            <MessageSquare className="w-full h-full" />
          </motion.div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6"
              >
                <span className="text-accent font-medium text-sm">Get In Touch</span>
              </motion.div>
              
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight"
              >
                <div className="inline-block">
                  <span style={{ color: 'var(--theme-color-hex)' }}>Contact Us</span>
                  <div 
                    className="block h-1 rounded-full mt-1"
                    style={{ backgroundColor: 'var(--theme-color-hex)', opacity: 0.3 }}
                  />
                </div>
                <div className="text-white block mt-2">We'd Love to Hear from You</div>
              </h1>
              
              <motion.p
                variants={fadeIn("up", "tween", 0.2, 1)}
                className="text-gray-400 text-base sm:text-lg md:text-xl mb-5 sm:mb-6 md:mb-8 max-w-3xl mx-auto px-4 sm:px-6"
              >
                Have questions or feedback? Contact our team at Anime India for any inquiries
                about our events, products, or services.
              </motion.p>
              

            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "contact" && (
            <motion.div
              key="contact-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ContactSection />
            </motion.div>
          )}
  
          {activeTab === "faq" && (
            <motion.div
              key="faq-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <FAQSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContactPage;