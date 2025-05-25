
import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import TabNavigation from "./TabNavigation";
import ActualDataTab from "./ActualDataTab";
import ForecastTab from "./ForecastTab";
import ModelValidationTab from "./ModelValidationTab";
import InsightsTab from "./InsightsTab";
import PlanningTab from "./PlanningTab";
import UploadDataTabWithNavigation from "./UploadDataTabWithNavigation";
import { cn } from "@/lib/utils";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("businessPerformance");
  const [openModal, setOpenModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "businessPerformance":
        return <div className="p-6">Business Performance Content</div>;
      case "actualData":
        return <ActualDataTab />;
      case "forecast":
        return <ForecastTab />;
      case "modelValidation":
        return <ModelValidationTab />;
      case "insights":
        return <InsightsTab />;
      case "planning":
        return <PlanningTab />;
      case "uploadData":
        return <UploadDataTabWithNavigation />;
      default:
        return <ActualDataTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <CustomSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setOpenModal={setOpenModal}
        handleLogout={handleLogout}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <DashboardHeader
            title="Dashboard"
            lastUpdated="2024-01-15 14:30"
            forecastPeriod="6 months"
          />
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
