import HeroSection from "@/components/HeroSection.tsx";
import AboutSection from "@/components/AboutSection.tsx";
import ProductsSection from "@/components/ProductsSection.tsx";
import EventsSection from "@/components/EventsSection.tsx";
import TestimonialsSection from "@/components/TestimonialsSection.tsx";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";
import { useEffect, useRef } from "react";

const HomePage = () => {
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const lastAutoScrolledSectionRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  
  // Section IDs in order
  const sectionIds = ["home", "about", "products", "events", "testimonials", "faq", "cta"];

  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    lastScrollYRef.current = 0;
  }, []);

  // Auto-scroll when 75% of a section has scrolled out of view (only when scrolling down)
  useEffect(() => {
    const handleScroll = () => {
      // Prevent auto-scroll if user is actively scrolling or if we just auto-scrolled
      if (isScrollingRef.current) return;
      
      const now = Date.now();
      // Throttle: only check every 100ms
      if (now - lastScrollTimeRef.current < 100) return;
      lastScrollTimeRef.current = now;

      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollYRef.current ? "down" : "up";
      lastScrollYRef.current = scrollY;
      
      // Only trigger when scrolling down
      if (scrollDirection !== "down") return;
      
      // Find current section based on scroll position
      for (let i = 0; i < sectionIds.length; i++) {
        const sectionId = sectionIds[i];
        const section = document.getElementById(sectionId);
        
        if (!section) continue;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        const section75PercentOut = sectionTop + (sectionHeight * 0.75);
        
        // Check if 75% of the section has scrolled out of view
        // This means scrollY has passed 75% of the section
        // and we're still within the section bounds
        // Also check if we haven't already auto-scrolled from this section
        if (
          scrollY >= section75PercentOut && 
          scrollY < sectionBottom &&
          lastAutoScrolledSectionRef.current !== i
        ) {
          // Only auto-scroll if there's a next section
          if (i < sectionIds.length - 1) {
            const nextSectionId = sectionIds[i + 1];
            const nextSection = document.getElementById(nextSectionId);
            
            if (nextSection) {
              isScrollingRef.current = true;
              lastAutoScrolledSectionRef.current = i;
              
              // Get header height to account for fixed header
              const header = document.getElementById("navbar");
              const headerHeight = header ? header.offsetHeight : 0;
              
              // Calculate target scroll position (section top minus header height)
              const sectionTop = nextSection.offsetTop;
              const targetScrollY = sectionTop - headerHeight;
              
              // Smooth scroll to next section with header offset
              window.scrollTo({
                top: targetScrollY,
                behavior: "smooth"
              });
              
              // Reset flag after scroll completes (approximate time for smooth scroll)
              setTimeout(() => {
                isScrollingRef.current = false;
                // Reset the last auto-scrolled section after a delay to allow scrolling back
                setTimeout(() => {
                  lastAutoScrolledSectionRef.current = null;
                }, 500);
              }, 1000);
              
              break;
            }
          }
        }
        
        // Reset tracking if we've scrolled back to before this section
        if (scrollY < sectionTop && lastAutoScrolledSectionRef.current === i) {
          lastAutoScrolledSectionRef.current = null;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
