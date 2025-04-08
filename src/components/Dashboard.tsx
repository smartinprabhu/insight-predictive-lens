
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
        return <ActualDataTab aggregationType={aggregationType} />;
      case "forecast":
        return <ForecastTab forecastPeriod={forecastPeriod} aggregationType={aggregationType} />;
      case "modelValidation":
        return <ModelValidationTab aggregationType={aggregationType} />;
      case "insights":
        return <InsightsTab />;
      default:
        return <ActualDataTab aggregationType={aggregationType} />;
    }
  };

  // Current date for KPI reporting
  const currentDate = new Date();
  const kpiTimePeriod = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;

  const kpiData = [
    { title: "IB Units", value: 648, subtitle: "Total cases for IB units", changeValue: 12.5, changeText: "from previous period" },
    { title: "Inventory", value: 532, subtitle: "Total cases for Inventory", changeValue: 4.2, changeText: "from previous period" },
    { title: "Customer Returns", value: 285, subtitle: "Total cases for Customer returns", changeValue: 7.8, changeText: "from previous period" },
    { title: "WSF China", value: 423, subtitle: "Total cases for WSF China", changeValue: 3.1, changeText: "from previous period" },
    { title: "IB Exceptions", value: 156, subtitle: "Total cases for IB Exceptions", changeValue: -2.5, changeText: "from previous period" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 bg-gradient-to-b from-background to-background/95 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      <DashboardHeader
        title="Predictive Analytics Dashboard"
        lastUpdated="07/04/2025"
        forecastPeriod={forecastPeriod}
        onRefresh={handleRefresh}
      />
      
      {/* KPI Metrics with common time period */}
      <div className="mb-2 flex justify-between items-center px-1">
        <h2 className="text-lg font-medium text-foreground">Key Performance Indicators</h2>
        <div className="text-sm text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-3 py-1 rounded-md shadow-sm border border-border/30">
          <span>{kpiTimePeriod}</span>
        </div>
      </div>
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
      
      <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/90 rounded-lg shadow-lg border border-border/20 dark:border-gray-700/50">
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
