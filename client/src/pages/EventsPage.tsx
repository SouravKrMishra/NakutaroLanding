import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, staggerContainer, slideIn } from "@/lib/animations";
import EventsSection from "@/components/EventsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { Calendar, Calendar as CalendarIcon, MapPin, Users, Star, Trophy } from "lucide-react";

const EventsPage = () => {
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [activeSlide, setActiveSlide] = useState(0);
  
  const upcomingEvents = [
    {
      title: "Anime India Winter Fest 2024",
      date: "December 18-20, 2024",
      location: "NSIC Exhibition Ground, New Delhi",
      attendees: "Expected 5,000+",
      highlights: "Cosplay competitions, Anime screenings, Merchandise stalls, Artist alley"
    },
    {
      title: "Manga Masters Competition",
      date: "November 12, 2024",
      location: "Bombay Exhibition Centre, Mumbai",
      attendees: "Expected 2,000+",
      highlights: "Manga drawing competition, Professional workshops, Publishing opportunities"
    },
    {
      title: "Voice Actor Meet & Greet",
      date: "January 15, 2025",
      location: "Phoenix MarketCity, Bangalore",
      attendees: "Limited to 500 attendees",
      highlights: "Meet famous anime voice actors, Autograph sessions, Live dubbing demonstrations"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % upcomingEvents.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [upcomingEvents.length]);

  // Event timeline data
  const timelineEvents = [
    { year: "2020", title: "First Anime India Convention", description: "Our journey began with a small gathering of 500 anime enthusiasts in Delhi" },
    { year: "2021", title: "Expanded to Online Events", description: "During the pandemic, we took our events virtual, connecting fans across India" },
    { year: "2022", title: "Multi-City Tour", description: "Hosted events in Delhi, Mumbai, Bangalore, and Kolkata with over 10,000 total attendees" },
    { year: "2023", title: "International Guests Program", description: "Featured voice actors and animators from Japan for the first time" },
    { year: "2024", title: "Largest Event Yet", description: "Our Summer Convention broke records with 15,000+ attendees and 100+ exhibitors" }
  ];

  return (
    <div className="events-page pt-28 pb-16 overflow-hidden">
      {/* Hero Section with Animated Background */}
      <div className="relative h-[70vh] min-h-[500px] mb-20 overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 opacity-20">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
          
          {/* Anime-inspired decorative elements */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-accent rounded-full filter blur-[80px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          <motion.div 
            className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-accent rounded-full filter blur-[100px]"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Flying elements */}
          <motion.div
            className="absolute -top-10 -left-10 w-20 h-20 text-accent/20"
            animate={{
              x: [0, window.innerWidth + 20],
              y: [0, window.innerHeight + 20],
              rotate: [0, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z" opacity="0.4"></path><path d="M10.14,13.79a1,1,0,0,0,1.72,0l2.41-4a1,1,0,0,0-1.72-1L10.85,12Z"></path></svg>
          </motion.div>
          
          <motion.div
            className="absolute -bottom-10 -right-10 w-16 h-16 text-accent/15"
            animate={{
              x: [window.innerWidth, -20],
              y: [window.innerHeight, -20],
              rotate: [0, -360]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21,7H3A1,1,0,0,0,2,8V16a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V8A1,1,0,0,0,21,7ZM11,14.71a.79.79,0,0,1-.71.29.83.83,0,0,1-.7-.29L7.33,12H9.21l1.05,1.29L14.79,9H10a1,1,0,0,1,0-2h5a1,1,0,0,1,.92.62,1,1,0,0,1-.21,1.09Z"></path></svg>
          </motion.div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="inline-block bg-accent/10 px-4 py-1 rounded-full border border-accent/20 mb-6"
              >
                <span className="text-accent font-medium text-sm">Upcoming Events 2024-2025</span>
              </motion.div>
              
              <motion.h1
                variants={fadeIn("up", "tween", 0.1, 1)}
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              >
                Anime India{" "}
                <span className="text-accent relative">
                  Events
                  <motion.span 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-accent/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </span>{" "}
                & Conventions
              </motion.h1>
              
              <motion.p
                variants={fadeIn("up", "tween", 0.2, 1)}
                className="text-gray-400 text-xl mb-8 max-w-3xl mx-auto"
              >
                Join us at our upcoming anime conventions, cosplay competitions, and exclusive 
                screenings. Experience the vibrant community of anime enthusiasts across India.
              </motion.p>
              
              {/* Featured upcoming event carousel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#1A1A1A]/80 backdrop-blur-sm p-6 rounded-xl border border-[#333] shadow-xl max-w-3xl mx-auto"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center text-left gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <Calendar className="w-10 h-10 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{upcomingEvents[activeSlide].title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-accent/70" />
                          {upcomingEvents[activeSlide].date}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-accent/70" />
                          {upcomingEvents[activeSlide].location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-accent/70" />
                          {upcomingEvents[activeSlide].attendees}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2 text-accent/70" />
                          Registrations Open
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-400">
                        <span className="font-medium text-white">Highlights:</span> {upcomingEvents[activeSlide].highlights}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Carousel dots */}
              <div className="flex justify-center mt-4 space-x-2">
                {upcomingEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeSlide === index ? "bg-accent w-6" : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    aria-label={`View event ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
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
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          >
            Our Journey
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Event Timeline
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            See how Anime India's events have evolved over the years
          </motion.p>
        </motion.div>
        
        <div className="relative flex flex-col items-center max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute h-full w-0.5 bg-[#333] left-1/2 transform -translate-x-1/2 z-0"></div>
          
          {/* Timeline events */}
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative z-10 flex w-full items-center justify-between mb-12 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Year bubble */}
              <div className="absolute left-1/2 transform -translate-x-1/2 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg">
                {event.year}
              </div>
              
              {/* Content */}
              <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-400">{event.description}</p>
              </div>
              
              <div className="w-5/12"></div>
            </motion.div>
          ))}
          
          {/* Trophy at the end */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center text-accent border border-accent/30 z-10"
          >
            <Trophy className="w-8 h-8" />
          </motion.div>
        </div>
      </div>

      <EventsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default EventsPage;