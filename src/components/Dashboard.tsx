
import React, { useState } from "react";
import KPIMetrics from "./KPIMetrics"; // Using default import
import { ActualDataTab } from "./ActualDataTab";
import { ForecastTab } from "./ForecastTab";
import { ModelValidationTab } from "./ModelValidationTab";
import { InsightsTab } from "./InsightsTab";
import { PlanningTab } from "./PlanningTab";
import UploadDataTabWithNavigation from "./UploadDataTabWithNavigation"; // Using default import
import CustomSidebar from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

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

  // Sample KPI data for the KPIMetrics component
  const kpiData = [
    {
      title: "Total Contacts",
      value: 15420,
      subtitle: "Last 30 days",
      changeValue: 12.5,
      changeText: "vs previous period",
      invertChange: false
    },
    {
      title: "Average Handle Time",
      value: 5.2,
      subtitle: "Minutes per contact",
      changeValue: -3.1,
      changeText: "vs previous period",
      invertChange: true
    },
    {
      title: "Occupancy Rate",
      value: 87,
      subtitle: "Agent utilization",
      changeValue: 2.3,
      changeText: "vs target",
      invertChange: false
    },
    {
      title: "Forecast Accuracy",
      value: 92,
      subtitle: "Last period",
      changeValue: 4.2, // Ensuring this is a number
      changeText: "vs previous period",
      invertChange: false
    },
    {
      title: "Agent Availability",
      value: 105,
      subtitle: "Full-time equivalent",
      changeValue: -2.5, // Converting to a number (was likely a string)
      changeText: "vs required",
      invertChange: true
    }
  ];

  return (
    <SidebarProvider>
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
                  <KPIMetrics kpiData={kpiData} loading={false} />
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
    </SidebarProvider>
  );
};
