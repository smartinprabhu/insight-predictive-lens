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
  Menu, // Replaced MoreVertical with Menu
} from "lucide-react";
// import { ThemeToggle } from "./ThemeToggle"; // ThemeToggle not used in this component
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

const tabs = [
  { id: "businessPerformance", name: "Business Performance Metrics" },
  { id: "actualData", name: "Historical Data Analysis" },
  { id: "forecast", name: "Trends & Forecast" },
  { id: "modelValidation", name: "Model Validation" },
  { id: "insights", name: "Insights & Analysis" },
  { id: "planning", name: "Planning" },
  { id: "uploadData", name: "Upload Data" },
];

const CustomSidebar = ({ activeTab, setActiveTab, setOpenModal, handleLogout, isSidebarCollapsed, toggleSidebar }) => {
  const [isWalmartWFSOpen, setIsWalmartWFSOpen] = React.useState(true);

  return (
    <Sidebar 
      className={`bg-sidebar-background text-sidebar-foreground transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
    >
      <SidebarContent>
        {/* Header: Toggle button and Logo */}
        <div className={`flex items-center py-4 border-b border-gray-200 dark:border-gray-700 ${isSidebarCollapsed ? 'px-2 justify-start' : 'px-2 justify-start'}`}> 
          {/* Keep justify-start for collapsed to align hamburger to left, px-2 for padding */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          {!isSidebarCollapsed && (
            <img
              src="/image.svg"
              alt="Logo"
              className="w-16 h-auto ml-2 transition-all duration-300" // Using w-16, h-auto for proportion
            />
          )}
           {/* Small logo when collapsed - removed to match Gmail's leaner collapsed look */}
           {/* If a small logo is desired when collapsed, it could be re-added here,
               but ensure it doesn't interfere with the left-aligned toggle button
               or make the w-20 header too crowded.
           */}
        </div>

        {/* Original logo section from initial code - for reference of animation classes */}
        {/* 
        <div className="flex flex-col items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
            // ... button was here ...
          <img
            src="/image.svg"
            alt="Logo"
            className={`transition-all duration-300 ${
              isSidebarCollapsed ? 'w-8 h-8 mx-auto' : 'w-16 h-16 mx-auto'
            } mb-0`} // Removed w-80 h-30 as it was conflicting/large
          />
        </div>
        */}

        <SidebarGroup className="mt-0">
          <SidebarGroupContent className="mt-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButtonOriginal
                  onClick={() => setIsWalmartWFSOpen(!isWalmartWFSOpen)}
                  className={`flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  tooltip={isSidebarCollapsed ? "Walmart Fulfillment services" : undefined}
                >
                  {isWalmartWFSOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  {!isSidebarCollapsed && <span className="text-sm font-medium">Walmart Fulfillment services</span>}
                </SidebarMenuButtonOriginal>
                {isWalmartWFSOpen && (
                  <SidebarMenuSub className={`${isSidebarCollapsed ? 'pl-0' : 'pl-0'}`}> {/* Adjusted padding for collapse */}
                    {tabs.map((tab) => (
                      <SidebarMenuSubItem key={tab.id}>
                        <SidebarMenuSubButton
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 py-2 rounded-lg transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                            activeTab === tab.id
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                          tooltip={isSidebarCollapsed ? tab.name.replace("Dashboards", "Pages").replace("Metrics", "Page") : undefined}
                        >
                          {tab.id === "businessPerformance" && <ChartNoAxesGantt className="sidebar-menu-icon" />}
                          {tab.id === "actualData" && <FileClock className="sidebar-menu-icon" />}
                          {tab.id === "forecast" && <BarChart className="sidebar-menu-icon" />}
                          {tab.id === "modelValidation" && <Package className="sidebar-menu-icon" />}
                          {tab.id === "insights" && <Lightbulb className="sidebar-menu-icon" />}
                          {tab.id === "planning" && <NotebookPen className="sidebar-menu-icon" />}
                          {tab.id === "uploadData" && <CloudUpload className="sidebar-menu-icon" />}
                          {!isSidebarCollapsed && <span className="text-sm font-medium">{tab.name.replace("Dashboards", "Pages").replace("Metrics", "Page")}</span>}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Help"
              className={`flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <HelpCircle className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Help</span>}
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Company Setting"
              className={`flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Settings className="h-5 w-5" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Company Setting</span>}
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Logout"
              onClick={handleLogout}
              className={`flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
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

export default CustomSidebar;
