import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the types for theme mode and color theme
type ThemeMode = "light" | "dark" | "system";
type ColorTheme = "default" | "blue" | "teal" | "green" | "purple" | "orange"; // Added "teal"

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
  // Initialize isDarkTheme based on the initial themeMode
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const initialMode = (localStorage.getItem("themeMode") as ThemeMode | null) || "system";
    if (initialMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return initialMode === "dark";
  });

  // Effect to apply theme and listen for system changes
  useEffect(() => {
    const root = document.documentElement;

    // Determine if dark mode should be active
    let isDark = false;
    if (themeMode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = themeMode === "dark";
    }

    // Apply/remove 'dark' class
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light"); // Ensure light is removed if dark is active
    } else {
      root.classList.add("light");
      root.classList.remove("dark"); // Ensure dark is removed if light is active
    }
    
    // Remove any existing theme-* class
    const themes: ColorTheme[] = ["default", "blue", "teal", "green", "purple", "orange"];
    themes.forEach(t => {
      root.classList.remove(`theme-${t}`);
    });

    // Add the current colorTheme class
    if (colorTheme) {
      root.classList.add(`theme-${colorTheme}`);
    }

    // Update localStorage
    localStorage.setItem("themeMode", themeMode);
    localStorage.setItem("colorTheme", colorTheme);
    setIsDarkTheme(isDark); // Update isDarkTheme state for components that might need it

    // Listener for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("themeMode") === "system") { // Check localStorage directly for persisted mode
        const systemIsDark = e.matches;
        if (systemIsDark) {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
        setIsDarkTheme(systemIsDark);
        // The colorTheme class (theme-blue etc.) remains unchanged, only light/dark switches.
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeMode, colorTheme]); // Re-run when themeMode or colorTheme changes

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
