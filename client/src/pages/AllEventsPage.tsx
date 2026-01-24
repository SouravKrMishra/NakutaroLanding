import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { fadeIn, staggerContainer } from "@/lib/animations.ts";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Search,
  Filter,
  Clock,
  Camera,
  Medal,
  ArrowLeft,
} from "lucide-react";
import { GalleryPopup } from "@/components/ui/gallery-popup.tsx";
import { EventPopup } from "@/components/ui/event-popup.tsx";
import FAQSection from "@/components/FAQSection.tsx";
import CTASection from "@/components/CTASection.tsx";

// Import event images
import ncrWinner from "@assets/ncrwinner.jpg";
import iitDelhi from "@assets/iit-delhi.jpg";
import pennywise from "@assets/Pennywise.jpg";

// Import gallery images for organized event
import cosplay1 from "@assets/Newfolder/cosplay-royale (1)1.JPG";
import cosplay2 from "@assets/Newfolder/cosplay-royale (2)2.JPG";
import cosplay3 from "@assets/Newfolder/cosplay-royale (3)3.JPG";
import cosplay4 from "@assets/Newfolder/cosplay-royale (4)4.JPG";
import cosplay5 from "@assets/Newfolder/cosplay-royale (5)5.JPG";
import cosplay6 from "@assets/Newfolder/cosplay-royale (6)6.JPG";
import cosplay7 from "@assets/Newfolder/cosplay-royale (7)7.JPG";
import cosplay8 from "@assets/Newfolder/cosplay-royale (8)8.JPG";
import cosplay9 from "@assets/Newfolder/cosplay-royale (9)9.JPG";
import cosplay10 from "@assets/Newfolder/cosplay-royale (10)10.JPG";
import cosplay11 from "@assets/Newfolder/cosplay-royale (11)11.JPG";
import cosplay12 from "@assets/Newfolder/cosplay-royale (12)12.JPG";
import cosplay13 from "@assets/Newfolder/cosplay-royale (13)13.JPG";
import cosplay14 from "@assets/Newfolder/cosplay-royale (14)14.JPG";
import cosplay15 from "@assets/Newfolder/cosplay-royale (15)15.JPG";
import cosplay16 from "@assets/Newfolder/cosplay-royale (16)16.JPG";
import cosplay17 from "@assets/Newfolder/cosplay-royale (17)17.JPG";
import cosplay18 from "@assets/Newfolder/cosplay-royale (18)18.JPG";
import cosplay19 from "@assets/Newfolder/cosplay-royale (19)19.JPG";
import cosplay20 from "@assets/Newfolder/cosplay-royale (20)20.JPG";
import cosplay21 from "@assets/Newfolder/cosplay-royale (21)21.JPG";
import cosplay22 from "@assets/Newfolder/cosplay-royale (22)22.JPG";
import cosplay23 from "@assets/Newfolder/cosplay-royale (23)23.JPG";
import cosplay24 from "@assets/Newfolder/cosplay-royale (24)24.JPG";
import cosplay25 from "@assets/Newfolder/cosplay-royale (25)25.JPG";
import cosplay26 from "@assets/Newfolder/cosplay-royale (26)26.JPG";
import cosplay27 from "@assets/Newfolder/cosplay-royale (27)27.JPG";
import cosplay28 from "@assets/Newfolder/cosplay-royale (28)28.JPG";
import cosplay29 from "@assets/Newfolder/cosplay-royale (29)29.JPG";
import cosplay30 from "@assets/Newfolder/cosplay-royale (30)30.JPG";

// Gallery images array - created lazily when needed
const createGalleryImages = () => {
  const images = [
    cosplay1,
    cosplay2,
    cosplay3,
    cosplay4,
    cosplay5,
    cosplay6,
    cosplay7,
    cosplay8,
    cosplay9,
    cosplay10,
    cosplay11,
    cosplay12,
    cosplay13,
    cosplay14,
    cosplay15,
    cosplay16,
    cosplay17,
    cosplay18,
    cosplay19,
    cosplay20,
    cosplay21,
    cosplay22,
    cosplay23,
    cosplay24,
    cosplay25,
    cosplay26,
    cosplay27,
    cosplay28,
    cosplay29,
    cosplay30,
  ];

  const config = [
    { alt: "Anime cosplay event 1", width: 1200, height: 800 },
    { alt: "Anime cosplay event 2", width: 800, height: 1200 },
    { alt: "Anime cosplay event 3", width: 1200, height: 800 },
    { alt: "Anime cosplay event 4", width: 800, height: 800 },
    { alt: "Anime cosplay event 5", width: 800, height: 600 },
    { alt: "Anime cosplay event 6", width: 800, height: 1000 },
    { alt: "Anime cosplay event 7", width: 800, height: 1200 },
    { alt: "Anime cosplay event 8", width: 1000, height: 1500 },
    { alt: "Anime cosplay event 9", width: 800, height: 600 },
    { alt: "Anime cosplay event 10", width: 1200, height: 900 },
    { alt: "Anime cosplay event 11", width: 800, height: 1100 },
    { alt: "Anime cosplay event 12", width: 1000, height: 800 },
    { alt: "Anime cosplay event 13", width: 1200, height: 800 },
    { alt: "Anime cosplay event 14", width: 800, height: 1100 },
    { alt: "Anime cosplay event 15", width: 900, height: 700 },
    { alt: "Anime cosplay event 16", width: 1000, height: 800 },
    { alt: "Anime cosplay event 17", width: 1000, height: 800 },
    { alt: "Anime cosplay event 18", width: 1000, height: 800 },
    { alt: "Anime cosplay event 19", width: 1000, height: 800 },
    { alt: "Anime cosplay event 20", width: 1000, height: 800 },
    { alt: "Anime cosplay event 21", width: 1000, height: 800 },
    { alt: "Anime cosplay event 22", width: 1000, height: 800 },
    { alt: "Anime cosplay event 23", width: 1000, height: 800 },
    { alt: "Anime cosplay event 24", width: 1000, height: 800 },
    { alt: "Anime cosplay event 25", width: 1000, height: 800 },
    { alt: "Anime cosplay event 26", width: 1000, height: 800 },
    { alt: "Anime cosplay event 27", width: 1000, height: 800 },
    { alt: "Anime cosplay event 28", width: 1000, height: 800 },
    { alt: "Anime cosplay event 29", width: 1000, height: 800 },
    { alt: "Anime cosplay event 30", width: 1000, height: 800 },
  ];

  return images.map((src, index) => ({
    src,
    ...config[index],
  }));
};

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  time: string;
  description: string;
  image: string;
  type: "organized" | "sponsored" | "upcoming";
  featured?: boolean;
  prizePool?: string;
  attendees?: string;
  featured_image?: string;
}

const AllEventsPage = () => {
  const [, setLocation] = useLocation();
  
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "organized" | "sponsored" | "upcoming">("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[] | null>(null);

  const handleGoBack = () => {
    setLocation("/events");
  };

  // All events data
  const allEvents: Event[] = useMemo(
    () => [
      {
        id: "1",
        title: "Nakutaro Cosplay Royale",
        date: "September 28, 2024",
        location: "NCUI Auditorium, Hauz Khas, New Delhi",
        time: "10:00 AM - 6:00 PM",
        description:
          "Self-organized premier cosplay event featuring a prize pool of ₹50,000, attracting numerous cosplay enthusiasts to showcase their talents.",
        image: ncrWinner,
        featured_image: ncrWinner,
        type: "organized",
        featured: true,
        prizePool: "₹50,000",
        attendees: "500+",
      },
      {
        id: "2",
        title: "Masquerade Cosplay Event at IIT Delhi",
        date: "October 5-8, 2024",
        location: "IIT Delhi Campus",
        time: "All Day",
        description:
          "Nakutaro served as an associate sponsor for the Masquerade Cosplay Event during IIT Delhi's annual cultural fest, Rendezvous. The event offered a revamped prize pool of ₹30,000, contributed by Nakutaro, encouraging participants to display their creativity.",
        image: iitDelhi,
        type: "sponsored",
        prizePool: "₹30,000",
        attendees: "500+",
      },
      {
        id: "3",
        title: "Khooni Monday Horrorcon",
        date: "October 26, 2024",
        location: "Siri Fort Auditorium, New Delhi",
        time: "11:00 AM - 9:00 PM",
        description:
          "Nakutaro partnered as a sponsor for this horror-themed convention featuring a cosplay competition with a prize pool of ₹60,000, providing a platform for fans to immerse themselves in the genre.",
        image: pennywise,
        type: "sponsored",
        prizePool: "₹60,000",
        attendees: "600+",
      },
      {
        id: "4",
        title: "Anime India Winter Fest 2024",
        date: "December 18-20, 2024",
        location: "NSIC Exhibition Ground, New Delhi",
        time: "10:00 AM - 8:00 PM",
        description:
          "Cosplay competitions, Anime screenings, Merchandise stalls, Artist alley",
        image:
          "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
        type: "upcoming",
        attendees: "Expected 5,000+",
      },
      {
        id: "5",
        title: "Manga Masters Competition",
        date: "November 12, 2024",
        location: "Bombay Exhibition Centre, Mumbai",
        time: "9:00 AM - 6:00 PM",
        description:
          "Manga drawing competition, Professional workshops, Publishing opportunities",
        image:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
        type: "upcoming",
        attendees: "Expected 2,000+",
      },
      {
        id: "6",
        title: "Voice Actor Meet & Greet",
        date: "January 15, 2025",
        location: "Phoenix MarketCity, Bangalore",
        time: "2:00 PM - 8:00 PM",
        description:
          "Meet famous anime voice actors, Autograph sessions, Live dubbing demonstrations",
        image:
          "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
        type: "upcoming",
        attendees: "Limited to 500 attendees",
      },
    ],
    []
  );

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" || event.type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [allEvents, searchQuery, filterType]);

  const openGallery = () => {
    // Lazy create gallery images only when gallery opens
    if (galleryImages === null) {
      setGalleryImages(createGalleryImages());
    }
    setGalleryOpen(true);
  };

  return (
    <div className="events-page pt-28 pb-16 overflow-hidden min-h-screen">
      {/* Go Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center text-gray-400 hover:text-accent transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to Events</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            <div className="inline-block">
              <span style={{ color: "var(--theme-color-hex)" }}>
                All Events
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
          <p className="text-gray-400 text-lg">
            Discover all our organized events, sponsorships, and upcoming
            gatherings
          </p>
        </motion.div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "All Events", value: "all" },
              { label: "Organized", value: "organized" },
              { label: "Sponsored", value: "sponsored" },
              { label: "Upcoming", value: "upcoming" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as any)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterType === filter.value
                    ? "bg-accent text-white shadow-lg"
                    : "bg-[#1A1A1A] text-gray-300 border border-[#333] hover:border-accent/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center text-gray-400 text-sm">
            Showing {filteredEvents.length} of {allEvents.length} events
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No events found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={filterType + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-[#333] group hover:border-accent/30 transition-colors duration-200 shadow-lg"
                >
                  {/* Image */}
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      style={{ willChange: "transform" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent"></div>

                    {/* Event Type Badge */}
                    <div className="absolute top-4 left-4">
                      {event.type === "organized" && (
                        <div className="bg-accent/95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                          <Trophy className="h-3 w-3 mr-1.5" />
                          Organized
                        </div>
                      )}
                      {event.type === "sponsored" && (
                        <div className="bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                          <Medal className="h-3 w-3 mr-1.5 text-accent" />
                          Sponsored
                        </div>
                      )}
                      {event.type === "upcoming" && (
                        <div className="bg-blue-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          Upcoming
                        </div>
                      )}
                    </div>

                    {/* Prize Pool Badge */}
                    {event.prizePool && (
                      <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
                        {event.prizePool}
                      </div>
                    )}

                    {/* Featured Badge */}
                    {event.featured && (
                      <div className="absolute bottom-4 left-4 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-accent/70" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-accent/70" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-accent/70" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm">
                      {event.description}
                    </p>

                    {event.attendees && (
                      <div className="flex items-center text-gray-400 text-sm mb-4">
                        <Users className="h-4 w-4 mr-1 text-accent/70" />
                        {event.attendees} Attendees
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="flex-1 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        View Details
                      </button>
                      {event.type === "organized" && event.id === "1" && (
                        <button
                          onClick={openGallery}
                          className="px-4 py-2 bg-[#181818] hover:bg-[#222] border border-[#333] rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Gallery
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAQ and CTA Sections */}
      <FAQSection />
      <CTASection />

      {/* Popups */}
      {selectedEvent && (
        <EventPopup
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}

      {galleryOpen && galleryImages && (
        <GalleryPopup
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          images={galleryImages}
          title="Nakutaro Cosplay Royale Gallery"
        />
      )}
    </div>
  );
};

export default AllEventsPage;
