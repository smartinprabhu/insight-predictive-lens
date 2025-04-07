
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold mb-1">Supply Chain Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated} • {forecastPeriod} day forecast
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};
