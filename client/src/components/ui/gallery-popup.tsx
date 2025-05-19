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
            className="bg-[#121212] overflow-hidden shadow-2xl max-w-2xl w-full mx-4 rounded-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Full image at top */}
            <div className="relative h-72 w-full">
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
              
              {/* Image counter */}
              <div className="text-sm text-gray-400 mb-4">
                Image {selectedImageIndex + 1} of {images.length}
              </div>
              
              {/* Thumbnail navigation */}
              <div className="overflow-x-auto hide-scrollbar pb-2">
                <div className="flex space-x-2 min-w-max">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`cursor-pointer relative rounded overflow-hidden transition-all duration-200 
                        ${index === selectedImageIndex 
                          ? 'ring-2 ring-accent' 
                          : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-accent/50'}`}
                    >
                      <img
                        src={image.src}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-16 h-12 object-cover"
                      />
                    </div>
                  ))}
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