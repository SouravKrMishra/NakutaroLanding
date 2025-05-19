import React, { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Button } from './ui/button';
import { Palette, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'default' | 'blue' | 'pink' | 'purple' | 'green';

interface ThemeOption {
  id: Theme;
  name: string;
  color: string;
}

const themeOptions: ThemeOption[] = [
  { id: 'default', name: 'Red', color: '#FF3B30' },
  { id: 'blue', name: 'Blue', color: '#007AFF' },
  { id: 'pink', name: 'Pink', color: '#FF2D55' },
  { id: 'purple', name: 'Purple', color: '#AF52DE' },
  { id: 'green', name: 'Green', color: '#34C759' },
];

export const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.theme-customizer-panel') && !target.closest('.theme-customizer-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-customizer-toggle w-12 h-12 rounded-full bg-gray-900 border border-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
      >
        <Palette className="h-6 w-6 text-white" />
      </button>
      
      {/* Theme Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="theme-customizer-panel absolute bottom-16 right-0 w-60 bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <h3 className="text-white font-medium">Theme Color</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
            
            {/* Color Circles */}
            <div className="p-4 pb-2">
              <div className="grid grid-cols-5 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className="relative aspect-square rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: option.color }}
                  >
                    {theme === option.id && (
                      <div className="absolute inset-0 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Theme Buttons */}
            <div className="px-3 pb-3">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className="w-full flex items-center px-3 py-2 my-1 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                >
                  <span
                    className="w-4 h-4 mr-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: option.color }}
                  >
                    {theme === option.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </span>
                  {option.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};