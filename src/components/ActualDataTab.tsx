import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface DataItem {
  Week: string;
  'Total IB Units': number;
  exceptions: number;
  inventory: number;
  returns: number;
  wfs_china: number;
}

interface ActualDataTabProps {
  data?: {
    dz_df?: any[];
  };
  aggregationType?: string;
  setAggregationType?: (type: string) => void;
  plotAggregationType?: string;
  setPlotAggregationType?: (type: string) => void;
}

const transformData = (data: any[], aggregationType: string): DataItem[] => {
  if (aggregationType === 'Monthly') {
    const monthlyData: { [key: string]: DataItem } = {};
    data.forEach(item => {
      const date = new Date(item['Week']);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = {
          Week: key,
          'Total IB Units': 0,
          exceptions: 0,
          inventory: 0,
          returns: 0,
          wfs_china: 0,
        };
      }
      
      monthlyData[key]['Total IB Units'] += item['Total IB Units'] || 0;
      monthlyData[key].exceptions += item.exceptions || 0;
      monthlyData[key].inventory += item.inventory || 0;
      monthlyData[key].returns += item.returns || 0;
      monthlyData[key].wfs_china += item.wfs_china || 0;
    });
    
    return Object.values(monthlyData);
  } else {
    return data.map(item => ({
      Week: item['Week'],
      'Total IB Units': item['Total IB Units'] || 0,
      exceptions: item.exceptions || 0,
      inventory: item.inventory || 0,
      returns: item.returns || 0,
      wfs_china: item.wfs_china || 0,
    }));
  }
};

const metricLabels: { [key: string]: string } = {
  'Total IB Units': 'IB Units',
  exceptions: 'IB Exceptions',
  inventory: 'Inventory',
  returns: 'Customer Returns',
  wfs_china: 'WSF China',
};

const formatNumber = (value: number) => {
  if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value/1000).toFixed(1)}K`;
  return value.toLocaleString();
};

function getISOWeekNumber(date: Date): number {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export const ActualDataTab = ({ 
  data, 
  aggregationType, 
  plotAggregationType, 
  setPlotAggregationType 
}: ActualDataTabProps) => {
  const { toast } = useToast();

  const [selectedMetrics, setSelectedMetrics] = useState({
    'Total IB Units': true,
    exceptions: true,
    inventory: true,
    returns: true,
    wfs_china: true,
  });

  const transformedData = data?.dz_df ? transformData(data.dz_df, plotAggregationType || 'Weekly') : [];

  const tickInterval = (() => {
    const len = transformedData.length;
    if (len <= 20) return 0;
    if (len <= 50) return 2;
    if (len <= 100) return 5;
    return Math.floor(len / 20);
  })();

  if (!transformedData.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[400px] flex items-center justify-center">
            <span className="text-gray-500">No data available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleMetricToggle = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Week', 'Total IB Units', 'Exceptions', 'Inventory', 'Returns', 'WFS China'].join(','),
      ...transformedData.map(item => [
        item.Week,
        item['Total IB Units'],
        item.exceptions,
        item.inventory,
        item.returns,
        item.wfs_china
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'actual_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Data Exported",
      description: "Historical Data has been downloaded as CSV",
    });
  };

  return (
    <Card className="text-gray-900 dark:text-gray-100">
      <CardContent className="pt-2 mt-[-14px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Historical Data Analysis</h2>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Aggregation by:</span>
            <Button 
              variant={plotAggregationType === 'Weekly' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setPlotAggregationType && setPlotAggregationType('Weekly')}
            >
              Weekly
            </Button>
            <Button 
              variant={plotAggregationType === 'Monthly' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setPlotAggregationType && setPlotAggregationType('Monthly')}
            >
              Monthly
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="ml-2">
              <Download className="mr-0.3 h-2 w-2"/>
            </Button>
          </div>
        </div>
        <div className="flex gap-4 mb-4 flex-wrap">
          {Object.keys(selectedMetrics).map(metric => (
            <div key={metric} className="flex items-center space-x-2">
              <Checkbox
                id={metric}
                checked={selectedMetrics[metric as keyof typeof selectedMetrics]}
                onCheckedChange={() => handleMetricToggle(metric as keyof typeof selectedMetrics)}
                style={{ accentColor:
                  metric === 'Total IB Units' ? '#8884d8' :
                  metric === 'exceptions' ? '#82ca9d' :
                  metric === 'inventory' ? '#ffc658' :
                  metric === 'returns' ? '#ff7300' :
                  metric === 'wfs_china' ? '#a05195' : undefined
                 }}
              />
              <label htmlFor={metric} className="text-sm font-medium" style={{ color:
                  metric === 'Total IB Units' ? '#8884d8' :
                  metric === 'exceptions' ? '#82ca9d' :
                  metric === 'inventory' ? '#ffc658' :
                  metric === 'returns' ? '#ff7300' :
                  metric === 'wfs_china' ? '#a05195' : undefined
                 }}>
                {metricLabels[metric] || metric}
              </label>
            </div>
          ))}
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="Week" 
                stroke="currentColor"
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  if (isNaN(date.getTime())) return tick;
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = date.toLocaleString('default', { month: 'short' });
                  const year = date.getFullYear();
                  return `${day} ${month}\n${year}`;
                }}
                tick={({ x, y, payload }) => {
                  const date = new Date(payload.value);
                  if (isNaN(date.getTime())) return null;
                  
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = date.toLocaleString('default', { month: 'short' });
                  const year = date.getFullYear();
                  const yy = year.toString();

                  return (
                    <text
                      x={x}
                      y={y + 15}
                      textAnchor="middle"
                      fontSize={10}
                      style={{ whiteSpace: 'pre', fill: 'currentColor' }}
                    >
                      {` ${month}\n${yy}`}
                    </text>
                  );
                }}
                interval={tickInterval}
                height={100}
              />
              <YAxis 
                tickFormatter={formatNumber}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={formatNumber}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;

                  const date = new Date(label);
                  if (isNaN(date.getTime())) return null;

                  const day = date.getDate().toString().padStart(2, '0');
                  const month = date.toLocaleString('default', { month: 'short' });
                  const year = date.getFullYear();
                  const week = getISOWeekNumber(date);
                  const dateStr = `${day} ${month} ${year} (W${week})`;

                  return (
                    <div className="p-2 rounded-lg border text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <div className="font-medium mb-1">{dateStr}</div>
                      {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: entry.stroke,
                              borderRadius: 2,
                            }}
                          ></div>
                          <span>{metricLabels[entry.name] || entry.name}</span>
                          <span className="font-bold">{formatNumber(entry.value)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ marginBottom: 20 }}
                formatter={(value) => metricLabels[value] || value}
              />
              
              {selectedMetrics['Total IB Units'] && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="Total IB Units"
                  stroke="#8884d8"
                  fill="#8884d8"
                  strokeWidth={2}
                />
              )}
              
              {selectedMetrics.exceptions && (
                <Area
                  type="monotone"
                  dataKey="exceptions"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  strokeWidth={2}
                />
              )}
              
              {selectedMetrics.inventory && (
                <Area
                  type="monotone"
                  dataKey="inventory"
                  stroke="#ffc658"
                  fill="#ffc658"
                  strokeWidth={2}
                />
              )}
              
              {selectedMetrics.returns && (
                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#ff7300"
                  fill="#ff7300"
                  strokeWidth={2}
                />
              )}
              
              {selectedMetrics.wfs_china && (
                <Area
                  type="monotone"
                  dataKey="wfs_china"
                  stroke="#a05195"
                  fill="#a05195"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
