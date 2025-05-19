import { X, Calendar, MapPin, Clock, Trophy } from 'lucide-react';
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div 
            className="bg-[#121212] overflow-hidden shadow-2xl max-w-md w-full mx-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Full image at top */}
            <div className="relative h-64 w-full">
              <img 
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-70"></div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 text-white"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Event details */}
            <div className="p-6 pt-5">
              <h3 className="text-2xl font-bold mb-4 text-white">{event.title}</h3>
              
              <div className="space-y-3 mb-5">
                <div className="flex items-center text-gray-300">
                  <Calendar className="h-5 w-5 min-w-5 mr-3 text-accent" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 min-w-5 mr-3 text-accent" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="h-5 w-5 min-w-5 mr-3 text-accent" />
                  <span>{event.time}</span>
                </div>
                {event.prizePool && (
                  <div className="flex items-center text-gray-300">
                    <Trophy className="h-5 w-5 min-w-5 mr-3 text-accent" />
                    <span>Prize Pool: {event.prizePool}</span>
                  </div>
                )}
              </div>
              
              <div className="text-gray-300 mb-6">
                <p>{event.description}</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-accent hover:bg-accent/90 transition-colors duration-200 text-white rounded-md font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}