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
  Menu,
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "@/components/ui/sidebar";
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

const CustomSidebar = ({ activeTab, setActiveTab, setOpenModal, handleLogout }) => {
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const [isWalmartWFSOpen, setIsWalmartWFSOpen] = React.useState(true);

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-background text-sidebar-foreground">
      <SidebarContent>
        <div className="flex flex-col items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end w-full p-2"></div>
          <img
            src="/image.svg"
            alt="Logo"
            className={`transition-all duration-300 ${
              sidebarState === 'collapsed' ? 'w-8 h-8 mx-auto' : 'w-16 h-16 mx-auto'
            } w-80 h-30 mb-0`}
          />
        </div>
        <SidebarGroup className="w-auto mt-0">
          <SidebarGroupContent className="mt-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButtonOriginal
                  tooltip="Walmart Fulfillment Services"
                  onClick={() => setIsWalmartWFSOpen(!isWalmartWFSOpen)}
                  className="flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {isWalmartWFSOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Walmart Fulfillment Services</span>
                </SidebarMenuButtonOriginal>
              </SidebarMenuItem>

              {isWalmartWFSOpen && (
                <>
                  {tabs.map((tab) => (
                    <SidebarMenuItem key={tab.id}>
                      <SidebarMenuButtonOriginal
                        tooltip={tab.name} // Add tooltip for each tab
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-2 rounded-lg transition-colors duration-200 w-full ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        } ${sidebarState === 'expanded' ? 'pl-7' : ''}`}
                      >
                        {tab.id === "businessPerformance" && <ChartNoAxesGantt className="sidebar-menu-icon" />}
                        {tab.id === "actualData" && <FileClock className="sidebar-menu-icon" />}
                        {tab.id === "forecast" && <BarChart className="sidebar-menu-icon" />}
                        {tab.id === "modelValidation" && <Package className="sidebar-menu-icon" />}
                        {tab.id === "insights" && <Lightbulb className="sidebar-menu-icon" />}
                        {tab.id === "planning" && <NotebookPen className="sidebar-menu-icon" />}
                        {tab.id === "uploadData" && <CloudUpload className="sidebar-menu-icon" />}

                        <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{tab.name.replace("Dashboards", "Pages").replace("Metrics", "Metrics")}</span>
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
          <SidebarMenuItem>
            <div className="flex items-center gap-2 py-0 mr-5 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200">
              <ThemeSelector />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden"></span>
            </div>
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
