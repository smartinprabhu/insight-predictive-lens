
import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  ReferenceArea,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

// Sample data generation function with unique data for each metric
const generateForecastData = (days = 60, metricId = "ibUnits") => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days / 2); // Half actual, half forecast

  // Use fixed date April 6, 2025 for forecast cutoff
  const forecastStartDate = new Date('2025-04-06');

  // Different base values and multipliers for each metric
  const metricConfig = {
    ibUnits: { base: 120, multiplier: 30, randFactor: 20, growthTrend: 0.5 },
    inventory: { base: 250, multiplier: 45, randFactor: 25, growthTrend: -0.2 },
    customerReturns: { base: 80, multiplier: 15, randFactor: 10, growthTrend: 0.1 },
    wsfChina: { base: 180, multiplier: 40, randFactor: 30, growthTrend: 0.8 },
    ibExceptions: { base: 60, multiplier: 10, randFactor: 5, growthTrend: -0.3 },
  };

  const config = metricConfig[metricId as keyof typeof metricConfig] || metricConfig.ibUnits;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const isActual = currentDate < forecastStartDate;
    
    // Generate unique patterns based on metric ID
    const factor = Math.sin(i / 5) + (i / days) * config.growthTrend;
    const baseValue = config.base + (factor * config.multiplier);
    const value = Math.round(baseValue + Math.random() * config.randFactor);
    
    // Only add upperBound and lowerBound for forecasted dates
    const varianceFactor = isActual ? 0 : (0.1 + Math.random() * 0.1);
    const upperBound = !isActual ? Math.round(value * (1 + varianceFactor)) : null;
    const lowerBound = !isActual ? Math.round(value * (1 - varianceFactor)) : null;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      dateFormatted: `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`,
      value,
      upperBound,
      lowerBound,
      isActual,
    });
  }

  return data;
};

export const ForecastTab = () => {
  const metrics = [
    { id: "ibUnits", name: "IB Units", color: "#4284f5" },
    { id: "inventory", name: "Inventory", color: "#36b37e" },
    { id: "customerReturns", name: "Customer Returns", color: "#ff9e2c" },
    { id: "wsfChina", name: "WSF China", color: "#9061F9" },
    { id: "ibExceptions", name: "IB Exceptions", color: "#f56565" },
  ];
  
  const [selectedMetrics, setSelectedMetrics] = useState([metrics[0].id]);
  const [showConfidenceBounds, setShowConfidenceBounds] = useState(true);
  
  // Generate unique data for each selected metric
  const getMetricData = () => {
    // Create a data structure for all dates - to ensure alignment between metrics
    const allDates = generateForecastData(60, metrics[0].id).map(item => ({
      date: item.date,
      dateFormatted: item.dateFormatted,
      isActual: item.isActual,
    }));
    
    // For each date, add values for each selected metric
    const chartData = allDates.map(dateItem => {
      const result = { ...dateItem };
      
      // Add data for each selected metric
      selectedMetrics.forEach(metricId => {
        const metricData = generateForecastData(60, metricId);
        const matchingDateData = metricData.find(d => d.date === dateItem.date);
        
        if (matchingDateData) {
          result[`${metricId}Value`] = matchingDateData.value;
          result[`${metricId}Upper`] = matchingDateData.upperBound;
          result[`${metricId}Lower`] = matchingDateData.lowerBound;
        }
      });
      
      return result;
    });
    
    return chartData;
  };
  
  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(current => 
      current.includes(metricId)
        ? current.length > 1 ? current.filter(id => id !== metricId) : current // Prevent deselecting all
        : [...current, metricId]
    );
  };

  const forecastData = getMetricData();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 mb-6">
          <h3 className="text-xl font-semibold">Forecast</h3>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between">
                  {selectedMetrics.length === 1 
                    ? metrics.find(m => m.id === selectedMetrics[0])?.name 
                    : `${selectedMetrics.length} metrics selected`}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px]">
                <DropdownMenuLabel>Select Metrics</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {metrics.map((metric) => (
                  <DropdownMenuCheckboxItem
                    key={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  >
                    {metric.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="confidenceBounds" 
                checked={showConfidenceBounds} 
                onCheckedChange={() => setShowConfidenceBounds(!showConfidenceBounds)} 
              />
              <label htmlFor="confidenceBounds" className="text-sm font-medium">
                Show confidence bounds
              </label>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={forecastData}
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
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                        <p className="font-medium">{label}</p>
                        <div className="mt-2">
                          {payload.map((entry, index) => {
                            const metricId = entry.dataKey.toString().replace('Value', '');
                            const metricInfo = metrics.find(m => m.id === metricId);
                            const isActualData = forecastData.find(d => d.dateFormatted === label)?.isActual;

                            return (
                              <p key={`tooltip-${index}`} style={{ color: entry.stroke }}>
                                {metricInfo?.name}: {entry.value} 
                                {!isActualData && ' (Forecast)'}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {/* Reference area to highlight forecasted period */}
              <ReferenceArea
                x1={forecastData.find(d => !d.isActual)?.dateFormatted}
                x2={forecastData[forecastData.length - 1].dateFormatted}
                fillOpacity={0.1}
                label={{ position: 'insideTop', value: 'Forecast Period', fill: '#666', fontSize: 12 }}
              />
              
              {/* Render each selected metric with unique data */}
              {selectedMetrics.map((metricId) => {
                const metricInfo = metrics.find(m => m.id === metricId);
                
                return (
                  <React.Fragment key={metricId}>
                    {/* Confidence bounds for forecast only */}
                    {showConfidenceBounds && (
                      <Area
                        dataKey={(data) => data.isActual ? null : data[`${metricId}Upper`]}
                        stroke="none"
                        fill={metricInfo?.color || "#4284f5"}
                        fillOpacity={0.2}
                        isAnimationActive={false}
                        legendType="none"
                      />
                    )}
                    
                    {showConfidenceBounds && (
                      <Area
                        dataKey={(data) => data.isActual ? null : data[`${metricId}Lower`]}
                        stroke="none"
                        fill={metricInfo?.color || "#4284f5"}
                        fillOpacity={0.2}
                        isAnimationActive={false}
                        legendType="none"
                      />
                    )}
                    
                    {/* Actual line - only show for dates before forecast period */}
                    <Line
                      type="monotone"
                      dataKey={(data) => data.isActual ? data[`${metricId}Value`] : null}
                      name={`${metricInfo?.name || "Value"} (Actual)`}
                      stroke={metricInfo?.color || "#4284f5"}
                      strokeWidth={2}
                      dot={{ r: 3, fill: metricInfo?.color || "#4284f5" }}
                      activeDot={{ r: 5 }}
                      connectNulls
                      isAnimationActive
                    />
                    
                    {/* Forecasted line (dashed) - only show for forecast period */}
                    <Line
                      type="monotone"
                      dataKey={(data) => !data.isActual ? data[`${metricId}Value`] : null}
                      name={`${metricInfo?.name || "Value"} (Forecast)`}
                      stroke={metricInfo?.color || "#4284f5"}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      dot={{ r: 3 }}
                      connectNulls
                      isAnimationActive
                    />
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
