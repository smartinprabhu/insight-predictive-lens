
import React, { useState } from "react";
import { CheckIcon, Moon, Sun, Monitor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "./ThemeContext";
import type { ThemeMode, ColorTheme } from "../types/shared";

const themeColors = [
  {
    name: "default",
    label: "Default",
    light: { primary: "#2563eb", secondary: "#64748b", accent: "#f1f5f9", bg: "#f8fafc" },
    dark: { primary: "#3b82f6", secondary: "#60a5fa", accent: "#334155", bg: "#0f172a" }
  },
  {
    name: "blue",
    label: "Blue",
    light: { primary: "#3F51B5", secondary: "#5C6BC0", accent: "#E8EAF6", bg: "#E3F2FD" },
    dark: { primary: "#3F51B5", secondary: "#7986CB", accent: "#303F9F", bg: "#1A237E" }
  },
  {
    name: "teal",
    label: "Teal",
    light: { primary: "#00796B", secondary: "#00897B", accent: "#B2DFDB", bg: "#E0F2F1" },
    dark: { primary: "#00796B", secondary: "#26A69A", accent: "#00897B", bg: "#004D40" }
  },
  {
    name: "green",
    label: "Green",
    light: { primary: "#00796B", secondary: "#26A69A", accent: "#C8E6C9", bg: "#E8F5E9" },
    dark: { primary: "#00796B", secondary: "#4DB6AC", accent: "#006064", bg: "#004D40" }
  },
  {
    name: "purple",
    label: "Purple",
    light: { primary: "#512DA8", secondary: "#673AB7", accent: "#D1C4E9", bg: "#EDE7F6" },
    dark: { primary: "#512DA8", secondary: "#7E57C2", accent: "#4A148C", bg: "#311B92" }
  },
  {
    name: "orange",
    label: "Orange",
    light: { primary: "#f97316", secondary: "#fb923c", accent: "#fed7aa", bg: "#fff7ed" },
    dark: { primary: "#EF6C00", secondary: "#FF9800", accent: "#BF360C", bg: "#E65100" }
  }
];

const EnhancedThemeSelector: React.FC = () => {
  const { themeMode, colorTheme, isDarkTheme, setThemeMode, setColorTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleModeChange = (value: string | undefined) => {
    if (value) {
      setThemeMode(value as ThemeMode);
      toast({
        title: "Theme Mode Updated",
        description: `Theme changed to ${value === "system" ? "system preference" : value} mode`,
        duration: 2000,
      });
    }
  };

  const handleColorThemeChange = (value: ColorTheme) => {
    setColorTheme(value);
    toast({
      title: "Color Theme Updated",
      description: `Color theme changed to ${value}`,
      duration: 2000,
    });
  };

  const currentModeName =
    themeMode === "light" ? "Light" :
    themeMode === "dark" ? "Dark" : "System";

  const ThemePreview: React.FC<{ theme: typeof themeColors[0], isSelected: boolean }> = ({ theme, isSelected }) => {
    const colors = isDarkTheme ? theme.dark : theme.light;
    
    return (
      <div className="flex flex-col items-center gap-2">
        <Label
          htmlFor={`${theme.name}-theme`}
          className={cn(
            "cursor-pointer relative rounded-xl overflow-hidden w-16 h-16 p-1",
            "ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200",
            "transform hover:scale-105 active:scale-95",
            isSelected && "ring-primary shadow-lg"
          )}
          onClick={() => handleColorThemeChange(theme.name as ColorTheme)}
        >
          <div className="w-full h-full rounded-lg overflow-hidden shadow-inner">
            <div className="flex h-full">
              <div className="flex-1 flex flex-col">
                <div 
                  className="flex-1" 
                  style={{ backgroundColor: colors.bg }}
                />
                <div 
                  className="flex-1" 
                  style={{ backgroundColor: colors.accent }}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div 
                  className="flex-1" 
                  style={{ backgroundColor: colors.primary }}
                />
                <div 
                  className="flex-1" 
                  style={{ backgroundColor: colors.secondary }}
                />
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md">
                  <CheckIcon className="h-3 w-3 text-gray-800" />
                </div>
              </div>
            )}
          </div>
        </Label>
        <span className={cn(
          "text-xs font-medium text-center",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
          {theme.label}
        </span>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "w-10 h-10 bg-background/80 backdrop-blur-sm border-border/50",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-all duration-200 ease-in-out",
            "transform hover:scale-105 active:scale-95"
          )}
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
      <PopoverContent className={cn(
        "w-80 p-6 bg-popover/95 backdrop-blur-md text-popover-foreground border-border/50",
        "shadow-xl animate-in fade-in-0 zoom-in-95"
      )}>
        <div className="space-y-6">
          {/* Theme Mode Selector */}
          <div>
            <div className="mb-3 font-semibold text-lg">Appearance</div>
            <ToggleGroup
              type="single"
              value={themeMode}
              onValueChange={handleModeChange}
              className="grid grid-cols-3 gap-2 p-1 bg-muted/50 rounded-lg"
            >
              <ToggleGroupItem
                value="light"
                className={cn(
                  "flex-1 items-center gap-2 rounded-md py-2 px-3 transition-all duration-200",
                  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                  themeMode === "light" && "bg-background text-foreground shadow-sm"
                )}
              >
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium">Light</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                className={cn(
                  "flex-1 items-center gap-2 rounded-md py-2 px-3 transition-all duration-200",
                  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                  themeMode === "dark" && "bg-background text-foreground shadow-sm"
                )}
              >
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium">Dark</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="system"
                className={cn(
                  "flex-1 items-center gap-2 rounded-md py-2 px-3 transition-all duration-200",
                  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                  themeMode === "system" && "bg-background text-foreground shadow-sm"
                )}
              >
                <Monitor className="h-4 w-4" />
                <span className="text-sm font-medium">Auto</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Color Theme Selector */}
          <div>
            <div className="mb-3 font-semibold text-lg">Theme Colors</div>
            <div className="grid grid-cols-3 gap-4">
              {themeColors.map((theme) => (
                <ThemePreview
                  key={theme.name}
                  theme={theme}
                  isSelected={colorTheme === theme.name}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 text-center text-sm text-muted-foreground border-t border-border/30">
            Current: {currentModeName} {colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedThemeSelector;
