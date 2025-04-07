
import { useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

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
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      dateFormatted: `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`,
      actual: actualValue,
      predicted: predictedValue,
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
  
  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);
  const selectedMetrics = metrics[selectedCategory];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 mb-6">
          <div>
            <h3 className="text-xl font-semibold">Model Validation</h3>
            <p className="text-sm text-gray-500 mt-1">
              Actual vs Predicted values for the same time period
            </p>
          </div>
          
          <div className="w-[200px]">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select category" />
              </Select.Trigger>
              <Select.Content>
                {categories.map((category) => (
                  <Select.Item key={category.id} value={category.id}>
                    {category.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #f1f1f1',
                  borderRadius: '4px',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => `Date: ${value}`}
              />
              <Legend />
              
              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                name={`Actual ${selectedCategoryInfo?.name}`}
                stroke={selectedCategoryInfo?.color || "#4284f5"}
                strokeWidth={2}
                dot={{ r: 3, fill: selectedCategoryInfo?.color || "#4284f5" }}
                activeDot={{ r: 5 }}
              />
              
              {/* Predicted line */}
              <Line
                type="monotone"
                dataKey="predicted"
                name={`Predicted ${selectedCategoryInfo?.name}`}
                stroke={selectedCategoryInfo?.color || "#4284f5"}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">MAE</p>
            <p className="text-xl font-semibold">{selectedMetrics.mae} units</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">RMSE</p>
            <p className="text-xl font-semibold">{selectedMetrics.rmse} units</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">MAPE</p>
            <p className="text-xl font-semibold">{selectedMetrics.mape}%</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-500">R²</p>
            <p className="text-xl font-semibold">{selectedMetrics.r2}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
