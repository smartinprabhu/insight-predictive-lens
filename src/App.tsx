
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removed useEffect as it's no longer needed for theme management here
import Login from "./pages/Login";
import Index from "./pages/Index";
import { ThemeProvider } from "@/components/ThemeContext"; // Import ThemeProvider
import NotFound from "./pages/NotFound";
import "./styles/themes.css";

const queryClient = new QueryClient();

const App = () => {
  // The useEffect hook for manual theme management has been removed.
  // ThemeProvider will now handle theme initialization and updates.

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
