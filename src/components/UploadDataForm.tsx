
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MoveRightIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./ThemeToggle";

interface UploadDataFormProps {
  onSubmit: () => void;
}

export const UploadDataForm = ({ onSubmit }: UploadDataFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState("Prophet");
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no file is selected, we'll use sample data
    if (!file) {
      toast({
        title: "Using sample data",
        description: "No file was uploaded. Sample data will be used for demonstration.",
      });
    } else {
      toast({
        title: "Processing data",
        description: "Your file is being analyzed. Please wait...",
      });
    }
    
    // Simulate processing time
    setTimeout(() => {
      toast({
        title: "Analysis complete",
        description: "Your dashboard has been generated successfully.",
      });
      onSubmit();
    }, 2000);
  };

  const handleUseSampleData = () => {
    toast({
      title: "Using sample data",
      description: "Sample data will be used for demonstration.",
    });
    
    setTimeout(() => {
      toast({
        title: "Analysis complete",
        description: "Your dashboard has been generated with sample data.",
      });
      onSubmit();
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Upload Inventory Data</h1>
            <ThemeToggle />
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            Upload your Excel file to generate predictive insights
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excel File
              </label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="cursor-pointer dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model Type
                </label>
                <Select
                  value={modelType}
                  onValueChange={setModelType}
                >
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
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
                  Forecast Period (days)
                </label>
                <Input
                  type="number"
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={handleUseSampleData}
                className="dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Use Sample Data
              </Button>
              
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate Dashboard
                <MoveRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
