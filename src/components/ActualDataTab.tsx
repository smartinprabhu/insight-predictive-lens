
import { useState, useEffect } from "react";
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
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generateWeeklyMonthlyData, aggregateToMonthly, fetchForecastData, mapForecastData } from "@/services/forecastService";

export const ActualDataTab = ({ aggregationType = "Weekly", forecastPeriod = 12 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [apiData, setApiData] = useState<any[] | null>(null);
  const [currentForecastPeriod, setCurrentForecastPeriod] = useState(forecastPeriod);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Generate sample data for initial view - in a real app, this would come from the API
  const sampleData = generateWeeklyMonthlyData(15);
  
  // Process data based on aggregation type
  const actualData = aggregationType === "Monthly" 
    ? aggregateToMonthly(apiData || sampleData)
    : (apiData || sampleData);
  
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      toast({
        title: "Processing file",
        description: "Uploading and analyzing your data...",
      });
      
      const forecastData = await fetchForecastData(file, currentForecastPeriod);
      if (forecastData.length > 0) {
        const mappedData = mapForecastData(forecastData);
        setApiData(mappedData);
        
        toast({
          title: "Upload successful",
          description: "Your data has been processed successfully",
        });
        setOpenDialog(false);
      } else {
        toast({
          title: "Processing error",
          description: "Could not process the file. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload error",
        description: "An error occurred while uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateForecastPeriod = async () => {
    if (file) {
      try {
        setIsUploading(true);
        const forecastData = await fetchForecastData(file, currentForecastPeriod);
        if (forecastData.length > 0) {
          const mappedData = mapForecastData(forecastData);
          setApiData(mappedData);
          
          toast({
            title: "Forecast updated",
            description: `Forecast period updated to ${currentForecastPeriod} weeks`,
          });
        }
      } catch (error) {
        console.error("Error updating forecast period:", error);
      } finally {
        setIsUploading(false);
      }
    }
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

  // Effect to update data when forecast period changes
  useEffect(() => {
    if (file) {
      updateForecastPeriod();
    }
  }, [currentForecastPeriod]);

  return (
    <Card className="rounded-xl shadow-lg border dark:border-gray-700 dark:bg-gray-800/90">
      <CardContent className="pt-6">
        <div className="flex flex-row justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Historical Data</h3>
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={currentForecastPeriod}
                onChange={(e) => setCurrentForecastPeriod(parseInt(e.target.value) || 1)}
                className="w-20 h-9"
                min={1}
                max={52}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">weeks</span>
            </div>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Upload className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Excel File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Upload an Excel file to generate actual and forecast data
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading || !file}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isUploading ? "Processing..." : "Upload & Process"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="icon" onClick={exportToCSV} className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" />
            </Button>
          </div>
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
                  borderRadius: '8px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => `Period: ${value}`}
                formatter={(value, name) => {
                  let displayName = name;
                  if (name === "IB Units") displayName = "Total IB Units";
                  if (name === "Inventory") displayName = "Inventory";
                  if (name === "Customer Returns") displayName = "Customer Returns";
                  if (name === "WSF China") displayName = "WSF China";
                  if (name === "IB Exceptions") displayName = "IB Exceptions";
                  return [value, displayName];
                }}
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
                  activeDot={{ r: 6, strokeWidth: 2 }}
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
                  activeDot={{ r: 6, strokeWidth: 2 }}
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
                  activeDot={{ r: 6, strokeWidth: 2 }}
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
                  activeDot={{ r: 6, strokeWidth: 2 }}
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
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
