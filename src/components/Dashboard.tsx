
import React, { useState } from "react";
import KPIMetrics from "./KPIMetrics"; // Fixed import
import { ActualDataTab } from "./ActualDataTab";
import { ForecastTab } from "./ForecastTab";
import { ModelValidationTab } from "./ModelValidationTab";
import { InsightsTab } from "./InsightsTab";
import { PlanningTab } from "./PlanningTab";
import UploadDataTabWithNavigation from "./UploadDataTabWithNavigation"; // Fixed import
import CustomSidebar from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

export const Dashboard = ({ 
  onReset, 
  apiResponse 
}: { 
  onReset: () => void;
  apiResponse: any;
}) => {
  const [activeTab, setActiveTab] = useState("businessPerformance");
  const [openModal, setOpenModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    onReset();
  };

  // Mock data for components that require props
  const mockData = {
    title: "Walmart Fulfillment Services",
    lastUpdated: "May 19, 2025",
    forecastPeriod: "Q2 2025",
    insights: [
      { id: 1, title: "Insight 1", description: "Description for insight 1" },
      { id: 2, title: "Insight 2", description: "Description for insight 2" }
    ],
    modelType: "ARIMA",
    aggregationType: "Weekly"
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <CustomSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        setOpenModal={setOpenModal}
        handleLogout={handleLogout}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader 
          title={mockData.title} 
          lastUpdated={mockData.lastUpdated}
          forecastPeriod={mockData.forecastPeriod}
        />

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Show appropriate tab content based on activeTab */}
            {activeTab === "businessPerformance" && (
              <>
                <KPIMetrics />
              </>
            )}
            {activeTab === "actualData" && <ActualDataTab />}
            {activeTab === "forecast" && (
              <ForecastTab 
                aggregationType={mockData.aggregationType}
                modelType={mockData.modelType}
                forecastPeriod={mockData.forecastPeriod}
                data={apiResponse || {}}
                insights={mockData.insights}
              />
            )}
            {activeTab === "modelValidation" && (
              <ModelValidationTab 
                data={apiResponse || {}}
                modelType={mockData.modelType}
              />
            )}
            {activeTab === "insights" && (
              <InsightsTab insights={mockData.insights} />
            )}
            {activeTab === "planning" && <PlanningTab />}
            {activeTab === "uploadData" && <UploadDataTabWithNavigation />}
          </div>
        </div>
      </div>
    </div>
  );
};
