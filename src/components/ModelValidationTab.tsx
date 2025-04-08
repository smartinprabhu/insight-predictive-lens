
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
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle, Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ModelValidationTabProps {
  aggregationType: string;
}

// Generate sample validation data
const generateValidationData = (metricId = "ibUnits", days = 30) => {
  const data = [];
  const date = new Date();
  date.setDate(date.getDate() - days);

  // Different base values and error patterns for each metric
  const metricConfig = {
    ibUnits: { base: 120, errorFactor: 10, trend: 0.2 },
    inventory: { base: 250, errorFactor: 15, trend: -0.1 },
    customerReturns: { base: 80, errorFactor: 5, trend: 0.1 },
    wsfChina: { base: 180, errorFactor: 12, trend: 0.3 },
    ibExceptions: { base: 60, errorFactor: 8, trend: -0.2 },
  };

  const config = metricConfig[metricId as keyof typeof metricConfig] || metricConfig.ibUnits;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(date);
    currentDate.setDate(date.getDate() + i);

    // Generate realistic looking actual vs predicted values
    const dayFactor = i / days * config.trend;
    const baseTrend = config.base + (config.base * dayFactor);
    const actualValue = Math.round(baseTrend + (Math.random() * config.errorFactor * 2));
    
    // Predicted is close to actual but with some error
    const errorPercent = Math.random() * 0.2 - 0.1; // -10% to +10% error
    const predictedValue = Math.round(actualValue * (1 + errorPercent));

    data.push({
      date: currentDate.toISOString().split('T')[0],
      dateFormatted: `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`,
      actual: actualValue,
      predicted: predictedValue,
      error: actualValue - predictedValue,
      errorPercent: Math.round((actualValue - predictedValue) / actualValue * 100)
    });
  }

  return data;
};

// Aggregate validation data by week or month
const aggregateValidationData = (data, aggregationType) => {
  if (aggregationType === "Daily") {
    return data;
  }

  const aggregatedData = [];
  const groupedData = {};

  data.forEach(item => {
    const date = new Date(item.date);
    let key;

    if (aggregationType === "Weekly") {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else if (aggregationType === "Monthly") {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
        actualSum: 0,
        predictedSum: 0,
        errorSum: 0,
        errorPercentSum: 0,
        firstDate: date
      };
    }

    const group = groupedData[key];
    group.count += 1;
    group.actualSum += item.actual;
    group.predictedSum += item.predicted;
    group.errorSum += item.error;
    group.errorPercentSum += item.errorPercent;
  });

  Object.entries(groupedData).forEach(([key, value]) => {
    const entry = value as any; // Type assertion for TypeScript
    const { count, actualSum, predictedSum, errorSum, errorPercentSum, firstDate } = entry;

    let dateFormatted;
    if (aggregationType === "Weekly") {
      dateFormatted = `Week ${key.split('-W')[1]}, ${key.split('-')[0]}`;
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = parseInt(key.split('-')[1]) - 1;
      dateFormatted = `${monthNames[month]} ${key.split('-')[0]}`;
    }

    aggregatedData.push({
      date: key,
      dateFormatted,
      actual: Math.round(actualSum / count),
      predicted: Math.round(predictedSum / count),
      error: Math.round(errorSum / count),
      errorPercent: Math.round(errorPercentSum / count)
    });
  });

  return aggregatedData.sort((a, b) => a.date.localeCompare(b.date));
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

export const ModelValidationTab = ({ aggregationType = "Daily" }: ModelValidationTabProps) => {
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
    const rawData = generateValidationData(selectedMetric, 30);
    return aggregateValidationData(rawData, aggregationType);
  }, [selectedMetric, aggregationType]);

  // Calculate error metrics
  const errorMetrics = calculateErrorMetrics(validationData);

  const handleMetricChange = (value) => {
    setSelectedMetric(value);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Date", "Actual", "Predicted", "Error", "Error Percent"];
    const csvContent = [
      headers.join(","),
      ...validationData.map(row => 
        [row.date, row.actual, row.predicted, row.error, row.errorPercent].join(",")
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

  const selectedMetricInfo = metrics.find(m => m.id === selectedMetric);

  return (
    <TooltipProvider>
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">Model Validation</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                  <p className="font-medium mb-1">About model validation</p>
                  <p className="text-sm text-muted-foreground">
                    This page shows how accurately our forecasting model predicts actual values. 
                    Lower error metrics indicate better model performance. The chart compares 
                    actual historical values with what our model would have predicted for those dates.
                  </p>
                </TooltipContent>
              </UITooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              Model performance and error analysis ({aggregationType})
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
          <Card className="lg:col-span-3 shadow-md">
            <CardContent className="p-6">
              <div className="h-[400px] bg-gradient-to-b from-card/40 to-background/10 p-4 rounded-lg border border-border/10">
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
                          const error = Math.abs(actual - predicted);
                          const errorPercent = Math.round((error / actual) * 100);

                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
                              <div className="font-medium pb-2 border-b border-border/50 mb-2">{label}</div>
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
                                <div className="flex justify-between items-center pt-1 border-t border-border/30 text-muted-foreground">
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

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                Error Metrics
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
              <CardDescription>
                For {metrics.find(m => m.id === selectedMetric)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">MAPE</TableCell>
                    <TableCell className="text-right">{errorMetrics.mape}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">RMSE</TableCell>
                    <TableCell className="text-right">{errorMetrics.rmse}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MAE</TableCell>
                    <TableCell className="text-right">{errorMetrics.mae}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Collapsible className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-center">
                    {showMetricsInfo ? "Hide" : "Show"} metrics explanations
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  <div className="text-xs p-2 bg-muted rounded-md">
                    <p className="font-medium mb-1">MAPE (Mean Absolute Percentage Error)</p>
                    <p className="text-muted-foreground">Measures prediction accuracy as percentage. Lower is better.</p>
                  </div>
                  
                  <div className="text-xs p-2 bg-muted rounded-md">
                    <p className="font-medium mb-1">RMSE (Root Mean Square Error)</p>
                    <p className="text-muted-foreground">Measures prediction error magnitude, penalizing large errors.</p>
                  </div>
                  
                  <div className="text-xs p-2 bg-muted rounded-md">
                    <p className="font-medium mb-1">MAE (Mean Absolute Error)</p>
                    <p className="text-muted-foreground">Average absolute difference between predicted and actual values.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
