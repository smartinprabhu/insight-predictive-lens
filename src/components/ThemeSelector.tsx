
import React, { useState, useEffect } from "react";
import { CheckIcon, Moon, Sun, Monitor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/components/ui/use-toast";

// Theme types
type ThemeMode = "light" | "dark" | "system";
type ColorTheme = "default" | "blue" | "green" | "purple" | "orange";

const ThemeSelector = () => {
  // State for theme mode and color theme
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Load theme preferences from localStorage on component mount
  useEffect(() => {
    const savedThemeMode = localStorage.getItem("themeMode") as ThemeMode;
    const savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme;
    
    if (savedThemeMode) setThemeMode(savedThemeMode);
    if (savedColorTheme) setColorTheme(savedColorTheme);
    
    // Set initial theme based on saved preferences
    applyTheme(savedThemeMode || "system", savedColorTheme || "default");
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

    // Force refresh of any UI components that might not update automatically
    document.body.style.backgroundColor = '';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 10);
  };

  // Handle theme mode change
  const handleModeChange = (value: ThemeMode) => {
    setThemeMode(value);
    applyTheme(value, colorTheme);
    toast({
      title: "Theme Mode Updated",
      description: `Theme changed to ${value === "system" ? "system preference" : value} mode`,
      duration: 2000,
    });
  };

  // Handle color theme change
  const handleColorThemeChange = (value: ColorTheme) => {
    setColorTheme(value);
    applyTheme(themeMode, value);
    toast({
      title: "Color Theme Updated",
      description: `Color theme changed to ${value}`,
      duration: 2000,
    });
  };

  // Display name for the current mode
  const currentModeName = 
    themeMode === "light" ? "Light" : 
    themeMode === "dark" ? "Dark" : "System";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-10 h-10 bg-background border-border"
        >
          {themeMode === "light" ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : themeMode === "dark" ? (
            <Moon className="h-5 w-5 text-foreground" />
          ) : (
            <Monitor className="h-5 w-5 text-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-popover text-popover-foreground border-border">
        <div className="space-y-4">
          {/* Theme Mode Selector - Matching reference image */}
          <div>
            <div className="mb-2 font-medium">Appearance</div>
            <div className="w-full overflow-hidden rounded-full bg-muted p-1 flex">
              <ToggleGroup
                type="single"
                value={themeMode}
                onValueChange={(value) => value && handleModeChange(value as ThemeMode)}
                className="flex justify-between rounded-full w-full"
              >
                <ToggleGroupItem
                  value="light"
                  className={cn(
                    "flex-1 items-center gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white px-4 py-2",
                    themeMode === "light" && "bg-primary text-white"
                  )}
                >
                  <Sun className="h-4 w-4 mr-1" /> Light
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="dark"
                  className={cn(
                    "flex-1 items-center gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white px-4 py-2",
                    themeMode === "dark" && "bg-primary text-white"
                  )}
                >
                  <Moon className="h-4 w-4 mr-1" /> Dark
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="system"
                  className={cn(
                    "flex-1 items-center gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white px-4 py-2",
                    themeMode === "system" && "bg-primary text-white"
                  )}
                >
                  <Monitor className="h-4 w-4 mr-1" /> Device
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Color Theme Selector - Grid of color options like reference image */}
          <div>
            <div className="mb-2 font-medium">Theme Colors</div>
            <RadioGroup
              value={colorTheme}
              onValueChange={(value: ColorTheme) => handleColorThemeChange(value)}
              className="grid grid-cols-4 gap-3"
            >
              {/* Default theme */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="default-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1 relative">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap",
                      themeMode === 'dark' ? "bg-[#1a1a1a]" : "bg-white"
                    )}>
                      {/* Upper left - blue */}
                      <div className="w-1/2 h-1/2 bg-blue-600"></div>
                      {/* Upper right - light blue */}
                      <div className="w-1/2 h-1/2 bg-blue-200"></div>
                      {/* Lower left - light gray */}
                      <div className="w-1/2 h-1/2 bg-gray-200"></div>
                      {/* Lower right - gray */}
                      <div className="w-1/2 h-1/2 bg-gray-400"></div>
                    </div>
                    {colorTheme === "default" && (
                      <div className="absolute top-1 left-1 bg-blue-600 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </Label>
                <RadioGroupItem
                  id="default-theme"
                  value="default"
                  className="sr-only"
                />
              </div>

              {/* Blue theme */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="blue-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap",
                      themeMode === 'dark' ? "bg-[#0f172a]" : "bg-[#e6f2ff]"
                    )}>
                      <div className="w-1/2 h-1/2 bg-blue-500"></div>
                      <div className="w-1/2 h-1/2 bg-blue-200"></div>
                      <div className="w-1/2 h-1/2 bg-blue-300"></div>
                      <div className="w-1/2 h-1/2 bg-blue-400"></div>
                    </div>
                    {colorTheme === "blue" && (
                      <div className="absolute top-1 left-1 bg-blue-600 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </Label>
                <RadioGroupItem
                  id="blue-theme"
                  value="blue"
                  className="sr-only"
                />
              </div>

              {/* Green theme */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="green-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap",
                      themeMode === 'dark' ? "bg-[#052e16]" : "bg-[#e6ffec]"
                    )}>
                      <div className="w-1/2 h-1/2 bg-green-700"></div>
                      <div className="w-1/2 h-1/2 bg-green-200"></div>
                      <div className="w-1/2 h-1/2 bg-green-300"></div>
                      <div className="w-1/2 h-1/2 bg-green-500"></div>
                    </div>
                    {colorTheme === "green" && (
                      <div className="absolute top-1 left-1 bg-green-600 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </Label>
                <RadioGroupItem
                  id="green-theme"
                  value="green"
                  className="sr-only"
                />
              </div>

              {/* Purple theme */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="purple-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap",
                      themeMode === 'dark' ? "bg-[#4b0082]" : "bg-[#f5f3ff]"
                    )}>
                      <div className="w-1/2 h-1/2 bg-purple-700"></div>
                      <div className="w-1/2 h-1/2 bg-purple-200"></div>
                      <div className="w-1/2 h-1/2 bg-purple-300"></div>
                      <div className="w-1/2 h-1/2 bg-purple-500"></div>
                    </div>
                    {colorTheme === "purple" && (
                      <div className="absolute top-1 left-1 bg-purple-600 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </Label>
                <RadioGroupItem
                  id="purple-theme"
                  value="purple"
                  className="sr-only"
                />
              </div>
              
              {/* Orange theme */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="orange-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap",
                      themeMode === 'dark' ? "bg-[#431407]" : "bg-[#fff5eb]"
                    )}>
                      <div className="w-1/2 h-1/2 bg-orange-600"></div>
                      <div className="w-1/2 h-1/2 bg-orange-200"></div>
                      <div className="w-1/2 h-1/2 bg-orange-300"></div>
                      <div className="w-1/2 h-1/2 bg-orange-400"></div>
                    </div>
                    {colorTheme === "orange" && (
                      <div className="absolute top-1 left-1 bg-orange-600 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </Label>
                <RadioGroupItem
                  id="orange-theme"
                  value="orange"
                  className="sr-only"
                />
              </div>
            </RadioGroup>
          </div>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            Current theme: {currentModeName} {colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSelector;
