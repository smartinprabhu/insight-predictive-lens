import { RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  title: string;
  onLogout?: () => void;
  lastUpdated: string;
  forecastPeriod?: string | number;
  onRefresh?: () => void;
}

export const DashboardHeader = ({
  title = "Walmart Fulfillment Services",
  lastUpdated,
  forecastPeriod,
  onRefresh,
}: DashboardHeaderProps) => {
  const { toast } = useToast();
  const { toggleSidebar, state } = useSidebar();

  const handleRefresh = () => {
    toast({
      title: "Refreshing Dashboard",
      description: "Updating with the latest data...",
    });
  };

  return (
    <div className="w-full sticky top-0 z-20 bg-background border-b border-border/30 dark:border-border/50">
<div className={`flex flex-col md:flex-row justify-between items-center gap-4 p-4 w-full ${state === 'expanded' ? 'w-[1200px]' : 'w-[1370px]'}`}>
        <div className="flex items-center gap-4 w-full">
          {/* Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Title and other information */}
          <div className="flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdated} • {forecastPeriod}
            </p>
          </div>
        </div>

        {/* Refresh button aligned to the end of the header */}
        <div className="flex justify-end w-full">
          <Button
            variant="default"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
