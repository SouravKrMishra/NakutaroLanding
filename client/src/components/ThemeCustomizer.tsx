import React, { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Button } from './ui/button';
import { Palette } from 'lucide-react';

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

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as any);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          size="sm"
          className="rounded-full w-10 h-10 flex items-center justify-center bg-[#18181B] border-[#27272A] hover:bg-[#27272A]"
          onClick={toggleOpen}
        >
          <Palette className="h-5 w-5 text-white" />
        </Button>
        
        {isOpen && (
          <div 
            className="absolute bottom-12 right-0 rounded-xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: '#18181B',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#27272A',
              width: '240px'
            }}
          >
            <div 
              className="p-3 border-b border-[#27272A]"
              style={{
                backgroundColor: '#222222',
              }}
            >
              <h3 className="text-sm font-medium text-white">Theme Color</h3>
            </div>
            
            <div className="p-3">
              {/* Color circles for theme preview */}
              <div className="grid grid-cols-5 gap-2 mb-4 px-1">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className="relative rounded-full aspect-square flex items-center justify-center"
                    style={{
                      backgroundColor: option.id === 'default' ? '#FF3B30' : 
                                      option.id === 'blue' ? '#007AFF' : 
                                      option.id === 'pink' ? '#FF2D55' : 
                                      option.id === 'purple' ? '#AF52DE' : 
                                      option.id === 'green' ? '#34C759' : option.color,
                    }}
                  >
                    {option.id === theme && (
                      <div className="absolute inset-0 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Theme selection buttons */}
              <div className="space-y-2">
                {themeOptions.map((option) => {
                  // Get the appropriate color for the current theme option
                  const circleColor = option.id === 'default' ? '#FF3B30' : 
                                      option.id === 'blue' ? '#007AFF' : 
                                      option.id === 'pink' ? '#FF2D55' : 
                                      option.id === 'purple' ? '#AF52DE' : 
                                      option.id === 'green' ? '#34C759' : option.color;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleThemeChange(option.id)}
                      className="w-full rounded text-left text-white py-2 px-3 transition-colors flex items-center"
                      style={{
                        backgroundColor: '#333333'
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full mr-3 flex items-center justify-center"
                        style={{
                          backgroundColor: circleColor
                        }}
                      >
                        {option.id === theme && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm">{option.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end p-3">
              <Button
                onClick={() => setIsOpen(false)}
                className="rounded text-white text-sm py-2 px-4"
                style={{ backgroundColor: '#444444' }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};