
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the types for theme mode and color theme
type ThemeMode = "light" | "dark" | "system";
type ColorTheme = "default" | "blue" | "teal" | "green" | "purple" | "orange";

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
    const stored = localStorage.getItem("themeMode");
    return (stored as ThemeMode) || "system";
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem("colorTheme");
    return (stored as ColorTheme) || "default";
  });
  
  // Initialize isDarkTheme based on the initial themeMode
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const initialMode = (localStorage.getItem("themeMode") as ThemeMode) || "system";
    if (initialMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return initialMode === "dark";
  });

  // Effect to apply theme and listen for system changes
  useEffect(() => {
    const currentMode = themeMode;
    const currentColor = colorTheme;

    document.documentElement.classList.remove(
      "light-default", "light-blue", "light-teal", "light-green", "light-purple", "light-orange",
      "dark-default", "dark-blue", "dark-teal", "dark-green", "dark-purple", "dark-orange"
    );

    let isDark = false;
    if (currentMode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = currentMode === "dark";
    }

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    const themeClass = `${isDark ? "dark" : "light"}-${currentColor}`;
    document.documentElement.classList.add(themeClass);

    localStorage.setItem("themeMode", currentMode);
    localStorage.setItem("colorTheme", currentColor);
    setIsDarkTheme(isDark);

    // Listener for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === "system") {
        document.documentElement.classList.remove(
          "light-default", "light-blue", "light-teal", "light-green", "light-purple", "light-orange",
          "dark-default", "dark-blue", "dark-teal", "dark-green", "dark-purple", "dark-orange"
        );
        document.documentElement.classList.toggle("dark", e.matches);
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
        const newSystemThemeClass = `${e.matches ? "dark" : "light"}-${colorTheme}`;
        document.documentElement.classList.add(newSystemThemeClass);
        setIsDarkTheme(e.matches);
        localStorage.setItem("themeMode", "system");
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
    <ThemeContext.Provider value={{ themeMode, colorTheme, isDarkTheme, setThemeMode: handleModeChange, setColorTheme: handleColorThemeChange }}>
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
