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
          <div 
            className="absolute bottom-12 right-0 rounded-lg shadow-lg p-4 w-60 animate-in slide-in-from-bottom-5 duration-200"
            style={{ 
              backgroundColor: '#1E1E1E', 
              borderColor: '#2D2D2D',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm" style={{ color: 'white' }}>Customize Appearance</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Theme Color</p>
              
              <div className="flex flex-col gap-1">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    style={{ 
                      backgroundColor: 'transparent',
                      color: 'white',
                      fontSize: '0.875rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleThemeChange(option.id)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};