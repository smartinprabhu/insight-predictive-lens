
import React, { useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ComposedChart
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
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";

// Sample data - in a real app, this would come from an API
const generateValidationData = (days = 30) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const baseValue = 140 + Math.sin(i / 5) * 40;
    const actualValue = Math.round(baseValue + Math.random() * 15);
    const predictedValue = Math.round(actualValue + (Math.random() * 20 - 10));
    
    // Add confidence bounds with more clear separation
    const confidenceFactor = 0.15 + Math.random() * 0.1; // 15-25% variance
    const confidenceLower = Math.round(predictedValue * (1 - confidenceFactor));
    const confidenceUpper = Math.round(predictedValue * (1 + confidenceFactor));
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      dateFormatted: `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`,
      actual: actualValue,
      predicted: predictedValue,
      lowerBound: confidenceLower,
      upperBound: confidenceUpper,
    });
  }

  return data;
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
  
  const result = {};
  
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

export const ModelValidationTab = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const validationData = generateValidationData(30);
  const { toast } = useToast();
  
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
    link.setAttribute('download', `${selectedCategoryInfo?.name}-validation-data.csv`);
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
            <p className="text-sm text-gray-500 mt-1">
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
          <ComposedChart
            data={validationData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
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
                          Confidence: {payload.find((p) => p.dataKey === "lowerBound")?.value} - {payload.find((p) => p.dataKey === "upperBound")?.value}
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
              stroke="transparent"
              fill={selectedCategoryInfo?.color || "#4284f5"}
              fillOpacity={0.2}
              name="Confidence Interval"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="transparent"
              fill={selectedCategoryInfo?.color || "#4284f5"}
              fillOpacity={0}
              name="Confidence Interval"
              style={{ visibility: "hidden" }}
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
