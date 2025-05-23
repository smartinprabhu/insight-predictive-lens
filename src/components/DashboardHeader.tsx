
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";


interface DashboardHeaderProps {
  title: string;
  onLogout?: () => void;
  lastUpdated: string;
  forecastPeriod?: string | number;
  onRefresh?: () => void;
}

export const DashboardHeader = ({
  title = "", // Changed default title to empty string
  lastUpdated,
  forecastPeriod,
  onRefresh
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/30 dark:border-border/50">
      <div>
        {title && ( // Conditionally render title only if provided
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {lastUpdated} • {forecastPeriod}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            className="bg-background text-foreground border-border"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}

      </div>
    </div>
  );
};

export default DashboardHeader;
