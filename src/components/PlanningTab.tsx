
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlanningGrid from '@/components/PlanningGrid';

// Types for planning data
interface WeekData {
  date: string;
  volume: number;
  aht: number;
  shrinkage: number;
  occupancy: number;
  attrition: number;
  actual: number;
}

interface MetricExplanation {
  title: string;
  description: string;
  impact: string;
}

const PlanningTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  
  // Initialize with sample data
  useEffect(() => {
    const sampleData = [
      {
        date: '2023-W1',
        volume: 5000,
        aht: 300, // in seconds
        shrinkage: 0.2, // 20%
        occupancy: 0.85, // 85%
        attrition: 0.05, // 5%
        actual: 50
      },
      {
        date: '2023-W2',
        volume: 5500,
        aht: 290,
        shrinkage: 0.18,
        occupancy: 0.86,
        attrition: 0.05,
        actual: 52
      },
      {
        date: '2023-W3',
        volume: 6000,
        aht: 295,
        shrinkage: 0.19,
        occupancy: 0.87,
        attrition: 0.04,
        actual: 54
      }
    ];
    
    setWeekData(sampleData);
  }, []);
  
  // Metric explanations with detailed information
  const metricExplanations: Record<string, MetricExplanation> = {
    volume: {
      title: 'Volume',
      description: 'Total number of customer interactions expected during the week.',
      impact: 'Higher volume requires more staff to maintain service levels.'
    },
    aht: {
      title: 'Average Handling Time (AHT)',
      description: 'The average time (in seconds) it takes to handle a single customer interaction.',
      impact: 'Longer handling times require more staff to maintain service levels.'
    },
    shrinkage: {
      title: 'Shrinkage',
      description: 'The percentage of time that agents are paid but not available to handle contacts (training, breaks, meetings, etc.).',
      impact: 'Higher shrinkage percentages require more staff to maintain service levels.'
    },
    occupancy: {
      title: 'Occupancy',
      description: 'The percentage of time that agents spend handling contacts versus waiting for contacts.',
      impact: 'Target occupancy affects agent utilization and burnout rates.'
    },
    attrition: {
      title: 'Attrition',
      description: 'The percentage of agents expected to leave during the time period.',
      impact: 'Higher attrition requires more hiring and training resources.'
    },
    required: {
      title: 'Required Headcount',
      description: 'The calculated number of agents needed based on volume, AHT, shrinkage, and occupancy targets.',
      impact: 'Key planning metric for budgeting and hiring decisions.'
    },
    actual: {
      title: 'Actual Headcount',
      description: 'The actual number of agents available during the time period.',
      impact: 'Compare with required headcount to identify potential service risks.'
    },
    ou: {
      title: 'Over/Under',
      description: 'The difference between actual and required headcount.',
      impact: 'Positive numbers indicate overstaffing, negative numbers indicate understaffing.'
    }
  };

  // Handle data changes in the grid
  const handleDataChange = (weekIndex: number, field: keyof WeekData, value: string) => {
    setWeekData(prev => {
      const newData = [...prev];
      let parsedValue: number;
      
      // Handle percentage values (convert from percentage to decimal)
      if (field === 'shrinkage' || field === 'occupancy' || field === 'attrition') {
        parsedValue = parseInt(value) / 100;
      } else {
        parsedValue = parseInt(value);
      }
      
      if (!isNaN(parsedValue)) {
        newData[weekIndex] = {
          ...newData[weekIndex],
          [field]: parsedValue
        };
      }
      
      return newData;
    });
  };

  return (
    <div className="space-y-4">
      <Tabs 
        defaultValue="current" 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <PlanningGrid 
                weekData={weekData}
                metricExplanations={metricExplanations}
                onDataChange={handleDataChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Forecast data will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningTab;
