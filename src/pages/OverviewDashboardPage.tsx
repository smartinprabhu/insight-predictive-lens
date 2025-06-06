import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  RawLoBCapacityEntry,
  CapacityDataRow,
  BusinessUnitName,
  LineOfBusinessName,
  TimeInterval,
  TeamPeriodicMetrics,
  AggregatedPeriodicMetrics, // Ensure this includes requiredHC, actualHC, overUnderHC for LOBs
  BUSINESS_UNIT_CONFIG,
  ALL_BUSINESS_UNITS,
  ALL_WEEKS_HEADERS,
  ALL_MONTH_HEADERS,
  calculateTeamMetricsForPeriod,
  getHeaderDateRange,
  initialMockRawCapacityData,
  getDefaultDateRange,
  STANDARD_WEEKLY_WORK_MINUTES,
  STANDARD_MONTHLY_WORK_MINUTES
} from '@/components/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import OverviewFilterBar from '@/components/OverviewFilterBar'; // Import the new filter bar

const chartConfig = {
  volume: { label: "Volume Forecast", color: "hsl(var(--chart-1))" },
  requiredHC: { label: "Required HC", color: "hsl(var(--chart-2))" },
  actualHC: { label: "Actual HC", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const OverviewDashboardPage = () => {
  const [rawCapacityDataSource, setRawCapacityDataSource] = useState<RawLoBCapacityEntry[]>(() => {
    return JSON.parse(JSON.stringify(initialMockRawCapacityData));
  });
  const [displayableCapacityData, setDisplayableCapacityData] = useState<CapacityDataRow[]>([]);
  const [displayedPeriodHeaders, setDisplayedPeriodHeaders] = useState<string[]>([]);

  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<BusinessUnitName[]>([...ALL_BUSINESS_UNITS]);
  const [selectedLinesOfBusiness, setSelectedLinesOfBusiness] = useState<LineOfBusinessName[]>([]);
  const [selectedTimeInterval, setSelectedTimeInterval] = useState<TimeInterval>('Week');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(() => getDefaultDateRange('Week', 10));

  // Effect to update selectedLinesOfBusiness based on selectedBusinessUnits.
  // This ensures that LOB selections dynamically adjust to be relevant to the chosen BUs.
  useEffect(() => {
    const lobsFromSelectedBUs: LineOfBusinessName[] = [];
    selectedBusinessUnits.forEach(buName => {
      const buConfig = BUSINESS_UNIT_CONFIG[buName];
      if (buConfig) {
        // Ensure correct key for lines of business and map to LineOfBusinessName
        lobsFromSelectedBUs.push(...(buConfig.lonsOfBusiness || buConfig.linesOfBusiness || []).map(lob => lob as LineOfBusinessName));
      }
    });
    const uniqueLobsFromSelectedBUs = Array.from(new Set(lobsFromSelectedBUs));

    if (selectedBusinessUnits.length === 0) {
      setSelectedLinesOfBusiness([]);
    } else {
      // Filter previously selected LOBs to keep only those valid for the new BU selection
      const stillValidSelectedLobs = selectedLinesOfBusiness.filter(lob => uniqueLobsFromSelectedBUs.includes(lob));

      if (stillValidSelectedLobs.length > 0) {
        setSelectedLinesOfBusiness(stillValidSelectedLobs);
      } else {
        // If no previously selected LOBs are valid (e.g., BUs changed completely or first selection after mount),
        // default to selecting all LOBs of the currently selected BUs.
        setSelectedLinesOfBusiness(uniqueLobsFromSelectedBUs);
      }
    }
  }, [selectedBusinessUnits]);

  // Processes raw capacity data based on current filters to generate displayable hierarchical data
  // for KPIs, charts, and alerts. This includes BU, LOB, and Team level aggregations.
  const processOverviewData = useCallback(() => {
    const currentPeriods = selectedTimeInterval === 'Week' ? ALL_WEEKS_HEADERS : ALL_MONTH_HEADERS;
    let periodsToDisplay: string[] = [];

    if (selectedDateRange?.from) {
      const userRangeStart = selectedDateRange.from;
      const userRangeEnd = selectedDateRange.to || userRangeStart;
      periodsToDisplay = currentPeriods.filter(periodHeaderStr => {
        const { startDate: periodStartDate, endDate: periodEndDate } = getHeaderDateRange(periodHeaderStr, selectedTimeInterval);
        if (!periodStartDate || !periodEndDate) return false;
        return periodEndDate >= userRangeStart && periodStartDate <= userRangeEnd;
      });
    } else {
      periodsToDisplay = currentPeriods.slice(0, 10);
    }
    setDisplayedPeriodHeaders(periodsToDisplay);

    const newDisplayData: CapacityDataRow[] = [];
    const standardWorkMinutes = selectedTimeInterval === "Week" ? STANDARD_WEEKLY_WORK_MINUTES : STANDARD_MONTHLY_WORK_MINUTES;

    selectedBusinessUnits.forEach(buName => {
      const buConfig = BUSINESS_UNIT_CONFIG[buName];
      if (!buConfig) return;

      const buData: CapacityDataRow = {
        id: buName, name: buName, level: 0, itemType: 'BU', periodicData: {}, children: [],
      };

      const lobsForThisBu = (buConfig.lonsOfBusiness || buConfig.linesOfBusiness || []).filter(lobName =>
        selectedLinesOfBusiness.length === 0 || selectedLinesOfBusiness.includes(lobName as LineOfBusinessName)
      );

      lobsForThisBu.forEach(lobName => {
        const lobRawEntry = rawCapacityDataSource.find(entry => entry.bu === buName && entry.lob === lobName);
        if (!lobRawEntry) return;

        const lobData: CapacityDataRow = {
          id: lobRawEntry.id, name: lobName as LineOfBusinessName, level: 1, itemType: 'LOB', periodicData: {}, children: [], lobId: lobRawEntry.id,
        };

        const teamsToProcess = lobRawEntry.teams || [];
        teamsToProcess.forEach(teamRawEntry => {
          const periodicTeamMetrics: Record<string, TeamPeriodicMetrics> = {};
          periodsToDisplay.forEach(period => {
            const lobTotalBaseRequiredMinutesForPeriod =
              (lobRawEntry.lobVolumeForecast?.[period] ?? 0) * (lobRawEntry.lobAverageAHT?.[period] ?? 0)
              || lobRawEntry.lobTotalBaseRequiredMinutes?.[period]
              || 0;
            periodicTeamMetrics[period] = calculateTeamMetricsForPeriod(
              teamRawEntry.periodicInputData[period] || {},
              lobTotalBaseRequiredMinutesForPeriod,
              standardWorkMinutes
            );
          });
          lobData.children?.push({
            id: `${lobRawEntry.id}_${teamRawEntry.teamName.replace(/\s+/g, '-')}`, name: teamRawEntry.teamName, level: 2, itemType: 'Team', periodicData: periodicTeamMetrics, lobId: lobRawEntry.id,
          });
        });

        periodsToDisplay.forEach(period => {
          let requiredHC_lob = 0, actualHC_lob = 0;
          let volume_lob = lobRawEntry.lobVolumeForecast?.[period] ?? 0;
          let aht_lob = lobRawEntry.lobAverageAHT?.[period] ?? 0;
          let baseRequiredMinutes_lob = lobRawEntry.lobTotalBaseRequiredMinutes?.[period] ?? (volume_lob * aht_lob);

          lobData.children?.forEach(team => {
            const teamMetrics = team.periodicData[period] as TeamPeriodicMetrics;
            if (teamMetrics) {
              requiredHC_lob += teamMetrics.requiredHC ?? 0;
              actualHC_lob += teamMetrics.actualHC ?? 0;
            }
          });
          lobData.periodicData[period] = {
            requiredHC: requiredHC_lob, actualHC: actualHC_lob, overUnderHC: actualHC_lob - requiredHC_lob, lobVolumeForecast: volume_lob, lobAverageAHT: aht_lob, lobTotalBaseRequiredMinutes: baseRequiredMinutes_lob,
          } as AggregatedPeriodicMetrics;
        });
        buData.children?.push(lobData);
      });

      periodsToDisplay.forEach(period => {
        let requiredHC_bu = 0, actualHC_bu = 0, totalVolume_bu = 0, totalBaseRequiredMinutes_bu = 0;
        buData.children?.forEach(lob => {
          const lobMetrics = lob.periodicData[period] as AggregatedPeriodicMetrics;
          if (lobMetrics) {
            requiredHC_bu += lobMetrics.requiredHC ?? 0;
            actualHC_bu += lobMetrics.actualHC ?? 0;
            totalVolume_bu += lobMetrics.lobVolumeForecast ?? 0;
            totalBaseRequiredMinutes_bu += lobMetrics.lobTotalBaseRequiredMinutes ?? 0;
          }
        });
        buData.periodicData[period] = {
          requiredHC: requiredHC_bu, actualHC: actualHC_bu, overUnderHC: actualHC_bu - requiredHC_bu, lobVolumeForecast: totalVolume_bu, lobTotalBaseRequiredMinutes: totalBaseRequiredMinutes_bu,
        } as AggregatedPeriodicMetrics;
      });

      if (buData.children && buData.children.length > 0) newDisplayData.push(buData);
    });
    setDisplayableCapacityData(newDisplayData);
  }, [
    rawCapacityDataSource, selectedBusinessUnits, selectedLinesOfBusiness,
    selectedTimeInterval, selectedDateRange,
  ]);

  useEffect(() => {
    processOverviewData();
  }, [processOverviewData]);

  // Calculates Key Performance Indicators (KPIs) for grand totals and per BU for the latest period.
  // KPIs include Required HC, Actual HC, Over/Under HC, and Volume Forecast.
  const kpiData = useMemo(() => {
    if (displayedPeriodHeaders.length === 0 || displayableCapacityData.length === 0) {
      return {
        grandTotals: { totalRequiredHC: 0, totalActualHC: 0, totalOverUnderHC: 0, totalVolumeForecast: 0 },
        buSpecific: [],
        latestPeriodName: 'N/A'
      };
    }
    const lastPeriod = displayedPeriodHeaders[displayedPeriodHeaders.length - 1];
    let grandTotalRequiredHC = 0, grandTotalActualHC = 0, grandTotalOverUnderHC = 0, grandTotalVolumeForecast = 0;

    const buSpecific = displayableCapacityData.map(buRow => {
      const buPeriodicData = buRow.periodicData[lastPeriod] as AggregatedPeriodicMetrics;
      const requiredHC = buPeriodicData?.requiredHC ?? 0;
      const actualHC = buPeriodicData?.actualHC ?? 0;
      const overUnderHC = buPeriodicData?.overUnderHC ?? 0;
      const volumeForecast = buPeriodicData?.lobVolumeForecast ?? 0;

      grandTotalRequiredHC += requiredHC;
      grandTotalActualHC += actualHC;
      grandTotalOverUnderHC += overUnderHC;
      grandTotalVolumeForecast += volumeForecast;

      return {
        buName: buRow.name, totalRequiredHC: requiredHC, totalActualHC: actualHC, totalOverUnderHC: overUnderHC, totalVolumeForecast: volumeForecast,
      };
    });
    return {
      grandTotals: { totalRequiredHC: grandTotalRequiredHC, totalActualHC: grandTotalActualHC, totalOverUnderHC: grandTotalOverUnderHC, totalVolumeForecast: grandTotalVolumeForecast, },
      buSpecific,
      latestPeriodName: lastPeriod?.split(':')[0] || 'N/A'
    };
  }, [displayableCapacityData, displayedPeriodHeaders]);

  // Prepares data structured for rendering charts.
  // Focuses on LOB performance (Volume and HC comparison) within each selected BU for the latest period.
  const chartsData = useMemo(() => {
    if (displayedPeriodHeaders.length === 0 || displayableCapacityData.length === 0) {
      return {};
    }
    const lastPeriod = displayedPeriodHeaders[displayedPeriodHeaders.length - 1];
    const buChartsData: Record<string, { lobVolumeData: any[], lobHCData: any[] }> = {};

    displayableCapacityData.forEach(buRow => {
      const lobVolumeDataForBU: any[] = [];
      const lobHCDataForBU: any[] = [];
      buRow.children?.forEach(lobRow => {
        const lobPeriodicData = lobRow.periodicData[lastPeriod] as AggregatedPeriodicMetrics;
        if (lobPeriodicData) {
          lobVolumeDataForBU.push({ lobName: lobRow.name, volume: lobPeriodicData.lobVolumeForecast ?? 0, });
          lobHCDataForBU.push({ lobName: lobRow.name, requiredHC: lobPeriodicData.requiredHC ?? 0, actualHC: lobPeriodicData.actualHC ?? 0, });
        }
      });
      if (lobVolumeDataForBU.length > 0 || lobHCDataForBU.length > 0) {
        buChartsData[buRow.name] = { lobVolumeData: lobVolumeDataForBU, lobHCData: lobHCDataForBU };
      }
    });
    return buChartsData;
  }, [displayableCapacityData, displayedPeriodHeaders]);

  const alertData = useMemo(() => {
    if (displayedPeriodHeaders.length === 0 || displayableCapacityData.length === 0) {
      return [];
    }
    const lastPeriod = displayedPeriodHeaders[displayedPeriodHeaders.length - 1];
    const alerts: Array<{ id: string, buName: string, lobName: string, metric: string, value: string | number, message: string, severity: 'critical' | 'warning' }> = [];

    displayableCapacityData.forEach(buRow => {
      buRow.children?.forEach(lobRow => {
        const lobPeriodicData = lobRow.periodicData[lastPeriod] as AggregatedPeriodicMetrics; // Assuming requiredHC, actualHC, overUnderHC are here

        if (lobPeriodicData) {
          const { actualHC = 0, requiredHC = 0, overUnderHC = 0 } = lobPeriodicData;

          // Check for OverUnderHC < -5
          if (overUnderHC < -5) {
            alerts.push({
              id: `${buRow.name}_${lobRow.name}_overUnderHC`,
              buName: buRow.name,
              lobName: lobRow.name,
              metric: "Over/Under HC",
              value: overUnderHC.toFixed(0),
              message: `Critically understaffed by ${Math.abs(overUnderHC).toFixed(0)} HC. (Actual: ${actualHC.toFixed(0)}, Required: ${requiredHC.toFixed(0)})`,
              severity: 'critical',
            });
          }

          // Check for ActualHC < 90% of RequiredHC (and RequiredHC > 0)
          // Avoid duplicate alert if already caught by overUnderHC < -5 for the same core reason.
          const isAlreadyAlertedForUnderstaffing = alerts.some(a => a.id === `${buRow.name}_${lobRow.name}_overUnderHC`);
          if (requiredHC > 0 && actualHC < 0.9 * requiredHC && !isAlreadyAlertedForUnderstaffing) {
             alerts.push({
                id: `${buRow.name}_${lobRow.name}_coverage`,
                buName: buRow.name,
                lobName: lobRow.name,
                metric: "Staffing Coverage",
                value: `${((actualHC / requiredHC) * 100).toFixed(0)}%`,
                message: `Actual HC (${actualHC.toFixed(0)}) is less than 90% of Required HC (${requiredHC.toFixed(0)}).`,
                severity: 'critical', // Could be 'warning' depending on severity rules
            });
          }
        }
      });
    });
    return alerts;
  }, [displayableCapacityData, displayedPeriodHeaders]);

  // Helper to get all LOBs for currently selected BUs (for filter dropdowns)
  const availableLOBsForSelectedBUs = useMemo(() => {
    const lobs: LineOfBusinessName[] = [];
    selectedBusinessUnits.forEach(buName => {
      const buConfig = BUSINESS_UNIT_CONFIG[buName];
      if (buConfig) {
        lobs.push(...(buConfig.lonsOfBusiness || buConfig.linesOfBusiness || []).map(lob => lob as LineOfBusinessName));
      }
    });
    return Array.from(new Set(lobs));
  }, [selectedBusinessUnits]);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <h1 className="text-3xl font-bold mb-2">Overview Dashboard</h1>

      {/* Filters Section - OverviewFilterBar is already styled as a card */}
      <OverviewFilterBar
        allBusinessUnits={ALL_BUSINESS_UNITS} // Assuming ALL_BUSINESS_UNITS is imported from types
        selectedBusinessUnits={selectedBusinessUnits}
        onSelectBusinessUnits={setSelectedBusinessUnits}
        availableLinesOfBusiness={availableLOBsForSelectedBUs}
        selectedLinesOfBusiness={selectedLinesOfBusiness}
        onSelectLinesOfBusiness={setSelectedLinesOfBusiness}
        selectedTimeInterval={selectedTimeInterval}
        onSelectTimeInterval={setSelectedTimeInterval}
        selectedDateRange={selectedDateRange}
        onSelectDateRange={setSelectedDateRange}
      />

      {/* KPIs Section */}
      <div className="p-4 border rounded-lg shadow bg-card text-card-foreground">
        <h2 className="text-2xl font-semibold mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpiData.grandTotals && (
            <Card className="border-2 border-primary shadow-lg"> {/* Special styling for Grand Totals */}
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Grand Totals</CardTitle>
                <CardDescription>Overall performance (latest period: {kpiData.latestPeriodName})</CardDescription>
              </CardHeader>
              <CardContent className="p-4 grid gap-2">
                <p><strong>Required HC:</strong> {kpiData.grandTotals.totalRequiredHC.toFixed(0)}</p>
                <p><strong>Actual HC:</strong> {kpiData.grandTotals.totalActualHC.toFixed(0)}</p>
                <p className={kpiData.grandTotals.totalOverUnderHC < 0 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>
                  <strong>Over/Under HC:</strong> {kpiData.grandTotals.totalOverUnderHC.toFixed(0)}
                </p>
                <p><strong>Volume Forecast:</strong> {kpiData.grandTotals.totalVolumeForecast.toFixed(0)}</p>
              </CardContent>
            </Card>
          )}
          {kpiData.buSpecific.map(buKpi => (
            <Card key={buKpi.buName} className="shadow"> {/* Standard shadow for BU KPI cards */}
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{buKpi.buName}</CardTitle>
                <CardDescription>Performance (latest period: {kpiData.latestPeriodName})</CardDescription>
              </CardHeader>
              <CardContent className="p-4 grid gap-1">
                <p><strong>Required HC:</strong> {buKpi.totalRequiredHC.toFixed(0)}</p>
                <p><strong>Actual HC:</strong> {buKpi.totalActualHC.toFixed(0)}</p>
                <p className={buKpi.totalOverUnderHC < 0 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>
                  <strong>Over/Under HC:</strong> {buKpi.totalOverUnderHC.toFixed(0)}
                </p>
                <p><strong>Volume Forecast:</strong> {buKpi.totalVolumeForecast.toFixed(0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Visual Insights Section */}
      <div className="p-4 border rounded-lg shadow bg-card text-card-foreground">
        <h2 className="text-2xl font-semibold mb-4">Visual Insights</h2>
        {Object.keys(chartsData).length > 0 ? (
          Object.entries(chartsData).map(([buName, buData]) => (
            (buData.lobVolumeData && buData.lobVolumeData.length > 0) || (buData.lobHCData && buData.lobHCData.length > 0) ? (
            <div key={buName} className="mb-6 p-4 border rounded-md bg-background last:mb-0"> {/* Use mb-6 and last:mb-0 */}
              <h3 className="text-xl font-semibold mb-4 text-center">{buName} - Performance Metrics (Latest Period)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {buData.lobVolumeData && buData.lobVolumeData.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-medium mb-2 text-center">LOB Volume Forecast</h4>
                    <div className="h-[350px] p-2 rounded-lg">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart data={buData.lobVolumeData} accessibilityLayer margin={{ top: 5, right: 20, left: 0, bottom: 5 }}> {/* Adjusted left margin */}
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="lobName" tickLine={false} tickMargin={10} axisLine={false} className="text-xs" interval={0} /> {/* Added interval={0} */}
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString()} />
                          <ChartTooltipContent hideIndicator cursor={false} />
                          <Bar dataKey="volume" fill="var(--color-volume)" radius={5} />
                          <ChartLegendContent />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : <p className="text-center text-muted-foreground col-span-full lg:col-span-1 py-4">No volume data to display for {buName}.</p>}
                {buData.lobHCData && buData.lobHCData.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-medium mb-2 text-center">LOB HC Comparison</h4>
                    <div className="h-[350px] p-2 rounded-lg">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart data={buData.lobHCData} accessibilityLayer margin={{ top: 5, right: 20, left: 0, bottom: 5 }}> {/* Adjusted left margin */}
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="lobName" tickLine={false} tickMargin={10} axisLine={false} className="text-xs" interval={0} /> {/* Added interval={0} */}
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString()} />
                          <ChartTooltipContent hideIndicator cursor={false} />
                          <Bar dataKey="requiredHC" fill="var(--color-requiredHC)" radius={5} />
                          <Bar dataKey="actualHC" fill="var(--color-actualHC)" radius={5} />
                          <ChartLegendContent />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : <p className="text-center text-muted-foreground col-span-full lg:col-span-1 py-4">No HC data to display for {buName}.</p>}
              </div>
            </div>
            ) : null
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No data available to display charts. Please check filters or data source.</p>
        )}
      </div>

      {/* Alert System Section */}
      <div className="p-4 border rounded-lg shadow bg-card text-card-foreground"> {/* Removed mt-6 */}
        <h2 className="text-2xl font-semibold mb-4 text-destructive">Critical Alerts</h2>
        {alertData.length > 0 ? (
          <div className="space-y-3">
            {alertData.map(alert => (
              <Alert key={alert.id} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.buName} - {alert.lobName}: {alert.metric}</AlertTitle>
                <AlertDescription>
                  Value: {alert.value} | {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No critical alerts at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default OverviewDashboardPage;
