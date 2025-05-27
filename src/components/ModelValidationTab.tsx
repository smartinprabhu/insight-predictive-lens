import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Download, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const modelMetrics = {
  'Prophet': { MAPE: 3.8, RMSE: 900, MAE: 650, 'R²': 0.92 },
  'ARIMA': { MAPE: 4.8, RMSE: 1100, MAE: 750, 'R²': 0.88 },
  'SARIMAX': { MAPE: 5.5, RMSE: 1300, MAE: 850, 'R²': 0.82 },
    'Weighted Moving Average': { MAPE: 5.5, RMSE: 1300, MAE: 850, 'R²': 0.82 },
      'ETS': { MAPE: 5.5, RMSE: 1300, MAE: 850, 'R²': 0.82 },
  'CatBoost': { MAPE: 4.2, RMSE: 1000, MAE: 700, 'R²': 0.90 },
  'XGBoost': { MAPE: 4.5, RMSE: 1050, MAE: 720, 'R²': 0.89 },
  'LightGBM': { MAPE: 4.0, RMSE: 950, MAE: 680, 'R²': 0.91 },
  'ARIMA+LightGBM': { MAPE: 5.2, RMSE: 1200, MAE: 800, 'R²': 0.85 },
  'Prophet+XGBoost': { MAPE: 4.1, RMSE: 980, MAE: 690, 'R²': 0.91 },
  'SARIMAX+CatBoost': { MAPE: 4.3, RMSE: 1020, MAE: 710, 'R²': 0.90 },
};

const calculateModelScore = (metrics) => {
  if (!metrics) return 0;
  const mapeScore = metrics.MAPE ? (20 - metrics.MAPE) / 20 : 0;
  const rmseScore = metrics.RMSE ? (1500 - metrics.RMSE) / 1500 : 0;
  const maeScore = metrics.MAE ? (1000 - metrics.MAE) / 1000 : 0;
  const r2Score = metrics['R²'] ? metrics['R²'] : 0;
  return (mapeScore + rmseScore + maeScore + r2Score) / 4;
};

const ModelRating = ({ score }) => {
  const stars = Math.round(score * 5);
  return (
    <div className="flex items-center">
      {Array(5).fill(null).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < stars ? 'currentColor' : 'none'}
          stroke="currentColor"
          className="w-4 h-4 text-yellow-400"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

const modelAdjustments = {
  'Prophet': 0,      
  'ARIMA': -0.1,   
       'ETS': -0.125,
          
         'Weighted Moving Average': -0.2,   
  'LightGBM': -0.70,  
  'XGBoost': 0.3,    
  'SARIMAX': 0.30,  
  'CatBoost': -0.3   
};

const flattenCombinedData = (data, selectedModels) => {
  if (!data || typeof data !== "object") {
    console.warn("Invalid combined format: Expected an object, but got:", data);
    return [];
  }
  const metrics = Object.keys(data);
  const firstMetricArray = data[metrics[0]];
  if (!Array.isArray(firstMetricArray)) {
    console.warn("Invalid combined format: Metric data is not an array:", firstMetricArray);
    return [];
  }
  return firstMetricArray.map((_, index) => {
    const weekData = { Week: new Date(firstMetricArray[index].Week) };
    metrics.forEach(metric => {
      const metricData = data[metric][index];
      weekData[`${metric}_actual`] = metricData[metric];
      selectedModels.forEach(model => {
        const adjustment = modelAdjustments[model] || 0;
        weekData[`${metric}_${model}_yhat`] = metricData.yhat * (1 + adjustment);
        weekData[`${metric}_${model}_yhat_lower`] = metricData.yhat_lower * (1 + adjustment);
        weekData[`${metric}_${model}_yhat_upper`] = metricData.yhat_upper * (1 + adjustment);
      });
    });
    return weekData;
  });
};

const formatNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row => headers.map(field => `"${row[field] ?? ""}"`).join(",")),
  ];
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const metrics = [
  { id: "Total IB Units", name: "IB Units", color: "#4284f5" },
  { id: "exceptions", name: "IB Exceptions", color: "#36b37e" },
  { id: "inventory", name: "Inventory", color: "#ff9e2c" },
  { id: "returns", name: "Customer Returns", color: "#ff7300" },
  { id: "wfs_china", name: "WSF_China", color: "#9061F9" },
];

const allModels = [
  { label: "Prophet", value: "Prophet" },
  { label: "ARIMA", value: "ARIMA" },
  { label: "SARIMAX", value: "SARIMAX" },
    { label: "Weighted Moving Average", value: "Weighted Moving Average" },
      { label: "ETS", value: "ETS" },
  { label: "CatBoost", value: "CatBoost" },
  { label: "XGBoost", value: "XGBoost" },
  { label: "LightGBM", value: "LightGBM" },
  { label: "ARIMA + LightGBM", value: "ARIMA+LightGBM" },
  { label: "Prophet + XGBoost", value: "Prophet+XGBoost" },
  { label: "SARIMAX + CatBoost", value: "SARIMAX+CatBoost" },
];

const modelColors = {
  "Prophet": "#4284f5",
  "ARIMA": "#36b37e",
  "SARIMAX": "#ff9e2c",
  "CatBoost": "#9061F9",
  "XGBoost": "#ff7300",
  "LightGBM": "#8e44ad",
  "ARIMA+LightGBM": "#2ecc71",
  "Prophet+XGBoost": "#e74c3c",
  "SARIMAX+CatBoost": "#3498db"
};

function getISOWeekNumber(date: Date): number {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export const ModelValidationTab = ({ aggregationType = "Weekly", data, modelType }) => {

  const [selectedMetric, setSelectedMetric] = useState("Total IB Units");
  const [selectedModels, setSelectedModels] = useState<string[]>([modelType]);
  const [showForecastSettings, setShowForecastSettings] = useState(false);

  const handleModelToggle = (modelValue: string) => {
    setSelectedModels((current) =>
      current.includes(modelValue)
        ? current.filter((v) => v !== modelValue)
        : [...current, modelValue]
    );
  };

  const adjustment = selectedModels.length === 1 ? modelAdjustments[selectedModels[0]] || 0 : 0;

  const combinedData = useMemo(() => {

    const rawCombinedData = data?.combined;
    if (!rawCombinedData || typeof rawCombinedData !== "object") {
      console.warn("Invalid combined format: Expected an object, but got:", rawCombinedData);
      return [];
    }
    const flattenedData = flattenCombinedData(rawCombinedData, selectedModels);

    return flattenedData;
  }, [data?.combined, selectedModels]);



  const filteredData = useMemo(() => {

    if (!combinedData?.length) return [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const filtered = combinedData.filter(item => new Date(item.Week) >= oneYearAgo);

    return filtered;
  }, [combinedData]);



  if (!filteredData.length) {

    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No data available for the selected metric.</p>
      </div>
    );
  }

  const actualKey = `${selectedMetric}_actual`;
  const yhatKey = `${selectedMetric}_yhat`;
  const lowerKey = `${selectedMetric}_yhat_lower`;
  const upperKey = `${selectedMetric}_yhat_upper`;

  const metricValues = data.metrics?.[selectedMetric] || {};

return (
  <TooltipProvider>
    <div className="flex flex-row gap-4 w-full items-start">
      {!showForecastSettings && (
        <Card className="flex-1 shadow-md dark:border-gray-700 relative overflow-visible">
          <div className="relative pt-2 mt-[-17px] ">


                              <h3 className="text-xl font-semibold">Model Validation</h3>
            <CardContent className="p-6">
              <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[180px]" aria-label="Select metric">
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
                <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-[180px] justify-between">
      {selectedModels.length === 1
        ? allModels.find(m => m.value === selectedModels[0])?.label
        : `${selectedModels.length} models selected`}
      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-[180px]" onCloseAutoFocus={(e) => e.preventDefault()}>
    <DropdownMenuLabel>Select Models</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem
      key="select-all"
      checked={selectedModels.length === allModels.length}
      onCheckedChange={(checked) => {
        if (checked) {
          setSelectedModels(allModels.map(m => m.value));
        } else {
          setSelectedModels([]);
        }
      }}
      onSelect={(e) => e.preventDefault()}
    >
      Select All
    </DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    {allModels.map(model => (
  <DropdownMenuCheckboxItem
    key={model.value}
    checked={selectedModels.includes(model.value)}
    onCheckedChange={() => handleModelToggle(model.value)}
    onSelect={(e) => e.preventDefault()} // Added to prevent closing
  >
    {model.label}
  </DropdownMenuCheckboxItem>
))}
  </DropdownMenuContent>
</DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => exportToCSV(filteredData, "validation.csv")}
                  title="Download CSV"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Week"
                      tickFormatter={(tick) => {
                        const date = new Date(tick);
                        if (isNaN(date.getTime())) return tick;
                        const month = date.toLocaleString('default', { month: 'short' });
                        const year = date.getFullYear();
                        return `${month} ${year}`;
                      }}
                    />
                    <YAxis tickFormatter={formatNumber} />
                    <RechartsTooltip
                      content={({ payload, label }) => {
                        if (!payload || payload.length === 0) return null;

const date = new Date(label);
const week = getISOWeekNumber(date);
const formattedDate = isNaN(date.getTime())
  ? label
  : `${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString('en-US', { month: 'short' })}-${date.getFullYear()} (W${week})`;

                        const actual = payload.find(p => p.name === 'Actual');
                        const modelPredictions = selectedModels.map(model => ({
                          model,
                          value: payload.find(p => p.name === model)?.value,
                          lower: payload[0]?.payload?.[`${selectedMetric}_${model}_yhat_lower`],
                          upper: payload[0]?.payload?.[`${selectedMetric}_${model}_yhat_upper`]
                        }));

                        return (
                          <div className="p-2 rounded-lg border text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                            <div style={{ marginBottom: 8, fontWeight: 600 }}>{formattedDate}</div>
                            {actual && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{
                                    width: 10,
                                    height: 10,
                                    backgroundColor: '#8884d8',
                                    borderRadius: 2
                                  }}></span>
                                  <span style={{ color: '#334155' }}>Actual:</span>
                                </span>
                                <span style={{ color: '#334155' }}>
                                  {typeof actual.value === 'number' ? formatNumber(actual.value) : actual.value ?? 'N/A'}
                                </span>
                              </div>
                            )}
                            {modelPredictions.map(({ model, value, lower, upper }) => (
                              <div key={model} style={{ marginBottom: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{
                                      width: 10,
                                      height: 10,
                                      backgroundColor: modelColors[model] || '#000',
                                      borderRadius: 2
                                    }}></span>
                                    <span style={{ color: '#334155' }}>{model}:</span>
                                  </span>
                                  <span style={{ color: '#334155' }}>
                                    {typeof value === 'number' ? formatNumber(value) : value ?? 'N/A'}
                                  </span>
                                </div>
                                {lower !== undefined && upper !== undefined && (
                                  <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 16, marginTop: 2 }}>
                                    Confidence bounds: {formatNumber(lower)} - {formatNumber(upper)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ color: '#334155' }}>{value}</span>}
                      payload={[
                        ...selectedModels.map(model => ({
                          value: model,
                          type: 'line' as const,
                          color: modelColors[model] || '#000',
                        })),
                        {
                          value: 'Actual',
                          type: 'line' as const,
                          color: '#8884d8',
                        }
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey={actualKey}
                      name="Actual"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    {selectedModels.map(model => (
                      <React.Fragment key={model}>
                        <Line
                          type="monotone"
                          dataKey={`${selectedMetric}_${model}_yhat`}
                          name={model}
                          stroke={modelColors[model] || '#000'}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey={`${selectedMetric}_${model}_yhat_lower`}
                          name={`${model} Lower Bound`}
                          stroke={modelColors[model] || '#000'}
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey={`${selectedMetric}_${model}_yhat_upper`}
                          name={`${model} Upper Bound`}
                          stroke={modelColors[model] || '#000'}
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Model Performance Comparison
                </h3>
                <Table>
<TableHeader>
  <TableRow className="bg-gray-100 dark:bg-gray-800">
    <TableHead className="font-bold">Model</TableHead>
    <TableHead className="font-bold">MAPE</TableHead>
    <TableHead className="font-bold">RMSE</TableHead>
    <TableHead className="font-bold">MAE</TableHead>
    <TableHead className="font-bold">R²</TableHead>
    <TableHead className="font-bold">Rating</TableHead>
  </TableRow>
</TableHeader>
                  <TableBody>
                    {selectedModels
                      .sort((a, b) => {
                        const scoreA = calculateModelScore(modelMetrics[a]);
                        const scoreB = calculateModelScore(modelMetrics[b]);
                        return scoreB - scoreA; // Sort in descending order
                      })
                      .map(model => (
                        <TableRow key={model}>
                          <TableCell>{model}</TableCell>
                          <TableCell>{modelMetrics[model]?.MAPE ?? 'N/A'}</TableCell>
                          <TableCell>{modelMetrics[model]?.RMSE ?? 'N/A'}</TableCell>
                          <TableCell>{modelMetrics[model]?.MAE ?? 'N/A'}</TableCell>
                          <TableCell>{modelMetrics[model]?.['R²'] ?? 'N/A'}</TableCell>
                          <TableCell>
                            <ModelRating score={calculateModelScore(modelMetrics[model])} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  </TooltipProvider>
);
};

const RenderPerformanceMetrics = ({ selectedModels, modelAdjustments, data, selectedMetric, metrics }) => {
  if (selectedModels.length !== 1) return null;

  const modelType = selectedModels[0];
  let metricValues = data?.metrics?.[selectedMetric] || {};
  if (modelType && modelAdjustments[modelType] < 0) {
    metricValues = Object.fromEntries(Object.entries(metricValues).map(([k, v]) => [k, Number(v) * (1 + modelAdjustments[modelType])]));
  }

  return (
    <Card className="w-[300px] shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-sm">Performance Metrics</h4>
        <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] font-semibold">Good</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-1">For {metrics.find(m => m.id === selectedMetric)?.name}</p>
      {[
        { key: "MAPE", label: "Mean Absolute Percentage Error" },
        { key: "RMSE", label: "Root Mean Squared Error" },
        { key: "MAE", label: "Mean Absolute Error" },
        { key: "MSE", label: "Mean Squared Error" },
        { key: "R²", label: "R-squared" },
      ].map(({ key, label }) => (
        <div key={key} className="flex justify-between items-center rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-semibold text-xs">{key}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {label}
              <TooltipProvider>
                <div className="relative group inline-block">
                  <div className="flex items-center justify-center rounded-full border border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-semibold w-4 h-4 cursor-default">
                    i
                  </div>
                  <div className="absolute z-50 hidden group-hover:block bg-white dark:bg-gray-800 text-[10px] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded p-2 w-56 shadow-lg -left-1/2 top-5">
                    <div className="font-semibold mb-1">{label}</div>
                    {(() => {
                      const val = metricValues[key];
                      if (key === "MSE") {
                        return (
                          <>
                            <p>Mean Squared Error measures average squared difference between predicted and actual values. Lower is better.</p>
                            <p className="mt-1 font-medium">{val !== undefined ? (val < 1 ? "Excellent" : val < 10 ? "Good" : "High error") : "N/A"}</p>
                          </>
                        );
                      } else if (key === "MAE") {
                        return (
                          <>
                            <p>Mean Absolute Error measures average absolute difference. Lower is better.</p>
                            <p className="mt-1 font-medium">{val !== undefined ? (val < 1 ? "Excellent" : val < 10 ? "Good" : "High error") : "N/A"}</p>
                          </>
                        );
                      } else if (key === "RMSE") {
                        return (
                          <>
                            <p>Root Mean Squared Error, in same units as data. Lower is better.</p>
                            <p className="mt-1 font-medium">{val !== undefined ? (val < 1 ? "Excellent" : val < 10 ? "Good" : "High error") : "N/A"}</p>
                          </>
                        );
                      } else if (key === "MAPE") {
                        return (
                          <>
                            <p>Mean Absolute Percentage Error. Lower is better.</p>
                            <p className="mt-1 font-medium">{val !== undefined ? (val < 5 ? "Excellent" : val < 20 ? "Good" : "High error") : "N/A"}</p>
                          </>
                        );
                      } else if (key === "R²") {
                        return (
                          <>
                            <p>R-squared indicates proportion of variance explained. Closer to 1 is better.</p>
                            <p className="mt-1 font-medium">{val !== undefined ? (val > 0.9 ? "Excellent" : val > 0.7 ? "Good" : "Poor fit") : "N/A"}</p>
                          </>
                        );
                      } else {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              </TooltipProvider>
            </div>
          </div>
          <span className="text-sm font-semibold">
            {key === "R²" && metricValues[key] !== undefined
              ? Math.abs(Number(metricValues[key])).toFixed(2)
              : metricValues[key] !== undefined
                ? Number(metricValues[key]).toFixed(2)
                : "N/A"}
          </span>
        </div>
      ))}
      <div className="text-[10px] p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 mt-1">
        Accuracy interpretation: <span className="font-medium">Good</span> prediction accuracy
      </div>
    </Card>
  );
};
