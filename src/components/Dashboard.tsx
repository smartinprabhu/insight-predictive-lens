import React, { useEffect, useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui2/select'; // Added
import { Label } from './ui2/label'; // Added
import {
  BUSINESS_UNIT_CONFIG,
  RawLoBCapacityEntry, // RawLoBCapacityEntry is not directly used in current code but kept for context
  ALL_BUSINESS_UNITS,
  LineOfBusinessName,
  TeamName,
  initialMockRawCapacityData,
  ALL_TEAM_NAMES,
  BusinessUnitName,
  TeamPeriodicMetrics,
  AggregatedPeriodicMetrics, // Not directly used in ProcessedData but good for context
  calculateTeamMetricsForPeriod,
  STANDARD_WEEKLY_WORK_MINUTES,
  ALL_WEEKS_HEADERS, // For determining the latest period from mock data
} from './PlanningTab';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui2/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui2/card';
import { AlertCircle } from 'lucide-react';

interface ProcessedTeamData {
  teamName: TeamName;
  caseVolume: number;
  overUnderHC: number | null;
  isAlert: boolean;
}

interface ProcessedLobData {
  lobName: LineOfBusinessName;
  totalCases: number;
  overUnderHC: number | null;
  isAlert: boolean;
  teams: ProcessedTeamData[];
}

interface ProcessedBuData {
  buName: BusinessUnitName;
  lobs: ProcessedLobData[];
}

const Dashboard = () => {
  const [processedData, setProcessedData] = useState<ProcessedBuData[]>([]);
  const [selectedBu, setSelectedBu] = useState<string>('All');
  const [selectedLob, setSelectedLob] = useState<string>('All LOBs'); // For single LOB selection
  const [availableLobsForFilter, setAvailableLobsForFilter] = useState<LineOfBusinessName[]>([]);

  // Effect to update available LOBs for filter when selectedBu changes
  useEffect(() => {
    if (selectedBu === 'All') {
      setAvailableLobsForFilter([]);
      setSelectedLob('All LOBs'); // Reset LOB selection
    } else {
      const buConf = BUSINESS_UNIT_CONFIG[selectedBu as BusinessUnitName];
      if (buConf && Array.isArray(buConf.lonsOfBusiness)) {
        setAvailableLobsForFilter([...buConf.lonsOfBusiness]);
      } else {
        setAvailableLobsForFilter([]);
      }
      setSelectedLob('All LOBs'); // Reset LOB selection to "All LOBs" for the new BU
    }
  }, [selectedBu]);

  useEffect(() => {
    const processData = () => {
      const latestPeriod = ALL_WEEKS_HEADERS.length > 0 ? ALL_WEEKS_HEADERS[0] : null;
      const standardWorkMinutesForPeriod = STANDARD_WEEKLY_WORK_MINUTES;

      const busToProcess = selectedBu === 'All'
        ? ALL_BUSINESS_UNITS
        : [selectedBu as BusinessUnitName];

      const data: ProcessedBuData[] = busToProcess.filter(buName => BUSINESS_UNIT_CONFIG[buName]).map((buName) => {
        const buConfig = BUSINESS_UNIT_CONFIG[buName];
        // buConfig is guaranteed to exist due to the filter above

        let lobsToProcessForThisBu = (buConfig && Array.isArray(buConfig.lonsOfBusiness)) ? [...buConfig.lonsOfBusiness] : [];

        // If a specific LOB is selected (and it's not "All LOBs"), filter down
        if (selectedBu !== 'All' && selectedLob !== 'All LOBs') {
          lobsToProcessForThisBu = lobsToProcessForThisBu.filter(lob => lob === selectedLob);
        }

        const lobsData = lobsToProcessForThisBu.map((lobName) => {
          const lobEntry = initialMockRawCapacityData.find(
            (entry) => entry.lob === lobName && entry.bu === buName
          );

          let totalCasesLOB = 0;
          let lobActualHcSum = 0;
          let lobRequiredHcSum = 0;
          let lobOverUnderHC: number | null = null;
          let lobIsAlert = false;

          if (lobEntry) {
            // Calculate total cases for the LOB by summing up lobVolumeForecast for all periods.
            totalCasesLOB = Object.values(lobEntry.lobVolumeForecast || {}).reduce(
              (sum, forecast) => sum + (forecast || 0),
              0
            );

            const teamsData: ProcessedTeamData[] = ALL_TEAM_NAMES.map((teamName) => {
              const teamRawEntry = lobEntry.teams.find(t => t.teamName === teamName);
              let caseVolumeTeam = 0;
              let teamActualHc: number | null = null;
              let teamRequiredHc: number | null = null;
              let teamOverUnderHC: number | null = null;
              let teamIsAlert = false;

              if (teamRawEntry) {
                // Calculate caseVolume for the team
                // Sum of (lobVolumeForecast for period * teamVolumeMixPercentage for period)
                Object.entries(lobEntry.lobVolumeForecast || {}).forEach(([periodKey, lobVol]) => {
                  const teamPeriodicInputForVol = teamRawEntry.periodicInputData[periodKey];
                  if (lobVol && teamPeriodicInputForVol?.volumeMixPercentage) {
                    caseVolumeTeam += lobVol * (teamPeriodicInputForVol.volumeMixPercentage / 100);
                  }
                });

                // Calculate HC metrics for the latest period for this team
                if (latestPeriod) {
                  const lobVolumeLatestPeriod = lobEntry.lobVolumeForecast[latestPeriod] ?? null;
                  const lobAhtLatestPeriod = lobEntry.lobAverageAHT?.[latestPeriod] ?? null;

                  let lobTotalBaseRequiredMinutesForLatestPeriod: number | null = null;
                  if (lobVolumeLatestPeriod !== null && lobAhtLatestPeriod !== null && lobAhtLatestPeriod > 0) {
                      lobTotalBaseRequiredMinutesForLatestPeriod = lobVolumeLatestPeriod * lobAhtLatestPeriod;
                  }

                  const teamPeriodicInputLatest = teamRawEntry.periodicInputData[latestPeriod] || {};

                  const completeTeamInputForCalc: Partial<TeamPeriodicMetrics> = {
                    actualHC: teamPeriodicInputLatest.actualHC ?? 0,
                    aht: teamPeriodicInputLatest.aht ?? lobAhtLatestPeriod ?? 0,
                    shrinkagePercentage: teamPeriodicInputLatest.shrinkagePercentage ?? 0,
                    occupancyPercentage: teamPeriodicInputLatest.occupancyPercentage ?? 100,
                    backlogPercentage: teamPeriodicInputLatest.backlogPercentage ?? 0,
                    volumeMixPercentage: teamPeriodicInputLatest.volumeMixPercentage ?? 0, // Already a percentage 0-100
                    moveIn: teamPeriodicInputLatest.moveIn ?? 0,
                    moveOut: teamPeriodicInputLatest.moveOut ?? 0,
                    newHireBatch: teamPeriodicInputLatest.newHireBatch ?? 0,
                    newHireProduction: teamPeriodicInputLatest.newHireProduction ?? 0,
                    attritionPercentage: teamPeriodicInputLatest.attritionPercentage ?? 0,
                  };

                  const metrics = calculateTeamMetricsForPeriod(
                    completeTeamInputForCalc,
                    lobTotalBaseRequiredMinutesForLatestPeriod,
                    standardWorkMinutesForPeriod
                  );

                  teamActualHc = metrics.actualHC;
                  teamRequiredHc = metrics.requiredHC;
                  teamOverUnderHC = metrics.overUnderHC;
                  teamIsAlert = teamOverUnderHC !== null && teamOverUnderHC < 0;

                  if (teamActualHc !== null) lobActualHcSum += teamActualHc;
                  if (teamRequiredHc !== null) lobRequiredHcSum += teamRequiredHc;
                }
              }

              return {
                teamName,
                caseVolume: Math.round(caseVolumeTeam),
                overUnderHC: teamOverUnderHC !== null ? parseFloat(teamOverUnderHC.toFixed(0)) : null,
                isAlert: teamIsAlert,
              };
            });

            if (lobActualHcSum !== null && lobRequiredHcSum !== null && latestPeriod) { // Ensure calculations only if latestPeriod was valid
              lobOverUnderHC = lobActualHcSum - lobRequiredHcSum;
              lobIsAlert = lobOverUnderHC < 0;
            }
            return { // This is for lobsData.map
              lobName,
              totalCases: Math.round(totalCasesLOB),
              overUnderHC: lobOverUnderHC !== null ? parseFloat(lobOverUnderHC.toFixed(0)) : null,
              isAlert: lobIsAlert,
              teams: teamsData,
            };
          } else { // lobEntry not found
            return {
              lobName,
              totalCases: 0,
              overUnderHC: null,
              isAlert: false,
              teams: ALL_TEAM_NAMES.map(teamName => ({
                teamName,
                caseVolume: 0,
                overUnderHC: null,
                isAlert: false,
              })),
            };
          }
        }); // End of lobsData map

        return {
          buName,
          lobs: lobsData,
        };
      }); // End of data map
      setProcessedData(data);
    };

    processData();
  }, [selectedBu, selectedLob, initialMockRawCapacityData]); // Rerun when filters or base data change

  const handleBuChange = (value: string) => {
    setSelectedBu(value);
    // LOB selection and available LOBs will be reset by the other useEffect triggered by selectedBu change
  };

  const handleLobChange = (value: string) => {
    setSelectedLob(value);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Overview Dashboard</h1>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 p-4 bg-card border rounded-lg items-start">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <Label htmlFor="bu-filter" className="mb-2 block">Business Unit</Label>
          <Select value={selectedBu} onValueChange={handleBuChange}>
            <SelectTrigger id="bu-filter">
              <SelectValue placeholder="Select Business Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Business Units</SelectItem>
              {ALL_BUSINESS_UNITS.map(bu => (
                <SelectItem key={bu} value={bu}>{bu}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBu !== 'All' && (
          <div className="w-full sm:w-1/2 md:w-1/3">
            <Label htmlFor="lob-filter" className="mb-2 block">Line of Business</Label>
            <Select value={selectedLob} onValueChange={handleLobChange} disabled={availableLobsForFilter.length === 0 && selectedBu !== 'All'}>
              <SelectTrigger id="lob-filter">
                <SelectValue placeholder="Select Line of Business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All LOBs">All LOBs for {selectedBu}</SelectItem>
                {availableLobsForFilter.map(lob => (
                  <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {processedData.length === 0 && (
        <p className="text-muted-foreground">No data available for the current filter selection.</p>
      )}

      {processedData.map((buData) => (
        <Card key={buData.buName}>
          <CardHeader>
            <CardTitle>{buData.buName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {buData.lobs.map((lobData) => (
              <Card key={lobData.lobName} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className={`text-lg flex items-center ${lobData.isAlert ? 'text-red-500' : ''}`}>
                    {lobData.isAlert && <AlertCircle className="mr-2 h-5 w-5" />}
                    {lobData.lobName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total Cases: {lobData.totalCases.toLocaleString()}
                    {lobData.overUnderHC !== null && (
                      <span className={`ml-2 ${lobData.isAlert ? 'text-red-500' : (lobData.overUnderHC >= 0 ? 'text-green-500' : 'text-orange-500') }` }>
                        (HC: {lobData.overUnderHC > 0 ? '+' : ''}{lobData.overUnderHC.toFixed(0)})
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  {lobData.teams.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>Case Volume</TableHead>
                          <TableHead className="text-right">Over/Under HC (Latest Period)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lobData.teams.map((teamData) => (
                          <TableRow key={teamData.teamName}>
                            <TableCell className={`font-medium flex items-center ${teamData.isAlert ? 'text-red-500' : ''}`}>
                              {teamData.isAlert && <AlertCircle className="mr-2 h-4 w-4" />}
                              {teamData.teamName}
                            </TableCell>
                            <TableCell>{teamData.caseVolume.toLocaleString()}</TableCell>
                            <TableCell className={`text-right ${teamData.isAlert ? 'text-red-500' : (teamData.overUnderHC !== null && teamData.overUnderHC >= 0 ? 'text-green-500' : (teamData.overUnderHC !== null ? 'text-orange-500' : ''))}`}>
                              {teamData.overUnderHC !== null ? `${teamData.overUnderHC > 0 ? '+' : ''}${teamData.overUnderHC.toFixed(0)}` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>No team data available for this LOB.</p>
                  )}
                </CardContent>
              </Card>
            ))}
             {buData.lobs.length === 0 && selectedBu !== 'All' && selectedLob !== 'All LOBs' && (
              <p className="text-muted-foreground">No data available for the selected LOB ({selectedLob}) in {selectedBu}.</p>
            )}
            {buData.lobs.length === 0 && selectedBu !== 'All' && selectedLob === 'All LOBs' && (
              <p className="text-muted-foreground">No LOBs found for {selectedBu} after filtering (this should not typically happen if LOBs are defined).</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
