
import React, { useState, useMemo } from "react";
import {
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle, Info, AlertCircle } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { generateWeeklyMonthlyData, aggregateToMonthly } from "@/services/forecastService";

interface ModelValidationTabProps {
  aggregationType: string;
}

// Generate sample validation data
const generateValidationData = (metricId = "ibUnits", weeks = 15) => {
  const data = [];
  const date = new Date();
  date.setDate(date.getDate() - (weeks * 7));

  // Different base values and error patterns for each metric
  const metricConfig = {
    ibUnits: { base: 120, errorFactor: 10, trend: 0.2 },
    inventory: { base: 250, errorFactor: 15, trend: -0.1 },
    customerReturns: { base: 80, errorFactor: 5, trend: 0.1 },
    wsfChina: { base: 180, errorFactor: 12, trend: 0.3 },
    ibExceptions: { base: 60, errorFactor: 8, trend: -0.2 },
  };

  const config = metricConfig[metricId as keyof typeof metricConfig] || metricConfig.ibUnits;

  for (let i = 0; i < weeks; i++) {
    const currentDate = new Date(date);
    currentDate.setDate(date.getDate() + (i * 7));
    
    // Calculate week number
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    const weekKey = `${currentDate.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;

    // Generate realistic looking actual vs predicted values
    const weekFactor = i / weeks * config.trend;
    const baseTrend = config.base + (config.base * weekFactor);
    const actualValue = Math.round(baseTrend + (Math.random() * config.errorFactor * 2));
    
    // Predicted is close to actual but with some error
    const errorPercent = Math.random() * 0.2 - 0.1; // -10% to +10% error
    const predictedValue = Math.round(actualValue * (1 + errorPercent));
    
    // Generate confidence bounds (95% confidence interval)
    const confidenceFactor = Math.max(5, config.errorFactor / 2);
    const lowerBound = Math.round(predictedValue - (predictedValue * 0.05) - confidenceFactor);
    const upperBound = Math.round(predictedValue + (predictedValue * 0.05) + confidenceFactor);

    data.push({
      date: weekKey,
      dateFormatted: `Week ${weekNum}`,
      actual: actualValue,
      predicted: predictedValue,
      error: actualValue - predictedValue,
      errorPercent: Math.round((actualValue - predictedValue) / actualValue * 100),
      lowerBound,
      upperBound
    });
  }

  return data;
};

// Process validation data for monthly view
const processMonthlyValidationData = (data) => {
  const groupedData = {};

  data.forEach(item => {
    const weekParts = item.date.split('-W');
    const year = parseInt(weekParts[0]);
    const weekNum = parseInt(weekParts[1]);
    
    // Estimate month from week number (rough approximation)
    const estimatedMonth = Math.floor((weekNum - 1) / 4) + 1;
    const key = `${year}-${estimatedMonth}`;
    
    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
        actualSum: 0,
        predictedSum: 0,
        errorSum: 0,
        errorPercentSum: 0,
        lowerBoundSum: 0,
        upperBoundSum: 0
      };
    }

    const group = groupedData[key];
    group.count += 1;
    group.actualSum += item.actual;
    group.predictedSum += item.predicted;
    group.errorSum += item.error;
    group.errorPercentSum += item.errorPercent;
    group.lowerBoundSum += item.lowerBound;
    group.upperBoundSum += item.upperBound;
  });

  // Convert grouped data to array and calculate averages
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return Object.entries(groupedData).map(([key, value]) => {
    const [year, month] = key.split('-');
    const monthIndex = parseInt(month) - 1;
    const dateFormatted = `${monthNames[monthIndex]} ${year}`;
    
    const group = value as any;
    
    return {
      date: key,
      dateFormatted,
      actual: Math.round(group.actualSum / group.count),
      predicted: Math.round(group.predictedSum / group.count),
      error: Math.round(group.errorSum / group.count),
      errorPercent: Math.round(group.errorPercentSum / group.count),
      lowerBound: Math.round(group.lowerBoundSum / group.count),
      upperBound: Math.round(group.upperBoundSum / group.count)
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
};

// Calculate model error metrics
const calculateErrorMetrics = (data) => {
  let mape = 0;
  let rmse = 0;
  let mae = 0;
  
  // Sum up errors
  data.forEach(item => {
    mape += Math.abs(item.error / item.actual);
    rmse += Math.pow(item.error, 2);
    mae += Math.abs(item.error);
  });
  
  // Calculate averages
  mape = (mape / data.length) * 100;
  rmse = Math.sqrt(rmse / data.length);
  mae = mae / data.length;
  
  return {
    mape: mape.toFixed(2),
    rmse: rmse.toFixed(2),
    mae: mae.toFixed(2)
  };
};

export const ModelValidationTab = ({ aggregationType = "Weekly" }: ModelValidationTabProps) => {
  const [selectedMetric, setSelectedMetric] = useState("ibUnits");
  const [showMetricsInfo, setShowMetricsInfo] = useState(false);
  const { toast } = useToast();

  const metrics = [
    { id: "ibUnits", name: "IB Units", color: "#4284f5" },
    { id: "inventory", name: "Inventory", color: "#36b37e" },
    { id: "customerReturns", name: "Customer Returns", color: "#ff9e2c" },
    { id: "wsfChina", name: "WSF China", color: "#9061F9" },
    { id: "ibExceptions", name: "IB Exceptions", color: "#f56565" },
  ];

  // Generate validation data for selected metric
  const validationData = useMemo(() => {
    const rawData = generateValidationData(selectedMetric, 15);
    return aggregationType === "Monthly" ? processMonthlyValidationData(rawData) : rawData;
  }, [selectedMetric, aggregationType]);

  // Calculate error metrics
  const errorMetrics = calculateErrorMetrics(validationData);

  const handleMetricChange = (value) => {
    setSelectedMetric(value);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Date", "Actual", "Predicted", "Lower Bound", "Upper Bound", "Error", "Error Percent"];
    const csvContent = [
      headers.join(","),
      ...validationData.map(row => 
        [row.date, row.actual, row.predicted, row.lowerBound, row.upperBound, row.error, row.errorPercent].join(",")
      )
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `validation_${selectedMetric}_${aggregationType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Validation data for ${metrics.find(m => m.id === selectedMetric)?.name} has been exported to CSV`,
    });
  };

  // Get performance badge based on MAPE score
  const getPerformanceBadge = (mape) => {
    const mapeValue = parseFloat(mape);
    if (mapeValue < 10) {
      return <Badge className="bg-green-500">Excellent</Badge>;
    } else if (mapeValue < 20) {
      return <Badge className="bg-blue-500">Good</Badge>;
    } else if (mapeValue < 30) {
      return <Badge className="bg-yellow-500 text-gray-800">Fair</Badge>;
    } else {
      return <Badge className="bg-red-500">Poor</Badge>;
    }
  };

  const selectedMetricInfo = metrics.find(m => m.id === selectedMetric);

  return (
    <TooltipProvider>
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">Model Performance</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                  <p className="font-medium mb-1">About model performance</p>
                  <p className="text-sm text-muted-foreground">
                    This page shows how accurately our forecasting model predicts actual values. 
                    Lower error metrics indicate better model performance. The chart compares 
                    actual historical values with what our model would have predicted for those dates.
                  </p>
                </TooltipContent>
              </UITooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              Historical prediction accuracy ({aggregationType})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedMetric} onValueChange={handleMetricChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-3 shadow-md dark:border-gray-700 rounded-xl">
            <CardContent className="p-6">
              <div className="h-[400px] bg-gradient-to-b from-card/40 to-background/10 dark:from-gray-800/40 dark:to-gray-900/40 p-4 rounded-lg border border-border/10 dark:border-gray-700/30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={validationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="dateFormatted" stroke="currentColor" className="text-muted-foreground text-opacity-70" />
                    <YAxis stroke="currentColor" className="text-muted-foreground text-opacity-70" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const actual = payload[0]?.value;
                          const predicted = payload[1]?.value;
                          const lowerBound = payload[2]?.value;
                          const upperBound = payload[3]?.value;
                          const error = Math.abs(actual - predicted);
                          const errorPercent = Math.round((error / actual) * 100);

                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-xl dark:bg-gray-800 dark:border-gray-700">
                              <div className="font-medium pb-2 border-b border-border/50 dark:border-gray-700/80 mb-2">{label}</div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3" style={{ backgroundColor: selectedMetricInfo?.color }}></div>
                                    <span className="text-sm">Actual</span>
                                  </div>
                                  <span className="text-sm font-mono">{actual}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2" style={{ borderColor: selectedMetricInfo?.color }}></div>
                                    <span className="text-sm">Predicted</span>
                                  </div>
                                  <span className="text-sm font-mono">{predicted}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">Confidence Bounds</span>
                                  </div>
                                  <span className="text-xs font-mono">{lowerBound} - {upperBound}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-border/30 dark:border-gray-700/50 text-muted-foreground">
                                  <span className="text-xs">Absolute Error</span>
                                  <span className="text-xs font-mono">{error} ({errorPercent}%)</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="lowerBound"
                      stackId="1"
                      stroke="none"
                      fill={`${selectedMetricInfo?.color}20`}
                      name="Lower Bound" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upperBound"
                      stackId="1"
                      stroke="none"
                      fill={`${selectedMetricInfo?.color}20`}
                      name="Upper Bound"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      name="Actual" 
                      stroke={selectedMetricInfo?.color} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      name="Predicted" 
                      stroke={selectedMetricInfo?.color} 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={{ stroke: selectedMetricInfo?.color, strokeWidth: 2, r: 4, fill: "white" }}
                    />
                    <ReferenceLine 
                      y={validationData.reduce((sum, item) => sum + item.actual, 0) / validationData.length} 
                      stroke="#666" 
                      strokeDasharray="3 3"
                      label={{ value: 'Average', position: 'right', fill: '#666' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md dark:border-gray-700 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                Performance Metrics
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-4">
                    <p className="text-sm text-muted-foreground">
                      These metrics help evaluate forecasting accuracy. Lower values indicate better performance.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                For {metrics.find(m => m.id === selectedMetric)?.name}
                {getPerformanceBadge(errorMetrics.mape)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                <div className="bg-muted p-3 rounded-md dark:bg-gray-700/50">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">MAPE</div>
                    <div className={`font-mono ${parseFloat(errorMetrics.mape) < 10 ? 'text-green-500' : parseFloat(errorMetrics.mape) < 20 ? 'text-blue-500' : parseFloat(errorMetrics.mape) < 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {errorMetrics.mape}%
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(parseFloat(errorMetrics.mape) * 2, 100)} 
                    className="h-2"
                    indicatorClassName={`${parseFloat(errorMetrics.mape) < 10 ? 'bg-green-500' : parseFloat(errorMetrics.mape) < 20 ? 'bg-blue-500' : parseFloat(errorMetrics.mape) < 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <span>Mean Absolute Percentage Error</span>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs max-w-[180px]">
                          Average percentage difference between predicted and actual values. Values under 10% indicate excellent accuracy.
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md dark:bg-gray-700/50">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">RMSE</div>
                    <div className="font-mono">{errorMetrics.rmse}</div>
                  </div>
                  <Progress 
                    value={Math.min(parseFloat(errorMetrics.rmse) / 2, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <span>Root Mean Square Error</span>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs max-w-[180px]">
                          Measures error magnitude, giving higher weight to large errors. Lower values indicate better predictions.
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md dark:bg-gray-700/50">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">MAE</div>
                    <div className="font-mono">{errorMetrics.mae}</div>
                  </div>
                  <Progress 
                    value={Math.min(parseFloat(errorMetrics.mae) * 2, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <span>Mean Absolute Error</span>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs max-w-[180px]">
                          Average absolute difference between predictions and actuals. Easier to interpret than RMSE, in the same units as the data.
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md mt-2 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="text-xs text-muted-foreground">
                      Accuracy interpretation: {
                        parseFloat(errorMetrics.mape) < 10 
                          ? "Excellent prediction accuracy" 
                          : parseFloat(errorMetrics.mape) < 20
                            ? "Good prediction accuracy"
                            : parseFloat(errorMetrics.mape) < 30
                              ? "Fair prediction accuracy, may need improvement"
                              : "Poor prediction accuracy, model needs refinement"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
