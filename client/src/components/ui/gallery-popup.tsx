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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = images[selectedImageIndex];

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
  
  // Reset selected image when gallery opens
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
    }
  }, [isOpen]);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  if (!isOpen || images.length === 0) return null;
  
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
            className="bg-[#121212] overflow-hidden shadow-2xl max-w-5xl w-full mx-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Full image at top */}
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <img 
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-70"></div>
              
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 text-white"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 text-white"
                    onClick={handlePrevious}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 text-white"
                    onClick={handleNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Gallery title and thumbnails */}
            <div className="p-6 pt-5">
              {title && (
                <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
              )}
              
              {/* Slider navigation */}
              <div className="relative mt-2 mb-4">
                <div className="flex items-center">
                  {/* Previous button */}
                  <button
                    className="absolute left-0 z-10 p-1 bg-black/30 hover:bg-black/50 rounded-full"
                    onClick={handlePrevious}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  
                  {/* Slider with thumbnails */}
                  <div className="w-full overflow-hidden mx-6">
                    <div 
                      className="flex transition-transform duration-300 ease-out space-x-1"
                      style={{
                        transform: `translateX(${Math.min(0, -selectedImageIndex * 56 + (images.length > 8 ? (window.innerWidth > 768 ? 200 : 100) : 0))}px)`
                      }}
                    >
                      {images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => handleThumbnailClick(index)}
                          className={`shrink-0 cursor-pointer text-center transition-opacity duration-200
                            ${index === selectedImageIndex ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                          style={{ width: '55px' }}
                        >
                          <div 
                            className={`relative overflow-hidden rounded mb-1 border-2
                              ${index === selectedImageIndex ? 'border-accent' : 'border-transparent'}`}
                          >
                            <img
                              src={image.src}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-10 object-cover"
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Next button */}
                  <button
                    className="absolute right-0 z-10 p-1 bg-black/30 hover:bg-black/50 rounded-full"
                    onClick={handleNext}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-gray-800 rounded-full w-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${((selectedImageIndex + 1) / images.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-accent hover:bg-accent/90 transition-colors duration-200 text-white rounded-md text-sm font-medium"
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