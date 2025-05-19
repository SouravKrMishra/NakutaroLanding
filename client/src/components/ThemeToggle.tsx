import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);
  
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      // Switch to dark mode
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      // Switch to light mode
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 bg-opacity-10 hover:bg-opacity-20 transition-colors duration-200 focus:outline-none"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-white" />
      ) : (
        <Moon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  );
}