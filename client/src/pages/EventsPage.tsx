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

  // Event timeline data - focusing on 2023-2025 only
  const timelineEvents = [
    { 
      year: "2023", 
      title: "International Guests Program", 
      description: "Featured voice actors and animators from Japan for the first time",
      date: "August 2023",
      highlight: "5,000+ attendees",
      image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    },
    { 
      year: "2024", 
      title: "Summer Anime Expo", 
      description: "Our Summer Convention broke records with massive attendance and exhibitor participation",
      date: "June 2024",
      highlight: "15,000+ attendees",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    },
    { 
      year: "2025", 
      title: "Global Anime Summit", 
      description: "Planned international expansion with partner events in Japan, USA and Europe",
      date: "March 2025",
      highlight: "Coming soon",
      image: "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
    }
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
              
              <h1
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              >
                <div className="inline-block">
                  <span style={{ color: 'var(--theme-color-hex)' }}>Anime India Events</span>
                  <div 
                    className="block h-1 rounded-full mt-1"
                    style={{ backgroundColor: 'var(--theme-color-hex)', opacity: 0.3 }}
                  />
                </div>
                <div className="text-white block mt-2">&amp; Conventions</div>
              </h1>
              
              <motion.p
                variants={fadeIn("up", "tween", 0.2, 1)}
                className="text-gray-400 text-xl mb-8 max-w-3xl mx-auto"
              >
                Join us at our upcoming anime conventions, cosplay competitions, and exclusive 
                screenings. Experience the vibrant community of anime enthusiasts across India.
              </motion.p>
              

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