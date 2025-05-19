import React, { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Button } from '../components/ui/button';
import { Settings, Check, ChevronDown } from 'lucide-react';

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
    setIsOpen(false);
  };

  const currentTheme = themeOptions.find(t => t.id === theme) || themeOptions[0];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full p-2 bg-[#1E1E1E] border-[#2D2D2D] hover:bg-[#2D2D2D]"
          onClick={toggleOpen}
        >
          <Settings className="h-5 w-5" style={{ color: currentTheme.color }} />
        </Button>
        
        {isOpen && (
          <div className="absolute bottom-12 right-0 bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg shadow-lg p-4 w-60 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">Customize Appearance</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-400 text-xs mb-2">Accent Color</p>
              <div className="grid grid-cols-5 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full aspect-square rounded-full flex items-center justify-center border-2 ${option.id === theme ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: option.color }}
                    onClick={() => handleThemeChange(option.id)}
                    title={option.name}
                  >
                    {option.id === theme && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-[#2D2D2D]">
                <div className="flex flex-col gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-[#2D2D2D] transition-colors ${option.id === theme ? 'bg-[#2D2D2D]' : ''}`}
                      onClick={() => handleThemeChange(option.id)}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: option.color }} 
                        />
                        {option.name}
                      </div>
                      {option.id === theme && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};