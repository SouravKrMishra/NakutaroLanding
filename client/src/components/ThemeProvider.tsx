import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';
type AccentColor = 'red' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  toggleTheme: () => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor>('red');

  // Initialize theme from localStorage if available
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedAccentColor = localStorage.getItem('accentColor') as AccentColor | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('light-mode', storedTheme === 'light');
    }
    
    if (storedAccentColor) {
      setAccentColor(storedAccentColor);
      applyAccentColor(storedAccentColor);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light-mode', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
  };

  const changeAccentColor = (color: AccentColor) => {
    setAccentColor(color);
    applyAccentColor(color);
    localStorage.setItem('accentColor', color);
  };

  const applyAccentColor = (color: AccentColor) => {
    // Remove existing accent color classes
    document.documentElement.classList.remove(
      'accent-red', 
      'accent-blue', 
      'accent-green', 
      'accent-pink', 
      'accent-purple', 
      'accent-orange'
    );
    // Add new accent color class
    document.documentElement.classList.add(`accent-${color}`);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      accentColor, 
      toggleTheme, 
      setAccentColor: changeAccentColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}