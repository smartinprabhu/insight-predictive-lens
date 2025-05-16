
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Plus, Minus } from "lucide-react";
import { formatPercentage } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
  const lobOptions = {
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

  // Initialize or update week data
  useEffect(() => {
    // Create week data for the period range
    const currentYear = new Date().getFullYear();
    const newWeekData: WeekData[] = [];
    
    // Generate weeks for the period (in reverse order - most recent first)
    for (let week = periodEnd; week >= periodStart; week--) {
      const weekNumber = week.toString().padStart(2, '0');
      // Simple date calculation (approximate - just for display)
      const date = `${weekNumber}-Mar`;
      
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
  const calculateRequired = (data: WeekData) => {
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
  const calculateOU = (actual: number, required: number) => {
    return actual - required;
  };

  // Handle changes to assumption inputs
  const handleInputChange = (index: number, field: keyof WeekData, value: string) => {
    const newWeekData = [...weekData];
    
    // Convert percentages (stored as decimal)
    if (field === 'shrinkage' || field === 'occupancy' || field === 'attrition') {
      newWeekData[index][field] = parseFloat(value) / 100;
    } else {
      newWeekData[index][field] = parseFloat(value);
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

  // Export to Excel (simplified - would need a proper Excel export library for production)
  const exportToExcel = () => {
    // In a real implementation, use a library like xlsx or exceljs
    console.log("Exporting data to Excel:", weekData);
    alert("Export functionality would save an Excel file with the current planning data.");
  };

  return (
    <Card className="p-4 shadow-lg">
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

      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export to Excel
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 bg-gray-100 sticky left-0 z-10">Metric</TableHead>
              {weekData.map((week, index) => (
                <TableHead 
                  key={index} 
                  className="text-center bg-gray-100 font-medium"
                >
                  {week.date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Volume Row */}
            <TableRow>
              <TableCell colSpan={weekData.length + 1} className="bg-blue-100 font-medium">
                Volume
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium border sticky left-0 bg-white">Volume (Contacts)</TableCell>
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
              <TableCell colSpan={weekData.length + 1} className="bg-green-100 font-medium">
                Assumptions
              </TableCell>
            </TableRow>
            
            {/* AHT Row */}
            <TableRow>
              <TableCell className="font-medium border sticky left-0 bg-white">AHT (seconds)</TableCell>
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
              <TableCell className="font-medium border sticky left-0 bg-white">Shrinkage (%)</TableCell>
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
              <TableCell className="font-medium border sticky left-0 bg-white">Occupancy (%)</TableCell>
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
              <TableCell className="font-medium border sticky left-0 bg-white">Attrition (%)</TableCell>
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
              <TableCell colSpan={weekData.length + 1} className="bg-pink-100 font-medium">
                Factors
              </TableCell>
            </TableRow>
            
            {/* Required Row */}
            <TableRow>
              <TableCell className="font-medium border sticky left-0 bg-white">Required (HC)</TableCell>
              {weekData.map((week, index) => {
                const required = calculateRequired(week);
                return (
                  <TableCell 
                    key={`required-${index}`} 
                    className="text-center border font-medium bg-gray-50"
                  >
                    {required}
                  </TableCell>
                );
              })}
            </TableRow>
            
            {/* Actual Row */}
            <TableRow>
              <TableCell className="font-medium border sticky left-0 bg-white">Actual (HC)</TableCell>
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
              <TableCell className="font-medium border sticky left-0 bg-white">O/U</TableCell>
              {weekData.map((week, index) => {
                const required = calculateRequired(week);
                const overUnder = calculateOU(week.actual, required);
                return (
                  <TableCell 
                    key={`ou-${index}`} 
                    className={`text-center border font-medium ${
                      overUnder < 0 ? 'text-red-600 bg-red-50' : 
                      overUnder > 0 ? 'text-green-600 bg-green-50' : 
                      'text-gray-600'
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

      <div className="mt-4 text-sm text-gray-500">
        <p>* Calculation: Required HC = (Volume × AHT) / (60 × 480 × 5 × Occupancy × (1-Shrinkage) × (1-Attrition))</p>
        <p>* O/U = Actual - Required</p>
      </div>
    </Card>
  );
};

