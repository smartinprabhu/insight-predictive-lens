
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const GlobalFilters: React.FC = () => {
  const [timeInterval, setTimeInterval] = useState('week');
  const [dateRange, setDateRange] = useState('6/4 - 7/1'); // Example date range
  
  // Business unit options - these would come from your data
  const businessUnits = ["WFS", "WCS", "ATS", "CAS"];
  const channels = ["All channels", "Voice", "Chat", "Email"];
  const queues = ["All queues", "Sales", "Support", "Technical", "Billing"];
  const sites = ["All sites", "Site A", "Site B", "Site C"];
  const schedules = ["Default Schedule", "Schedule A", "Schedule B", "Schedule C"];

  return (
    <Card className="bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-sm font-medium">Time interval</span>
              <Tabs value={timeInterval} onValueChange={setTimeInterval} className="mt-1">
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-3 py-1">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3 py-1">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <span className="sr-only">Previous period</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
              
              <div className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-xs font-medium ring-offset-background">
                {dateRange}
              </div>
              
              <Button variant="outline" size="icon" className="h-8 w-8">
                <span className="sr-only">Next period</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <span className="text-sm font-medium">Channels</span>
              <Select defaultValue={channels[0]}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel} value={channel} className="text-xs">{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <span className="text-sm font-medium">Queues</span>
              <Select defaultValue={queues[0]}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select queue" />
                </SelectTrigger>
                <SelectContent>
                  {queues.map((queue) => (
                    <SelectItem key={queue} value={queue} className="text-xs">{queue}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <span className="text-sm font-medium">Sites</span>
              <Select defaultValue={sites[0]}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site} value={site} className="text-xs">{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <span className="text-sm font-medium">Schedule</span>
              <Select defaultValue={schedules[0]}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule} value={schedule} className="text-xs">{schedule}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Select defaultValue="group-by-sites">
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Group by sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group-by-sites" className="text-xs">Group by sites</SelectItem>
              <SelectItem value="group-by-channels" className="text-xs">Group by channels</SelectItem>
              <SelectItem value="group-by-queues" className="text-xs">Group by queues</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by</span>
            <Select defaultValue="site-name">
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Site name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site-name" className="text-xs">Site name</SelectItem>
                <SelectItem value="volume" className="text-xs">Volume</SelectItem>
                <SelectItem value="headcount" className="text-xs">Headcount</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="lowest-first">
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Lowest first" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lowest-first" className="text-xs">Lowest first</SelectItem>
                <SelectItem value="highest-first" className="text-xs">Highest first</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="h-8 text-xs">
              View options
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
