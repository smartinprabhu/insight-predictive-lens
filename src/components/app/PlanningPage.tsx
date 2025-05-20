
import React from "react";
import { PlanningTab } from "@/components/PlanningTab";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui_2/card";
import { Button } from "@/components/ui_2/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui_2/tooltip";
import { Info } from "lucide-react";

const PlanningPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workforce Planning</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Planning Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Use this page to plan your workforce requirements based on forecasted volume and other metrics.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workforce Planning Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanningTab />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanningPage;
