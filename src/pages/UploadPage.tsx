
import React from "react";
import UploadDataTabWithNavigation from "@/components/UploadDataTabWithNavigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader"; // Import DashboardHeader

const UploadPage = () => {
  return (
    <div className="p-4 md:p-6 space-y-4"> {/* New top-level div */}
      <DashboardHeader
        title="Upload & Planning"
        lastUpdated={new Date().toLocaleDateString("en-GB")}
        forecastPeriod="Manage your data uploads and planning" // Example value
        // onRefresh prop can be omitted if not needed for this page
      />
      <Card>
        <CardHeader>
          <CardTitle>Upload & Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDataTabWithNavigation />
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
