
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeMode, ColorTheme } from '../types/shared';

// Define the context type
interface ThemeContextType {
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  isDarkTheme: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ColorTheme) => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("themeMode") as ThemeMode | null) || "system";
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem("colorTheme") as ColorTheme | null) || "default";
  });
  
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const initialMode = (localStorage.getItem("themeMode") as ThemeMode | null) || "system";
    if (initialMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return initialMode === "dark";
  });

  // Effect to apply theme and listen for system changes
  useEffect(() => {
    const applyTheme = () => {
      // Remove all existing theme classes
      document.documentElement.classList.remove(
        "light-default", "light-blue", "light-teal", "light-green", "light-purple", "light-orange",
        "dark-default", "dark-blue", "dark-teal", "dark-green", "dark-purple", "dark-orange"
      );

      let isDark = false;
      if (themeMode === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = themeMode === "dark";
      }

      // Apply the dark class and data-theme attribute
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

      // Apply the specific theme class
      const themeClass = `${isDark ? "dark" : "light"}-${colorTheme}`;
      document.documentElement.classList.add(themeClass);

      // Store in localStorage
      localStorage.setItem("themeMode", themeMode);
      localStorage.setItem("colorTheme", colorTheme);
      setIsDarkTheme(isDark);
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === "system") {
        setIsDarkTheme(e.matches);
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeMode, colorTheme]);

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleColorThemeChange = (color: ColorTheme) => {
    setColorTheme(color);
  };

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      colorTheme, 
      isDarkTheme, 
      setThemeMode: handleModeChange, 
      setColorTheme: handleColorThemeChange 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export types for use in other components
export type { ThemeMode, ColorTheme };
