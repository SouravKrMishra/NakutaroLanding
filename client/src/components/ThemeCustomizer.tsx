import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";
import { Button } from "../components/ui/button";
import { Settings } from "lucide-react";

interface ThemeOption {
  id: string;
  name: string;
  color: string;
}

const themeOptions: ThemeOption[] = [
  { id: "default", name: "Red", color: "#9c181d" },
  { id: "blue", name: "Blue", color: "#007AFF" },
  { id: "pink", name: "Pink", color: "#FF2D55" },
  { id: "purple", name: "Purple", color: "#AF52DE" },
  { id: "green", name: "Green", color: "#34C759" },
];

export const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const customizerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as any);
    setIsOpen(false);
  };

  // Close customizer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customizerRef.current &&
        !customizerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentTheme =
    themeOptions.find((t) => t.id === theme) || themeOptions[0];

  return (
    <div className="fixed bottom-20 right-8 z-50">
      <div className="relative" ref={customizerRef}>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-[#1E1E1E] border-[#2D2D2D] hover:bg-[#2D2D2D] shadow-lg"
          onClick={toggleOpen}
        >
          <Settings className="h-5 w-5" style={{ color: currentTheme.color }} />
        </Button>

        {isOpen && (
          <div
            className="absolute bottom-12 right-0 rounded-lg shadow-lg p-4 w-60 animate-in slide-in-from-bottom-5 duration-200"
            style={{
              backgroundColor: "#1E1E1E",
              borderColor: "#2D2D2D",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <div className="mb-3">
              <h3 className="font-bold text-sm text-white">
                Customize Appearance
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-[#9CA3AF] text-xs mb-2">Theme Color</p>

              <div className="flex flex-col gap-1">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`text-white text-sm py-2 px-3 rounded hover:bg-[#2D2D2D] text-left transition-all ${
                      theme === option.id ? "bg-[#2D2D2D]" : ""
                    }`}
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
