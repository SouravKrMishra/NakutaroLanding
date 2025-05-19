import { X, Calendar, MapPin, Clock, Trophy, Users, Ticket, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    date: string;
    location: string;
    time: string;
    description: string;
    image: string;
    prizePool?: string;
    attendees?: string;
    registrationUrl?: string;
    featured_image?: string;
  };
}

export function EventPopup({ isOpen, onClose, event }: EventPopupProps) {
  if (!isOpen) return null;

  // Lock scroll when popup is open
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            className="bg-gradient-to-b from-[#181818] to-[#0D0D0D] overflow-hidden shadow-2xl max-w-4xl w-full mx-4 rounded-xl border border-[#333]"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Full image at top */}
            <div className="relative h-[250px] sm:h-[300px] w-full overflow-hidden">
              <img 
                src={event.featured_image || event.image}
                alt={event.title}
                className="w-full h-full object-cover scale-105 transition-transform duration-10000 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
              
              {/* Event title overlay */}
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">{event.title}</h3>
                {event.prizePool && (
                  <div className="inline-flex items-center bg-accent/90 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full mt-3">
                    <Trophy className="h-4 w-4 mr-2" />
                    Prize Pool: {event.prizePool}
                  </div>
                )}
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 text-white"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Event details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {/* Event info badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="bg-accent/10 px-3 py-1.5 rounded-full flex items-center">
                      <Calendar className="h-4 w-4 text-accent mr-2" />
                      <span className="text-white text-sm">{event.date}</span>
                    </div>
                    
                    <div className="bg-accent/10 px-3 py-1.5 rounded-full flex items-center">
                      <Clock className="h-4 w-4 text-accent mr-2" />
                      <span className="text-white text-sm">{event.time}</span>
                    </div>
                    
                    {event.attendees && (
                      <div className="bg-accent/10 px-3 py-1.5 rounded-full flex items-center">
                        <Users className="h-4 w-4 text-accent mr-2" />
                        <span className="text-white text-sm">{event.attendees} Attendees</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2 mb-6">
                    <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{event.location}</span>
                  </div>
                  
                  <div className="bg-[#131313] p-4 rounded-lg border border-[#333] mb-6">
                    <h4 className="text-lg font-medium text-white mb-2">About This Event</h4>
                    <p className="text-gray-300 leading-relaxed">{event.description}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    {event.registrationUrl && (
                      <a 
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center overflow-hidden rounded-lg bg-gradient-to-r from-accent to-accent/80 px-6 py-2.5 text-white transition-all duration-300 ease-out hover:scale-105"
                      >
                        <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                        <span className="absolute bottom-0 left-0 h-1 w-full bg-white opacity-10"></span>
                        <span className="relative flex items-center">
                          <Ticket className="h-5 w-5 mr-2" />
                          Register Now
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </span>
                      </a>
                    )}
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-[#1D1D1D] hover:bg-[#252525] transition-colors duration-200 text-white rounded-lg font-medium border border-[#333] flex items-center"
                    >
                      Close
                    </button>
                  </div>
                </div>
                
                {/* Additional image on large screens */}
                <div className="hidden md:block">
                  <div className="overflow-hidden rounded-lg border border-[#333] shadow-lg h-full">
                    <div className="relative h-full">
                      <img 
                        src={event.image}
                        alt={`${event.title} event`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}