
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MoveRightIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    
    // In a real application, you would upload the file to a server here
    // For now, we'll just simulate success and show a toast
    
    if (!file) {
      toast({
        title: "File required",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processing data",
      description: "Your file is being analyzed. Please wait...",
    });
    
    // Simulate processing time
    setTimeout(() => {
      toast({
        title: "Analysis complete",
        description: "Your dashboard has been generated successfully.",
      });
      onSubmit();
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Upload Inventory Data</h1>
            <p className="text-gray-500 mt-1">
              Upload your Excel file to generate predictive insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excel File
              </label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Type
                </label>
                <Select
                  value={modelType}
                  onValueChange={setModelType}
                >
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder="Select model type" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="Prophet">Prophet</Select.Item>
                    <Select.Item value="ARIMA">ARIMA</Select.Item>
                    <Select.Item value="LSTM">LSTM</Select.Item>
                    <Select.Item value="XGBoost">XGBoost</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forecast Period (days)
                </label>
                <Input
                  type="number"
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(Number(e.target.value))}
                  min={1}
                  max={365}
                />
              </div>
            </div>

            <div className="flex justify-end">
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
