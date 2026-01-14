import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer, slideIn } from "@/lib/animations.ts";
import EventsSection from "@/components/EventsSection.tsx";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";
import axios from "axios";
import { buildApiUrl } from "@/lib/api.ts";
import {
  Calendar,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Star,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const EventsPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [eventImages, setEventImages] = useState<any[]>([]);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Fetch event images from API
  useEffect(() => {
    const fetchEventImages = async () => {
      try {
        const response = await axios.get(
          buildApiUrl("/api/settings/events/images")
        );
        if (response.data.success && response.data.images) {
          // Store full image objects
          const images = response.data.images.filter((img: any) => img.url);
          setEventImages(images);
          // Reset activeSlide if it's out of bounds
          setActiveSlide((prev) => {
            if (images.length === 0) return 0;
            return prev >= images.length ? 0 : prev;
          });
          // Set global auto-scroll enabled setting
          setAutoScrollEnabled(
            response.data.autoScrollEnabled !== undefined
              ? response.data.autoScrollEnabled
              : true
          );
        }
      } catch (error) {
        console.error("Failed to fetch event images:", error);
        // Continue with empty array if fetch fails
        setEventImages([]);
        setActiveSlide(0);
      }
    };

    fetchEventImages();
  }, []);

  // Auto-rotate carousel with per-image delay settings
  useEffect(() => {
    if (
      eventImages.length === 0 ||
      !autoScrollEnabled ||
      eventImages.length <= 1
    )
      return;

    const currentImage = eventImages[activeSlide];
    if (!currentImage) return;

    // Get delay for current image (default to 5 seconds if not set)
    const delay =
      currentImage.autoScrollDelay !== undefined
        ? currentImage.autoScrollDelay
        : 5000;

    // Ensure delay is valid (at least 1 second)
    const validDelay = Math.max(1000, delay);

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % eventImages.length);
    }, validDelay);

    return () => clearInterval(interval);
  }, [eventImages, activeSlide, autoScrollEnabled]);

  const upcomingEvents = [
    {
      title: "Anime India Winter Fest 2024",
      date: "December 18-20, 2024",
      location: "NSIC Exhibition Ground, New Delhi",
      attendees: "Expected 5,000+",
      highlights:
        "Cosplay competitions, Anime screenings, Merchandise stalls, Artist alley",
    },
    {
      title: "Manga Masters Competition",
      date: "November 12, 2024",
      location: "Bombay Exhibition Centre, Mumbai",
      attendees: "Expected 2,000+",
      highlights:
        "Manga drawing competition, Professional workshops, Publishing opportunities",
    },
    {
      title: "Voice Actor Meet & Greet",
      date: "January 15, 2025",
      location: "Phoenix MarketCity, Bangalore",
      attendees: "Limited to 500 attendees",
      highlights:
        "Meet famous anime voice actors, Autograph sessions, Live dubbing demonstrations",
    },
  ];

  const handlePreviousSlide = () => {
    if (eventImages.length === 0) return;
    setActiveSlide(
      (prev) => (prev - 1 + eventImages.length) % eventImages.length
    );
  };

  const handleNextSlide = () => {
    if (eventImages.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % eventImages.length);
  };

  // Event timeline data - focusing on 2023-2025 only
  const timelineEvents = [
    {
      year: "2023",
      title: "International Guests Program",
      description:
        "Featured voice actors and animators from Japan for the first time",
      date: "August 2023",
      highlight: "5,000+ attendees",
      image:
        "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    },
    {
      year: "2024",
      title: "Summer Anime Expo",
      description:
        "Our Summer Convention broke records with massive attendance and exhibitor participation",
      date: "June 2024",
      highlight: "15,000+ attendees",
      image:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    },
    {
      year: "2025",
      title: "Global Anime Summit",
      description:
        "Planned international expansion with partner events in Japan, USA and Europe",
      date: "March 2025",
      highlight: "Coming soon",
      image:
        "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    },
  ];

  return (
    <div className="events-page pt-28 pb-16 overflow-hidden">
      {/* Title Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            <div className="inline-block">
              <span style={{ color: "var(--theme-color-hex)" }}>
                Anime India Events
              </span>
              <div
                className="block h-1 rounded-full mt-1"
                style={{
                  backgroundColor: "var(--theme-color-hex)",
                  opacity: 0.3,
                }}
              />
            </div>
          </h1>
        </motion.div>
      </div>

      {/* Hero Section with Animated Background */}
      <div className="relative h-[60vh] sm:h-[65vh] md:h-[70vh] min-h-[400px] sm:min-h-[450px] md:min-h-[500px] mb-12 sm:mb-16 md:mb-20 overflow-hidden bg-[#121212]">
        {/* Carousel Images */}
        {eventImages.length > 0 && (
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait" initial={false}>
              {eventImages[activeSlide] && (
                <motion.img
                  key={activeSlide}
                  src={eventImages[activeSlide].url}
                  alt={`Event carousel image ${activeSlide + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </AnimatePresence>
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
          </div>
        )}
        <div className="absolute inset-0 opacity-20 z-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        </div>

        {/* Navigation arrows - placed outside carousel container to ensure they're on top */}
        {eventImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePreviousSlide();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNextSlide();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
              {eventImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSlide(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    index === activeSlide
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.span
            variants={fadeIn("up", "tween", 0.1, 1)}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          >
            Our Journey
          </motion.span>
          <motion.h2
            variants={fadeIn("up", "tween", 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Event Timeline
          </motion.h2>
          <motion.p
            variants={fadeIn("up", "tween", 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            See how Anime India's events have evolved over the years
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative z-10 bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#333] shadow-xl group"
            >
              {/* Image */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60"></div>

                {/* Year badge */}
                <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full font-bold shadow-lg">
                  {event.year}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative">
                {/* Date ribbon */}
                <div className="absolute -top-4 left-6 bg-[#222] px-4 py-1 rounded-full text-sm font-medium text-gray-300 border border-[#333]">
                  {event.date}
                </div>

                <h3 className="text-xl font-bold mb-3 mt-3">{event.title}</h3>
                <p className="text-gray-400 mb-4">{event.description}</p>

                <div className="flex items-center mt-auto">
                  <div className="flex items-center text-accent/80 bg-accent/5 px-3 py-1 rounded-full text-sm">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>{event.highlight}</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
            </motion.div>
          ))}
        </div>
      </div>

      <EventsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default EventsPage;
