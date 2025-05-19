
import React from "react";
import { KPIMetricsCard } from "./KPIMetricsCard";
import LoadingSkeleton from "./LoadingSkeleton";

interface KPIMetricsProps {
  kpiData: {
    title: string;
    value: number | string;
    subtitle?: string;
    changeValue: number;
    changeText?: string;
    invertChange?: boolean;
  }[];
  loading: boolean;
}

const KPIMetrics: React.FC<KPIMetricsProps> = ({ kpiData, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center px-1">
        <h2 className="text-lg font-medium text-foreground">
          Business Performance Metrics
        </h2>
        <div className="text-sm text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-3 py-1 rounded-md shadow-sm border border-border/30">
          <span>As of {new Date().toLocaleDateString('en-GB')}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {kpiData.map((kpi, index) => (
          <KPIMetricsCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            changeValue={kpi.changeValue}
            changeText={kpi.changeText}
            invertChange={kpi.invertChange}
          />
        ))}
      </div>
    </div>
  );
};

export default KPIMetrics;
