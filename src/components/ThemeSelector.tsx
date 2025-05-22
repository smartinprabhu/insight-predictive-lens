
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

// Theme types
type ThemeMode = "light" | "dark" | "system";
type ColorTheme = "default" | "blue" | "green" | "purple" | "orange";

const ThemeSelector = () => {
  // State for theme mode and color theme
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default");
  const [open, setOpen] = useState(false);

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
      "light-default", "light-blue", "light-green",
      "dark-default", "dark-purple", "dark-orange"
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
    
    // Apply specific theme
    const themeClass = `${isDark ? "dark" : "light"}-${color}`;
    document.documentElement.classList.add(themeClass);
    
    // Save preferences
    localStorage.setItem("themeMode", mode);
    localStorage.setItem("colorTheme", color);
  };

  // Handle theme mode change
  const handleModeChange = (value: ThemeMode) => {
    setThemeMode(value);
    applyTheme(value, colorTheme);
  };

  // Handle color theme change
  const handleColorThemeChange = (value: ColorTheme) => {
    setColorTheme(value);
    applyTheme(themeMode, value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10">
          {themeMode === "light" ? (
            <Sun className="h-4 w-4" />
          ) : themeMode === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          {/* Theme Mode Selector */}
          <div>
            <div className="mb-2 font-medium">Theme Mode</div>
            <ToggleGroup
              type="single"
              value={themeMode}
              onValueChange={(value) => value && handleModeChange(value as ThemeMode)}
              className="justify-start rounded-full bg-muted p-1 w-full"
            >
              <ToggleGroupItem
                value="light"
                className={cn(
                  "flex items-center gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white px-4",
                  themeMode === "light" && "bg-primary text-white"
                )}
              >
                <Sun className="h-4 w-4" /> Light
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                className={cn(
                  "flex items-center gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white px-4",
                  themeMode === "dark" && "bg-primary text-white"
                )}
              >
                <Moon className="h-4 w-4" /> Dark
              </ToggleGroupItem>
              <ToggleGroupItem
                value="system"
                className={cn(
                  "flex items-center gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white px-4",
                  themeMode === "system" && "bg-primary text-white"
                )}
              >
                <Monitor className="h-4 w-4" /> Device
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Color Theme Selector */}
          <div>
            <div className="mb-2 font-medium">Color Theme</div>
            <RadioGroup
              value={colorTheme}
              onValueChange={(value: ColorTheme) => handleColorThemeChange(value)}
              className="grid grid-cols-4 gap-2"
            >
              {/* Default theme */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="default-theme"
                  className="cursor-pointer relative rounded-md overflow-hidden w-14 h-14 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap",
                      themeMode === 'dark' ? "bg-[#2c2c2c]" : "bg-white"
                    )}>
                      <div className="w-1/2 h-1/2 bg-blue-600"></div>
                      <div className="w-1/2 h-1/2 bg-gray-300"></div>
                      <div className="w-1/2 h-1/2 bg-gray-400"></div>
                      <div className="w-1/2 h-1/2 bg-gray-500"></div>
                    </div>
                    {colorTheme === "default" && (
                      <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3 text-white" />
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
                  className="cursor-pointer relative rounded-md overflow-hidden w-14 h-14 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className="w-full h-full rounded-full overflow-hidden flex flex-wrap">
                      <div className="w-1/2 h-1/2 bg-blue-500"></div>
                      <div className="w-1/2 h-1/2 bg-blue-200"></div>
                      <div className="w-1/2 h-1/2 bg-blue-300"></div>
                      <div className="w-1/2 h-1/2 bg-blue-400"></div>
                    </div>
                    {colorTheme === "blue" && (
                      <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3 text-white" />
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
                  className="cursor-pointer relative rounded-md overflow-hidden w-14 h-14 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className="w-full h-full rounded-full overflow-hidden flex flex-wrap">
                      <div className="w-1/2 h-1/2 bg-green-600"></div>
                      <div className="w-1/2 h-1/2 bg-green-200"></div>
                      <div className="w-1/2 h-1/2 bg-green-300"></div>
                      <div className="w-1/2 h-1/2 bg-green-400"></div>
                    </div>
                    {colorTheme === "green" && (
                      <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3 text-white" />
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
                  className="cursor-pointer relative rounded-md overflow-hidden w-14 h-14 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className="w-full h-full rounded-full overflow-hidden flex flex-wrap">
                      <div className="w-1/2 h-1/2 bg-purple-700"></div>
                      <div className="w-1/2 h-1/2 bg-purple-200"></div>
                      <div className="w-1/2 h-1/2 bg-purple-300"></div>
                      <div className="w-1/2 h-1/2 bg-purple-500"></div>
                    </div>
                    {colorTheme === "purple" && (
                      <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3 text-white" />
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
                  className="cursor-pointer relative rounded-md overflow-hidden w-14 h-14 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className="w-full h-full rounded-full overflow-hidden flex flex-wrap">
                      <div className="w-1/2 h-1/2 bg-orange-600"></div>
                      <div className="w-1/2 h-1/2 bg-orange-200"></div>
                      <div className="w-1/2 h-1/2 bg-orange-300"></div>
                      <div className="w-1/2 h-1/2 bg-orange-400"></div>
                    </div>
                    {colorTheme === "orange" && (
                      <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3 text-white" />
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSelector;
