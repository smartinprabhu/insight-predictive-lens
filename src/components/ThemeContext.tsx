import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the types for theme mode and color theme
type ThemeMode = "light" | "dark" | "system";
type ColorTheme = "default" | "blue" | "green" | "purple" | "orange";

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
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default");
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  // Load theme preferences from localStorage on component mount
  useEffect(() => {
    const savedThemeMode = localStorage.getItem("themeMode") as ThemeMode;
    const savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme;

    if (savedThemeMode) setThemeMode(savedThemeMode);
    if (savedColorTheme) setColorTheme(savedColorTheme);
  }, []);

  // Apply theme based on mode and color
  const applyTheme = (mode: ThemeMode, color: ColorTheme) => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      "light-default", "light-blue", "light-green", "light-purple", "light-orange",
      "dark-default", "dark-blue", "dark-green", "dark-purple", "dark-orange"
    );

    // Determine if dark mode should be applied
    let isDark = false;

    if (mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = mode === "dark";
    }

    // Apply dark/light class
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    // Apply specific theme
    const themeClass = `${isDark ? "dark" : "light"}-${color}`;
    document.documentElement.classList.add(themeClass);

    // Save preferences
    localStorage.setItem("themeMode", mode);
    localStorage.setItem("colorTheme", color);

    // Update the state
    setIsDarkTheme(isDark);
  };

  // Handle theme mode change
  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode, colorTheme);
  };

  // Handle color theme change
  const handleColorThemeChange = (color: ColorTheme) => {
    setColorTheme(color);
    applyTheme(themeMode, color);
  };

  // Apply the initial theme
  useEffect(() => {
    applyTheme(themeMode, colorTheme);
  }, []);

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
