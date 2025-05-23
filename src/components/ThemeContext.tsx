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
    const applyTheme = (mode: ThemeMode, color: ColorTheme) => {
      document.documentElement.classList.remove(
        "light-default", "light-blue", "light-green", "light-purple", "light-orange",
        "dark-default", "dark-blue", "dark-green", "dark-purple", "dark-orange"
      );

      let isDark = false;
      if (mode === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = mode === "dark";
      }

      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

      const themeClass = `${isDark ? "dark" : "light"}-${color}`;
      document.documentElement.classList.add(themeClass);

      localStorage.setItem("themeMode", mode);
      localStorage.setItem("colorTheme", color);
      setIsDarkTheme(isDark);
    };

    applyTheme(themeMode, colorTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (themeMode === "system") {
        applyTheme("system", colorTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeMode, colorTheme]); // Re-run when themeMode or colorTheme changes by user

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    // Theme application is handled by the useEffect above
  };

  const handleColorThemeChange = (color: ColorTheme) => {
    setColorTheme(color);
    // Theme application is handled by the useEffect above
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
