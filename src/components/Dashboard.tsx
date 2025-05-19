
import React, { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { TabNavigation } from "./TabNavigation";
import { KPIMetrics } from "./KPIMetrics";
import { ActualDataTab } from "./ActualDataTab";
import { ForecastTab } from "./ForecastTab";
import { ModelValidationTab } from "./ModelValidationTab";
import { InsightsTab } from "./InsightsTab";
import { PlanningTab } from "./PlanningTab";
import { UploadDataTabWithNavigation } from "./UploadDataTabWithNavigation";
import CustomSidebar from "./Sidebar";

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
        <DashboardHeader />

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Show appropriate tab content based on activeTab */}
            {activeTab === "businessPerformance" && (
              <>
                <KPIMetrics />
              </>
            )}
            {activeTab === "actualData" && <ActualDataTab />}
            {activeTab === "forecast" && <ForecastTab />}
            {activeTab === "modelValidation" && <ModelValidationTab />}
            {activeTab === "insights" && <InsightsTab />}
            {activeTab === "planning" && <PlanningTab />}
            {activeTab === "uploadData" && <UploadDataTabWithNavigation />}
          </div>
        </div>
      </div>
    </div>
  );
};
