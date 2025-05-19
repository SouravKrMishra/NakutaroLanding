import { useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import EventsSection from "@/components/EventsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

const SubscribePage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="subscribe-page pt-28 pb-16">
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
            Join Anime India
          </motion.h1>
          <motion.p
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-gray-400 text-lg"
          >
            Become a member of India's largest anime community and enjoy exclusive benefits, 
            early access to merchandise, and special event invitations.
          </motion.p>
        </motion.div>
      </div>

      <EventsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default SubscribePage;