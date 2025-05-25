
import React from "react";
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
  MoreVertical,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton as SidebarMenuButtonOriginal,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "businessPerformance", name: "Business Performance Metrics", icon: ChartNoAxesGantt },
  { id: "actualData", name: "Historical Data Analysis", icon: FileClock },
  { id: "forecast", name: "Trends & Forecast", icon: BarChart },
  { id: "modelValidation", name: "Model Validation", icon: Package },
  { id: "insights", name: "Insights & Analysis", icon: Lightbulb },
  { id: "planning", name: "Planning", icon: NotebookPen },
  { id: "uploadData", name: "Upload Data", icon: CloudUpload },
];

interface AnimatedSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setOpenModal?: (open: boolean) => void;
  handleLogout: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  setOpenModal, 
  handleLogout, 
  isSidebarCollapsed, 
  toggleSidebar 
}) => {
  const [isWalmartWFSOpen, setIsWalmartWFSOpen] = React.useState(true);

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "bg-sidebar-background text-sidebar-foreground transition-all duration-300 ease-in-out",
        "border-r border-sidebar-border shadow-lg"
      )}
    >
      <SidebarContent>
        {/* Header with Logo and Toggle */}
        <div className={cn(
          "flex flex-col items-center justify-center py-6 border-b border-sidebar-border",
          "transition-all duration-300 ease-in-out"
        )}>
          <div className="flex items-center justify-end w-full px-4 mb-4">
            <button
              onClick={toggleSidebar} 
              className={cn(
                "p-2 rounded-md transition-all duration-200 ease-in-out",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-sidebar-ring",
                "transform hover:scale-105 active:scale-95"
              )}
              aria-label="Toggle sidebar"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          
          <div className={cn(
            "transition-all duration-300 ease-in-out transform",
            isSidebarCollapsed ? "scale-75" : "scale-100"
          )}>
            <img
              src="/image.svg"
              alt="Logo"
              className={cn(
                "transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "w-10 h-10" : "w-16 h-16",
                "filter brightness-0 dark:brightness-100"
              )}
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButtonOriginal
                  onClick={() => setIsWalmartWFSOpen(!isWalmartWFSOpen)}
                  className={cn(
                    "flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 ease-in-out",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "group relative overflow-hidden",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
                    "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
                  )}
                >
                  <div className={cn(
                    "transition-transform duration-200 ease-in-out",
                    isWalmartWFSOpen ? "rotate-0" : "rotate-[-90deg]"
                  )}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium tracking-wide">
                      Walmart Fulfillment Services
                    </span>
                  )}
                </SidebarMenuButtonOriginal>
                
                {/* Animated Submenu */}
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isWalmartWFSOpen && !isSidebarCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <SidebarMenuSub className="mt-2 space-y-1">
                    {tabs.map((tab, index) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      
                      return (
                        <SidebarMenuSubItem key={tab.id}>
                          <SidebarMenuSubButton
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ease-in-out",
                              "group relative overflow-hidden",
                              "transform hover:translate-x-1",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md scale-105"
                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
                            )}
                            style={{
                              animationDelay: `${index * 50}ms`
                            }}
                          >
                            <div className={cn(
                              "transition-all duration-200 ease-in-out",
                              isActive ? "scale-110" : "group-hover:scale-105"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={cn(
                              "text-sm font-medium transition-all duration-200 ease-in-out",
                              isActive ? "font-semibold" : ""
                            )}>
                              {tab.name.replace("Dashboards", "Pages").replace("Metrics", "Page")}
                            </span>
                            
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute right-2 w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                            )}
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
      <SidebarFooter className="px-3 py-4 border-t border-sidebar-border">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Help"
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              <HelpCircle className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Help</span>}
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Company Setting"
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              <Settings className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Company Setting</span>}
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Logout"
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:bg-destructive hover:text-destructive-foreground",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AnimatedSidebar;
