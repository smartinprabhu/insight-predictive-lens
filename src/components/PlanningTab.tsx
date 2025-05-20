
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Plus, Minus, Maximize, Minimize, Info } from "lucide-react";
import { formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeekData {
  date: string;
  volume: number;
  aht: number;
  shrinkage: number;
  occupancy: number;
  attrition: number;
  actual: number;
}

export const PlanningTab: React.FC = () => {
  // Business unit options
  const businessUnits = ["WFS", "WCS", "ATS", "CAS"];
  const lobOptions: Record<string, string[]> = {
    "WFS": ["US Phone", "EU Phone", "APAC Chat", "Global Email"],
    "WCS": ["Technical Support", "Customer Service", "Sales"],
    "ATS": ["Platform A", "Platform B", "Platform C"],
    "CAS": ["Enterprise", "SMB", "Consumer"]
  };

  // State
  const [businessUnit, setBusinessUnit] = useState("WFS");
  const [lob, setLob] = useState("US Phone");
  const [periodStart, setPeriodStart] = useState(3);
  const [periodEnd, setPeriodEnd] = useState(8);
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [expandedView, setExpandedView] = useState(false);

  // Metric explanations for info buttons
  const metricExplanations = {
    volume: {
      title: "Volume",
      description: "The total number of customer contacts (calls, chats, emails) expected during the week. This is a key driver for staffing requirements.",
      impact: "Higher volume directly increases the required headcount. Volume is distributed according to the volume distribution mix based on teams."
    },
    aht: {
      title: "Average Handle Time (AHT)",
      description: "The average time in seconds an agent spends handling a customer contact, including talk time, hold time, and after-call work.",
      impact: "Longer AHT means agents can handle fewer contacts per hour, increasing required headcount."
    },
    shrinkage: {
      title: "Shrinkage",
      description: "The percentage of paid time that agents are not available to handle contacts due to breaks, training, meetings, time off, etc.",
      impact: "Higher shrinkage rates mean you need more agents to cover the same contact volume."
    },
    occupancy: {
      title: "Occupancy",
      description: "The percentage of logged-in time that agents spend actively handling contacts. Target typically ranges from 75-85%.",
      impact: "Lower occupancy targets improve agent experience but require more headcount."
    },
    attrition: {
      title: "Attrition",
      description: "The percentage of agents expected to leave the company during the period. Accounts for ongoing hiring needs.",
      impact: "Higher attrition increases the need for additional headcount to maintain service levels."
    },
    required: {
      title: "Required Headcount",
      description: "The calculated number of agents needed based on volume, AHT, shrinkage, occupancy, and attrition.",
      impact: "Changes to assumptions will affect the required headcount calculation."
    },
    actual: {
      title: "Actual Headcount",
      description: "The actual number of agents currently employed or planned for the period based on team allocations.",
      impact: "Actual headcount is distributed according to team volume distribution mix."
    },
    ou: {
      title: "Over/Under (O/U)",
      description: "The difference between actual and required headcount, indicating surplus or deficit in staffing.",
      impact: "Negative values indicate understaffing, which may impact service quality. Positive values indicate overstaffing, which increases costs."
    }
  };

  // Function to generate a date string for a Saturday in a specific week
  const getSaturdayDateForWeek = (weekNumber: number): string => {
    const currentYear = new Date().getFullYear();
    // January 1st of the current year
    const firstDayOfYear = new Date(currentYear, 0, 1);
    // Calculate days to first Saturday
    const dayOfWeek = firstDayOfYear.getDay(); // 0 = Sunday, 6 = Saturday
    const daysToFirstSaturday = (6 - dayOfWeek + 7) % 7;
    
    // First Saturday of the year
    const firstSaturday = new Date(currentYear, 0, 1 + daysToFirstSaturday);
    
    // Add (weekNumber - 1) * 7 days to get to the Saturday of the specified week
    const targetSaturday = new Date(firstSaturday);
    targetSaturday.setDate(firstSaturday.getDate() + (weekNumber - 1) * 7);
    
    // Format as "DD-MMM-YY" (e.g., "03-Feb-25")
    const day = targetSaturday.getDate().toString().padStart(2, '0');
    const month = targetSaturday.toLocaleString('en-US', { month: 'short' });
    const year = targetSaturday.getFullYear() % 100; // Get last 2 digits of year
    
    return `${day}-${month.toLowerCase()}-${year}`;
  };

  // Initialize or update week data
  useEffect(() => {
    // Create week data for the period range
    const newWeekData: WeekData[] = [];
    
    // Generate weeks for the period (in natural order - most recent first to oldest)
    for (let week = periodEnd; week >= periodStart; week--) {
      const date = getSaturdayDateForWeek(week);
      
      newWeekData.push({
        date,
        volume: 5000, // Default volume (could come from API)
        aht: 300, // in seconds
        shrinkage: 0.3, // 30%
        occupancy: 0.85, // 85%
        attrition: 0.05, // 5%
        actual: 30 // Default actual headcount
      });
    }
    
    setWeekData(newWeekData);
  }, [periodStart, periodEnd]);

  // Calculate Required HC based on formula
  const calculateRequired = (data: WeekData): number => {
    // Total Handling Time = Volume × AHT (in seconds)
    const totalHandlingTime = data.volume * data.aht;
    
    // Effective Minutes per Agent per Week = 480 × Occupancy × (1 − Shrinkage) × (1 − Attrition)
    // 480 minutes = 8 hours per day * 60 minutes * 5 days per week
    const effectiveMinutesPerAgent = 480 * 5 * data.occupancy * (1 - data.shrinkage) * (1 - data.attrition);
    
    // Convert total handling time from seconds to minutes
    const totalHandlingTimeMinutes = totalHandlingTime / 60;
    
    // Required HC = Total Handling Time / Effective Minutes per Agent
    const required = Math.ceil(totalHandlingTimeMinutes / effectiveMinutesPerAgent);
    
    return required;
  };

  // Calculate O/U (Over/Under)
  const calculateOU = (actual: number, required: number): number => {
    return actual - required;
  };

  // Handle changes to assumption inputs
  const handleInputChange = (index: number, field: keyof WeekData, value: string) => {
    const newWeekData = [...weekData];
    
    // Convert percentages (stored as decimal)
    if (field === 'shrinkage' || field === 'occupancy' || field === 'attrition') {
      newWeekData[index][field] = parseFloat(value) / 100;
    } else {
      // Use specific type for each field to avoid type errors
      if (field === 'volume' || field === 'aht' || field === 'actual') {
        newWeekData[index][field] = parseFloat(value);
      }
    }
    
    setWeekData(newWeekData);
  };

  // Add week to the period
  const addWeek = () => {
    setPeriodEnd(periodEnd + 1);
  };

  // Remove week from the period
  const removeWeek = () => {
    if (periodEnd > periodStart + 1) {
      setPeriodEnd(periodEnd - 1);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    // In a real implementation, use a library like xlsx or exceljs
    console.log("Exporting data to Excel:", weekData);
    
    // Create CSV content
    const headerRow = ["Date", "Volume", "AHT", "Shrinkage", "Occupancy", "Attrition", "Required", "Actual", "O/U"];
    const csvRows = [headerRow.join(",")];
    
    weekData.forEach(week => {
      const required = calculateRequired(week);
      const ou = calculateOU(week.actual, required);
      
      const row = [
        week.date,
        week.volume,
        week.aht,
        (week.shrinkage * 100).toFixed(0),
        (week.occupancy * 100).toFixed(0),
        (week.attrition * 100).toFixed(0),
        required,
        week.actual,
        ou
      ];
      csvRows.push(row.join(","));
    });
    
    // Create and trigger download
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workforce_planning_${businessUnit}_${lob.replace(" ", "_")}_weeks_${periodStart}-${periodEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle expanded view
  const toggleExpandedView = () => {
    setExpandedView(!expandedView);
  };

  // Helper function to render metric label with info tooltip
  const renderMetricLabel = (metricKey: keyof typeof metricExplanations) => {
    const metric = metricExplanations[metricKey];
    return (
      <div className="flex items-center gap-1">
        <span>{metric.title}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Info about {metric.title}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm bg-background border shadow-lg">
              <div className="space-y-2 p-1">
                <h4 className="font-medium">{metric.title}</h4>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
                <p className="text-sm font-medium">Impact: {metric.impact}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const renderPlanningTable = () => (
    <div className="overflow-x-auto bg-card dark:bg-card rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32 bg-muted dark:bg-muted sticky left-0 z-10">Metric</TableHead>
            {weekData.map((week, index) => (
              <TableHead 
                key={index} 
                className="text-center bg-muted dark:bg-muted font-medium"
              >
                {week.date}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Volume Row */}
          <TableRow>
            <TableCell colSpan={weekData.length + 1} className="bg-blue-100 font-medium dark:bg-blue-950 dark:text-blue-200">
              Volume
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('volume')}
            </TableCell>
            {weekData.map((week, index) => (
              <TableCell 
                key={`volume-${index}`} 
                className="text-center border"
              >
                <Input 
                  type="number"
                  value={week.volume}
                  onChange={(e) => handleInputChange(index, 'volume', e.target.value)}
                  className="w-24 text-center mx-auto"
                />
              </TableCell>
            ))}
          </TableRow>

          {/* Assumptions Section */}
          <TableRow>
            <TableCell colSpan={weekData.length + 1} className="bg-green-100 font-medium dark:bg-green-950 dark:text-green-200">
              Assumptions
            </TableCell>
          </TableRow>
          
          {/* AHT Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('aht')}
            </TableCell>
            {weekData.map((week, index) => (
              <TableCell 
                key={`aht-${index}`} 
                className="text-center border"
              >
                <Input 
                  type="number"
                  value={week.aht}
                  onChange={(e) => handleInputChange(index, 'aht', e.target.value)}
                  className="w-24 text-center mx-auto"
                />
              </TableCell>
            ))}
          </TableRow>
          
          {/* Shrinkage Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('shrinkage')}
            </TableCell>
            {weekData.map((week, index) => (
              <TableCell 
                key={`shrinkage-${index}`} 
                className="text-center border"
              >
                <Input 
                  type="number"
                  value={(week.shrinkage * 100).toFixed(0)}
                  onChange={(e) => handleInputChange(index, 'shrinkage', e.target.value)}
                  className="w-24 text-center mx-auto"
                />
              </TableCell>
            ))}
          </TableRow>
          
          {/* Occupancy Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('occupancy')}
            </TableCell>
            {weekData.map((week, index) => (
              <TableCell 
                key={`occupancy-${index}`} 
                className="text-center border"
              >
                <Input 
                  type="number"
                  value={(week.occupancy * 100).toFixed(0)}
                  onChange={(e) => handleInputChange(index, 'occupancy', e.target.value)}
                  className="w-24 text-center mx-auto"
                />
              </TableCell>
            ))}
          </TableRow>
          
          {/* Attrition Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('attrition')}
            </TableCell>
            {weekData.map((week, index) => (
              <TableCell 
                key={`attrition-${index}`} 
                className="text-center border"
              >
                <Input 
                  type="number"
                  value={(week.attrition * 100).toFixed(0)}
                  onChange={(e) => handleInputChange(index, 'attrition', e.target.value)}
                  className="w-24 text-center mx-auto"
                />
              </TableCell>
            ))}
          </TableRow>
          
          {/* Factors Section */}
          <TableRow>
            <TableCell colSpan={weekData.length + 1} className="bg-pink-100 font-medium dark:bg-pink-950 dark:text-pink-200">
              Factors
            </TableCell>
          </TableRow>
          
          {/* Required Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('required')}
            </TableCell>
            {weekData.map((week, index) => {
              const required = calculateRequired(week);
              return (
                <TableCell 
                  key={`required-${index}`} 
                  className="text-center border font-medium bg-muted dark:bg-muted"
                >
                  {required}
                </TableCell>
              );
            })}
          </TableRow>
          
          {/* Actual Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('actual')}
            </TableCell>
            {weekData.map((week, index) => (
              <TableCell 
                key={`actual-${index}`} 
                className="text-center border"
              >
                <Input 
                  type="number"
                  value={week.actual}
                  onChange={(e) => handleInputChange(index, 'actual', e.target.value)}
                  className="w-24 text-center mx-auto"
                />
              </TableCell>
            ))}
          </TableRow>
          
          {/* O/U Row */}
          <TableRow>
            <TableCell className="font-medium border sticky left-0 bg-card dark:bg-card">
              {renderMetricLabel('ou')}
            </TableCell>
            {weekData.map((week, index) => {
              const required = calculateRequired(week);
              const overUnder = calculateOU(week.actual, required);
              return (
                <TableCell 
                  key={`ou-${index}`} 
                  className={`text-center border font-medium ${
                    overUnder < 0 ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950' : 
                    overUnder > 0 ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {overUnder}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="p-4 shadow-lg bg-card dark:border-gray-700">
      <CardHeader className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <CardTitle className="text-xl font-semibold">Workforce Planning</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleExpandedView}
            className="transition-all duration-200"
          >
            {expandedView ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Unit</label>
            <Select 
              value={businessUnit} 
              onValueChange={setBusinessUnit}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Business Unit" />
              </SelectTrigger>
              <SelectContent>
                {businessUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Line of Business</label>
            <Select 
              value={lob} 
              onValueChange={setLob}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select LoB" />
              </SelectTrigger>
              <SelectContent>
                {lobOptions[businessUnit as keyof typeof lobOptions]?.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Period</label>
            <div className="flex items-center space-x-2">
              <Input 
                value={`Week ${periodStart.toString().padStart(2, '0')} – Week ${periodEnd.toString().padStart(2, '0')}`}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={removeWeek} disabled={periodEnd <= periodStart + 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={addWeek}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Render the planning table or show the expanded view dialog */}
        {expandedView ? (
          <Dialog open={expandedView} onOpenChange={setExpandedView}>
            <DialogContent className="max-w-screen-xl w-[90vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex justify-between items-center">
                  <span>Workforce Planning - {businessUnit} / {lob}</span>
                  <Button variant="outline" size="icon" onClick={() => setExpandedView(false)}>
                    <Minimize className="h-4 w-4" />
                  </Button>
                </DialogTitle>
                <DialogDescription>
                  Period: Week {periodStart.toString().padStart(2, '0')} – Week {periodEnd.toString().padStart(2, '0')}
                </DialogDescription>
              </DialogHeader>
              {renderPlanningTable()}
            </DialogContent>
          </Dialog>
        ) : (
          renderPlanningTable()
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>* Calculation: Required HC = (Volume × AHT) / (60 × 480 × 5 × Occupancy × (1-Shrinkage) × (1-Attrition))</p>
          <p>* O/U = Actual - Required</p>
        </div>
      </CardContent>
    </Card>
  );
};
