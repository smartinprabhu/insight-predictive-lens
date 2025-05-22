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
type ColorTheme = "default" | "blue" | "teal" | "green" | "purple" | "orange";

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
      "light-default", "light-blue", "light-teal", "light-green", "light-purple", "light-orange",
      "dark-default", "dark-blue", "dark-teal", "dark-green", "dark-purple", "dark-orange"
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
              {/* First theme - Blue */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="blue-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1 relative">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap"
                    )}>
                      {/* Upper left - light color */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-blue-900" : "bg-blue-50"
                      )}></div>
                      {/* Upper right - lighter color */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-blue-800" : "bg-blue-100"
                      )}></div>
                      {/* Lower left - dark color */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-blue-200" : "bg-blue-600"
                      )}></div>
                      {/* Lower right - darker color */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-blue-100" : "bg-blue-200"
                      )}></div>
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

              {/* Second theme - Teal */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="teal-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap"
                    )}>
                      {/* Upper left - light teal */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-teal-900" : "bg-teal-50"
                      )}></div>
                      {/* Upper right - lighter teal */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-teal-800" : "bg-teal-100"
                      )}></div>
                      {/* Lower left - dark teal */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-teal-200" : "bg-teal-600"
                      )}></div>
                      {/* Lower right - darker teal */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-teal-100" : "bg-teal-200"
                      )}></div>
                    </div>
                    {colorTheme === "teal" && (
                      <div className="absolute top-1 left-1 bg-teal-600 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </Label>
                <RadioGroupItem
                  id="teal-theme"
                  value="teal"
                  className="sr-only"
                />
              </div>

              {/* Third theme - Green */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="green-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap"
                    )}>
                      {/* Upper left - light green */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-green-900" : "bg-green-50"
                      )}></div>
                      {/* Upper right - lighter green */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-green-800" : "bg-green-100"
                      )}></div>
                      {/* Lower left - dark green */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-green-200" : "bg-green-600"
                      )}></div>
                      {/* Lower right - darker green */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-green-100" : "bg-green-200"
                      )}></div>
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

              {/* Fourth theme - Purple */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="purple-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap"
                    )}>
                      {/* Upper left - light purple */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-purple-900" : "bg-purple-50"
                      )}></div>
                      {/* Upper right - lighter purple */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-purple-800" : "bg-purple-100"
                      )}></div>
                      {/* Lower left - dark purple */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-purple-200" : "bg-purple-600"
                      )}></div>
                      {/* Lower right - darker purple */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-purple-100" : "bg-purple-200"
                      )}></div>
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

              {/* Fifth theme - Orange */}
              <div className="flex flex-col items-center gap-1">
                <Label
                  htmlFor="orange-theme"
                  className="cursor-pointer relative rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center bg-muted"
                >
                  <div className="w-full h-full p-1">
                    <div className={cn(
                      "w-full h-full rounded-full overflow-hidden flex flex-wrap"
                    )}>
                      {/* Upper left - light orange */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-orange-900" : "bg-orange-50"
                      )}></div>
                      {/* Upper right - lighter orange */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-orange-800" : "bg-orange-100"
                      )}></div>
                      {/* Lower left - dark orange */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-orange-200" : "bg-orange-600"
                      )}></div>
                      {/* Lower right - darker orange */}
                      <div className={cn(
                        "w-1/2 h-1/2",
                        themeMode === 'dark' ? "bg-orange-100" : "bg-orange-200"
                      )}></div>
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
