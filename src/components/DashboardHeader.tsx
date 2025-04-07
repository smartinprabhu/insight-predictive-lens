
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  change: number;
}

const MetricCard = ({ title, value, description, change }: MetricCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
      <p className="text-3xl font-semibold mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 mr-1" />
        )}
        <span>{Math.abs(change)}% from previous period</span>
      </div>
    </div>
  );
};

interface DashboardHeaderProps {
  lastUpdated: string;
  forecastPeriod: number;
  onRefresh: () => void;
}

export const DashboardHeader = ({
  lastUpdated,
  forecastPeriod,
  onRefresh,
}: DashboardHeaderProps) => {
  const { toast } = useToast();
  
  const metrics = [
    {
      title: "IB Units",
      value: 648,
      description: "Total cases for IB units",
      change: 12.5,
    },
    {
      title: "Inventory",
      value: 532,
      description: "Total cases for Inventory",
      change: 4.2,
    },
    {
      title: "Customer Returns",
      value: 285,
      description: "Total cases for Customer returns",
      change: 7.8,
    },
    {
      title: "WSF China",
      value: 423,
      description: "Total cases for WSF China",
      change: 3.1,
    },
    {
      title: "IB Exceptions",
      value: 156,
      description: "Total cases for IB Exceptions",
      change: -2.5,
    },
  ];

  const handleRefresh = () => {
    onRefresh();
    toast({
      title: "Dashboard Refreshed",
      description: "The dashboard has been refreshed with the latest data.",
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Predictive Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            Forecast period: {forecastPeriod} days | Last updated: {lastUpdated}
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100"
          >
            <RefreshCwIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            change={metric.change}
          />
        ))}
      </div>
    </div>
  );
};
