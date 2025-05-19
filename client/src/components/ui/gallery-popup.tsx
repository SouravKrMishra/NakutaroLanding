import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  
  // Calculate layout columns for masonry grid based on screen size
  const getColumnCount = () => {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };
  
  const [columnCount, setColumnCount] = useState(getColumnCount());
  
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to organize images into masonry columns
  const organizeImagesIntoColumns = (images: GalleryImage[], columnCount: number) => {
    const columns: GalleryImage[][] = Array.from({ length: columnCount }, () => []);
    
    // Distribute images to columns based on heights to maintain balance
    images.forEach((image, index) => {
      // Find the column with the least height
      const columnHeights = columns.map(column => 
        column.reduce((total, img) => total + (img.height / img.width), 0)
      );
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumnIndex].push(image);
    });
    
    return columns;
  };
  
  const imageColumns = organizeImagesIntoColumns(images, columnCount);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-black/50 backdrop-blur-sm py-2 px-4 rounded-lg">
              {title && (
                <h3 className="text-xl font-bold text-white">{title}</h3>
              )}
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Masonry Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4"
              style={{ 
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
              }}
            >
              {imageColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-4">
                  {column.map((image, imageIndex) => (
                    <motion.div
                      key={`${columnIndex}-${imageIndex}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.3,
                        delay: 0.05 * (columnIndex + imageIndex) 
                      }}
                      className="overflow-hidden rounded-lg bg-accent/5 hover:bg-accent/10 transition-all duration-300"
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                        style={{ aspectRatio: `${image.width}/${image.height}` }}
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}