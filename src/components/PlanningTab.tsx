import React, { useState, useEffect, useCallback, useRef } from "react";
import HeaderSection from "./HeaderSection";
import CapacityTable from "./CapacityTable";
import { CapacityDataRow, TimeInterval, TeamName, BusinessUnitName, RawLoBCapacityEntry, DateRange } from "./types";
import {
  initialMockRawCapacityData,
  ALL_WEEKS_HEADERS,
  ALL_MONTH_HEADERS,
  BUSINESS_UNIT_CONFIG,
  TEAM_METRIC_ROW_DEFINITIONS,
  AGGREGATED_METRIC_ROW_DEFINITIONS,
  calculateTeamMetricsForPeriod,
  getDefaultDateRange,
  getHeaderDateRange,
  STANDARD_WEEKLY_WORK_MINUTES,
  STANDARD_MONTHLY_WORK_MINUTES
} from "./types";
import { startOfWeek, endOfWeek, isAfter, addDays, startOfMonth, endOfMonth, isBefore, addWeeks, isSameDay } from 'date-fns';


let rawCapacityDataSource: RawLoBCapacityEntry[] = JSON.parse(JSON.stringify(initialMockRawCapacityData));

export default function PlanningTab() {
  const [localRawCapacityDataSource, setLocalRawCapacityDataSource] = useState<RawLoBCapacityEntry[]>(() => {
    return JSON.parse(JSON.stringify(initialMockRawCapacityData));
  });

  useEffect(() => {
    rawCapacityDataSource = localRawCapacityDataSource;
  }, [localRawCapacityDataSource]);

  const defaultWFSLoBs = ["Inventory Management", "Customer Returns", "Help Desk"];
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnitName>("WFS");

  const [selectedLineOfBusiness, setSelectedLineOfBusiness] = useState<string[]>(() => {
    const initialBuLobs = BUSINESS_UNIT_CONFIG["WFS"].lonsOfBusiness;
    return defaultWFSLoBs.filter(lob => initialBuLobs.includes(lob as any));
  });

  const [selectedTimeInterval, setSelectedTimeInterval] = useState<TimeInterval>("Week");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(() => getDefaultDateRange("Week"));

  const [filterOptions, setFilterOptions] = useState(() => {
    const buConfig = BUSINESS_UNIT_CONFIG["WFS"];
    const lobsForWFS = [...buConfig.lonsOfBusiness];
    return {
      businessUnits: [...Object.keys(BUSINESS_UNIT_CONFIG)],
      linesOfBusiness: lobsForWFS,
    };
  });

  const [displayableCapacityData, setDisplayableCapacityData] = useState<CapacityDataRow[]>([]);
  const [displayedPeriodHeaders, setDisplayedPeriodHeaders] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    const initialExpandedItems: Record<string, boolean> = {};
    Object.keys(BUSINESS_UNIT_CONFIG).forEach(bu => {
      initialExpandedItems[bu] = true;
    });
    return initialExpandedItems;
  });

  const [editingCell, setEditingCell] = useState<{ id: string; period: string; metricKey: string } | null>(null);
  const [activeHierarchyContext, setActiveHierarchyContext] = useState<string>("BU / LoB / Team / Metric");

  const headerPeriodScrollerRef = useRef<HTMLDivElement>(null);
  const tableBodyScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const handleActiveHierarchyChange = useCallback((newContext: string | null) => {
    setActiveHierarchyContext(newContext || "BU / LoB / Team / Metric");
  }, []);

  const handleSetEditingCell = useCallback((id: string | null, period: string | null, metricKey: string | null) => {
    if (id && period && metricKey) {
      setEditingCell({ id, period, metricKey });
    } else {
      setEditingCell(null);
    }
  }, []);

  const handleTeamMetricChange = useCallback((lobId: string, teamNameToUpdate: TeamName, periodHeader: string, metricKey: keyof TeamPeriodicMetrics, rawValue: string) => {
    const newValueParsed = rawValue === "" || rawValue === "-" ? null : parseFloat(rawValue);
    if (rawValue !== "" && rawValue !== "-" && isNaN(newValueParsed as number) && newValueParsed !== null) {
      return;
    }
    const newValue = newValueParsed;

    setLocalRawCapacityDataSource(prevRawData => {
      const newData = JSON.parse(JSON.stringify(prevRawData)) as RawLoBCapacityEntry[];
      const lobEntryIndex = newData.findIndex(lob => lob.id === lobId);
      if (lobEntryIndex === -1) return prevRawData;

      const lobEntry = newData[lobEntryIndex];
      const teamEntryIndex = lobEntry.teams.findIndex(team => team.teamName === teamNameToUpdate);
      if (teamEntryIndex === -1) return prevRawData;

      const teamEntry = lobEntry.teams[teamEntryIndex];

      if (!teamEntry.periodicInputData) {
        teamEntry.periodicInputData = {};
      }
      if (!teamEntry.periodicInputData[periodHeader]) {
        teamEntry.periodicInputData[periodHeader] = {};
      }

      (teamEntry.periodicInputData[periodHeader] as any)[metricKey] = newValue;

      if (metricKey === 'volumeMixPercentage') {
        const updatedTeamMix = Math.max(0, Math.min(100, newValue === null ? 0 : newValue as number));
        (teamEntry.periodicInputData[periodHeader] as any)[metricKey] = updatedTeamMix;

        const otherTeams = lobEntry.teams.filter(t => t.teamName !== teamNameToUpdate);
        const currentTotalMixOfOtherTeams = otherTeams.reduce((sum, t) => {
          const teamPeriodData = t.periodicInputData[periodHeader];
          return sum + (teamPeriodData?.volumeMixPercentage ?? 0);
        }, 0);

        const remainingMixPercentage = 100 - updatedTeamMix;

        if (otherTeams.length > 0) {
          if (Math.abs(currentTotalMixOfOtherTeams) > 0.001) {
            let distributedSum = 0;
            for (let i = 0; i < otherTeams.length; i++) {
              const team = otherTeams[i];
              if (!team.periodicInputData[periodHeader]) team.periodicInputData[periodHeader] = {};
              const teamPeriodData = team.periodicInputData[periodHeader];

              const originalShareOfOthers = (teamPeriodData?.volumeMixPercentage ?? 0) / currentTotalMixOfOtherTeams;
              let newShare = remainingMixPercentage * originalShareOfOthers;

              if (i === otherTeams.length - 1) {
                newShare = remainingMixPercentage - distributedSum;
              }
              newShare = Math.max(0, Math.min(100, parseFloat(newShare.toFixed(1))));
              (team.periodicInputData[periodHeader] as any).volumeMixPercentage = newShare;
              distributedSum += newShare;
            }
          } else {
            const mixPerOtherTeam = otherTeams.length > 0 ? parseFloat((remainingMixPercentage / otherTeams.length).toFixed(1)) : 0;
            let distributedSum = 0;
            otherTeams.forEach((team, i) => {
              if (!team.periodicInputData[periodHeader]) team.periodicInputData[periodHeader] = {};
              let currentMix = mixPerOtherTeam;
              if (i === otherTeams.length - 1) {
                currentMix = remainingMixPercentage - distributedSum;
              }
              (team.periodicInputData[periodHeader] as any).volumeMixPercentage = Math.max(0, Math.min(100, parseFloat(currentMix.toFixed(1))));
              distributedSum += parseFloat(currentMix.toFixed(1));
            });
          }
        }
        let finalSum = lobEntry.teams.reduce((sum, t) => {
          const teamPeriodData = t.periodicInputData[periodHeader];
          return sum + (teamPeriodData?.volumeMixPercentage ?? 0);
        }, 0);

        if (Math.abs(finalSum - 100) > 0.01 && lobEntry.teams.length > 0) {
          const diff = 100 - finalSum;
          let teamToAdjust = lobEntry.teams.find(t => t.teamName === teamNameToUpdate) ||
            lobEntry.teams.find(t => (t.periodicInputData[periodHeader]?.volumeMixPercentage ?? 0) > 0) ||
            lobEntry.teams[0];

          if (!teamToAdjust.periodicInputData[periodHeader]) {
            teamToAdjust.periodicInputData[periodHeader] = {};
          }
          const currentMixToAdjust = (teamToAdjust.periodicInputData[periodHeader] as any).volumeMixPercentage ?? 0;
          (teamToAdjust.periodicInputData[periodHeader] as any).volumeMixPercentage =
            Math.max(0, Math.min(100, parseFloat((currentMixToAdjust + diff).toFixed(1))));
        }
      }
      return newData;
    });
  }, []);

  const handleLobMetricChange = useCallback((lobId: string, periodHeader: string, metricKey: 'lobTotalBaseRequiredMinutes', rawValue: string) => {
    const newValueParsed = rawValue === "" || rawValue === "-" ? null : parseFloat(rawValue);
    if (rawValue !== "" && rawValue !== "-" && isNaN(newValueParsed as number) && newValueParsed !== null) {
      return;
    }
    const newValue = newValueParsed;

    setLocalRawCapacityDataSource(prevRawData => {
      const newData = JSON.parse(JSON.stringify(prevRawData)) as RawLoBCapacityEntry[];
      const lobEntryIndex = newData.findIndex(lob => lob.id === lobId);
      if (lobEntryIndex === -1) return prevRawData;

      const lobEntry = newData[lobEntryIndex];

      if (!lobEntry.lobTotalBaseRequiredMinutes) {
        lobEntry.lobTotalBaseRequiredMinutes = {};
      }
      lobEntry.lobTotalBaseRequiredMinutes[periodHeader] = newValue;

      if (newValue !== null) {
        if (!lobEntry.lobVolumeForecast) lobEntry.lobVolumeForecast = {};
        if (!lobEntry.lobAverageAHT) lobEntry.lobAverageAHT = {};
        lobEntry.lobVolumeForecast[periodHeader] = null;
        lobEntry.lobAverageAHT[periodHeader] = null;
      }

      return newData;
    });
  }, []);

  const handleBusinessUnitChange = useCallback((bu: BusinessUnitName) => {
    setSelectedBusinessUnit(bu);
    const newBuConfig = BUSINESS_UNIT_CONFIG[bu];
    const allLobsForNewBu = [...newBuConfig.lonsOfBusiness];
    let newDefaultSelectedLobs: string[];

    if (bu === "WFS") {
      newDefaultSelectedLobs = defaultWFSLoBs.filter(lob =>
        allLobsForNewBu.includes(lob as any)
      );
    } else {
      newDefaultSelectedLobs = [...allLobsForNewBu];
    }
    setSelectedLineOfBusiness(newDefaultSelectedLobs);
    setFilterOptions(prev => ({
      ...prev,
      linesOfBusiness: allLobsForNewBu
    }));
  }, [defaultWFSLoBs]);

  const handleLOBChange = useCallback((lobs: string[]) => {
    setSelectedLineOfBusiness(lobs);
  }, []);

  const handleTimeIntervalChange = useCallback((interval: TimeInterval) => {
    setSelectedTimeInterval(interval);
    setSelectedDateRange(getDefaultDateRange(interval));
  }, []);

  useEffect(() => {
    const newBuConfig = BUSINESS_UNIT_CONFIG[selectedBusinessUnit];
    const allLobsForNewBu = [...newBuConfig.lonsOfBusiness];
    let newDefaultSelectedLobs: string[];

    if (selectedBusinessUnit === "WFS") {
      newDefaultSelectedLobs = defaultWFSLoBs.filter(lob =>
        allLobsForNewBu.includes(lob as any)
      );
      setSelectedLineOfBusiness(currentSelectedLobs => {
        const currentSorted = [...currentSelectedLobs].sort().join(',');
        const newDefaultSorted = [...newDefaultSelectedLobs].sort().join(',');
        if (currentSorted !== newDefaultSorted) {
          return newDefaultSelectedLobs;
        }
        return currentSelectedLobs;
      });
    } else {
      newDefaultSelectedLobs = [...allLobsForNewBu];
      setSelectedLineOfBusiness(newDefaultSelectedLobs);
    }

    setFilterOptions(prev => {
      const newLinesOfBusinessForFilter = [...allLobsForNewBu];
      const currentLinesOfBusinessForFilterSorted = [...prev.linesOfBusiness].sort().join(',');
      const newLinesOfBusinessForFilterSorted = [...newLinesOfBusinessForFilter].sort().join(',');

      if (currentLinesOfBusinessForFilterSorted !== newLinesOfBusinessForFilterSorted || prev.businessUnits.join(',') !== Object.keys(BUSINESS_UNIT_CONFIG).join(',')) {
        return {
          businessUnits: [...Object.keys(BUSINESS_UNIT_CONFIG)],
          linesOfBusiness: newLinesOfBusinessForFilter
        };
      }
      return prev;
    });
  }, [selectedBusinessUnit, defaultWFSLoBs]);

  const processDataForTable = useCallback(() => {
    const sourcePeriods = selectedTimeInterval === "Week" ? ALL_WEEKS_HEADERS : ALL_MONTH_HEADERS;
    let periodsToDisplayCurrently: string[] = [];

    if (selectedDateRange?.from) {
      const userRangeStart = selectedDateRange.from;
      const userRangeEnd = selectedDateRange.to || userRangeStart;

      periodsToDisplayCurrently = sourcePeriods.filter(periodHeaderStr => {
        const { startDate: periodStartDate, endDate: periodEndDate } = getHeaderDateRange(periodHeaderStr, selectedTimeInterval);
        if (!periodStartDate || !periodEndDate) return false;

        return isAfter(periodEndDate, addDays(userRangeStart, -1)) && isBefore(periodStartDate, addDays(userRangeEnd, 1));
      });
    } else {
      periodsToDisplayCurrently = sourcePeriods.slice(0, 60);
    }

    setDisplayedPeriodHeaders(periodsToDisplayCurrently);

    const standardWorkMinutes = selectedTimeInterval === "Week" ? STANDARD_WEEKLY_WORK_MINUTES : STANDARD_MONTHLY_WORK_MINUTES;
    const newDisplayData: CapacityDataRow[] = [];

    const buName = selectedBusinessUnit;
    const relevantRawLobEntriesForSelectedBu = localRawCapacityDataSource.filter(d => d.bu === buName);

    if (relevantRawLobEntriesForSelectedBu.length === 0) {
      setDisplayableCapacityData([]);
      return;
    }

    const childrenLobsDataRows: CapacityDataRow[] = [];

    const lobsToProcessForThisBu = selectedLineOfBusiness.length === 0 ||
      (selectedLineOfBusiness.length === BUSINESS_UNIT_CONFIG[buName].lonsOfBusiness.length &&
        selectedLineOfBusiness.every(lob => BUSINESS_UNIT_CONFIG[buName].lonsOfBusiness.includes(lob as any)))
      ? relevantRawLobEntriesForSelectedBu
      : relevantRawLobEntriesForSelectedBu.filter(lobEntry => selectedLineOfBusiness.includes(lobEntry.lob));

    lobsToProcessForThisBu.forEach(lobRawEntry => {
      const childrenTeamsDataRows: CapacityDataRow[] = [];
      const teamsToProcess = lobRawEntry.teams || [];

      const lobCalculatedBaseRequiredMinutes: Record<string, number | null> = {};
      periodsToDisplayCurrently.forEach(period => {
        const volume = lobRawEntry.lobVolumeForecast?.[period];
        const avgAHT = lobRawEntry.lobAverageAHT?.[period];
        if (volume !== null && volume !== undefined && avgAHT !== null && avgAHT !== undefined && avgAHT > 0) {
          lobCalculatedBaseRequiredMinutes[period] = volume * avgAHT;
        } else {
          lobCalculatedBaseRequiredMinutes[period] = lobRawEntry.lobTotalBaseRequiredMinutes?.[period] ?? 0;
        }
        if (!lobRawEntry.lobTotalBaseRequiredMinutes) lobRawEntry.lobTotalBaseRequiredMinutes = {};
        lobRawEntry.lobTotalBaseRequiredMinutes[period] = lobCalculatedBaseRequiredMinutes[period];
      });

      teamsToProcess.forEach(teamRawEntry => {
        const periodicTeamMetrics: Record<string, TeamPeriodicMetrics> = {};
        periodsToDisplayCurrently.forEach(period => {
          periodicTeamMetrics[period] = calculateTeamMetricsForPeriod(
            teamRawEntry.periodicInputData[period] || {},
            lobCalculatedBaseRequiredMinutes[period],
            standardWorkMinutes
          );
        });
        childrenTeamsDataRows.push({
          id: `${lobRawEntry.id}_${teamRawEntry.teamName.replace(/\s+/g, '-')}`,
          name: teamRawEntry.teamName,
          level: 2,
          itemType: 'Team',
          periodicData: periodicTeamMetrics,
          lobId: lobRawEntry.id,
        });
      });

      const lobPeriodicData: Record<string, AggregatedPeriodicMetrics> = {};
      periodsToDisplayCurrently.forEach(period => {
        let reqHcSum = 0;
        let actHcSum = 0;
        let lobBaseMinutesForLobPeriod = lobCalculatedBaseRequiredMinutes[period] ?? 0;

        childrenTeamsDataRows.forEach(teamRow => {
          const teamPeriodMetric = teamRow.periodicData[period] as TeamPeriodicMetrics;
          if (teamPeriodMetric) {
            reqHcSum += teamPeriodMetric.requiredHC ?? 0;
            actHcSum += teamPeriodMetric.actualHC ?? 0;
          }
        });
        const overUnderHCSum = (actHcSum !== null && reqHcSum !== null) ? actHcSum - reqHcSum : null;

        lobPeriodicData[period] = {
          requiredHC: reqHcSum,
          actualHC: actHcSum,
          overUnderHC: overUnderHCSum,
          lobTotalBaseRequiredMinutes: lobBaseMinutesForLobPeriod,
        };
      });

      if (childrenTeamsDataRows.length > 0 || teamsToProcess.length > 0) {
        childrenLobsDataRows.push({
          id: lobRawEntry.id,
          name: lobRawEntry.lob,
          level: 1,
          itemType: 'LOB',
          periodicData: lobPeriodicData,
          children: childrenTeamsDataRows,
        });
      }
    });

    if (childrenLobsDataRows.length > 0) {
      const buPeriodicData: Record<string, AggregatedPeriodicMetrics> = {};
      periodsToDisplayCurrently.forEach(period => {
        let reqHcSum = 0;
        let actHcSum = 0;
        let lobTotalBaseReqMinsForBu = 0;
        childrenLobsDataRows.forEach(lobRow => {
          const lobPeriodMetric = lobRow.periodicData[period] as AggregatedPeriodicMetrics;
          if (lobPeriodMetric) {
            reqHcSum += lobPeriodMetric.requiredHC ?? 0;
            actHcSum += lobPeriodMetric.actualHC ?? 0;
            lobTotalBaseReqMinsForBu += lobPeriodMetric.lobTotalBaseRequiredMinutes ?? 0;
          }
        });
        const overUnderHCSum = (actHcSum !== null && reqHcSum !== null) ? actHcSum - reqHcSum : null;

        buPeriodicData[period] = {
          requiredHC: reqHcSum,
          actualHC: actHcSum,
          overUnderHC: overUnderHCSum,
          lobTotalBaseRequiredMinutes: lobTotalBaseReqMinsForBu,
        };
      });
      newDisplayData.push({
        id: buName,
        name: buName,
        level: 0,
        itemType: 'BU',
        periodicData: buPeriodicData,
        children: childrenLobsDataRows,
      });
    }
    setDisplayableCapacityData(newDisplayData);
  }, [
    selectedBusinessUnit,
    selectedLineOfBusiness,
    selectedTimeInterval,
    selectedDateRange,
    localRawCapacityDataSource,
  ]);

  useEffect(() => {
    processDataForTable();
  }, [processDataForTable]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  useEffect(() => {
    const headerScroller = headerPeriodScrollerRef.current;
    const bodyScroller = tableBodyScrollRef.current;

    if (!headerScroller || !bodyScroller) return;

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;
      target.scrollLeft = source.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    };

    const handleHeaderScroll = () => syncScroll(headerScroller, bodyScroller);
    const handleBodyScroll = () => syncScroll(bodyScroller, headerScroller);

    headerScroller.addEventListener('scroll', handleHeaderScroll);
    bodyScroller.addEventListener('scroll', handleBodyScroll);

    return () => {
      headerScroller.removeEventListener('scroll', handleHeaderScroll);
      bodyScroller.removeEventListener('scroll', handleBodyScroll);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <HeaderSection
        filterOptions={filterOptions}
        selectedBusinessUnit={selectedBusinessUnit}
        onSelectBusinessUnit={handleBusinessUnitChange}
        selectedLineOfBusiness={selectedLineOfBusiness}
        onSelectLineOfBusiness={handleLOBChange}
        selectedTimeInterval={selectedTimeInterval}
        onSelectTimeInterval={handleTimeIntervalChange}
        selectedDateRange={selectedDateRange}
        onSelectDateRange={setSelectedDateRange}
        allAvailablePeriods={selectedTimeInterval === "Week" ? ALL_WEEKS_HEADERS : ALL_MONTH_HEADERS}
        displayedPeriodHeaders={displayedPeriodHeaders}
        activeHierarchyContext={activeHierarchyContext}
        headerPeriodScrollerRef={headerPeriodScrollerRef}
      />
      <main className="flex-grow px-4 pb-4 overflow-auto">
        <CapacityTable
          data={displayableCapacityData}
          periodHeaders={displayedPeriodHeaders}
          expandedItems={expandedItems}
          toggleExpand={toggleExpand}
          teamMetricDefinitions={TEAM_METRIC_ROW_DEFINITIONS}
          aggregatedMetricDefinitions={AGGREGATED_METRIC_ROW_DEFINITIONS}
          onTeamMetricChange={handleTeamMetricChange}
          onLobMetricChange={handleLobMetricChange}
          editingCell={editingCell}
          onSetEditingCell={handleSetEditingCell}
          selectedTimeInterval={selectedTimeInterval}
          onActiveHierarchyChange={handleActiveHierarchyChange}
          tableBodyScrollRef={tableBodyScrollRef}
        />
      </main>
    </div>
  );
}
