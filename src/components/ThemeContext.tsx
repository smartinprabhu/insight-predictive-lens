
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeMode, ColorTheme } from '../types/shared';

// Define comprehensive theme colors
const themeColors = {
  default: {
    light: {
      primary: "hsl(222.2 84% 4.9%)",
      secondary: "hsl(210 40% 96%)",
      accent: "hsl(210 40% 96%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 84% 4.9%)",
      muted: "hsl(210 40% 96%)",
      border: "hsl(214.3 31.8% 91.4%)",
      card: "hsl(0 0% 100%)",
    },
    dark: {
      primary: "hsl(210 40% 98%)",
      secondary: "hsl(222.2 84% 4.9%)",
      accent: "hsl(217.2 32.6% 17.5%)",
      background: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
      muted: "hsl(217.2 32.6% 17.5%)",
      border: "hsl(217.2 32.6% 17.5%)",
      card: "hsl(222.2 84% 4.9%)",
    }
  },
  blue: {
    light: {
      primary: "hsl(221.2 83.2% 53.3%)",
      secondary: "hsl(210 40% 96%)",
      accent: "hsl(210 40% 96%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 84% 4.9%)",
      muted: "hsl(210 40% 96%)",
      border: "hsl(214.3 31.8% 91.4%)",
      card: "hsl(0 0% 100%)",
    },
    dark: {
      primary: "hsl(217.2 91.2% 59.8%)",
      secondary: "hsl(222.2 84% 4.9%)",
      accent: "hsl(217.2 32.6% 17.5%)",
      background: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
      muted: "hsl(217.2 32.6% 17.5%)",
      border: "hsl(217.2 32.6% 17.5%)",
      card: "hsl(222.2 84% 4.9%)",
    }
  },
  // Add other theme colors...
};

interface ThemeContextType {
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  isDarkTheme: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

  // Apply theme CSS variables
  const applyThemeVariables = (mode: "light" | "dark", theme: ColorTheme) => {
    const colors = themeColors[theme] || themeColors.default;
    const themeColors_current = colors[mode];
    
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(themeColors_current).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = themeMode === "dark";
      }

      // Apply dark class
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

      // Apply theme variables
      applyThemeVariables(isDark ? "dark" : "light", colorTheme);

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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { ThemeMode, ColorTheme };
