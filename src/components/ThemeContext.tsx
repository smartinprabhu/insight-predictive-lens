import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define the types for theme mode and color theme
type ThemeMode = "light" | "dark" | "system";
type ColorTheme = "default" | "blue" | "green" | "purple" | "orange" | "teal"; // Added "teal"

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
    return (localStorage.getItem("themeMode") as ThemeMode) || "system";
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem("colorTheme") as ColorTheme) || "default";
  });
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  // Apply theme based on mode and color
  const applyTheme = useCallback(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      "light-default", "light-blue", "light-green", "light-purple", "light-orange", "light-teal",
      "dark-default", "dark-blue", "dark-green", "dark-purple", "dark-orange", "dark-teal"
    );

    let currentThemeMode = themeMode;
    let currentIsDark = false;

    if (currentThemeMode === "system") {
      currentIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      currentIsDark = currentThemeMode === "dark";
    }

    // Apply dark/light class
    document.documentElement.classList.toggle("dark", currentIsDark);
    document.documentElement.setAttribute("data-theme", currentIsDark ? "dark" : "light");

    // Apply specific theme
    const themeClass = `${currentIsDark ? "dark" : "light"}-${colorTheme}`;
    document.documentElement.classList.add(themeClass);

    // Save preferences
    localStorage.setItem("themeMode", themeMode); // Use state themeMode directly
    localStorage.setItem("colorTheme", colorTheme); // Use state colorTheme directly

    // Update the state
    setIsDarkTheme(currentIsDark);
  }, [themeMode, colorTheme]); // Dependencies for useCallback

  // Effect to apply theme when mode or color changes
  useEffect(() => {
    applyTheme();
  }, [applyTheme]); // applyTheme is memoized and includes themeMode, colorTheme

  // Effect to listen for system theme changes
  useEffect(() => {
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        applyTheme(); // Re-apply theme based on new system preference
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [themeMode, applyTheme]); // Dependency on themeMode and applyTheme

  // Handle theme mode change
  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    // applyTheme will be called by the useEffect hook due to themeMode change
  };

  // Handle color theme change
  const handleColorThemeChange = (color: ColorTheme) => {
    setColorTheme(color);
    // applyTheme will be called by the useEffect hook due to colorTheme change
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
