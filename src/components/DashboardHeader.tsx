
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
  title = "Walmart Fulfillment Services ",
  lastUpdated,
  forecastPeriod,
  onRefresh
}: DashboardHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-background flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-border/30 dark:border-border/50">
      {/* Added sticky, top-0, z-50, bg-background. Changed pb-4 to py-4 for consistent padding when sticky. */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
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
