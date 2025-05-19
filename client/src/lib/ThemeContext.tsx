import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'blue' | 'pink' | 'purple' | 'green';
type Mode = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state - for color accents
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('anime-india-theme');
    return (savedTheme as Theme) || 'default';
  });
  
  // Mode state - for light/dark preference
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem('anime-india-mode');
    return (savedMode as Mode) || 'dark';
  });

  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };

  // Apply theme changes
  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('anime-india-theme', theme);
    
    // Apply theme attribute
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  // Apply mode changes
  useEffect(() => {
    // Save mode to localStorage
    localStorage.setItem('anime-india-mode', mode);
    
    // Apply mode to HTML element
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Set data attribute for CSS selectors
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};