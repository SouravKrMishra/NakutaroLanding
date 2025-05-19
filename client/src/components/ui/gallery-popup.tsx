import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface GalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  title?: string;
}

export function GalleryPopup({ isOpen, onClose, images, title }: GalleryPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex]);
  
  // Lock scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-4">
              {title && (
                <h3 className="text-xl font-bold text-white">{title}</h3>
              )}
              <button 
                onClick={onClose}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Main gallery container */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative overflow-hidden">
              {/* Navigation buttons for mobile and desktop */}
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-0 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    className="absolute right-0 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              
              {/* Current image */}
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex].src}
                    alt={images[currentIndex].alt}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>
            </div>
            
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="mt-4 overflow-x-auto pb-2">
                <div className="flex space-x-2 w-max min-w-full">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 h-16 w-24 overflow-hidden rounded border-2 transition-all duration-200 ${
                        index === currentIndex 
                          ? 'border-accent' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                    >
                      <img 
                        src={image.src}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}