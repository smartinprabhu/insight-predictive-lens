
// Import the components we need
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Sample validation data for demonstration (would come from API in a real app)
const getModelValidationData = () => {
  return {
    actual: [148, 165, 180, 170, 190, 210, 200, 220, 210, 240, 230, 250],
    predicted: [145, 160, 175, 175, 185, 200, 205, 215, 220, 230, 235, 245],
    lower: [130, 145, 160, 160, 170, 185, 190, 200, 205, 215, 220, 230],
    upper: [160, 175, 190, 190, 200, 215, 220, 230, 235, 245, 250, 260],
    labels: [
      "Week 1",
      "Week 2",
      "Week 3",
      "Week 4",
      "Week 5",
      "Week 6",
      "Week 7",
      "Week 8",
      "Week 9",
      "Week 10",
      "Week 11",
      "Week 12",
    ],
  };
};

// Create a performance metrics dataset from the validation data
const getPerformanceMetrics = () => {
  const data = getModelValidationData();
  let totalError = 0;
  let totalAbsError = 0;
  let totalSquaredError = 0;
  const totalActual = data.actual.reduce((sum, value) => sum + value, 0);
  
  const metrics = data.actual.map((actual, index) => {
    const predicted = data.predicted[index];
    const error = predicted - actual;
    const absError = Math.abs(error);
    const squaredError = error * error;
    
    totalError += error;
    totalAbsError += absError;
    totalSquaredError += squaredError;
    
    return {
      period: data.labels[index],
      actual,
      predicted,
      error,
      absError,
      squaredError,
      percentageError: (error / actual) * 100,
    };
  });
  
  const n = data.actual.length;
  
  return {
    metrics,
    summary: {
      mae: totalAbsError / n,
      mse: totalSquaredError / n,
      rmse: Math.sqrt(totalSquaredError / n),
      mape: (metrics.reduce((sum, item) => sum + Math.abs(item.percentageError), 0)) / n,
      bias: totalError / n,
    },
  };
};

// Data preparation for accuracy metrics charts
const prepareData = () => {
  const { metrics, summary } = getPerformanceMetrics();
  const validationData = getModelValidationData();
  
  // Prepare the data for the line chart
  const lineData = validationData.labels.map((label, index) => {
    return {
      name: label,
      Actual: validationData.actual[index],
      Predicted: validationData.predicted[index],
      "Lower Bound": validationData.lower[index],
      "Upper Bound": validationData.upper[index],
      Error: metrics[index].error,
    };
  });
  
  // Prepare the data for the error distribution chart
  const errorDistData = metrics.map((item) => ({
    name: item.period,
    Error: item.error,
  }));
  
  // Scalar metrics for the metrics cards
  const scalarMetrics = {
    mae: summary.mae.toFixed(2),
    mse: summary.mse.toFixed(2),
    rmse: summary.rmse.toFixed(2),
    mape: summary.mape.toFixed(2),
    bias: summary.bias.toFixed(2),
  };
  
  return { lineData, errorDistData, scalarMetrics };
};

// Component for displaying error metrics
const ErrorMetricsCard = ({ title, value, description, maxValue, color }: { 
  title: string;
  value: number;
  description: string;
  maxValue: number;
  color: string;
}) => {
  // Convert string to number to ensure we have a numerical value for calculations
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const percentage = (numericValue / maxValue) * 100;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{numericValue.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <Progress
          value={percentage}
          className="h-2 mt-2"
        />
      </CardContent>
    </Card>
  );
};

// The main component
export const ModelValidationTab = ({ aggregationType = "Weekly" }) => {
  const { lineData, errorDistData, scalarMetrics } = prepareData();
  
  // Define descriptions for error metrics
  const metricDescriptions = {
    mae: "Mean Absolute Error - average absolute difference between predictions and actual values",
    mse: "Mean Squared Error - average of squared errors measuring prediction quality",
    rmse: "Root Mean Squared Error - square root of MSE, represents standard deviation of errors",
    mape: "Mean Absolute Percentage Error - percentage representation of prediction accuracy",
    bias: "Average tendency of the model to over or under predict (closer to 0 is better)",
  };
  
  // Define max values for visualizing metrics (these would typically be derived from industry standards or project requirements)
  const maxValues = {
    mae: 20,
    mse: 400,
    rmse: 20,
    mape: 15,
    bias: 10,
  };
  
  // Define colors for different metrics
  const metricColors = {
    mae: "bg-blue-500",
    mse: "bg-purple-500",
    rmse: "bg-red-500",
    mape: "bg-amber-500",
    bias: "bg-emerald-500",
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md dark:shadow-gray-800/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Model Performance Validation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparison between actual and predicted values with {aggregationType.toLowerCase()} aggregation
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lineComparison" className="w-full">
            <TabsList className="mb-4 w-full max-w-md">
              <TabsTrigger value="lineComparison" className="flex-1">Line Comparison</TabsTrigger>
              <TabsTrigger value="errorDistribution" className="flex-1">Error Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lineComparison" className="pt-2">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      padding={{ left: 20, right: 20 }}
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
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f1f1f1'
                      }}
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    
                    <Line
                      type="monotone"
                      dataKey="Actual"
                      stroke="#4284f5"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Predicted"
                      stroke="#36b37e"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Lower Bound"
                      stroke="#a8aaad"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Upper Bound"
                      stroke="#a8aaad"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Confidence Bounds Explained</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  The upper and lower bounds represent the 95% confidence interval for the forecast.
                  There is a 95% probability that the actual value will fall within these bounds.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="errorDistribution" className="pt-2">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={errorDistData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      padding={{ left: 20, right: 20 }}
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
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f1f1f1'
                      }}
                      formatter={(value, name) => [`${value} units`, name]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="Error"
                      fill="#f56565"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Error Distribution</h4>
                <p className="text-xs text-red-700 dark:text-red-400">
                  This chart shows the difference between predicted and actual values across periods.
                  Positive values indicate overprediction, while negative values indicate underprediction.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Error Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ErrorMetricsCard
            title="MAE"
            value={parseFloat(scalarMetrics.mae)}
            description={metricDescriptions.mae}
            maxValue={maxValues.mae}
            color="blue"
          />
          
          <ErrorMetricsCard
            title="MSE"
            value={parseFloat(scalarMetrics.mse)}
            description={metricDescriptions.mse}
            maxValue={maxValues.mse}
            color="purple"
          />
          
          <ErrorMetricsCard
            title="RMSE"
            value={parseFloat(scalarMetrics.rmse)}
            description={metricDescriptions.rmse}
            maxValue={maxValues.rmse}
            color="red"
          />
          
          <ErrorMetricsCard
            title="MAPE (%)"
            value={parseFloat(scalarMetrics.mape)}
            description={metricDescriptions.mape}
            maxValue={maxValues.mape}
            color="amber"
          />
          
          <ErrorMetricsCard
            title="Bias"
            value={parseFloat(scalarMetrics.bias)}
            description={metricDescriptions.bias}
            maxValue={maxValues.bias}
            color="emerald"
          />
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">How to interpret these metrics</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400">MAE:</span>
              <span>Lower is better. This is the average absolute difference between predictions and actual values.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600 dark:text-purple-400">MSE:</span>
              <span>Lower is better. Heavily penalizes large errors by squaring differences.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-red-600 dark:text-red-400">RMSE:</span>
              <span>Lower is better. Square root of MSE. More interpretable as it's in the same units as the data.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-amber-600 dark:text-amber-400">MAPE:</span>
              <span>Lower is better. Shows the average percentage error, giving a relative measure of accuracy.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Bias:</span>
              <span>Closer to zero is better. Indicates systematic over or under prediction.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
