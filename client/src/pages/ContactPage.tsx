import { useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";

const ContactPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page pt-28 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto"
        >
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
        </motion.div>
      </div>

      <ContactSection />
      <FAQSection />
    </div>
  );
};

export default ContactPage;