import { useState, useEffect } from 'react';

type AccentColor = 'red' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

export function AccentColorSelector() {
  const [accentColor, setAccentColor] = useState<AccentColor>('red');
  
  useEffect(() => {
    // Check for saved accent color preference
    const savedAccentColor = localStorage.getItem('accentColor') as AccentColor;
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
      applyAccentColorClass(savedAccentColor);
    } else {
      // Set default to red
      document.documentElement.classList.add('accent-red');
    }
  }, []);
  
  const applyAccentColorClass = (color: AccentColor) => {
    // Remove all accent color classes
    document.documentElement.classList.remove(
      'accent-red',
      'accent-blue',
      'accent-green',
      'accent-pink',
      'accent-purple',
      'accent-orange'
    );
    // Add the selected accent color class
    document.documentElement.classList.add(`accent-${color}`);
  };

  const changeAccentColor = (color: AccentColor) => {
    setAccentColor(color);
    applyAccentColorClass(color);
    localStorage.setItem('accentColor', color);
  };
  
  const colorOptions = [
    { value: 'red', label: 'Red', bgClass: 'bg-[#FF3B30]' },
    { value: 'blue', label: 'Blue', bgClass: 'bg-[#007AFF]' },
    { value: 'green', label: 'Green', bgClass: 'bg-[#34C759]' },
    { value: 'pink', label: 'Pink', bgClass: 'bg-[#FF2D55]' },
    { value: 'purple', label: 'Purple', bgClass: 'bg-[#AF52DE]' },
    { value: 'orange', label: 'Orange', bgClass: 'bg-[#FF9500]' }
  ];
  
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium">
        Accent:
      </span>
      <div className="flex space-x-2">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            onClick={() => changeAccentColor(color.value as AccentColor)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              accentColor === color.value 
                ? 'border-white dark:border-white scale-110' 
                : 'border-transparent scale-100 hover:scale-105'
            } ${color.bgClass}`}
            aria-label={`Set accent color to ${color.label}`}
            title={color.label}
          />
        ))}
      </div>
    </div>
  );
}