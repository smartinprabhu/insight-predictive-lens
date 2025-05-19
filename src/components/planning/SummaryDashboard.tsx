
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const SummaryDashboard: React.FC = () => {
  // Sample data for charts - in a real app, this would come from state/props
  const weeklyData = [
    { 
      week: 'Week 23',
      required: 71452,
      available: 69798, 
      shortage: 1654,
      overallocated: 0
    },
    { 
      week: 'Week 24',
      required: 71324,
      available: 67433, 
      shortage: 3891,
      overallocated: 0
    },
    { 
      week: 'Week 25',
      required: 70598,
      available: 66796, 
      shortage: 3802,
      overallocated: 0
    },
    { 
      week: 'Week 26',
      required: 70055,
      available: 64493, 
      shortage: 5562,
      overallocated: 0
    },
  ];

  const channelMixData = [
    { name: 'Voice', value: 60, color: '#8884d8' },
    { name: 'Chat', value: 25, color: '#82ca9d' },
    { name: 'Email', value: 15, color: '#ffc658' },
  ];

  const monthlyTrendData = [
    { month: 'Jan', required: 65000, available: 62000 },
    { month: 'Feb', required: 68000, available: 65000 },
    { month: 'Mar', required: 72000, available: 69000 },
    { month: 'Apr', required: 75000, available: 70000 },
    { month: 'May', required: 71000, available: 68000 },
    { month: 'Jun', required: 70000, available: 66000 },
  ];
  
  const lobSummaryData = [
    { lob: 'Sales', volume: 150000, hours: 15000, headcount: 120 },
    { lob: 'Support', volume: 90000, hours: 9500, headcount: 75 },
    { lob: 'Technical', volume: 60000, hours: 12000, headcount: 90 },
    { lob: 'Billing', volume: 40000, hours: 4000, headcount: 30 },
  ];
  
  const channelSummaryData = [
    { channel: 'Voice', volume: 204000, hours: 20400, headcount: 170 },
    { channel: 'Chat', volume: 85000, hours: 7100, headcount: 60 },
    { channel: 'Email', volume: 51000, hours: 13000, headcount: 85 },
  ];

  // Custom formatter for y-axis labels (thousands) - fixed to return a string
  const formatYAxis = (value: number): string => {
    return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString();
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Required vs Available Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip formatter={(value) => formatNumber(value as number)} />
                <Legend />
                <Bar dataKey="required" name="Required HC" fill="#8884d8" />
                <Bar dataKey="available" name="Available HC" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Channel Mix Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelMixData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {channelMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Capacity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="required" name="Required HC" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="available" name="Available HC" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary by Line of Business</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line of Business</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Required HC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lobSummaryData.map((row) => (
                  <TableRow key={row.lob}>
                    <TableCell className="font-medium">{row.lob}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.volume)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.hours)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.headcount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(lobSummaryData.reduce((sum, row) => sum + row.volume, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(lobSummaryData.reduce((sum, row) => sum + row.hours, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(lobSummaryData.reduce((sum, row) => sum + row.headcount, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Summary by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Required HC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelSummaryData.map((row) => (
                  <TableRow key={row.channel}>
                    <TableCell className="font-medium">{row.channel}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.volume)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.hours)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.headcount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(channelSummaryData.reduce((sum, row) => sum + row.volume, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(channelSummaryData.reduce((sum, row) => sum + row.hours, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(channelSummaryData.reduce((sum, row) => sum + row.headcount, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
