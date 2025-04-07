
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

// Sample data - in a real app, this would come from an API
const generateDailyData = (days = 30) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const baseIbUnits = 120 + Math.random() * 80;
    const baseInventory = 100 + Math.random() * 50;
    const baseCustomerReturns = 30 + Math.random() * 30;
    const baseWsfChina = 40 + Math.random() * 40;
    const baseIbExceptions = 15 + Math.random() * 20;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      dateFormatted: `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`,
      ibUnits: Math.round(baseIbUnits),
      inventory: Math.round(baseInventory),
      customerReturns: Math.round(baseCustomerReturns),
      wsfChina: Math.round(baseWsfChina),
      ibExceptions: Math.round(baseIbExceptions),
    });
  }

  return data;
};

export const ActualDataTab = () => {
  const actualData = generateDailyData(30);
  const [selectedMetrics, setSelectedMetrics] = useState({
    ibUnits: true,
    inventory: true,
    customerReturns: true,
    wsfChina: true,
    ibExceptions: true,
  });

  const handleMetricToggle = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4">Actual Data</h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ibUnits" 
              checked={selectedMetrics.ibUnits} 
              onCheckedChange={() => handleMetricToggle('ibUnits')} 
            />
            <label htmlFor="ibUnits" className="text-sm font-medium text-chart-ibunits cursor-pointer">
              IB Units
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="inventory" 
              checked={selectedMetrics.inventory} 
              onCheckedChange={() => handleMetricToggle('inventory')} 
            />
            <label htmlFor="inventory" className="text-sm font-medium text-chart-inventory cursor-pointer">
              Inventory
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="customerReturns" 
              checked={selectedMetrics.customerReturns} 
              onCheckedChange={() => handleMetricToggle('customerReturns')} 
            />
            <label htmlFor="customerReturns" className="text-sm font-medium text-chart-customerReturns cursor-pointer">
              Customer Returns
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="wsfChina" 
              checked={selectedMetrics.wsfChina} 
              onCheckedChange={() => handleMetricToggle('wsfChina')} 
            />
            <label htmlFor="wsfChina" className="text-sm font-medium text-chart-wsfChina cursor-pointer">
              WSF China
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ibExceptions" 
              checked={selectedMetrics.ibExceptions} 
              onCheckedChange={() => handleMetricToggle('ibExceptions')} 
            />
            <label htmlFor="ibExceptions" className="text-sm font-medium text-chart-ibExceptions cursor-pointer">
              IB Exceptions
            </label>
          </div>
        </div>
        
        <div className="w-full h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={actualData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIbUnits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4284f5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4284f5" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorInventory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36b37e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#36b37e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorCustomerReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9e2c" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff9e2c" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorWsfChina" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9061F9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#9061F9" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorIbExceptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f56565" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f56565" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
              
              {selectedMetrics.ibUnits && (
                <Area
                  type="monotone"
                  dataKey="ibUnits"
                  stroke="#4284f5"
                  fillOpacity={1}
                  fill="url(#colorIbUnits)"
                  name="IB Units"
                />
              )}
              
              {selectedMetrics.inventory && (
                <Area
                  type="monotone"
                  dataKey="inventory"
                  stroke="#36b37e"
                  fillOpacity={1}
                  fill="url(#colorInventory)"
                  name="Inventory"
                />
              )}
              
              {selectedMetrics.customerReturns && (
                <Area
                  type="monotone"
                  dataKey="customerReturns"
                  stroke="#ff9e2c"
                  fillOpacity={1}
                  fill="url(#colorCustomerReturns)"
                  name="Customer Returns"
                />
              )}
              
              {selectedMetrics.wsfChina && (
                <Area
                  type="monotone"
                  dataKey="wsfChina"
                  stroke="#9061F9"
                  fillOpacity={1}
                  fill="url(#colorWsfChina)"
                  name="WSF China"
                />
              )}
              
              {selectedMetrics.ibExceptions && (
                <Area
                  type="monotone"
                  dataKey="ibExceptions"
                  stroke="#f56565"
                  fillOpacity={1}
                  fill="url(#colorIbExceptions)"
                  name="IB Exceptions"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
