import React, { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Settings, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeOption {
  id: string;
  name: string;
}

const themeOptions: ThemeOption[] = [
  { id: 'default', name: 'Red' },
  { id: 'blue', name: 'Blue' },
  { id: 'pink', name: 'Pink' },
  { id: 'purple', name: 'Purple' },
  { id: 'green', name: 'Green' },
];

export const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('#theme-panel') && !target.closest('#theme-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        id="theme-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-neutral-800 rounded-full shadow-lg hover:bg-neutral-700 transition-colors"
      >
        <Settings className="h-5 w-5 text-white" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="theme-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 bottom-12 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-800">
              <h3 className="text-sm font-medium text-white">Theme Color</h3>
            </div>
            
            <div className="p-2">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as any)}
                  className="w-full flex items-center justify-between px-3 py-2 my-1 text-sm text-white rounded bg-neutral-800 hover:bg-neutral-700"
                >
                  <span>{option.name}</span>
                  {theme === option.id && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};