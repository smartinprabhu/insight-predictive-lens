
import React, { useState } from "react";
import {
  FileClock,
  BarChart,
  ChartNoAxesGantt,
  CloudUpload,
  NotebookPen,
  Lightbulb,
  LogOut,
  Package,
  HelpCircle,
  Settings,
  Menu,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EnhancedThemeSelector from "./EnhancedThemeSelector";

const tabs = [
  { id: "businessPerformance", name: "Business Performance", icon: ChartNoAxesGantt },
  { id: "actualData", name: "Historical Data", icon: FileClock },
  { id: "forecast", name: "Trends & Forecast", icon: BarChart },
  { id: "modelValidation", name: "Model Validation", icon: Package },
  { id: "insights", name: "Insights & Analysis", icon: Lightbulb },
  { id: "planning", name: "Planning", icon: NotebookPen },
  { id: "uploadData", name: "Upload Data", icon: CloudUpload },
];

interface GmailStyleSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const GmailStyleSidebar: React.FC<GmailStyleSidebarProps> = ({
  activeTab,
  setActiveTab,
  handleLogout,
  isSidebarCollapsed,
  toggleSidebar,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-300 ease-in-out z-50 flex flex-col",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with logo and hamburger */}
      <div className="flex items-center p-4 border-b border-border">
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-accent transition-colors",
            isSidebarCollapsed ? "mx-auto" : "mr-3"
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2">
            <img src="/image.svg" alt="Logo" className="w-8 h-8" />
            <span className="font-semibold text-lg">Walmart WFS</span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredItem(tab.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                  "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-foreground hover:text-accent-foreground",
                  isSidebarCollapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  (isActive || hoveredItem === tab.id) && "scale-110"
                )} />
                
                {!isSidebarCollapsed && (
                  <span className="font-medium truncate flex-1">
                    {tab.name}
                  </span>
                )}
                
                {!isSidebarCollapsed && isActive && (
                  <ChevronRight className="h-4 w-4 opacity-60" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border p-2 space-y-1">
        {/* Theme Selector */}
        <div className={cn(
          "flex items-center",
          isSidebarCollapsed ? "justify-center" : "px-2 py-2"
        )}>
          <EnhancedThemeSelector />
          {!isSidebarCollapsed && (
            <span className="ml-3 text-sm font-medium">Theme</span>
          )}
        </div>

        {/* Help */}
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
            "hover:bg-accent text-foreground hover:text-accent-foreground",
            isSidebarCollapsed && "justify-center px-2"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {!isSidebarCollapsed && <span className="font-medium">Help</span>}
        </button>

        {/* Settings */}
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
            "hover:bg-accent text-foreground hover:text-accent-foreground",
            isSidebarCollapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5" />
          {!isSidebarCollapsed && <span className="font-medium">Settings</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
            "hover:bg-destructive hover:text-destructive-foreground",
            isSidebarCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default GmailStyleSidebar;
