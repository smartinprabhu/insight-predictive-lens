import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import DateRangePicker from '@/components/DateRangePicker'; // Use existing
import type { DateRange } from 'react-day-picker';
import type { BusinessUnitName, LineOfBusinessName, TimeInterval } from '@/components/types';
import { ChevronDown } from 'lucide-react';

interface OverviewFilterBarProps {
  allBusinessUnits: BusinessUnitName[];
  selectedBusinessUnits: BusinessUnitName[];
  onSelectBusinessUnits: (bus: BusinessUnitName[]) => void;
  availableLinesOfBusiness: LineOfBusinessName[];
  selectedLinesOfBusiness: LineOfBusinessName[];
  onSelectLinesOfBusiness: (lobs: LineOfBusinessName[]) => void;
  selectedTimeInterval: TimeInterval;
  onSelectTimeInterval: (interval: TimeInterval) => void;
  selectedDateRange: DateRange | undefined;
  onSelectDateRange: (dateRange: DateRange | undefined) => void;
  // ALL_WEEKS_HEADERS and ALL_MONTH_HEADERS are not directly needed by OverviewFilterBar
  // as DateRangePicker imports ALL_WEEKS_HEADERS itself from types.tsx
}

const OverviewFilterBar: React.FC<OverviewFilterBarProps> = ({
  allBusinessUnits, selectedBusinessUnits, onSelectBusinessUnits,
  availableLinesOfBusiness, selectedLinesOfBusiness, onSelectLinesOfBusiness,
  selectedTimeInterval, onSelectTimeInterval,
  selectedDateRange, onSelectDateRange
}) => {

  const handleBuSelectionChange = (bu: BusinessUnitName) => {
    const newSelection = selectedBusinessUnits.includes(bu)
      ? selectedBusinessUnits.filter(item => item !== bu)
      : [...selectedBusinessUnits, bu];
    onSelectBusinessUnits(newSelection);
  };

  const handleSelectAllBu = (checked: boolean) => {
    onSelectBusinessUnits(checked ? allBusinessUnits : []);
  };

  const handleLobSelectionChange = (lob: LineOfBusinessName) => {
    const newSelection = selectedLinesOfBusiness.includes(lob)
      ? selectedLinesOfBusiness.filter(item => item !== lob)
      : [...selectedLinesOfBusiness, lob];
    onSelectLinesOfBusiness(newSelection);
  };

  const handleSelectAllLob = (checked: boolean) => {
    onSelectLinesOfBusiness(checked ? availableLinesOfBusiness : []);
  };

  const buDropdownLabel = selectedBusinessUnits.length === 0 ? "Select BUs" :
                         selectedBusinessUnits.length === allBusinessUnits.length ? "All BUs" :
                         `${selectedBusinessUnits.length} BU(s) Selected`;

  const lobDropdownLabel = availableLinesOfBusiness.length === 0 ? "No LOBs" :
                          selectedLinesOfBusiness.length === 0 ? "Select LOBs" :
                          selectedLinesOfBusiness.length === availableLinesOfBusiness.length ? `All ${availableLinesOfBusiness.length} LOBs` :
                          `${selectedLinesOfBusiness.length} LOB(s) Selected`;

  return (
    <div className="p-4 border rounded-lg shadow bg-card flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* BU Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-between">
            {buDropdownLabel} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Business Units</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedBusinessUnits.length === allBusinessUnits.length && allBusinessUnits.length > 0}
            onCheckedChange={handleSelectAllBu}
          >
            Select All ({allBusinessUnits.length})
          </DropdownMenuCheckboxItem>
          {allBusinessUnits.map(bu => (
            <DropdownMenuCheckboxItem
              key={bu}
              checked={selectedBusinessUnits.includes(bu)}
              onCheckedChange={() => handleBuSelectionChange(bu)}
            >
              {bu}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* LOB Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-between" disabled={availableLinesOfBusiness.length === 0}>
            {lobDropdownLabel} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Lines of Business</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedLinesOfBusiness.length === availableLinesOfBusiness.length && availableLinesOfBusiness.length > 0}
            onCheckedChange={handleSelectAllLob}
            disabled={availableLinesOfBusiness.length === 0}
          >
            Select All ({availableLinesOfBusiness.length})
          </DropdownMenuCheckboxItem>
          {availableLinesOfBusiness.map(lob => (
            <DropdownMenuCheckboxItem
              key={lob}
              checked={selectedLinesOfBusiness.includes(lob)}
              onCheckedChange={() => handleLobSelectionChange(lob)}
            >
              {lob}
            </DropdownMenuCheckboxItem>
          ))}
           {availableLinesOfBusiness.length === 0 && <DropdownMenuItem disabled>No LOBs available for selected BUs</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Interval Toggle */}
      <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted">
        <Button variant={selectedTimeInterval === 'Week' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSelectTimeInterval('Week')} className="px-3 h-8">Week</Button>
        <Button variant={selectedTimeInterval === 'Month' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSelectTimeInterval('Month')} className="px-3 h-8">Month</Button>
      </div>

      {/* DateRangePicker */}
      <DateRangePicker date={selectedDateRange} onDateChange={onSelectDateRange} />
    </div>
  );
};

export default OverviewFilterBar;
