import { RefreshCcw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar

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
  const { toggleSidebar } = useSidebar(); // Use the toggleSidebar function from useSidebar

  return (
    <div className="sticky top-0 z-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/30 dark:border-border/50 bg-background">
      <div className="flex items-center gap-4">
        {/* Logo */}
        {/* <img
          src="/image.svg"
          alt="Logo"
          className="w-16 h-16"
        /> */}

        {/* Three-line sidebar trigger button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Title and other information */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {lastUpdated} • {forecastPeriod}
          </p>
        </div>
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
