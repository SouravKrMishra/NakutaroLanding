import HeroSection from "@/components/HeroSection.tsx";
import AboutSection from "@/components/AboutSection.tsx";
import ProductsSection from "@/components/ProductsSection.tsx";
import EventsSection from "@/components/EventsSection.tsx";
import TestimonialsSection from "@/components/TestimonialsSection.tsx";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";
import { useEffect } from "react";

const HomePage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="home-page">
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <EventsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
