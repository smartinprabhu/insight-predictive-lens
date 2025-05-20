
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
  ChevronRight
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
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
  SidebarTrigger,
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

const CustomSidebar = ({ activeTab, setActiveTab, setOpenModal, handleLogout, isSidebarCollapsed }) => {
  const [isWalmartWFSOpen, setIsWalmartWFSOpen] = React.useState(true);

  return (
    <Sidebar collapsible="icon" className="bg-gray-100 dark:bg-gray-800">
      <SidebarContent>
        <div className="flex flex-col items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between w-full p-2">
            <SidebarTrigger />
          </div>
          <img
            src="/image.svg"
            alt="Logo"
            className={`transition-all duration-300 ${
              isSidebarCollapsed ? 'w-8 h-8 mx-auto' : 'w-16 h-16 mx-auto'
            } w-40 h-30 mb-0`}
          />
        </div>
        <SidebarGroup className="w-auto mt-0">
          <SidebarGroupContent className="mt-0 ">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButtonOriginal
                  onClick={() => setIsWalmartWFSOpen(!isWalmartWFSOpen)}
                  className="flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  {isWalmartWFSOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <span className="text-sm font-medium">Walmart Fulfillment services</span>
                </SidebarMenuButtonOriginal>
                {isWalmartWFSOpen && (
                  <SidebarMenuSub>
                    {tabs.map((tab) => (
                      <SidebarMenuSubItem key={tab.id}>
                        <SidebarMenuSubButton
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 py-2 rounded-lg transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'bg-gray-200 dark:bg-gray-600 text-primary font-bold'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {tab.id === "businessPerformance" && <ChartNoAxesGantt className="sidebar-menu-icon" />}
                          {tab.id === "actualData" && <FileClock className="sidebar-menu-icon" />}
                          {tab.id === "forecast" && <BarChart className="sidebar-menu-icon" />}
                          {tab.id === "modelValidation" && <Package className="sidebar-menu-icon" />}
                          {tab.id === "insights" && <Lightbulb className="sidebar-menu-icon" />}
                          {tab.id === "planning" && <NotebookPen className="sidebar-menu-icon" />}
                          {tab.id === "uploadData" && <CloudUpload className="sidebar-menu-icon" />}
                          <span className="text-sm font-medium">{tab.name.replace("Dashboards", "Pages").replace("Metrics", "Page")}</span>
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
              tooltip="Logout"
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomSidebar;
