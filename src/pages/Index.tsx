
import { useState } from "react";
import { UploadDataForm } from "@/components/UploadDataForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  
  const handleFormSubmit = () => {
    setShowDashboard(true);
  };
  
  const handleReset = () => {
    setShowDashboard(false);
  };
  
  const handleFileUpload = (files: FileList | null) => {
    console.log("Files uploaded:", files);
    // Implement file upload logic here if needed
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showDashboard ? (
        <Dashboard onReset={handleReset} apiResponse={apiResponse} />
      ) : (
        <UploadDataForm 
          onSubmit={handleFormSubmit} 
          onApiResponse={setApiResponse}
          onFileUpload={handleFileUpload}
          setOpenModal={setOpenModal}
        />
      )}
    </div>
  );
};

export default Index;
