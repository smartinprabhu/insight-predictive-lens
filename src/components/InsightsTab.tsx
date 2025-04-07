
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
import { useState } from "react";
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";

// Sample data for insights
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

// Generate heatmap data
const generateHeatmapData = () => {
  const categories = ["IB Units", "Inventory", "Customer Returns", "WSF China", "IB Exceptions"];
  const correlationMatrix = [];
  
  for (let i = 0; i < categories.length; i++) {
    const row = [];
    for (let j = 0; j < categories.length; j++) {
      if (i === j) {
        row.push(1); // Self correlation is always 1
      } else {
        // Generate a random correlation between -1 and 1
        // Higher chance of positive correlation between related metrics
        const baseCorrelation = Math.random() * 1.4 - 0.4;
        row.push(Math.max(-0.95, Math.min(0.95, baseCorrelation))); // Clamp between -0.95 and 0.95
      }
    }
    correlationMatrix.push(row);
  }
  
  // Make the matrix symmetric
  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      correlationMatrix[j][i] = correlationMatrix[i][j];
    }
  }
  
  return { categories, matrix: correlationMatrix };
};

const { categories: heatmapCategories, matrix: correlationMatrix } = generateHeatmapData();

// Generate seasonality data
const generateSeasonalityData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return months.map(month => {
    return {
      name: month,
      ibUnits: Math.round(100 + Math.random() * 100),
      inventory: Math.round(80 + Math.random() * 80),
      customerReturns: Math.round(30 + Math.random() * 60),
      wsfChina: Math.round(50 + Math.random() * 70),
      ibExceptions: Math.round(20 + Math.random() * 40),
    };
  });
};

const seasonalityData = generateSeasonalityData();

export const InsightsTab = () => {
  const [activeTab, setActiveTab] = useState<"insights" | "correlations" | "seasonality">("insights");
  
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
              className={`py-2 px-4 text-sm font-medium ${activeTab === "insights" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("insights")}
            >
              Automated Insights
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "correlations" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("correlations")}
            >
              Correlation Heatmap
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "seasonality" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
              onClick={() => setActiveTab("seasonality")}
            >
              Seasonality Analysis
            </button>
          </div>
        </div>
        
        {activeTab === "insights" && (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getIconForInsightType(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-lg text-gray-900">{insight.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColorForImpact(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === "correlations" && (
          <div className="bg-white rounded-lg">
            <p className="text-sm text-gray-500 mb-4">
              This heatmap shows the correlation between different metrics. Darker colors indicate stronger correlations.
            </p>
            
            <div className="w-full h-[400px] overflow-x-auto">
              <div className="min-w-[600px] h-full">
                <div className="grid grid-cols-6 gap-1">
                  <div className=""></div>
                  {heatmapCategories.map((category, i) => (
                    <div key={i} className="font-medium text-sm p-2 text-center">{category}</div>
                  ))}
                  
                  {heatmapCategories.map((category, i) => (
                    <>
                      <div key={`label-${i}`} className="font-medium text-sm p-2">{category}</div>
                      {correlationMatrix[i].map((value, j) => {
                        // Calculate color based on correlation value
                        // -1 to 1 range maps to blue-white-red
                        const intensity = Math.abs(value) * 100;
                        const color = value < 0 
                          ? `rgba(59, 130, 246, ${intensity / 100})` // Blue for negative
                          : `rgba(239, 68, 68, ${intensity / 100})`; // Red for positive
                        
                        return (
                          <div 
                            key={`cell-${i}-${j}`} 
                            className="flex items-center justify-center p-2 text-xs font-medium text-gray-900"
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
            </div>
          </div>
        )}
        
        {activeTab === "seasonality" && (
          <div className="bg-white rounded-lg">
            <p className="text-sm text-gray-500 mb-4">
              This chart shows the seasonal patterns of different metrics throughout the year.
            </p>
            
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={seasonalityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ibUnits" name="IB Units" fill="#4284f5" />
                  <Bar dataKey="inventory" name="Inventory" fill="#36b37e" />
                  <Bar dataKey="customerReturns" name="Customer Returns" fill="#ff9e2c" />
                  <Bar dataKey="wsfChina" name="WSF China" fill="#9061F9" />
                  <Bar dataKey="ibExceptions" name="IB Exceptions" fill="#f56565" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
