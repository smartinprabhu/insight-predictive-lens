
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
  
  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
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
          onFileUpload={(fileOrFiles: File | FileList | null) => {
            if (fileOrFiles instanceof File) {
              handleFileUpload(fileOrFiles);
            } else if (fileOrFiles instanceof FileList && fileOrFiles.length > 0) {
              handleFileUpload(fileOrFiles[0]);
            }
          }}
          setOpenModal={() => setOpenModal(!openModal)}
        />
      )}
    </div>
  );
};

export default Index;
