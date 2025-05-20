
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import PlanningGrid from './PlanningGrid';
import PlanDropdown from './PlanDropdown';
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";

// Define types for metric explanations
interface MetricExplanation {
  title: string;
  description: string;
  impact: string;
}

interface WeekData {
  date: string;
  volume: number;
  aht: number;
  shrinkage: number;
  occupancy: number;
  attrition: number;
  actual: number;
}

const PlanningTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("Move In");
  const [weekData, setWeekData] = useState<WeekData[]>([]);

  // Initialize with sample data
  useEffect(() => {
    // Generate 4 weeks of sample data
    const sampleData = Array.from({ length: 4 }).map((_, index) => {
      const weekNumber = index + 1;
      const date = `2025-${index < 2 ? '05' : '06'}-${index < 2 ? 15 + index * 7 : (index - 2) * 7 + 1}`;
      return {
        date,
        volume: 1000 + Math.floor(Math.random() * 500),
        aht: 300 + Math.floor(Math.random() * 60),
        shrinkage: 0.1 + Math.random() * 0.1,
        occupancy: 0.7 + Math.random() * 0.2,
        attrition: 0.05 + Math.random() * 0.05,
        actual: 20 + Math.floor(Math.random() * 10)
      };
    });
    setWeekData(sampleData);
  }, [selectedPlan]);

  // Metric explanations for tooltips
  const metricExplanations: Record<string, MetricExplanation> = {
    volume: {
      title: "Volume",
      description: "Total number of contacts or transactions expected.",
      impact: "Higher volume requires more staff."
    },
    aht: {
      title: "Average Handling Time",
      description: "Average time to complete a single transaction (in seconds).",
      impact: "Longer AHT requires more staff."
    },
    shrinkage: {
      title: "Shrinkage",
      description: "Percentage of paid time agents are unavailable to handle contacts.",
      impact: "Higher shrinkage requires more staff to compensate."
    },
    occupancy: {
      title: "Occupancy",
      description: "Percentage of time agents spend handling contacts vs waiting.",
      impact: "Higher occupancy means higher agent utilization but can increase burnout."
    },
    attrition: {
      title: "Attrition",
      description: "Percentage of agents leaving the company in a given period.",
      impact: "Higher attrition requires more hiring to maintain staffing levels."
    },
    required: {
      title: "Required HC",
      description: "Calculated headcount needed based on all factors.",
      impact: "This is the target staffing level."
    },
    actual: {
      title: "Actual HC",
      description: "Current headcount available.",
      impact: "Compare with Required HC to identify gaps."
    },
    ou: {
      title: "Over/Under",
      description: "Difference between Actual and Required HC.",
      impact: "Negative values indicate understaffing, positive values indicate overstaffing."
    }
  };

  // Handle data changes from the grid
  const handleDataChange = (index: number, field: keyof WeekData, value: string) => {
    const updatedData = [...weekData];
    let numValue = parseFloat(value);
    
    // Handle percentage conversion
    if (field === 'shrinkage' || field === 'occupancy' || field === 'attrition') {
      numValue = numValue / 100; // Convert percentage back to decimal
    }
    
    updatedData[index] = {
      ...updatedData[index],
      [field]: numValue
    };
    
    setWeekData(updatedData);
    
    // Show a toast when data is updated
    toast({
      title: "Data Updated",
      description: `${field.charAt(0).toUpperCase() + field.slice(1)} value changed to ${value}.`,
    });
  };

  // Handle plan selection
  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    // You would typically fetch new data based on the selected plan
    toast({
      title: "Plan Selected",
      description: `${plan} plan has been selected.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Capacity Planning</h2>
          <p className="text-muted-foreground">
            Plan and forecast your workforce needs based on volume and efficiency metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PlanDropdown onSelectPlan={handleSelectPlan} />
          <Button variant="outline" onClick={() => {
            toast({
              title: "Plan Saved",
              description: "Your capacity plan has been saved successfully.",
            });
          }}>
            Save Plan
          </Button>
        </div>
      </div>

      {/* Planning Grid */}
      <div className="bg-background rounded-md border">
        <div className="p-4">
          <PlanningGrid 
            weekData={weekData} 
            metricExplanations={metricExplanations}
            onDataChange={handleDataChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PlanningTab;
