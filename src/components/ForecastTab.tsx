
import { useState } from "react";
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

// Sample data - in a real app, this would come from an API
const generateForecastData = (days = 60) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days / 2); // Half actual, half forecast

  const forecastStartDate = new Date();
  forecastStartDate.setDate(forecastStartDate.getDate() + 1);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const isActual = currentDate < forecastStartDate;
    
    const baseValue = 120 + Math.sin(i / 5) * 30;
    const value = Math.round(baseValue + Math.random() * 20);
    
    // For forecasted values, add some uncertainty
    const upperBound = isActual ? null : Math.round(value * (1 + 0.1 + Math.random() * 0.1));
    const lowerBound = isActual ? null : Math.round(value * (1 - 0.1 - Math.random() * 0.1));
    
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
  
  const [selectedMetric, setSelectedMetric] = useState(metrics[0].id);
  const [showConfidenceBounds, setShowConfidenceBounds] = useState(true);
  
  const forecastData = generateForecastData(60);
  
  const selectedMetricInfo = metrics.find(m => m.id === selectedMetric);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 mb-6">
          <h3 className="text-xl font-semibold">Forecast</h3>
          
          <div className="flex items-center gap-4">
            <div className="w-[200px]">
              <Select
                value={selectedMetric}
                onValueChange={setSelectedMetric}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #f1f1f1',
                  borderRadius: '4px',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => `Date: ${value}`}
              />
              <Legend />
              
              {/* Reference area to highlight forecasted period */}
              <ReferenceArea
                x1={forecastData.find(d => !d.isActual)?.dateFormatted}
                x2={forecastData[forecastData.length - 1].dateFormatted}
                fillOpacity={0.1}
                label={{ position: 'insideTop', value: 'Forecast Period', fill: '#666', fontSize: 12 }}
              />
              
              {/* Confidence bounds */}
              {showConfidenceBounds && (
                <Area
                  dataKey="upperBound"
                  stroke="none"
                  fill={selectedMetricInfo?.color || "#4284f5"}
                  fillOpacity={0.2}
                  isAnimationActive={false}
                  legendType="none"
                />
              )}
              
              {showConfidenceBounds && (
                <Area
                  dataKey="lowerBound"
                  stroke="none"
                  fill={selectedMetricInfo?.color || "#4284f5"}
                  fillOpacity={0.2}
                  isAnimationActive={false}
                  legendType="none"
                />
              )}
              
              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="value"
                name={`${selectedMetricInfo?.name || "Value"} (Actual)`}
                stroke={selectedMetricInfo?.color || "#4284f5"}
                strokeWidth={2}
                dot={{ r: 3, fill: selectedMetricInfo?.color || "#4284f5" }}
                activeDot={{ r: 5 }}
                connectNulls
                isAnimationActive
              />
              
              {/* Forecasted line (dashed) */}
              <Line
                type="monotone"
                dataKey={(data) => data.isActual ? null : data.value}
                name={`${selectedMetricInfo?.name || "Value"} (Forecast)`}
                stroke={selectedMetricInfo?.color || "#4284f5"}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                connectNulls
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
