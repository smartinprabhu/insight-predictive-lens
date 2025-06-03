import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

interface KPIMetricProps {
  title?: string;
  value?: string | number;
  subtitle?: string;
  changeValue?: number;
  changeText?: string;
  invertChange?: boolean;
  loading?: boolean;
}

export const KPIMetricsCard = ({
  title,
  value,
  subtitle,
  changeValue,
  changeText,
  invertChange = false,
  loading = false,
}: KPIMetricProps) => {
  const isPositive = invertChange ? (changeValue <= 0) : (changeValue >= 0);
  
  if (loading) {
    return (
      <Card className="relative m-4 shadow-md w-full max-w-xs h-40">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-md p-4 w-full max-w-xs h-auto dark:bg-[#272D35] bg-white dark:hover:bg-[#3A3F49] hover:bg-gray-100 transition duration-200 ease-in-out overflow-hidden">
      <div className="space-y-1.5">
        <h3 className="font-medium dark:text-gray-200 text-black truncate">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold dark:text-gray-100 text-black truncate">
            {typeof value === 'number' ? formatNumber(value) : value}
          </span>
        </div>
        <p className="text-sm dark:text-gray-400 text-gray-700 truncate">{subtitle}</p>
      </div>
      <div className="mt-4 flex flex-col space-y-1">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'} truncate`}>
            {changeValue >= 0 ? '+' : '-'} {Math.abs(changeValue).toFixed(2)}% {changeText}
          </span>
        </div>
      </div>
    </Card>
  );
};
