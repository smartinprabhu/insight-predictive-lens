
import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data - in a real app, this would come from an API
const generateValidationData = (days = 30, aggregationType = "Daily", metricId = "ibUnits") => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Different base values and multipliers for each metric
  const metricConfig: Record<string, { base: number, multiplier: number, randFactor: number }> = {
    ibUnits: { base: 120, multiplier: 30, randFactor: 20 },
    inventory: { base: 250, multiplier: 45, randFactor: 25 },
    customerReturns: { base: 80, multiplier: 15, randFactor: 10 },
    wsfChina: { base: 180, multiplier: 40, randFactor: 30 },
    ibExceptions: { base: 60, multiplier: 10, randFactor: 5 },
  };

  const config = metricConfig[metricId] || metricConfig.ibUnits;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const baseValue = config.base + Math.sin(i / 5) * config.multiplier;
    const actualValue = Math.round(baseValue + Math.random() * config.randFactor);
    const predictedValue = Math.round(actualValue + (Math.random() * 20 - 10));
    
    // Add confidence bounds with more clear separation
    const confidenceFactor = 0.15 + Math.random() * 0.1; // 15-25% variance
    const confidenceLower = Math.round(predictedValue * (1 - confidenceFactor));
    const confidenceUpper = Math.round(predictedValue * (1 + confidenceFactor));
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      dateFormatted: 
        aggregationType === "Daily" 
          ? `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`
          : `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`,
      actual: actualValue,
      predicted: predictedValue,
      lowerBound: confidenceLower,
      upperBound: confidenceUpper,
    });
  }

  // Aggregate data if not daily
  if (aggregationType !== "Daily") {
    return aggregateValidationData(data, aggregationType);
  }

  return data;
};

// Aggregate validation data
const aggregateValidationData = (data: any[], aggregationType: string) => {
  const groupedData: Record<string, { 
    count: number;
    actual: number;
    predicted: number;
    lowerBoundSum: number;
    upperBoundSum: number;
    firstDate: Date;
  }> = {};
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;
    
    if (aggregationType === "Weekly") {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else if (aggregationType === "Monthly") {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    } else {
      key = item.date; // Default to daily
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
        actual: 0,
        predicted: 0,
        lowerBoundSum: 0,
        upperBoundSum: 0,
        firstDate: date,
      };
    }
    
    groupedData[key].count += 1;
    groupedData[key].actual += item.actual;
    groupedData[key].predicted += item.predicted;
    groupedData[key].lowerBoundSum += item.lowerBound;
    groupedData[key].upperBoundSum += item.upperBound;
  });
  
  const aggregatedData = [];
  
  Object.entries(groupedData).forEach(([key, value]) => {
    const { count, firstDate } = value;
    
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
      actual: Math.round(value.actual / count),
      predicted: Math.round(value.predicted / count),
      lowerBound: Math.round(value.lowerBoundSum / count),
      upperBound: Math.round(value.upperBoundSum / count),
    });
  });
  
  return aggregatedData.sort((a, b) => a.date.localeCompare(b.date));
};

// Generate metrics for each category
const generateMetricsForCategories = () => {
  const categories = [
    { id: "ibUnits", name: "IB Units", color: "#4284f5" },
    { id: "inventory", name: "Inventory", color: "#36b37e" },
    { id: "customerReturns", name: "Customer Returns", color: "#ff9e2c" },
    { id: "wsfChina", name: "WSF China", color: "#9061F9" },
    { id: "ibExceptions", name: "IB Exceptions", color: "#f56565" },
  ];
  
  const result: Record<string, { mae: string, rmse: string, mape: string, r2: string }> = {};
  
  categories.forEach(category => {
    result[category.id] = {
      mae: (Math.random() * 15 + 5).toFixed(1),
      rmse: (Math.random() * 20 + 10).toFixed(1),
      mape: (Math.random() * 10 + 3).toFixed(1),
      r2: (Math.random() * 0.2 + 0.8).toFixed(2),
    };
  });
  
  return { categories, metrics: result };
};

const { categories, metrics } = generateMetricsForCategories();

export const ModelValidationTab = ({ aggregationType = "Daily" }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const { toast } = useToast();
  
  // Generate data specifically for the selected category
  const validationData = generateValidationData(30, aggregationType, selectedCategory);
  
  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);
  const selectedMetrics = metrics[selectedCategory];
  
  const exportToCSV = () => {
    // Create CSV content
    const csvContent = [
      // Header row
      ["Date", "Actual", "Predicted", "Lower Bound", "Upper Bound"].join(","),
      // Data rows
      ...validationData.map(item => 
        [item.date, item.actual, item.predicted, item.lowerBound, item.upperBound].join(",")
      )
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedCategoryInfo?.name}-validation-data-${aggregationType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `${selectedCategoryInfo?.name} validation data has been exported.`,
    });
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 mb-6">
          <div>
            <h3 className="text-xl font-semibold">Model Validation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Actual vs Predicted values with confidence bounds
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-[200px]">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="icon" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={validationData}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedCategoryInfo?.color || "#4284f5"} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={selectedCategoryInfo?.color || "#4284f5"} stopOpacity={0.05} />
                </linearGradient>
              </defs>
            
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border p-2 rounded shadow-md">
                        <p className="font-medium">{label}</p>
                        <div className="mt-2">
                          {payload
                            .filter((entry) => entry.dataKey !== "lowerBound" && entry.dataKey !== "upperBound")
                            .map((entry, index) => (
                              <p key={`tooltip-${index}`} className="flex justify-between">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-mono ml-2">{entry.value}</span>
                              </p>
                            ))}
                          <p className="text-xs text-muted-foreground mt-1">
                            <span>Confidence bounds: </span>
                            <span className="font-mono">
                              {payload.find((p) => p.dataKey === "lowerBound")?.value} - {payload.find((p) => p.dataKey === "upperBound")?.value}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {/* Confidence Bounds as shaded area */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#confidenceGradient)"
                fillOpacity={1}
                name="Confidence Interval"
                legendType="none"
              />
              
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill={selectedCategoryInfo?.color || "#4284f5"}
                fillOpacity={0}
                name="Lower Bound"
                legendType="none"
              />
              
              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Values"
                stroke={selectedCategoryInfo?.color || "#4284f5"}
                strokeWidth={2}
                dot={{ r: 3, fill: selectedCategoryInfo?.color || "#4284f5" }}
                activeDot={{ r: 5 }}
              />
              
              {/* Predicted line */}
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted Values"
                stroke={selectedCategoryInfo?.color || "#4284f5"}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">MAE</p>
            <p className="text-xl font-semibold">{selectedMetrics.mae} units</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">RMSE</p>
            <p className="text-xl font-semibold">{selectedMetrics.rmse} units</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">MAPE</p>
            <p className="text-xl font-semibold">{selectedMetrics.mape}%</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">R²</p>
            <p className="text-xl font-semibold">{selectedMetrics.r2}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
