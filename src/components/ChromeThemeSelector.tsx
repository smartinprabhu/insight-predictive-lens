
import React, { useState } from "react";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTheme, ThemeMode, ColorTheme } from "./ThemeContext";
import { useToast } from "@/components/ui/use-toast";

interface ChromeThemeSelectorProps {
  isCollapsed: boolean;
}

const themeOptions: Array<{ mode: ThemeMode; color: ColorTheme; name: string; preview: string[] }> = [
  { mode: "light", color: "default", name: "Light", preview: ["#f8fafc", "#2563eb", "#ffffff", "#1e293b"] },
  { mode: "dark", color: "default", name: "Dark", preview: ["#0f172a", "#3b82f6", "#1e293b", "#f8fafc"] },
  { mode: "light", color: "blue", name: "Ocean Blue", preview: ["#E3F2FD", "#3F51B5", "#FFFFFF", "#1A237E"] },
  { mode: "dark", color: "blue", name: "Deep Blue", preview: ["#1A237E", "#3F51B5", "#283593", "#A7C4FF"] },
  { mode: "light", color: "teal", name: "Fresh Teal", preview: ["#E0F2F1", "#00796B", "#FFFFFF", "#004D40"] },
  { mode: "dark", color: "teal", name: "Dark Teal", preview: ["#004D40", "#00796B", "#00695C", "#A7FFEB"] },
  { mode: "light", color: "green", name: "Nature Green", preview: ["#E8F5E9", "#00796B", "#FFFFFF", "#004D40"] },
  { mode: "dark", color: "green", name: "Forest Green", preview: ["#004D40", "#00796B", "#00695C", "#A7FFEB"] },
  { mode: "light", color: "purple", name: "Royal Purple", preview: ["#EDE7F6", "#512DA8", "#FFFFFF", "#311B92"] },
  { mode: "dark", color: "purple", name: "Deep Purple", preview: ["#311B92", "#512DA8", "#4527A0", "#E1BEE7"] },
  { mode: "light", color: "orange", name: "Sunset Orange", preview: ["#fff7ed", "#f97316", "#ffffff", "#0f172a"] },
  { mode: "dark", color: "orange", name: "Ember Orange", preview: ["#E65100", "#EF6C00", "#D84315", "#FFCC80"] },
];

export const ChromeThemeSelector: React.FC<ChromeThemeSelectorProps> = ({ isCollapsed }) => {
  const [open, setOpen] = useState(false);
  const { themeMode, colorTheme, setThemeMode, setColorTheme } = useTheme();
  const { toast } = useToast();

  const currentTheme = themeOptions.find(
    (option) => option.mode === themeMode && option.color === colorTheme
  );

  const handleThemeSelect = (mode: ThemeMode, color: ColorTheme, name: string) => {
    setThemeMode(mode);
    setColorTheme(color);
    setOpen(false);
    
    toast({
      title: "Theme Changed",
      description: `Applied ${name} theme`,
      duration: 2000,
    });
  };

  const ThemePreviewTile: React.FC<{ option: typeof themeOptions[0]; isSelected: boolean }> = ({ 
    option, 
    isSelected 
  }) => (
    <button
      onClick={() => handleThemeSelect(option.mode, option.color, option.name)}
      className={cn(
        "relative group w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
        isSelected 
          ? "border-primary shadow-lg ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Theme Preview */}
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
        <div 
          className="col-span-2 h-4" 
          style={{ backgroundColor: option.preview[0] }}
        />
        <div 
          className="h-4" 
          style={{ backgroundColor: option.preview[1] }}
        />
        <div 
          className="h-4" 
          style={{ backgroundColor: option.preview[2] }}
        />
      </div>
      
      {/* Check Mark for Selected Theme */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-primary rounded-full p-1">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 w-full justify-start py-2 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="relative">
            <Palette className="h-4 w-4 flex-shrink-0" />
            {currentTheme && (
              <div 
                className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-background"
                style={{ backgroundColor: currentTheme.preview[1] }}
              />
            )}
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium truncate">
              Themes
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-4 bg-popover border-border"
        side={isCollapsed ? "right" : "top"}
        align="start"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-foreground mb-2">
              Choose Your Theme
            </h3>
            <p className="text-xs text-muted-foreground">
              Select a theme to instantly change your dashboard appearance
            </p>
          </div>
          
          {/* Theme Grid */}
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const isSelected = option.mode === themeMode && option.color === colorTheme;
              return (
                <div key={`${option.mode}-${option.color}`} className="flex flex-col items-center gap-1">
                  <ThemePreviewTile option={option} isSelected={isSelected} />
                  <span className={cn(
                    "text-xs text-center transition-colors duration-200",
                    isSelected ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {option.name}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Current Theme Info */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div 
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: currentTheme?.preview[1] }}
              />
              <span>Current: {currentTheme?.name}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
