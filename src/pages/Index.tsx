
import { useState } from "react";
import { UploadDataForm } from "@/components/UploadDataForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  
  const handleFormSubmit = () => {
    setShowDashboard(true);
  };
  
  const handleReset = () => {
    setShowDashboard(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showDashboard ? (
        <Dashboard onReset={handleReset} />
      ) : (
        <UploadDataForm onSubmit={handleFormSubmit} />
      )}
    </div>
  );
};

export default Index;
