import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectGroup, SelectScrollDownButton } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon, InfoIcon, ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Sample data for insights
interface InsightsTabProps {
  data?: {
    dz_df?: any[];
  };
  insights: any;
}

const insights = [
  {
    id: 1,
    type: "trend",
    title: "Inventory management expected to spike in next 30 days",
    description: "Based on historical patterns, we predict a 23% increase in inventory values over the next 30 days.",
    impact: "high",
  },
  {
    id: 2,
    type: "pattern",
    title: "Customer returns pattern shows seasonal variation",
    description: "Returns increase by 18% during holiday seasons, particularly in December and January.",
    impact: "medium",
  },
  {
    id: 3,
    type: "improvement",
    title: "WSF China trend improving with new supplier",
    description: "The new supplier relationship has reduced variance by 15% and improved predictability.",
    impact: "high",
  },
  {
    id: 4,
    type: "correlation",
    title: "Inbound exceptions correlate strongly with customer returns",
    description: "For every 5% increase in inbound exceptions, customer returns increase by approximately 8% within 14 days.",
    impact: "high",
  },
  {
    id: 5,
    type: "anomaly",
    title: "Unusual spike detected in IB Units on weekends",
    description: "Weekend processing is 27% higher than the historical average for the past 3 weeks.",
    impact: "medium",
  },
];

function computeCorrelationMatrix(data: any[], categories: string[]): number[][] {
  const matrix: number[][] = [];
  const n = data.length;

  for (let i = 0; i < categories.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < categories.length; j++) {
      const xi = data.map(row => Number(row[categories[i]]) || 0);
      const yi = data.map(row => Number(row[categories[j]]) || 0);

      const meanX = xi.reduce((a, b) => a + b, 0) / n;
      const meanY = yi.reduce((a, b) => a + b, 0) / n;

      const numerator = xi.reduce((sum, xk, idx) => sum + (xk - meanX) * (yi[idx] - meanY), 0);
      const denominatorX = Math.sqrt(xi.reduce((sum, xk) => sum + Math.pow(xk - meanX, 2), 0));
      const denominatorY = Math.sqrt(yi.reduce((sum, yk) => sum + Math.pow(yk - meanY, 2), 0));

      const corr = denominatorX && denominatorY ? numerator / (denominatorX * denominatorY) : 0;
      matrix[i][j] = Math.max(-1, Math.min(1, corr));
    }
  }
  return matrix;
}
const processMonthlyData = (dz_df: any[]) => {

  const monthlyData: { [key: string]: any } = {};

  dz_df.forEach((row) => {
    const dateStr = row.Week; // Use the 'Week' field for date
    if (!dateStr) return;

    // Parse the date in the format "DD-MMM-YYYY"
    const date = new Date(Date.parse(dateStr));
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateStr);
      return;
    }

    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // 'YYYY-MM'
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        ibUnits: 0,
        inventory: 0,
        customerReturns: 0,
        wsfChina: 0,
        ibExceptions: 0,
      };
    }

    monthlyData[monthKey].ibUnits += row['Total IB Units'] || 0;
    monthlyData[monthKey].inventory += row['inventory'] || 0;
    monthlyData[monthKey].customerReturns += row['returns'] || 0;
    monthlyData[monthKey].wsfChina += row['wfs_china'] || 0;
    monthlyData[monthKey].ibExceptions += row['exceptions'] || 0;
  });

  const result = Object.values(monthlyData).map((month) => ({
    name: month.name,
    ibUnits: month.ibUnits,
    inventory: month.inventory,
    customerReturns: month.customerReturns,
    wsfChina: month.wsfChina,
    ibExceptions: month.ibExceptions,
  }));


  return result;
};
export const InsightsTab = ({ data }: InsightsTabProps) => {
  const [activeTab, setActiveTab] = useState<"correlations" | "seasonality">("correlations");
  const [selectedTraces, setSelectedTraces] = useState<string[]>(["inventory"]);

  const categories = ["Total IB Units", "exceptions", "inventory", "returns", "wfs_china"];
  const labels = ["IB Units", "IB Exceptions", "Inventory", "Customer Returns", "WSF China"];
  const correlationMatrix = data?.dz_df && data.dz_df.length > 1
    ? computeCorrelationMatrix(data.dz_df, categories)
    : null;
  const heatmapCategories = labels;

  const traces = [
    { value: "inventory", label: "Inventory" },
    { value: "customerReturns", label: "Customer Returns" },
    { value: "wsfChina", label: "WSF China" },
    { value: "ibExceptions", label: "IB Exceptions" },
    { value: "ibUnits", label: "IB Units" },
  ];

  const handleTraceChange = (value: string[]) => {
    setSelectedTraces(value);
  };

  const exportToCSV = () => {
    if (!data?.dz_df) return;

    const monthlyData = processMonthlyData(data.dz_df);
    const csvHeader = ["Month", ...selectedTraces.map(trace => traces.find(t => t.value === trace)?.label || trace)].join(",");
    const csvRows = monthlyData.map(row => [row.name, ...selectedTraces.map(trace => row[trace])].join(","));

    const csvContent = [csvHeader, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `monthly_data_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  const getIconForInsightType = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUpIcon className="h-5 w-5 text-blue-500" />;
      case "anomaly":
        return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
      case "improvement":
        return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
      case "correlation":
        return <InfoIcon className="h-5 w-5 text-purple-500" />;
      case "pattern":
        return <LightbulbIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <LightbulbIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBadgeColorForImpact = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold">Insights & Analysis</h3>
          <div className="flex mt-4 border-b">
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "correlations" ? "border-b-2 border-primary text-primary" : ""}`}
              onClick={() => setActiveTab("correlations")}
            >
              Correlation Heatmap
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "seasonality" ? "border-b-2 border-primary text-primary" : ""}`}
              onClick={() => setActiveTab("seasonality")}
            >
              Seasonality Analysis
            </button>
          </div>
        </div>

        {activeTab === "correlations" && (
          <div className="rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-4">
              This heatmap shows the correlation between different metrics. Darker colors indicate stronger correlations.
            </p>
            {correlationMatrix ? (
              <div className="w-full h-[300px] overflow-x-auto rounded-lg p-4 bg-background">
                <div className="flex flex-row min-w-[600px] h-full">
                  <div className="flex-1">
                    <div className="grid grid-cols-6 gap-1">
                      <div className=""></div>
                      {heatmapCategories.map((category, i) => (
                        <div key={i} className="font-medium text-sm p-2 text-center text-foreground">{category}</div>
                      ))}

                      {heatmapCategories.map((category, i) => (
                        <>
                          <div key={`label-${i}`} className="font-medium text-sm p-2 text-foreground">{category}</div>
                          {correlationMatrix[i].map((value, j) => {
                            const intensity = Math.abs(value);
                            const color = value < 0
                              ? `rgba(239, 68, 68, ${intensity})`
                              : `rgba(59, 130, 246, ${intensity})`;

                            return (
                              <div
                                key={`cell-${i}-${j}`}
                                className="flex items-center justify-center p-2 text-xs font-medium text-foreground"
                                style={{ backgroundColor: color }}
                              >
                                {value.toFixed(2)}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-between ml-4 py-2">
                    <span className="text-xs text-muted-foreground">Positive</span>
                    <div
                      style={{
                        width: 12,
                        height: '100%',
                        background: 'linear-gradient(to top,rgba(239,68,68,1), white,rgba(59,130,246,1) )',
                        borderRadius: 4,
                        margin: '4px 0',
                        flexGrow: 1,
                      }}
                    ></div>
                    <span className="text-xs text-muted-foreground">Negative</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">No correlation data available</div>
            )}
          </div>
        )}

        {activeTab === "seasonality" && (
          <div className="rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-4">
              This chart shows the monthly aggregated data for different metrics throughout the year.
            </p>

            <div className="mb-4 flex justify-end">
              <div className="flex flex-col sm:flex-row gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-between">
                      {selectedTraces.length === 1
                        ? traces.find((t) => t.value === selectedTraces[0])?.label
                        : selectedTraces.length === traces.length
                          ? "All Traces"
                          : `${selectedTraces.length} traces selected`}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Select Traces</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      key="select-all"
                      checked={selectedTraces.length === traces.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleTraceChange(traces.map((t) => t.value));
                        } else {
                          handleTraceChange([]);
                        }
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Select All
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {traces.map((trace) => (
                      <DropdownMenuCheckboxItem
                        key={trace.value}
                        checked={selectedTraces.includes(trace.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleTraceChange([...selectedTraces, trace.value]);
                          } else {
                            handleTraceChange(selectedTraces.filter((t) => t !== trace.value));
                          }
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {trace.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={exportToCSV}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full h-[400px] bg-background">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.dz_df ? processMonthlyData(data.dz_df) : []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barCategoryGap="15%"
                  barGap="10%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    stroke="currentColor"
                    tick={({ x, y, payload }) => {
                      const label = payload.value;
                      const parts = label.split(' ');
                      const month = parts[0];
                      const year = parts[1];

                      return (
                        <g transform={`translate(${x},${y + 10})`}>
                          <text x={0} y={0} textAnchor="middle" fontSize={10} fill="hsl(var(--foreground))">
                            {month}
                          </text>
                          {month.toLowerCase() === 'jan' && (
                            <text x={0} y={15} textAnchor="middle" fontSize={8} fill="hsl(var(--foreground))">
                              {year}
                            </text>
                          )}
                        </g>
                      );
                    }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--foreground))" }}
                    axisLine={{ stroke: "hsl(var(--foreground))" }}
                    tickFormatter={(value: number) => {
                      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                      return value.toFixed(0);
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--destructive))"
                    tick={{ fill: "hsl(var(--destructive))" }}
                    axisLine={{ stroke: "hsl(var(--destructive))" }}
                    tickFormatter={(value: number) => {
                      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                      return value.toFixed(0);
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;

                      return (
                        <div className="p-2 rounded-lg border text-sm bg-background text-foreground border-border">
                          <div className="font-medium mb-1">{label}</div>
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div
                                style={{
                                  width: 10,
                                  height: 10,
                                  backgroundColor: entry.fill,
                                  borderRadius: 2,
                                }}
                              ></div>
                              <span>{entry.name}</span>
                              <span className="font-bold">
                                {entry.value >= 1e6
                                  ? `${(entry.value / 1e6).toFixed(2)}M`
                                  : entry.value >= 1e3
                                  ? `${(entry.value / 1e3).toFixed(2)}K`
                                  : entry.value.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "hsl(var(--foreground))", marginBottom: -10 }}
                    formatter={(value: string) => {
                      const colors: { [key: string]: string } = {
                        "Inventory": "hsl(var(--primary))",
                        "Customer Returns": "hsl(var(--secondary))",
                        "WSF China": "#9061F9",
                        "IB Exceptions": "hsl(var(--destructive))",
                        "IB Units": "#4284f5"
                      };
                      return <span style={{ color: colors[value] }}>{value}</span>;
                    }}
                  />
                  {selectedTraces.includes("inventory") && <Bar dataKey="inventory" name="Inventory" fill="hsl(var(--primary))" />}
                  {selectedTraces.includes("customerReturns") && <Bar dataKey="customerReturns" name="Customer Returns" fill="hsl(var(--secondary))" />}
                  {selectedTraces.includes("wsfChina") && <Bar dataKey="wsfChina" name="WSF China" fill="#9061F9" />}
                  {selectedTraces.includes("ibExceptions") && <Bar dataKey="ibExceptions" name="IB Exceptions" fill="hsl(var(--destructive))" />}
                  {selectedTraces.includes("ibUnits") && <Bar yAxisId="right" dataKey="ibUnits" name="IB Units" fill="#4284f5" />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
