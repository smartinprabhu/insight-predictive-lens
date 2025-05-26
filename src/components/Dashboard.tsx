
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TabNavigation } from "@/components/TabNavigation";
import { ActualDataTab } from "@/components/ActualDataTab";
import ForecastTab from "@/components/ForecastTab";
import { ModelValidationTab } from "@/components/ModelValidationTab";
import { InsightsTab } from "@/components/InsightsTab";
import PlanningTab from "@/components/PlanningTab";
import UploadDataTab from "@/components/UploadDataTab";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useToast } from "@/components/ui/use-toast";

interface DashboardProps {
  onReset: () => void;
  apiResponse?: any;
}

const Dashboard: React.FC<DashboardProps> = ({ onReset, apiResponse }) => {
  const [activeTab, setActiveTab] = useState("businessPerformance");
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "businessPerformance":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Business Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
                <p className="text-3xl font-bold text-primary">1,247,583</p>
                <p className="text-sm text-muted-foreground">+12.3% from last month</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">Average Handle Time</h3>
                <p className="text-3xl font-bold text-primary">4.2 min</p>
                <p className="text-sm text-muted-foreground">-8.1% from last month</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">Customer Satisfaction</h3>
                <p className="text-3xl font-bold text-primary">94.7%</p>
                <p className="text-sm text-muted-foreground">+2.4% from last month</p>
              </div>
            </div>
          </div>
        );
      case "actualData":
        return <ActualDataTab />;
      case "forecast":
        return (
          <ForecastTab
            aggregationType="daily"
            modelType="arima"
            forecastPeriod="3 months"
            data={apiResponse?.data || []}
            insights={apiResponse?.insights || []}
          />
        );
      case "modelValidation":
        return <ModelValidationTab />;
      case "insights":
        return <InsightsTab />;
      case "planning":
        return <PlanningTab />;
      case "uploadData":
        return <UploadDataTab setOpenModal={setOpenModal} />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Business Performance Metrics</h2>
          </div>
        );
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-background">
        <EnhancedSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setOpenModal={setOpenModal}
          handleLogout={handleLogout}
        />
        <SidebarInset className="flex-1">
          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
            <DashboardHeader
              title="Walmart Fulfillment Services"
              lastUpdated="2024-01-15 14:30"
              forecastPeriod="3 months forecast"
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {renderTabContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
