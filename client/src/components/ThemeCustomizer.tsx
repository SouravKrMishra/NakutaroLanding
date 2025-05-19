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
  
  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as any);
  };
  
  return (
    <div className="hidden">
      {/* Button and dropdown completely removed */}
    </div>
  );
};