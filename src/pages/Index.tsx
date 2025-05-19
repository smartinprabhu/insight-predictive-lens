
import { useState } from "react";
import { UploadDataForm } from "@/components/UploadDataForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  const handleFormSubmit = () => {
    setShowDashboard(true);
  };
  
  const handleReset = () => {
    setShowDashboard(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showDashboard ? (
        <Dashboard onReset={handleReset} apiResponse={apiResponse} />
      ) : (
        <UploadDataForm onSubmit={handleFormSubmit} onApiResponse={setApiResponse} />
      )}
    </div>
  );
};

export default Index;
