import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'blue' | 'pink' | 'purple' | 'green';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('anime-india-theme');
    return (savedTheme as Theme) || 'default';
  });

  useEffect(() => {
    // Save theme to localStorage when changed
    localStorage.setItem('anime-india-theme', theme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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