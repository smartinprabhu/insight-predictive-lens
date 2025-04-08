
import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { ModelConfiguration } from "./ModelConfiguration";
import { TabNavigation } from "./TabNavigation";
import { ActualDataTab } from "./ActualDataTab";
import { ForecastTab } from "./ForecastTab";
import { ModelValidationTab } from "./ModelValidationTab";
import { InsightsTab } from "./InsightsTab";
import { useToast } from "@/hooks/use-toast";
import { KPIMetricsCard } from "./KPIMetricsCard";

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
        return <ForecastTab forecastPeriod={forecastPeriod} />;
      case "modelValidation":
        return <ModelValidationTab />;
      case "insights":
        return <InsightsTab />;
      default:
        return <ActualDataTab />;
    }
  };

  const kpiData = [
    { title: "IB Units", value: 648, subtitle: "Total cases for IB units", changeValue: 12.5, changeText: "from previous period" },
    { title: "Inventory", value: 532, subtitle: "Total cases for Inventory", changeValue: 4.2, changeText: "from previous period" },
    { title: "Customer Returns", value: 285, subtitle: "Total cases for Customer returns", changeValue: 7.8, changeText: "from previous period" },
    { title: "WSF China", value: 423, subtitle: "Total cases for WSF China", changeValue: 3.1, changeText: "from previous period" },
    { title: "IB Exceptions", value: 156, subtitle: "Total cases for IB Exceptions", changeValue: -2.5, changeText: "from previous period" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <DashboardHeader
        lastUpdated="07/04/2025"
        forecastPeriod={forecastPeriod}
        onRefresh={handleRefresh}
      />
      
      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <KPIMetricsCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            changeValue={kpi.changeValue}
            changeText={kpi.changeText}
          />
        ))}
      </div>
      
      <ModelConfiguration
        modelType={modelType}
        forecastPeriod={forecastPeriod}
        aggregationType={aggregationType}
        onModelTypeChange={setModelType}
        onForecastPeriodChange={setForecastPeriod}
        onAggregationTypeChange={setAggregationType}
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
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
