import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Calendar, MapPin, Clock, Trophy, Camera, ArrowRight } from 'lucide-react';
import { GalleryPopup } from './ui/gallery-popup';
import { EventPopup } from './ui/event-popup';

interface Event {
  title: string;
  date: string;
  location: string;
  time: string;
  description: string;
  image: string;
  featured?: boolean;
  prizePool?: string;
}

const EventsSection = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const organizedEvent: Event = {
    title: 'Nakutaro Cosplay Royale',
    date: 'September 28, 2024',
    location: 'NCUI Auditorium, Hauz Khas, New Delhi',
    time: '10:00 AM - 6:00 PM',
    description: "Self-organized premier cosplay event featuring a prize pool of ₹50,000, attracting numerous cosplay enthusiasts to showcase their talents.",
    image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
    featured: true,
    prizePool: '₹50,000'
  };
  
  const sponsoredEvents: Event[] = [
    {
      title: 'Masquerade Cosplay Event at IIT Delhi',
      date: 'October 5-8, 2024',
      location: 'IIT Delhi Campus',
      time: 'All Day',
      description: "Nakutaro served as an associate sponsor for the Masquerade Cosplay Event during IIT Delhi's annual cultural fest, Rendezvous. The event offered a revamped prize pool of ₹30,000, contributed by Nakutaro, encouraging participants to display their creativity.",
      image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      prizePool: '₹30,000'
    },
    {
      title: 'Khooni Monday Horrorcon',
      date: 'October 26, 2024',
      location: 'Siri Fort Auditorium, New Delhi',
      time: '11:00 AM - 9:00 PM',
      description: "Nakutaro partnered as a sponsor for this horror-themed convention featuring a cosplay competition with a prize pool of ₹60,000, providing a platform for fans to immerse themselves in the genre.",
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      prizePool: '₹60,000'
    }
  ];
  
  // Gallery images with different widths/heights for masonry layout
  const galleryImages = [
    { 
      src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80', 
      alt: 'Anime cosplay event 1',
      width: 800,
      height: 600
    },
    { 
      src: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200&q=80', 
      alt: 'Anime cosplay event 2',
      width: 800,
      height: 1200
    },
    { 
      src: 'https://images.unsplash.com/photo-1594385468549-15dbcac14e54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80', 
      alt: 'Anime cosplay event 3',
      width: 1200,
      height: 800
    },
    { 
      src: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80', 
      alt: 'Anime cosplay event 4',
      width: 800,
      height: 800
    },
    { 
      src: 'https://images.unsplash.com/photo-1623776025811-fd139155a39b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80', 
      alt: 'Anime cosplay event 5',
      width: 800,
      height: 600
    },
    { 
      src: 'https://images.unsplash.com/photo-1617070201971-fb8c082e0001?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000&q=80', 
      alt: 'Anime cosplay event 6',
      width: 800,
      height: 1000
    },
    {
      src: 'https://images.unsplash.com/photo-1565799284935-da1e913a72a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200&q=80',
      alt: 'Anime cosplay event 7',
      width: 800,
      height: 1200
    },
    {
      src: 'https://images.unsplash.com/photo-1615524140580-5b1331d86c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=1500&q=80',
      alt: 'Anime cosplay event 8',
      width: 1000,
      height: 1500
    },
    {
      src: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      alt: 'Anime cosplay event 9',
      width: 800,
      height: 600
    },
    {
      src: 'https://images.unsplash.com/photo-1570462621100-763a8dc3f0b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=900&q=80',
      alt: 'Anime cosplay event 10',
      width: 1200,
      height: 900
    },
    {
      src: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1100&q=80',
      alt: 'Anime cosplay event 11',
      width: 800,
      height: 1100
    },
    {
      src: 'https://images.unsplash.com/photo-1613561125090-255dc241a456?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=800&q=80',
      alt: 'Anime cosplay event 12',
      width: 1000,
      height: 800
    },
    {
      src: 'https://images.unsplash.com/photo-1560932833-01678178a032?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
      alt: 'Anime cosplay event 13',
      width: 1200,
      height: 800
    },
    {
      src: 'https://images.unsplash.com/photo-1615367136042-965d9268e6be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1100&q=80',
      alt: 'Anime cosplay event 14',
      width: 800,
      height: 1100
    },
    {
      src: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&h=700&q=80',
      alt: 'Anime cosplay event 15',
      width: 900,
      height: 700
    }
  ];

  const openGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    setGalleryOpen(true);
  };

  const openEventDetails = (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedEvent(event);
  };
  
  return (
    <section id="events" className="py-20 bg-[#1E1E1E] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span 
            variants={fadeIn('up', 'tween', 0.1, 1)}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          >
            Events & Collaborations
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            We have Organized and Sponsored Multiple Events
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Connect with fellow anime and cosplay enthusiasts at our exciting events across India
          </motion.p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold mb-6 text-accent">Our Organized Event</h3>
            <div className="bg-[#242424] rounded-xl overflow-hidden border border-[#2D2D2D] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto relative overflow-hidden">
                  <img 
                    src={organizedEvent.image}
                    alt={organizedEvent.title}
                    className="absolute w-full h-full object-cover transform transition-all duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-bold mb-4">{organizedEvent.title}</h4>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{organizedEvent.date}</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{organizedEvent.location}</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{organizedEvent.time}</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-4">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>Prize Pool: {organizedEvent.prizePool}</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    {organizedEvent.description}
                  </p>
                  <button 
                    onClick={openGallery}
                    className="inline-flex items-center text-accent hover:text-accent/80 transition duration-300 font-medium"
                  >
                    View Gallery
                    <Camera className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={fadeIn('up', 'tween', 0.3, 1)}
          >
            <h3 className="text-2xl font-bold mb-6 text-accent">Our Sponsored Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sponsoredEvents.map((event, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                  className="bg-[#242424] rounded-xl overflow-hidden border border-[#2D2D2D] hover:border-accent/20 transition-all duration-300"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={event.image}
                      alt={event.title}
                      className="absolute w-full h-full object-cover transform transition-all duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3">{event.title}</h4>
                    <div className="flex items-center text-gray-400 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-400 mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-400 mb-3">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <p className="text-gray-300 mb-6 line-clamp-3">
                      {event.description}
                    </p>
                    <button 
                      onClick={(e) => openEventDetails(event, e)}
                      className="inline-flex items-center text-accent hover:text-accent/80 transition duration-300 font-medium"
                    >
                      About Event
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Anime-inspired decorative elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-accent rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-accent rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Stylized anime-inspired shape */}
      <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-accent/10 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 border-8 border-accent/5 rounded-full"></div>
      
      {/* Popups */}
      <GalleryPopup
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        title="Nakutaro Cosplay Royale Gallery"
      />
      
      <EventPopup
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent || organizedEvent} // Fallback to avoid type error
      />
    </section>
  );
};

export default EventsSection;