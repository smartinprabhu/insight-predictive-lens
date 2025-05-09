
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlanningTabProps {
  data?: any[];
}

export const PlanningTab: React.FC<PlanningTabProps> = ({ data }) => {
  const [businessUnit, setBusinessUnit] = useState("WFS");
  const [lob, setLob] = useState("US Phone");
  const [period, setPeriod] = useState("Week 03 – Week 08");

  // Sample data - in a real app, this would come from API or props
  const dates = ["08-May", "01-May", "08-May", "01-May", "08-May", "01-May", "08-May", "01-May", "08-May", "01-May", "08-May"];
  const assumptions = [
    { name: "AHT", values: Array(11).fill("30%") },
    { name: "Shrinkages", values: Array(11).fill("30%") },
    { name: "Occupancy", values: Array(11).fill("30%") },
    { name: "Attrition", values: Array(11).fill("30%") }
  ];
  const factors = [
    { name: "Required", values: ["23", ...Array(10).fill("30")] },
    { name: "Actual", values: Array(11).fill("30") },
    { name: "O/U", values: Array(11).fill("30") }
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium min-w-32">Business Unit</span>
          <input 
            type="text" 
            value={businessUnit} 
            onChange={(e) => setBusinessUnit(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium min-w-32">LoB</span>
          <input 
            type="text" 
            value={lob} 
            onChange={(e) => setLob(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium min-w-32">Period</span>
          <input 
            type="text" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32"></TableHead>
              {dates.map((date, index) => (
                <TableHead 
                  key={index} 
                  className="text-center bg-gray-200 font-medium"
                >
                  {date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={12} className="bg-green-100 font-medium">
                Assumptions
              </TableCell>
            </TableRow>
            
            {assumptions.map((row, rowIndex) => (
              <TableRow key={`assumption-${rowIndex}`}>
                <TableCell className="font-medium border">{row.name}</TableCell>
                {row.values.map((value, cellIndex) => (
                  <TableCell 
                    key={`assumption-cell-${rowIndex}-${cellIndex}`} 
                    className="text-center border bg-gray-100"
                  >
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            <TableRow>
              <TableCell colSpan={12} className="bg-pink-100 font-medium">
                Factors
              </TableCell>
            </TableRow>
            
            {factors.map((row, rowIndex) => (
              <TableRow key={`factor-${rowIndex}`}>
                <TableCell className="font-medium border">{row.name}</TableCell>
                {row.values.map((value, cellIndex) => (
                  <TableCell 
                    key={`factor-cell-${rowIndex}-${cellIndex}`} 
                    className="text-center border bg-gray-100"
                  >
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
