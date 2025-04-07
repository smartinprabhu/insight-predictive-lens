
import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { ModelConfiguration } from "./ModelConfiguration";
import { TabNavigation } from "./TabNavigation";
import { ActualDataTab } from "./ActualDataTab";
import { ForecastTab } from "./ForecastTab";
import { ModelValidationTab } from "./ModelValidationTab";
import { InsightsTab } from "./InsightsTab";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  onReset: () => void;
}

export const Dashboard = ({ onReset }: DashboardProps) => {
  const [modelType, setModelType] = useState("Prophet");
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [aggregationType, setAggregationType] = useState("Daily");
  const [activeTab, setActiveTab] = useState("actualData");
  const { toast } = useToast();

  const tabs = [
    { id: "actualData", name: "Actual Data" },
    { id: "forecast", name: "Trends & Forecast" },
    { id: "modelValidation", name: "Model Validation" },
    { id: "insights", name: "Insights" },
  ];

  const handleRefresh = () => {
    toast({
      title: "Refreshing Dashboard",
      description: "Updating with the latest data...",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "actualData":
        return <ActualDataTab />;
      case "forecast":
        return <ForecastTab />;
      case "modelValidation":
        return <ModelValidationTab />;
      case "insights":
        return <InsightsTab />;
      default:
        return <ActualDataTab />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <DashboardHeader
        lastUpdated="07/04/2025"
        forecastPeriod={forecastPeriod}
        onRefresh={handleRefresh}
      />
      
      <ModelConfiguration
        modelType={modelType}
        forecastPeriod={forecastPeriod}
        aggregationType={aggregationType}
        onModelTypeChange={setModelType}
        onForecastPeriodChange={setForecastPeriod}
        onAggregationTypeChange={setAggregationType}
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
