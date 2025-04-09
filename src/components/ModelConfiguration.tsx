
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelConfigurationProps {
  modelType: string;
  forecastPeriod: number;
  aggregationType: string;
  onModelTypeChange: (value: string) => void;
  onForecastPeriodChange: (value: number) => void;
  onAggregationTypeChange: (value: string) => void;
}

export const ModelConfiguration = ({
  modelType,
  forecastPeriod,
  aggregationType,
  onModelTypeChange,
  onForecastPeriodChange,
  onAggregationTypeChange,
}: ModelConfigurationProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Model Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model Type
            </label>
            <Select
              value={modelType}
              onValueChange={onModelTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prophet">Prophet</SelectItem>
                <SelectItem value="ARIMA">ARIMA</SelectItem>
                <SelectItem value="LSTM">LSTM</SelectItem>
                <SelectItem value="XGBoost">XGBoost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forecast Period (weeks)
            </label>
            <Input
              type="number"
              value={forecastPeriod}
              onChange={(e) => onForecastPeriodChange(parseInt(e.target.value))}
              min={1}
              max={52}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aggregation Type
            </label>
            <Select
              value={aggregationType}
              onValueChange={onAggregationTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select aggregation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
