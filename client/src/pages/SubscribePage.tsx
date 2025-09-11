import { useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import EventsSection from "@/components/EventsSection.tsx";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";

const EventsPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="events-page pt-28 pb-16">
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
            Anime India Events
          </motion.h1>
          <motion.p
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-gray-400 text-lg"
          >
            Join us at our upcoming anime conventions, cosplay competitions, and
            exclusive screenings. Experience the vibrant community of anime
            enthusiasts across India.
          </motion.p>
        </motion.div>
      </div>

      <EventsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default EventsPage;
