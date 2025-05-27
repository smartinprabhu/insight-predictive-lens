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
  MoreVertical, // Existing icon
  Menu,           // New hamburger icon
} from "lucide-react";
import ThemeSelector from "./ThemeSelector"; // Import ThemeSelector
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar
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
  // SidebarTrigger, // SidebarTrigger will be replaced
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

const CustomSidebar = ({ activeTab, setActiveTab, setOpenModal, handleLogout }) => { // Removed isSidebarCollapsed and toggleSidebar from props
  const { state: sidebarState, toggleSidebar } = useSidebar(); // Call useSidebar
  const [isWalmartWFSOpen, setIsWalmartWFSOpen] = React.useState(true);

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-background text-sidebar-foreground">
      <SidebarContent>
        <div className="flex flex-col items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end w-full p-2"> {/* Changed justify-between to justify-end */}
            {/* Replace SidebarTrigger with a custom button */}
            {/* <button
              onClick={toggleSidebar} 
              className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button> */}
          </div>
          <img
            src="/image.svg"
            alt="Logo"
            className={`transition-all duration-300 ${
              sidebarState === 'collapsed' ? 'w-8 h-8 mx-auto' : 'w-16 h-16 mx-auto' // Use sidebarState
            } w-80 h-30 mb-0`}
          />
        </div>
        <SidebarGroup className="w-auto mt-0">
          <SidebarGroupContent className="mt-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButtonOriginal
                  onClick={() => setIsWalmartWFSOpen(!isWalmartWFSOpen)}
                  className="flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {isWalmartWFSOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Walmart Fulfillment services</span>
                </SidebarMenuButtonOriginal>
              </SidebarMenuItem>

              {/* Conditionally rendered list of items, replacing SidebarMenuSub */}
              {isWalmartWFSOpen && (
                <>
                  {tabs.map((tab) => (
                    <SidebarMenuItem 
                      key={tab.id}
                    >
                      <SidebarMenuButtonOriginal
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-2 rounded-lg transition-colors duration-200 w-full ${ 
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        } ${ sidebarState === 'expanded' ? 'pl-7' : '' }`} // Indentation for expanded state. Collapsed state handled by ui/sidebar.tsx for SidebarMenuButtonOriginal
                      >
                        {/* Icons always visible */}
                        {tab.id === "businessPerformance" && <ChartNoAxesGantt className="sidebar-menu-icon" />}
                        {tab.id === "actualData" && <FileClock className="sidebar-menu-icon" />}
                        {tab.id === "forecast" && <BarChart className="sidebar-menu-icon" />}
                        {tab.id === "modelValidation" && <Package className="sidebar-menu-icon" />}
                        {tab.id === "insights" && <Lightbulb className="sidebar-menu-icon" />}
                        {tab.id === "planning" && <NotebookPen className="sidebar-menu-icon" />}
                        {tab.id === "uploadData" && <CloudUpload className="sidebar-menu-icon" />}

                        {/* Text label hidden when sidebar is collapsed */}
                        <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{tab.name.replace("Dashboards", "Pages").replace("Metrics", "Page")}</span>
                      </SidebarMenuButtonOriginal>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-start group-data-[collapsible=icon]:justify-center">
            <ThemeSelector />
            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden ml-2">
                Theme
            </span>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Help"
              className="flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Help</span>
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Company Setting"
              className="flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Company Setting</span>
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Logout"
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Logout</span>
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomSidebar;
