
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
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChromeThemeSelector } from "./ChromeThemeSelector";

const tabs = [
  { id: "businessPerformance", name: "Business Performance Metrics", icon: ChartNoAxesGantt },
  { id: "actualData", name: "Historical Data Analysis", icon: FileClock },
  { id: "forecast", name: "Trends & Forecast", icon: BarChart },
  { id: "modelValidation", name: "Model Validation", icon: Package },
  { id: "insights", name: "Insights & Analysis", icon: Lightbulb },
  { id: "planning", name: "Planning", icon: NotebookPen },
  { id: "uploadData", name: "Upload Data", icon: CloudUpload },
];

interface EnhancedSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setOpenModal: (open: boolean) => void;
  handleLogout: () => void;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  activeTab,
  setActiveTab,
  setOpenModal,
  handleLogout,
}) => {
  const [isWalmartWFSOpen, setIsWalmartWFSOpen] = useState(true);
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "bg-sidebar-background text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-border/20",
        "data-[state=collapsed]:w-16 data-[state=expanded]:w-64"
      )}
    >
      <SidebarContent>
        {/* Header with Logo and Toggle */}
        <div className="flex flex-col items-center justify-center py-4 border-b border-border/20">
          <div className="flex items-center justify-between w-full px-3 mb-3">
            <div className={cn("transition-opacity duration-200", isCollapsed && "opacity-0")}>
              <span className="text-sm font-medium text-sidebar-foreground/70">
                {!isCollapsed && "Menu"}
              </span>
            </div>
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Logo */}
          <div className="flex items-center justify-center">
            <img
              src="/image.svg"
              alt="Logo"
              className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "w-8 h-8" : "w-16 h-16"
              )}
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsWalmartWFSOpen(!isWalmartWFSOpen)}
                  className={cn(
                    "flex items-center gap-3 py-3 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all duration-200",
                    "group relative overflow-hidden"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "transition-transform duration-200",
                      isWalmartWFSOpen ? "rotate-0" : "-rotate-90"
                    )}>
                      {isWalmartWFSOpen ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate transition-opacity duration-200">
                        Walmart Fulfillment Services
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>

                {/* Animated Submenu */}
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isWalmartWFSOpen && !isCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <SidebarMenuSub className="mt-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      
                      return (
                        <SidebarMenuSubItem key={tab.id}>
                          <SidebarMenuSubButton
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 group relative",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isActive && "bg-primary text-primary-foreground font-medium shadow-sm",
                              "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary before:transition-all before:duration-200",
                              isActive ? "before:opacity-100" : "before:opacity-0 hover:before:opacity-50"
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm truncate group-hover:text-sidebar-accent-foreground transition-colors duration-200">
                              {tab.name}
                            </span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border/20 p-2">
        <SidebarMenu>
          {/* Theme Selector */}
          <SidebarMenuItem>
            <div className={cn(
              "px-2 py-2 transition-all duration-200",
              isCollapsed && "px-1"
            )}>
              <ChromeThemeSelector isCollapsed={isCollapsed} />
            </div>
          </SidebarMenuItem>
          
          {/* Footer Menu Items */}
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                "flex items-center gap-3 py-2 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all duration-200"
              )}
              tooltip={isCollapsed ? "Help" : undefined}
            >
              <HelpCircle className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Help</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                "flex items-center gap-3 py-2 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all duration-200"
              )}
              tooltip={isCollapsed ? "Company Settings" : undefined}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Company Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 py-2 px-3 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all duration-200"
              )}
              tooltip={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EnhancedSidebar;
