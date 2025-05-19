import React, { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Settings } from 'lucide-react';

interface ThemeOption {
  id: string;
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

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.theme-panel') && !target.closest('.theme-toggle')) {
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
        className="theme-toggle p-2 bg-neutral-800 rounded-full shadow-lg hover:bg-neutral-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="h-5 w-5 text-white" />
      </button>
      
      {isOpen && (
        <div className="theme-panel absolute right-0 bottom-12 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-neutral-800">
            <h3 className="text-sm font-medium text-white">Theme Color</h3>
          </div>
          
          <div className="p-2">
            {themeOptions.map((option) => {
              const isActive = theme === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as any)}
                  className="w-full rounded mb-2 text-white bg-purple-600"
                >
                  <div className="flex items-center px-3 py-2">
                    <div 
                      className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-sm">{option.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};