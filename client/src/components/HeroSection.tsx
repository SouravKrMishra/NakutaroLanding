import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import bgImage from "@assets/bg.png";

const HeroSection = () => {
  const [backgroundPosition, setBackgroundPosition] = useState("center");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the background image immediately with higher priority
    const img = new Image();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Set crossOrigin to avoid CORS issues if any
    img.crossOrigin = "anonymous";
    img.src = bgImage;

    // Force decode the image
    if (img.decode) {
      img
        .decode()
        .then(() => {
          setImageLoaded(true);
        })
        .catch(() => {
          // If decode fails, check if image is already loaded before setting handlers
          if (img.complete && img.naturalHeight !== 0) {
            // Image is already loaded (cached), set loaded state immediately
            setImageLoaded(true);
          } else if (img.complete && img.naturalHeight === 0) {
            // Image failed to load, show section after a short delay
            timeoutId = setTimeout(() => setImageLoaded(true), 100);
          } else {
            // Image is still loading, set up handlers
            img.onload = () => {
              setImageLoaded(true);
            };
            img.onerror = () => {
              // Even if image fails to load, show the section after a short delay
              timeoutId = setTimeout(() => setImageLoaded(true), 100);
            };
          }
        });
    } else {
      // Fallback for browsers that don't support decode()
      if (img.complete && img.naturalHeight !== 0) {
        setImageLoaded(true);
      } else {
        img.onload = () => {
          setImageLoaded(true);
        };
        img.onerror = () => {
          // Even if image fails to load, show the section after a short delay
          timeoutId = setTimeout(() => setImageLoaded(true), 100);
        };
      }
    }

    const updateBackgroundPosition = () => {
      setBackgroundPosition(window.innerWidth < 768 ? "74% center" : "center");
    };

    // Set initial position
    updateBackgroundPosition();

    // Update on resize
    window.addEventListener("resize", updateBackgroundPosition);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", updateBackgroundPosition);
      // Clear timeout if component unmounts before timeout completes
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const sectionStyle = imageLoaded
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: backgroundPosition,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#121212", // Fallback color
      }
    : {
        backgroundColor: "#121212",
        backgroundImage: "none !important",
      };

  return (
    <section
      id="home"
      className={`relative min-h-[90vh] md:min-h-screen flex items-center pt-16 md:pt-20 overflow-hidden ${
        imageLoaded ? "hero-gradient" : ""
      }`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-12 items-center"
        >
          <motion.div
            variants={fadeIn("right", "tween", 0.2, 1)}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-3 md:mb-4 relative">
              <div className="inline-block">
                <span className="text-accent">ANIME </span>
                <span className="text-white">INDIA</span>
              </div>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 sm:mb-6 text-white">
              Celebrating the Fandom!
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed relative z-10">
              <span className="relative">
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300">
                  India's #1 Anime Store
                </span>{" "}
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300 delay-100">
                  Bringing You the Best
                </span>{" "}
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300 delay-200">
                  Anime Merch
                </span>{" "}
                <span className="inline-block transform hover:translate-y-[-2px] transition-transform duration-300 delay-300">
                  Without the Hassle!
                </span>
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mt-2">
              <Link
                href="/products"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <span className="absolute bottom-0 left-0 h-1 w-full bg-white opacity-10"></span>
                <span className="absolute right-0 -mt-3 h-16 w-16 rotate-45 translate-x-8 -translate-y-2 bg-white opacity-10"></span>
                <span className="relative flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Shop Now
                </span>
              </Link>

              <a
                href="#services"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto overflow-hidden rounded-lg border border-accent/40 bg-[#181818] px-8 py-3 text-lg font-bold text-white transition-all duration-300 ease-out hover:scale-105"
              >
                <span className="absolute inset-0 translate-y-32 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <span className="absolute inset-0 opacity-30 bg-gradient-to-b from-accent to-transparent"></span>
                </span>
                <span className="relative flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-5 w-5 mr-2 text-accent"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                  Explore Collections
                </span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
