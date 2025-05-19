import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Calendar, Users, Award } from 'lucide-react';

const EventsSection = () => {
  const events = [
    {
      title: 'Nakutaro Cosplay Royale',
      date: 'On 28th September 2024',
      location: 'NCUI Auditorium, Hauz Khas, New Delhi',
      description: "Nakutaro hosted the Cosplay Royale featuring a prize pool of ₹50,000, attracting numerous cosplay enthusiasts to showcase their talents.",
      type: 'organized',
      icon: <Award className="h-6 w-6" />
    },
    {
      title: "Masquerade Cosplay Event at IIT Delhi's Rendezvous",
      date: 'From 5th to 8th October 2024',
      location: 'IIT Delhi campus',
      description: "Nakutaro served as an associate sponsor for the Masquerade Cosplay Event during IIT Delhi's annual cultural fest, Rendezvous. The event offered a revamped prize pool of ₹30,000, contributed by Nakutaro, encouraging participants to display their creativity.",
      type: 'sponsored',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: 'Khooni Monday Horrorcon',
      date: 'On 26th October 2024',
      location: 'Siri Fort Auditorium, New Delhi',
      description: "Nakutaro partnered as a sponsor for the Khooni Monday Horrorcon. This horror-themed convention featured a cosplay competition with a prize pool of ₹60,000, providing a platform for fans to immerse themselves in the genre.",
      type: 'sponsored',
      icon: <Users className="h-6 w-6" />
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
            Our Events
          </motion.span>
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-4xl font-bold mt-2 mb-6"
          >
            Events & Collaborations
          </motion.h2>
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-400 text-lg"
          >
            We have Organized and Sponsored Multiple Events
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
            <h3 className="text-2xl font-bold mb-6 text-[#FF3B30]">Our Organized Event</h3>
            <div className="bg-[#242424] rounded-xl overflow-hidden border border-[#2D2D2D] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1613310023042-ad79320c00ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                    alt="Cosplay event"
                    className="absolute w-full h-full object-cover transform transition-all duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Nakutaro Cosplay Royale</h4>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>28th September 2024</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-4">
                    <Users className="h-4 w-4 mr-2" />
                    <span>NCUI Auditorium, Hauz Khas, New Delhi</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Nakutaro hosted the Cosplay Royale featuring a prize pool of ₹50,000, attracting numerous cosplay 
                    enthusiasts to showcase their talents in an exciting competition that celebrated creativity and craftsmanship.
                  </p>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium"
                  >
                    View Gallery
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
            <h3 className="text-2xl font-bold mb-6 text-[#FF3B30]">Our Sponsored Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.filter(event => event.type === 'sponsored').map((event, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                  className="bg-[#242424] rounded-xl p-6 border border-[#2D2D2D] hover:border-[#FF3B30]/20 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] mb-4">
                    {event.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-start text-gray-400 mb-4">
                    <Users className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    {event.description}
                  </p>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-[#FF3B30] hover:text-[#FF6B61] transition duration-300 font-medium"
                  >
                    About feature
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
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