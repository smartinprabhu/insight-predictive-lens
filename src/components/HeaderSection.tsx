import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, ChevronDown, Building2, Briefcase, Download, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AiGroupingDialog from "./AiGroupingDialog";
import DateRangePicker from "./DateRangePicker";
import { BusinessUnitName, TimeInterval, DateRange } from "./types";

interface HeaderSectionProps {
  filterOptions: { businessUnits: BusinessUnitName[]; linesOfBusiness: string[] };
  selectedBusinessUnit: BusinessUnitName;
  onSelectBusinessUnit: (value: BusinessUnitName) => void;
  selectedLineOfBusiness: string[];
  onSelectLineOfBusiness: (value: string[]) => void;
  selectedTimeInterval: TimeInterval;
  onSelectTimeInterval: (value: TimeInterval) => void;
  selectedDateRange: DateRange | undefined;
  onSelectDateRange: (value: DateRange | undefined) => void;
  allAvailablePeriods: string[];
  displayedPeriodHeaders: string[];
  activeHierarchyContext: string;
  headerPeriodScrollerRef: React.RefObject<HTMLDivElement>;
}

export default function HeaderSection({
  filterOptions,
  selectedBusinessUnit,
  onSelectBusinessUnit,
  selectedLineOfBusiness,
  onSelectLineOfBusiness,
  selectedTimeInterval,
  onSelectTimeInterval,
  selectedDateRange,
  onSelectDateRange,
  allAvailablePeriods,
  displayedPeriodHeaders,
  activeHierarchyContext,
  headerPeriodScrollerRef,
}: HeaderSectionProps) {
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const handleLobSelectionChange = (lob: string, checked: boolean) => {
    const newSelectedLOBs = checked
      ? [...selectedLineOfBusiness, lob]
      : selectedLineOfBusiness.filter((item) => item !== lob);
    onSelectLineOfBusiness(newSelectedLOBs);
  };

  const actualLobsForCurrentBu = filterOptions.linesOfBusiness;
  let lobDropdownLabel = "Select LOBs";
  if (selectedLineOfBusiness.length === 1) {
    lobDropdownLabel = selectedLineOfBusiness[0];
  } else if (actualLobsForCurrentBu.length > 0 && selectedLineOfBusiness.length === actualLobsForCurrentBu.length) {
    lobDropdownLabel = `All ${actualLobsForCurrentBu.length} LOBs`;
  } else if (selectedLineOfBusiness.length > 1) {
    lobDropdownLabel = `${selectedLineOfBusiness.length} LOBs Selected`;
  } else if (actualLobsForCurrentBu.length === 0) {
    lobDropdownLabel = "No LOBs";
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 bg-background p-4 border-b border-border">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h1 className="text-2xl font-semibold text-foreground">Capacity Insights</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2" /> Export
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Export current view as CSV (not implemented)</p></TooltipContent>
            </Tooltip>
            <Button variant="default" size="sm" onClick={() => setIsAiDialogOpen(true)}>
              <Zap className="mr-2" /> Assumptions Assister
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-x-4 gap-y-2">
          <Select value={selectedBusinessUnit} onValueChange={onSelectBusinessUnit}>
            <SelectTrigger className="w-full lg:w-[180px] text-sm h-9">
              <Building2 className="mr-2 opacity-70" />
              <SelectValue placeholder="Business Unit" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.businessUnits.map((bu) => (
                <SelectItem key={bu} value={bu}>
                  {bu}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full lg:w-[240px] text-sm h-9 justify-between">
                <div className="flex items-center truncate">
                  <Briefcase className="mr-2 opacity-70 flex-shrink-0" />
                  <span className="truncate" title={lobDropdownLabel}>{lobDropdownLabel}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full md:w-[240px]">
              <DropdownMenuLabel>Select Lines of Business</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {actualLobsForCurrentBu.length > 0 ? (
                actualLobsForCurrentBu.map((lob) => (
                  <DropdownMenuCheckboxItem
                    key={lob}
                    checked={selectedLineOfBusiness.includes(lob)}
                    onCheckedChange={(checkedValue) => handleLobSelectionChange(lob, Boolean(checkedValue))}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {lob}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No LOBs available for {selectedBusinessUnit}</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 border rounded-md p-1 bg-muted">
            <Button
              variant={selectedTimeInterval === "Week" ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelectTimeInterval("Week")}
              className="h-7 px-3"
            >
              Week
            </Button>
            <Button
              variant={selectedTimeInterval === "Month" ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelectTimeInterval("Month")}
              className="h-7 px-3"
            >
              Month
            </Button>
          </div>
          <DateRangePicker date={selectedDateRange} onDateChange={onSelectDateRange} />
        </div>

        <div className="flex items-center border-b border-border bg-card px-4 h-12 mt-4">
          <div className="sticky left-0 z-55 bg-card min-w-[300px] whitespace-nowrap px-4 py-2 text-sm font-semibold text-foreground h-full flex items-center">
            {activeHierarchyContext}
          </div>
          <div ref={headerPeriodScrollerRef} className="flex-grow overflow-x-auto scrollbar-hide whitespace-nowrap h-full">
            <div className="flex h-full">
              {displayedPeriodHeaders.map((period) => {
                const parts = period.split(': ');
                const weekLabelPart = parts.length > 0 ? parts[0].replace("FWk", "W") : period;
                let dateRangePart = "";
                if (parts.length > 1) {
                  const dateAndYearPart = parts[1];
                  const dateMatch = dateAndYearPart.match(/^(\d{2}\/\d{2}-\d{2}\/\d{2})/);
                  if (dateMatch) {
                    dateRangePart = dateMatch[1];
                  }
                }
                return (
                  <div
                    key={period}
                    className="text-right min-w-[100px] px-2 py-2 border-l border-border/50 h-full flex flex-col justify-center items-end"
                  >
                    <span className="text-sm font-medium text-foreground">{weekLabelPart}</span>
                    {dateRangePart && (
                      <span className="text-xs text-muted-foreground">
                        ({dateRangePart})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <AiGroupingDialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen} />
      </header>
    </TooltipProvider>
  );
}
