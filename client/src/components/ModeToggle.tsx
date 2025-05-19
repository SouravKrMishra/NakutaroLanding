import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ModeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  
  return (
    <button
      onClick={toggleMode}
      className="fixed bottom-4 left-4 z-50 p-3 rounded-full bg-opacity-80 shadow-lg transition-colors flex items-center justify-center"
      style={{ 
        backgroundColor: mode === 'dark' ? '#333333' : '#FFFFFF',
        border: `1px solid ${mode === 'dark' ? '#444444' : '#EEEEEE'}`
      }}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {mode === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600" />
      )}
    </button>
  );
};