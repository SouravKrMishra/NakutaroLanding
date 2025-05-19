import { useState, useEffect, useRef } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { AccentColorSelector } from './AccentColorSelector';
import { motion, AnimatePresence } from 'framer-motion';

export function AppearanceSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Close popup when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePopup}
        className="h-9 w-9 rounded-full bg-transparent hover:bg-opacity-20"
        aria-label="Appearance settings"
      >
        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-72 rounded-md bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2D2D2D] shadow-lg p-4"
          >
            <div className="flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Appearance Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full"
                aria-label="Close settings"
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              
              <div className="pt-2">
                <AccentColorSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}