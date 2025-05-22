
import { RefreshCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSelector from "./ThemeSelector";

interface DashboardHeaderProps {
  title: string;
  onLogout?: () => void;  // Make onLogout optional
  lastUpdated: string;
  forecastPeriod?: string | number;
  onRefresh?: () => void;
}

export const DashboardHeader = ({
  title = "Walmart Fulfillment Services ",
  lastUpdated,
  forecastPeriod,
  onRefresh
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/30 dark:border-gray-700/50">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {lastUpdated} • {forecastPeriod}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
        <ThemeSelector />
      </div>
    </div>
  );
};
