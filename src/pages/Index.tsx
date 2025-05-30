
import { useState } from "react";
import { UploadDataForm } from "@/components/UploadDataForm";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const handleFormSubmit = () => {
    setShowDashboard(true);
  };
  
  const handleReset = () => {
    setShowDashboard(false);
  };
  
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showDashboard ? (
        <Dashboard onReset={handleReset} apiResponse={apiResponse} />
      ) : (
        <UploadDataForm 
          onSubmit={handleFormSubmit} 
          onApiResponse={setApiResponse} 
          onFileUpload={handleFileUpload}
          setOpenModal={() => {}}
        />
      )}
    </div>
  );
};

export default Index;
