
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const IntradayForecast: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [viewType, setViewType] = useState('daily');
  
  // Generate time intervals (30-minute slots)
  const timeIntervals = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour}:${minute}`;
  });
  
  // Days of week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Sample intraday forecast data for a channel (e.g., Voice)
  // In real app, this would be calculated based on volume distribution and assumptions
  const intradayVoiceData = {
    sunday: generateRandomIntradayData(0.4), // Lower volume on Sunday
    monday: generateRandomIntradayData(1.0), // Full volume on Monday
    tuesday: generateRandomIntradayData(0.9),
    wednesday: generateRandomIntradayData(0.8),
    thursday: generateRandomIntradayData(0.9),
    friday: generateRandomIntradayData(0.7),
    saturday: generateRandomIntradayData(0.5), // Lower volume on Saturday
  };
  
  const intradayChatData = {
    sunday: generateRandomIntradayData(0.3),
    monday: generateRandomIntradayData(0.9),
    tuesday: generateRandomIntradayData(0.8),
    wednesday: generateRandomIntradayData(0.7),
    thursday: generateRandomIntradayData(0.8),
    friday: generateRandomIntradayData(0.6),
    saturday: generateRandomIntradayData(0.4),
  };
  
  const intradayEmailData = {
    sunday: generateRandomIntradayData(0.2),
    monday: generateRandomIntradayData(0.8),
    tuesday: generateRandomIntradayData(0.9),
    wednesday: generateRandomIntradayData(0.7),
    thursday: generateRandomIntradayData(0.6),
    friday: generateRandomIntradayData(0.5),
    saturday: generateRandomIntradayData(0.2),
  };
  
  // Helper function to generate random intraday data with a realistic pattern
  function generateRandomIntradayData(volumeMultiplier: number) {
    return timeIntervals.map((time) => {
      const [hour, minute] = time.split(':').map(Number);
      const timePoint = hour + minute / 60;
      
      // Create a curve that peaks during business hours (9am-5pm)
      let volume = 0;
      if (timePoint >= 9 && timePoint <= 17) {
        // Peak between 10am and 3pm
        const normalizedTime = (timePoint - 9) / 8; // 0 to 1 for business hours
        volume = 10 + 50 * Math.sin(normalizedTime * Math.PI);
      } else if (timePoint >= 7 && timePoint < 9) {
        // Ramp up in the morning
        volume = 5 + (timePoint - 7) * 10;
      } else if (timePoint > 17 && timePoint <= 20) {
        // Decline in the evening
        volume = 10 + (20 - timePoint) * 10;
      } else {
        // Overnight has minimal volume
        volume = Math.random() * 5;
      }
      
      // Apply the day's volume multiplier and round to whole number
      return Math.round(volume * volumeMultiplier);
    });
  }
  
  // Calculate daily totals for weekly view
  const calculateDailyTotals = (data: Record<string, number[]>) => {
    return Object.keys(data).map(day => ({
      day,
      total: data[day].reduce((sum, value) => sum + value, 0),
    }));
  };
  
  const voiceDailyTotals = calculateDailyTotals(intradayVoiceData);
  const chatDailyTotals = calculateDailyTotals(intradayChatData);
  const emailDailyTotals = calculateDailyTotals(intradayEmailData);
  
  // Helper function to format time interval
  const formatTimeInterval = (interval: string, nextInterval?: string) => {
    if (nextInterval) {
      return `${interval} - ${nextInterval}`;
    }
    const [hour, minute] = interval.split(':');
    const nextHour = minute === '30' ? String((parseInt(hour) + 1) % 24).padStart(2, '0') : hour;
    const nextMinute = minute === '30' ? '00' : '30';
    return `${interval} - ${nextHour}:${nextMinute}`;
  };
  
  // Content for daily view
  const renderDailyView = () => {
    const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
    const dayLabel = dayLabels[selectedDayIndex];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Showing 30-minute intervals for <span className="font-medium">{dayLabel}</span></p>
          
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day, idx) => (
                <SelectItem key={day} value={day}>{dayLabels[idx]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-32">Time Interval</TableHead>
                    <TableHead>Voice Volume</TableHead>
                    <TableHead>Voice Required Agents</TableHead>
                    <TableHead>Chat Volume</TableHead>
                    <TableHead>Chat Required Agents</TableHead>
                    <TableHead>Email Volume</TableHead>
                    <TableHead>Email Required Agents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeIntervals.map((interval, idx) => {
                    const voiceVolume = intradayVoiceData[selectedDay][idx];
                    const chatVolume = intradayChatData[selectedDay][idx];
                    const emailVolume = intradayEmailData[selectedDay][idx];
                    
                    // Calculate required agents based on volume and productivity assumptions
                    // Using simple formulas as placeholders - in a real app, this would use the actual assumptions
                    const voiceAgents = Math.ceil(voiceVolume / 8); // Assuming 8 calls per agent per 30 min
                    const chatAgents = Math.ceil(chatVolume / 5); // Assuming 5 chats per agent per 30 min
                    const emailAgents = Math.ceil(emailVolume / 3); // Assuming 3 emails per agent per 30 min
                    
                    return (
                      <TableRow key={interval} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                        <TableCell className="font-medium">
                          {formatTimeInterval(interval, timeIntervals[idx + 1])}
                        </TableCell>
                        <TableCell>{voiceVolume}</TableCell>
                        <TableCell>{voiceAgents}</TableCell>
                        <TableCell>{chatVolume}</TableCell>
                        <TableCell>{chatAgents}</TableCell>
                        <TableCell>{emailVolume}</TableCell>
                        <TableCell>{emailAgents}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Content for weekly view
  const renderWeeklyView = () => {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Voice Volume</TableHead>
                <TableHead>Voice Avg Agents</TableHead>
                <TableHead>Chat Volume</TableHead>
                <TableHead>Chat Avg Agents</TableHead>
                <TableHead>Email Volume</TableHead>
                <TableHead>Email Avg Agents</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead>Total Avg Agents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daysOfWeek.map((day, idx) => {
                const voiceTotal = voiceDailyTotals[idx].total;
                const chatTotal = chatDailyTotals[idx].total;
                const emailTotal = emailDailyTotals[idx].total;
                const totalVolume = voiceTotal + chatTotal + emailTotal;
                
                // Calculate average agents needed throughout the day
                const voiceAvgAgents = Math.ceil(voiceTotal / (48 * 8)); // 48 intervals, 8 calls per agent per interval
                const chatAvgAgents = Math.ceil(chatTotal / (48 * 5));
                const emailAvgAgents = Math.ceil(emailTotal / (48 * 3));
                const totalAvgAgents = voiceAvgAgents + chatAvgAgents + emailAvgAgents;
                
                return (
                  <TableRow key={day}>
                    <TableCell className="font-medium">{dayLabels[idx]}</TableCell>
                    <TableCell>{voiceTotal}</TableCell>
                    <TableCell>{voiceAvgAgents}</TableCell>
                    <TableCell>{chatTotal}</TableCell>
                    <TableCell>{chatAvgAgents}</TableCell>
                    <TableCell>{emailTotal}</TableCell>
                    <TableCell>{emailAvgAgents}</TableCell>
                    <TableCell className="font-medium">{totalVolume}</TableCell>
                    <TableCell className="font-medium">{totalAvgAgents}</TableCell>
                  </TableRow>
                );
              })}
              
              {/* Total row */}
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="font-medium">
                  {voiceDailyTotals.reduce((sum, day) => sum + day.total, 0)}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell className="font-medium">
                  {chatDailyTotals.reduce((sum, day) => sum + day.total, 0)}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell className="font-medium">
                  {emailDailyTotals.reduce((sum, day) => sum + day.total, 0)}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell className="font-bold">
                  {voiceDailyTotals.reduce((sum, day) => sum + day.total, 0) +
                    chatDailyTotals.reduce((sum, day) => sum + day.total, 0) +
                    emailDailyTotals.reduce((sum, day) => sum + day.total, 0)}
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Intraday Volume & Required Agents</h3>
        <Tabs value={viewType} onValueChange={setViewType} className="w-[200px]">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {viewType === 'daily' ? renderDailyView() : renderWeeklyView()}
      
      <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
        <p>
          <span className="font-medium">Note:</span> This forecast distributes weekly volume across 30-minute intervals 
          based on historical patterns. Required agents are calculated using productivity assumptions: 
          Voice (8 calls per agent per 30 min), Chat (5 chats), and Email (3 emails).
        </p>
      </div>
    </div>
  );
};
