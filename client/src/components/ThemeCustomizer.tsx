import React, { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Button } from '../components/ui/button';
import { Settings, ChevronDown } from 'lucide-react';

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
            
            <div className="space-y-2">
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Accent Color</p>
              <div className="grid grid-cols-5 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-full aspect-square rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: option.id === 'default' ? '#FF3B30' : 
                                      option.id === 'blue' ? '#007AFF' : 
                                      option.id === 'pink' ? '#FF2D55' : 
                                      option.id === 'purple' ? '#AF52DE' : 
                                      option.id === 'green' ? '#34C759' : option.color,
                      border: `2px solid ${option.id === theme ? 'white' : 'transparent'}`
                    }}
                    onClick={() => handleThemeChange(option.id)}
                    title={option.name}
                  >
                    {option.id === theme && (
                      <div style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', backgroundColor: 'white' }}></div>
                    )}
                  </button>
                ))}
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '0.75rem', 
                borderTopWidth: '1px', 
                borderTopStyle: 'solid', 
                borderTopColor: '#2D2D2D' 
              }}>
                <div className="flex flex-col gap-2">
                  {themeOptions.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => handleThemeChange(option.id)}
                      className="cursor-pointer"
                    >
                      <div
                        style={{
                          backgroundColor: '#2563EB',
                          color: 'white',
                          borderRadius: '0.25rem',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#3070f0';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563EB';
                        }}
                      >
                        <div className="flex items-center w-full">
                          <span 
                            style={{ 
                              width: '1rem',
                              height: '1rem',
                              borderRadius: '9999px',
                              backgroundColor: option.id === 'default' ? '#FF3B30' : 
                                              option.id === 'blue' ? '#007AFF' : 
                                              option.id === 'pink' ? '#FF2D55' : 
                                              option.id === 'purple' ? '#AF52DE' : 
                                              option.id === 'green' ? '#34C759' : option.color,
                              marginRight: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: option.id === theme ? '2px solid white' : 'none'
                            }} 
                          >
                            {option.id === theme && (
                              <div style={{ 
                                width: '0.375rem', 
                                height: '0.375rem', 
                                borderRadius: '9999px', 
                                backgroundColor: 'white' 
                              }}></div>
                            )}
                          </span>
                          <span style={{ flexGrow: 1 }}>{option.name}</span>
                        </div>
                      </div>
                    </div>
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