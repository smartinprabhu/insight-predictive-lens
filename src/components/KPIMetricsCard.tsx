
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPIMetricProps {
  title: string;
  value: number;
  subtitle: string;
  changeValue: number;
  changeText: string;
  timePeriod?: string; // Time period is passed from parent
}

export const KPIMetricsCard = ({ 
  title, 
  value, 
  subtitle, 
  changeValue, 
  changeText,
  timePeriod = "Current Period" // Default if not provided
}: KPIMetricProps) => {
  const isPositive = changeValue >= 0;
  
  return (
    <Card className="p-6 shadow-md border border-border/40 hover:border-border/80 transition-all duration-200 dark:bg-gray-800/90 dark:border-gray-700">
      <div className="space-y-1.5">
        <h3 className="font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold dark:text-white">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-4 flex flex-col space-y-1">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{changeValue}% {changeText}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{timePeriod}</p>
      </div>
    </Card>
  );
};
