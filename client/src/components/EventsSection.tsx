import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventsSection = () => {
  const upcomingEvents = [
    {
      title: 'Anime India Con 2025',
      date: 'July 15-17, 2025',
      location: 'Mumbai Exhibition Center',
      time: '10:00 AM - 8:00 PM',
      description: "Join us for India's largest anime convention featuring guest speakers, cosplay competitions, merchandise booths, and special screenings of upcoming anime releases.",
      image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
    },
    {
      title: 'Manga Artist Workshop',
      date: 'August 5, 2025',
      location: 'Delhi Art Gallery',
      time: '12:00 PM - 4:00 PM',
      description: "Learn manga drawing techniques from professional artists. This hands-on workshop covers character design, storytelling, and traditional Japanese art styles.",
      image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
    },
    {
      title: 'Anime Movie Night',
      date: 'June 25, 2025',
      location: 'PVR Cinemas, Bangalore',
      time: '6:00 PM - 11:00 PM',
      description: "Experience a night of exclusive anime movie screenings featuring both classic favorites and brand new releases with fellow anime enthusiasts.",
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
    }
  ];

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
            className="text-[#FF3B30] font-semibold text-sm uppercase tracking-wider"
          >
            Upcoming Events
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Anime Events & Meetups
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            Connect with fellow anime enthusiasts at our exciting events across India
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
            <h3 className="text-2xl font-bold mb-6 text-[#FF3B30]">Featured Event</h3>
            <div className="bg-[#242424] rounded-xl overflow-hidden border border-[#2D2D2D] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto relative overflow-hidden">
                  <img 
                    src={upcomingEvents[0].image}
                    alt={upcomingEvents[0].title}
                    className="absolute w-full h-full object-cover transform transition-all duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-bold mb-4">{upcomingEvents[0].title}</h4>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{upcomingEvents[0].date}</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{upcomingEvents[0].location}</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{upcomingEvents[0].time}</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    {upcomingEvents[0].description}
                  </p>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium"
                  >
                    Register Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={fadeIn('up', 'tween', 0.3, 1)}
          >
            <h3 className="text-2xl font-bold mb-6 text-[#FF3B30]">More Upcoming Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingEvents.slice(1).map((event, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                  className="bg-[#242424] rounded-xl overflow-hidden border border-[#2D2D2D] hover:border-[#FF3B30]/20 transition-all duration-300"
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
                    <a 
                      href="#" 
                      className="inline-flex items-center text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium"
                    >
                      Learn More
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Anime-inspired decorative elements */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-[#FF3B30] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#FF3B30] rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#FF3B30] rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#FF3B30] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Stylized anime-inspired shape */}
      <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-[#FF3B30]/10 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 border-8 border-[#FF3B30]/5 rounded-full"></div>
    </section>
  );
};

export default EventsSection;