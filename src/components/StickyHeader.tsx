
import React from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyHeaderProps {
  title: string;
  onLogout?: () => void;
  lastUpdated: string;
  forecastPeriod?: string | number;
  onRefresh?: () => void;
  className?: string;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  title = "Walmart Fulfillment Services",
  lastUpdated,
  forecastPeriod,
  onRefresh,
  className
}) => {
  return (
    <div className={cn(
      "sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border/50",
      "shadow-sm transition-all duration-200 ease-in-out",
      className
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className={cn(
              "text-2xl md:text-3xl font-bold tracking-tight text-foreground",
              "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            )}>
              {title}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Last updated: {lastUpdated}
              {forecastPeriod && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{forecastPeriod}</span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh}
                className={cn(
                  "bg-background/80 backdrop-blur-sm text-foreground border-border/50",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-all duration-200 ease-in-out",
                  "transform hover:scale-105 active:scale-95"
                )}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyHeader;
