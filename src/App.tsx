
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import PlanningPage from "./components/app/PlanningPage";
import "./styles/themes.css";

const queryClient = new QueryClient();

const App = () => {
  // Initialize theme based on user preferences
  useEffect(() => {
    const themeMode = localStorage.getItem("themeMode") || "system";
    const colorTheme = localStorage.getItem("colorTheme") || "default";
    
    // Determine if dark mode should be applied
    let isDark = false;
    if (themeMode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = themeMode === "dark";
    }
    
    // Apply dark/light class
    document.documentElement.classList.toggle("dark", isDark);
    
    // Apply specific theme
    const themeClass = `${isDark ? "dark" : "light"}-${colorTheme}`;
    document.documentElement.classList.add(themeClass);
    
    // Listen for system preference changes if in system mode
    if (themeMode === "system") {
      const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.remove("light-default", "light-blue", "light-green", 
          "dark-default", "dark-purple", "dark-orange");
        document.documentElement.classList.toggle("dark", e.matches);
        const newThemeClass = `${e.matches ? "dark" : "light"}-${colorTheme}`;
        document.documentElement.classList.add(newThemeClass);
      };
      
      darkModeMediaQuery.addEventListener("change", handleChange);
      return () => darkModeMediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Index />} />
            {/* <Route path="/planning" element={<PlanningPage />} />  */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
