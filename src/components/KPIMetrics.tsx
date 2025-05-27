import React from "react";
import { KPIMetricsCard } from "./KPIMetricsCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Added imports

interface KPIMetricsProps {
  kpiData: any[];
  loading: boolean;
}

const KPIMetrics: React.FC<KPIMetricsProps> = ({ kpiData, loading }) => {
  if (loading) {
    return (
      <Card> {/* Loading state might also benefit from Card structure */}
        <CardHeader>
          <CardTitle>Business Performance Metrics</CardTitle>
          {/* Optional: Skeleton for date */}
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card> {/* Root element is now Card */}
      <CardHeader>
        <div className="flex justify-between items-center"> {/* To keep title and date on same line if desired */}
          <CardTitle className="text-xl mb-2 mt-[-2px] font-medium text-foreground"> {/* Applied original h2 classes for consistency, though CardTitle has its own */}
            Business Performance Metrics
          </CardTitle>
          <div className="text-sm text-muted-foreground bg-background/80 mb-2 dark:bg-gray-800/80 px-3 py-1 rounded-md shadow-sm border border-border/30">
            {/* This was the original "As of" date styling. It can be simplified or put into CardDescription */}
            <span>As of {new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default KPIMetrics;
