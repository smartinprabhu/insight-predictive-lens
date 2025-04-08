
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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

// Aggregate data by week or month
const aggregateData = (data, aggregationType) => {
  if (aggregationType === "Daily") {
    return data;
  }
  
  const aggregatedData = [];
  const groupedData = {};
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key;
    
    if (aggregationType === "Weekly") {
      // Get the week number and year
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else if (aggregationType === "Monthly") {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
        ibUnits: 0,
        inventory: 0,
        customerReturns: 0,
        wsfChina: 0,
        ibExceptions: 0,
        firstDate: date,
      };
    }
    
    groupedData[key].count += 1;
    groupedData[key].ibUnits += item.ibUnits;
    groupedData[key].inventory += item.inventory;
    groupedData[key].customerReturns += item.customerReturns;
    groupedData[key].wsfChina += item.wsfChina;
    groupedData[key].ibExceptions += item.ibExceptions;
  });
  
  Object.entries(groupedData).forEach(([key, value]) => {
    const { count, firstDate, ...metrics } = value;
    
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
      ibUnits: Math.round(metrics.ibUnits / count),
      inventory: Math.round(metrics.inventory / count),
      customerReturns: Math.round(metrics.customerReturns / count),
      wsfChina: Math.round(metrics.wsfChina / count),
      ibExceptions: Math.round(metrics.ibExceptions / count),
    });
  });
  
  return aggregatedData.sort((a, b) => a.date.localeCompare(b.date));
};

export const ActualDataTab = ({ aggregationType = "Daily" }) => {
  const rawData = generateDailyData(30);
  const actualData = aggregateData(rawData, aggregationType);
  
  const [selectedMetrics, setSelectedMetrics] = useState({
    ibUnits: true,
    inventory: true,
    customerReturns: true,
    wsfChina: true,
    ibExceptions: true,
  });
  
  const { toast } = useToast();

  const handleMetricToggle = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };
  
  const exportToCSV = () => {
    // Create CSV content
    const headerRow = ["Date"];
    const visibleMetrics = [];
    
    if (selectedMetrics.ibUnits) {
      headerRow.push("IB Units");
      visibleMetrics.push("ibUnits");
    }
    if (selectedMetrics.inventory) {
      headerRow.push("Inventory");
      visibleMetrics.push("inventory");
    }
    if (selectedMetrics.customerReturns) {
      headerRow.push("Customer Returns");
      visibleMetrics.push("customerReturns");
    }
    if (selectedMetrics.wsfChina) {
      headerRow.push("WSF China");
      visibleMetrics.push("wsfChina");
    }
    if (selectedMetrics.ibExceptions) {
      headerRow.push("IB Exceptions");
      visibleMetrics.push("ibExceptions");
    }
    
    const csvHeader = headerRow.join(",");
    
    const csvRows = actualData.map(item => {
      const row = [item.date];
      visibleMetrics.forEach(metric => row.push(item[metric]));
      return row.join(",");
    });
    
    const csvContent = [csvHeader, ...csvRows].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `actual_data_${aggregationType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `Actual data (${aggregationType}) has been exported to CSV`,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-row justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Actual Data</h3>
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
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
