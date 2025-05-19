import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PipelineData {
  week: string;
  startingHC: number;
  newHires: number;
  trainingStarts: number;
  trainingCompletions: number;
  transfersIn: number;
  transfersOut: number;
  attritionRate: number;
  attritionHC: number;
  endingHC: number;
}

export const RecruitmentPipeline: React.FC = () => {
  // Sample data for the recruitment pipeline
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([
    {
      week: 'Week 23',
      startingHC: 320,
      newHires: 15,
      trainingStarts: 20,
      trainingCompletions: 18,
      transfersIn: 2,
      transfersOut: 1,
      attritionRate: 1.5,
      attritionHC: 5,
      endingHC: 331
    },
    {
      week: 'Week 24',
      startingHC: 331,
      newHires: 10,
      trainingStarts: 15,
      trainingCompletions: 14,
      transfersIn: 3,
      transfersOut: 2,
      attritionRate: 1.7,
      attritionHC: 6,
      endingHC: 336
    },
    {
      week: 'Week 25',
      startingHC: 336,
      newHires: 12,
      trainingStarts: 18,
      trainingCompletions: 16,
      transfersIn: 1,
      transfersOut: 3,
      attritionRate: 1.2,
      attritionHC: 4,
      endingHC: 342
    },
    {
      week: 'Week 26',
      startingHC: 342,
      newHires: 8,
      trainingStarts: 12,
      trainingCompletions: 10,
      transfersIn: 2,
      transfersOut: 1,
      attritionRate: 1.8,
      attritionHC: 6,
      endingHC: 345
    }
  ]);
  
  // Sample data for pipeline flow chart
  const pipelineFlowData = [
    { name: 'Week 23', 'New Hires': 15, 'Training Starts': 20, 'Training Completions': 18, 'Attrition': 5 },
    { name: 'Week 24', 'New Hires': 10, 'Training Starts': 15, 'Training Completions': 14, 'Attrition': 6 },
    { name: 'Week 25', 'New Hires': 12, 'Training Starts': 18, 'Training Completions': 16, 'Attrition': 4 },
    { name: 'Week 26', 'New Hires': 8, 'Training Starts': 12, 'Training Completions': 10, 'Attrition': 6 },
  ];
  
  // Throughput metrics
  const throughputMetrics = {
    trainingThroughput: 85, // (Week 4 Training Completions ÷ Requested Trainees) * 100
    hiringThroughput: 92, // (Hires Received ÷ Requested Hires) * 100
  };

  // Helper to update a field in the pipeline data
  const updateField = (weekIndex: number, field: keyof PipelineData, value: number) => {
    const updatedData = [...pipelineData];
    updatedData[weekIndex] = {
      ...updatedData[weekIndex],
      [field]: value
    };
    
    // Recalculate attritionHC if attritionRate changes
    if (field === 'attritionRate') {
      updatedData[weekIndex].attritionHC = Math.round(updatedData[weekIndex].startingHC * (value / 100));
    }
    
    // Recalculate ending HC for this week and update starting HC for subsequent weeks
    for (let i = weekIndex; i < updatedData.length; i++) {
      if (i === weekIndex) {
        // Update ending HC for current week
        updatedData[i].endingHC = 
          updatedData[i].startingHC + 
          updatedData[i].newHires + 
          updatedData[i].transfersIn + 
          updatedData[i].trainingCompletions - 
          updatedData[i].attritionHC - 
          updatedData[i].transfersOut;
      }
      
      // Update starting HC for next week
      if (i + 1 < updatedData.length) {
        updatedData[i + 1] = {
          ...updatedData[i + 1],
          startingHC: updatedData[i].endingHC
        };
      }
    }
    
    setPipelineData(updatedData);
  };

  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Headcount Pipeline Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="New Hires" fill="#8884d8" />
              <Bar dataKey="Training Starts" fill="#82ca9d" />
              <Bar dataKey="Training Completions" fill="#ffc658" />
              <Bar dataKey="Attrition" fill="#ff7f50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pipeline & Attrition Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Starting HC</TableHead>
                <TableHead>New Hires</TableHead>
                <TableHead>Training Starts</TableHead>
                <TableHead>Training Completions</TableHead>
                <TableHead>Transfers In</TableHead>
                <TableHead>Transfers Out</TableHead>
                <TableHead>Attrition Rate (%)</TableHead>
                <TableHead>Attrition HC</TableHead>
                <TableHead>Ending HC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelineData.map((row, rowIndex) => (
                <TableRow key={row.week}>
                  <TableCell className="font-medium">{row.week}</TableCell>
                  <TableCell>{row.startingHC}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.newHires}
                      onChange={(e) => updateField(rowIndex, 'newHires', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.trainingStarts}
                      onChange={(e) => updateField(rowIndex, 'trainingStarts', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.trainingCompletions}
                      onChange={(e) => updateField(rowIndex, 'trainingCompletions', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.transfersIn}
                      onChange={(e) => updateField(rowIndex, 'transfersIn', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.transfersOut}
                      onChange={(e) => updateField(rowIndex, 'transfersOut', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.attritionRate}
                      step="0.1"
                      onChange={(e) => updateField(rowIndex, 'attritionRate', parseFloat(e.target.value) || 0)}
                      className="h-8 w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>{row.attritionHC}</TableCell>
                  <TableCell className="font-medium">{row.endingHC}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-500">
                {throughputMetrics.trainingThroughput}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Training Completions ÷ Requested Trainees
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Hiring Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-bold text-green-600 dark:text-green-500">
                {throughputMetrics.hiringThroughput}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Hires Received ÷ Requested Hires
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
