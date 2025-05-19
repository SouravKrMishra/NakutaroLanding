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
    <div className="contact-page pt-28 pb-16 overflow-hidden relative">
      {/* Animated background elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute opacity-20 pointer-events-none"
          style={{
            top: `${10 + (index * 20)}%`,
            left: `${70 + (index * 5)}%`,
            width: element.size,
            height: element.size
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 5 + index,
            ease: "easeInOut",
            delay: element.delay,
            repeat: Infinity
          }}
        >
          {element.icon}
        </motion.div>
      ))}
      
      {/* Decorative gradient blobs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-accent/5 rounded-full filter blur-[80px] opacity-50"></div>
      <div className="absolute bottom-40 -right-40 w-80 h-80 bg-accent/5 rounded-full filter blur-[80px] opacity-50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-accent/10 px-3 py-1 rounded-sm border-l-2 border-accent mb-4"
          >
            <span className="text-accent font-bold text-sm uppercase tracking-widest">
              REACH OUT
            </span>
          </motion.div>
          
          <motion.h1
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="text-4xl font-bold mb-4"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-gray-400 text-lg"
          >
            Have questions or feedback? We'd love to hear from you. 
            Contact our team at Anime India for any inquiries about our products or services.
          </motion.p>
          
          {/* Tab Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center mt-8 mb-4 relative"
          >
            <div className="inline-flex bg-[#1E1E1E] p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-4 rounded-md transition-all duration-300 ${
                    activeTab === tab.id 
                      ? "bg-accent text-white shadow-lg" 
                      : "bg-transparent text-gray-300 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-0 rounded-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "contact" && (
          <motion.div
            key="contact-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
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
            transition={{ duration: 0.5 }}
          >
            <FAQSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactPage;