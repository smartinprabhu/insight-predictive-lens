
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyForecastView } from "./planning/WeeklyForecastView";
import { AssumptionsPanel } from "./planning/AssumptionsPanel";
import { GlobalFilters } from "./planning/GlobalFilters";
import { RecruitmentPipeline } from "./planning/RecruitmentPipeline";
import { IntradayForecast } from "./planning/IntradayForecast";
import { SummaryDashboard } from "./planning/SummaryDashboard";

export const PlanningTab: React.FC = () => {
  // State for selected tab
  const [activeView, setActiveView] = useState("weekly-forecast");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planning</h1>
          <p className="text-muted-foreground">
            Workforce planning and capacity management tools
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">View history</Button>
          <Button variant="outline">Upload allocation</Button>
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>
      
      <GlobalFilters />
      
      <Tabs defaultValue="weekly-forecast" value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="weekly-forecast">Weekly Forecast</TabsTrigger>
          <TabsTrigger value="summary">Capacity Summary</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment Pipeline</TabsTrigger>
          <TabsTrigger value="intraday">Intraday Forecast</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly-forecast" className="mt-6">
          <WeeklyForecastView />
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          <SummaryDashboard />
        </TabsContent>
        
        <TabsContent value="recruitment" className="mt-6">
          <RecruitmentPipeline />
        </TabsContent>
        
        <TabsContent value="intraday" className="mt-6">
          <IntradayForecast />
        </TabsContent>
        
        <TabsContent value="assumptions" className="mt-6">
          <Card className="p-6">
            <AssumptionsPanel />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
