
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
    <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl font-semibold mb-4">Model Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forecast Period (days)
          </label>
          <Input
            type="number"
            value={forecastPeriod}
            onChange={(e) => onForecastPeriodChange(parseInt(e.target.value))}
            min={1}
            max={365}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
