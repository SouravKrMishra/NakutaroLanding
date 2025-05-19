import { useEffect } from "react";
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";

const ContactPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    // Update document title
    document.title = "Anime India - Contact Us";
  }, []);

  return (
    <>
      <div className="pt-20 bg-[#121212]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.h1 
              variants={fadeIn('up', 'tween', 0.2, 1)}
              className="text-3xl md:text-5xl font-bold mt-2 mb-6"
            >
              Contact Us
            </motion.h1>
            <motion.p 
              variants={fadeIn('up', 'tween', 0.3, 1)}
              className="text-gray-400 text-lg"
            >
              Have questions or need assistance? Get in touch with our team.
            </motion.p>
          </motion.div>
        </div>
      </div>
      
      <ContactSection />
      <FAQSection />
    </>
  );
};

export default ContactPage;