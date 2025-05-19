import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Calendar, MapPin, Clock, Trophy, Camera, ArrowRight, Ticket, Users, Medal, ExternalLink, Sparkles, Star, Flag } from 'lucide-react';
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
  attendees?: string;
  featured_image?: string;
  registrationUrl?: string;
  type?: string;
  tags?: string[];
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
    featured_image: 'https://images.unsplash.com/photo-1575900239752-13e5ef40c924?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
    featured: true,
    prizePool: '₹50,000',
    attendees: '300+',
    registrationUrl: 'https://shop.animeindia.org',
    type: 'Conference',
    tags: ['Cosplay', 'Competition', 'Prizes']
  };
  
  const upcomingEvents: Event[] = [
    {
      title: 'Tokyo Pop Culture Exhibition',
      date: 'December 15-18, 2024',
      location: 'Jawaharlal Nehru Stadium, New Delhi',
      time: '10:00 AM - 8:00 PM',
      description: "A multi-day exhibition showcasing the rich history and evolution of Japanese pop culture, featuring artwork, displays, limited merchandise, and special guest panels.",
      image: 'https://images.unsplash.com/photo-1565799284935-da1e913a72a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      prizePool: '',
      attendees: '1000+',
      featured_image: 'https://images.unsplash.com/photo-1565799284935-da1e913a72a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
      registrationUrl: 'https://shop.animeindia.org',
      type: 'Exhibition',
      tags: ['Art', 'Merchandise', 'Panels']
    }
  ];
  
  const sponsoredEvents: Event[] = [
    {
      title: 'Masquerade Cosplay Event at IIT Delhi',
      date: 'October 5-8, 2024',
      location: 'IIT Delhi Campus, Hauz Khas',
      time: 'All Day',
      description: "Nakutaro served as an associate sponsor for the Masquerade Cosplay Event during IIT Delhi's annual cultural fest, Rendezvous. The event offered a revamped prize pool of ₹30,000, contributed by Nakutaro, encouraging participants to display their creativity.",
      image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      prizePool: '₹30,000',
      attendees: '500+',
      featured_image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
      registrationUrl: 'https://shop.animeindia.org',
      type: 'Festival',
      tags: ['Cosplay', 'Campus', 'Cultural']
    },
    {
      title: 'Khooni Monday Horrorcon',
      date: 'October 26, 2024',
      location: 'Siri Fort Auditorium, New Delhi',
      time: '11:00 AM - 9:00 PM',
      description: "Nakutaro partnered as a sponsor for this horror-themed convention featuring a cosplay competition with a prize pool of ₹60,000, providing a platform for fans to immerse themselves in the genre.",
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      prizePool: '₹60,000',
      attendees: '600+',
      featured_image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
      registrationUrl: 'https://shop.animeindia.org',
      type: 'Convention',
      tags: ['Horror', 'Cosplay', 'Themed']
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
  
  // Event stats
  const eventStats = [
    { number: "12+", label: "Events Per Year", gradient: "from-blue-500 to-cyan-500" },
    { number: "5000+", label: "Attendees Annually", gradient: "from-purple-500 to-pink-500" },
    { number: "₹2L+", label: "Prize Pool Value", gradient: "from-accent to-yellow-500" }
  ];
  
  return (
    <section id="events" className="py-24 relative overflow-hidden">
      {/* Background with starry pattern */}
      <div className="absolute inset-0 bg-[#080808] overflow-hidden">
        {/* Custom star field */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Animated gradient background */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-accent/10 to-transparent opacity-30"
          animate={{ 
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 via-purple-500/5 to-transparent rounded-full filter blur-[100px]"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="inline-block bg-gradient-to-r from-accent/20 to-purple-500/20 px-4 py-1.5 rounded-full border border-accent/20 mb-6"
          >
            <span className="text-accent font-medium text-sm flex items-center justify-center">
              <Sparkles className="h-4 w-4 mr-2" />
              IMMERSIVE EXPERIENCES
            </span>
          </motion.div>
          
          <motion.h2 
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl md:text-5xl font-bold mt-2 mb-6"
          >
            <span className="text-white">Anime Events &</span> <span className="text-accent">Conventions</span>
          </motion.h2>
          
          <motion.p 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Connect with fellow anime enthusiasts at our vibrant events across India
          </motion.p>
          
          {/* Event Stats */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.4, 1)}
            className="grid grid-cols-3 gap-4 mt-10"
          >
            {eventStats.map((stat, index) => (
              <div 
                key={index} 
                className="group rounded-lg p-0.5 transition-all duration-500 hover:scale-105"
                style={{ background: `linear-gradient(120deg, ${stat.gradient})` }}
              >
                <div className="h-full w-full bg-[#121212] rounded-md py-4 px-2">
                  <p className="font-bold text-2xl md:text-3xl bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(120deg, ${stat.gradient})` }}>
                    {stat.number}
                  </p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Main Event Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Featured Event */}
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="mb-20"
          >
            <div className="flex items-center mb-10">
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
              <div className="mx-4 flex items-center">
                <Star className="h-5 w-5 text-accent mr-2" />
                <h3 className="text-2xl font-bold text-white">Featured Event</h3>
              </div>
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden group shadow-2xl transform transition-all duration-700 hover:scale-[0.99]">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/60 via-purple-600/60 to-accent/60 opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent via-purple-500 to-accent rounded-2xl opacity-0 group-hover:opacity-30 blur-sm group-hover:blur transition-all duration-700"></div>
              
              {/* Main Event Content */}
              <div className="relative bg-gradient-to-b from-[#121212] to-[#080808] rounded-2xl overflow-hidden">
                <div className="h-[500px] sm:h-[600px] relative overflow-hidden">
                  {/* Background image with overlay and animated gradient */}
                  <div className="absolute inset-0">
                    <img 
                      src={organizedEvent.featured_image || organizedEvent.image}
                      alt={organizedEvent.title}
                      className="absolute inset-0 w-full h-full object-cover transform transition-all duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#080808]"></div>
                    
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/40 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-1000"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 md:px-16 py-14 bg-gradient-to-t from-[#080808] via-[#080808]/90 to-transparent">
                    <div className="max-w-5xl mx-auto">
                      {/* Event Badge and Type */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="inline-flex rounded-full bg-accent text-white text-xs font-semibold px-3 py-1.5 items-center shadow-lg">
                          <Trophy className="h-3.5 w-3.5 mr-1.5" />
                          FEATURED EVENT
                        </div>
                        
                        {organizedEvent.type && (
                          <div className="inline-flex rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 shadow-lg">
                            {organizedEvent.type}
                          </div>
                        )}
                      </div>
                      
                      {/* Event Title and Date */}
                      <div className="md:flex md:items-end md:justify-between">
                        <div className="mb-8 md:mb-0">
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">{organizedEvent.title}</h2>
                          
                          {/* Date, Location, and Time */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center text-white/90 bg-white/5 backdrop-blur-md rounded-lg py-2 px-3">
                              <Calendar className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                              <span>{organizedEvent.date}</span>
                            </div>
                            
                            <div className="flex items-center text-white/90 bg-white/5 backdrop-blur-md rounded-lg py-2 px-3">
                              <Clock className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                              <span>{organizedEvent.time}</span>
                            </div>
                            
                            <div className="flex items-center text-white/90 bg-white/5 backdrop-blur-md rounded-lg py-2 px-3 sm:col-span-2 md:col-span-1">
                              <MapPin className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                              <span className="truncate">{organizedEvent.location}</span>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          {organizedEvent.tags && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {organizedEvent.tags.map((tag, index) => (
                                <span 
                                  key={index}
                                  className="bg-white/10 text-white/80 rounded-full px-3 py-1 text-xs font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Prize and Attendees */}
                          <div className="flex flex-wrap gap-4 mb-8">
                            {organizedEvent.prizePool && (
                              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg backdrop-blur-md">
                                <Trophy className="h-5 w-5 text-accent mr-2" />
                                <div>
                                  <p className="text-xs text-white/60 uppercase">Prize Pool</p>
                                  <p className="text-white font-semibold">{organizedEvent.prizePool}</p>
                                </div>
                              </div>
                            )}
                            
                            {organizedEvent.attendees && (
                              <div className="flex items-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md">
                                <Users className="h-5 w-5 text-accent mr-2" />
                                <div>
                                  <p className="text-xs text-white/60 uppercase">Attendees</p>
                                  <p className="text-white font-semibold">{organizedEvent.attendees}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 md:mt-4 sm:justify-end">
                          <button 
                            onClick={openGallery}
                            className="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-6 py-3 text-base font-medium text-white transition-all duration-300 hover:bg-white/10 hover:scale-105"
                          >
                            <span className="flex items-center justify-center">
                              <Camera className="h-5 w-5 mr-2" />
                              View Gallery
                            </span>
                          </button>
                          
                          {organizedEvent.registrationUrl && (
                            <a 
                              href={organizedEvent.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-6 py-3 text-base font-medium text-white transition-all duration-300 ease-out hover:shadow-lg hover:shadow-accent/20 hover:scale-105"
                            >
                              <span className="flex items-center justify-center">
                                <Ticket className="h-5 w-5 mr-2" />
                                Register Now
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Description - conditionally rendered */}
                      <div className="border-t border-white/10 mt-8 pt-8">
                        <p className="text-white/70 max-w-4xl">
                          {organizedEvent.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gradient scan line effect */}
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 animate-scan-vertical"></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Upcoming/Sponsored Events */}
          <div className="mb-16">
            <div className="flex items-center mb-10">
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
              <div className="mx-4 flex items-center">
                <Calendar className="h-5 w-5 text-accent mr-2" />
                <h3 className="text-2xl font-bold text-white">More Events</h3>
              </div>
              <div className="h-px flex-grow bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Upcoming Event Card */}
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={`upcoming-${index}`}
                  variants={fadeIn('up', 'tween', 0.1 + index * 0.1, 1)}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-accent/10 shadow-xl"
                >
                  {/* Event Type Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      UPCOMING
                    </div>
                  </div>
                  
                  {/* Event Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={event.image}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent"></div>
                    
                    {/* Type indicator */}
                    {event.type && (
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md">
                        {event.type}
                      </div>
                    )}
                  </div>
                  
                  {/* Event Content */}
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3 text-white group-hover:text-accent transition-colors duration-300">{event.title}</h4>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-white/70 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-accent/80" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-accent/80" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {event.tags && (
                      <div className="flex flex-wrap gap-1 mb-6">
                        {event.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="bg-white/5 text-white/60 rounded-full px-2 py-0.5 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-6">
                      <button 
                        onClick={(e) => openEventDetails(event, e)}
                        className="text-accent hover:text-white font-medium text-sm flex items-center group-hover:underline"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                      
                      {event.registrationUrl && (
                        <a 
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white bg-accent/20 hover:bg-accent hover:text-white transition-colors duration-300 rounded-full p-2"
                          aria-label="Register for event"
                        >
                          <Ticket className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Sponsored Events Cards */}
              {sponsoredEvents.map((event, index) => (
                <motion.div
                  key={`sponsored-${index}`}
                  variants={fadeIn('up', 'tween', 0.1 + (index + upcomingEvents.length) * 0.1, 1)}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] rounded-xl overflow-hidden border border-[#333] shadow-xl"
                >
                  {/* Event Type Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                      <Medal className="h-3.5 w-3.5 mr-1.5 text-accent" />
                      SPONSORED
                    </div>
                  </div>
                  
                  {/* Prize indicator */}
                  {event.prizePool && (
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-accent/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                        {event.prizePool}
                      </div>
                    </div>
                  )}
                  
                  {/* Event Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={event.image}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent"></div>
                    
                    {/* Type indicator */}
                    {event.type && (
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md">
                        {event.type}
                      </div>
                    )}
                  </div>
                  
                  {/* Event Content */}
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3 text-white group-hover:text-accent transition-colors duration-300">{event.title}</h4>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-white/70 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-accent/80" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-accent/80" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {event.tags && (
                      <div className="flex flex-wrap gap-1 mb-6">
                        {event.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="bg-white/5 text-white/60 rounded-full px-2 py-0.5 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-6">
                      <button 
                        onClick={(e) => openEventDetails(event, e)}
                        className="text-accent hover:text-white font-medium text-sm flex items-center group-hover:underline"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                      
                      {event.registrationUrl && (
                        <a 
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white bg-accent/20 hover:bg-accent hover:text-white transition-colors duration-300 rounded-full p-2"
                          aria-label="Register for event"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* CTA - Submit Your Event */}
          <motion.div
            variants={fadeIn('up', 'tween', 0.5, 1)}
            className="mt-16 text-center bg-gradient-to-r from-accent/10 to-purple-500/10 p-8 rounded-2xl border border-accent/20"
          >
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-white/10 backdrop-blur-md mb-6">
              <Flag className="h-6 w-6 text-accent" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              Want to <span className="text-accent">Host an Event</span> with Us?
            </h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              If you're interested in organizing or sponsoring an anime event in your city, we'd love to collaborate with you!
            </p>
            
            <a 
              href="/events"
              className="relative overflow-hidden inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent via-accent/90 to-accent px-8 py-3.5 text-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105"
            >
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Submit Your Event
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>
      
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
      
      {/* Custom animations are defined in index.css */}
    </section>
  );
};

export default EventsSection;