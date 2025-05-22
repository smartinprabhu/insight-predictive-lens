import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui2/button";
import { Calendar } from "@/components/ui2/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui2/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { ALL_WEEKS_HEADERS, findFiscalWeekHeaderForDate, getHeaderDateRange } from "./types";
import { getWeek, startOfWeek, endOfWeek, isBefore, isSameDay, addWeeks, addDays } from 'date-fns';

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

export default function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [clientButtonText, setClientButtonText] = useState("Loading...");

  useEffect(() => {
    let newButtonText = "Pick a date range";
    if (typeof window !== 'undefined' && date?.from) {
      const fromDateObj = date.from;
      const fromFiscalWeekInfo = findFiscalWeekHeaderForDate(fromDateObj, ALL_WEEKS_HEADERS);
      const fromFiscalWeekLabel = fromFiscalWeekInfo ? fromFiscalWeekInfo.split(':')[0].replace("FWk", "W") : `W${getWeek(fromDateObj, { weekStartsOn: 1 })}`;

      const formattedFromDate = `${String(fromDateObj.getUTCDate()).padStart(2, '0')}/${String(fromDateObj.getUTCMonth() + 1).padStart(2, '0')}/${fromDateObj.getUTCFullYear()}`;

      newButtonText = `${fromFiscalWeekLabel} (${formattedFromDate})`;

      if (date.to) {
        const toDateObj = date.to;
        const toFiscalWeekInfo = findFiscalWeekHeaderForDate(toDateObj, ALL_WEEKS_HEADERS);
        const toFiscalWeekLabel = toFiscalWeekInfo ? toFiscalWeekInfo.split(':')[0].replace("FWk", "W") : `W${getWeek(toDateObj, { weekStartsOn: 1 })}`;
        const formattedToDate = `${String(toDateObj.getUTCDate()).padStart(2, '0')}/${String(toDateObj.getUTCMonth() + 1).padStart(2, '0')}/${toDateObj.getUTCFullYear()}`;

        const fromWeekStartForLabel = startOfWeek(fromDateObj, { weekStartsOn: 1 });
        const toWeekStartForLabel = startOfWeek(toDateObj, { weekStartsOn: 1 });

        if (!isSameDay(fromWeekStartForLabel, toWeekStartForLabel)) {
          newButtonText += ` - ${toFiscalWeekLabel} (${formattedToDate})`;
        }
      }
    }
    setClientButtonText(newButtonText);
  }, [date]);

  const yearsInHeaders = useMemo(() =>
    [...new Set(ALL_WEEKS_HEADERS.map(h => {
      const match = h.match(/\((\d{4})\)$/);
      return match ? parseInt(match[1]) : 0;
    }).filter(y => y > 0))]
  , []);

  const minYear = yearsInHeaders.length > 0 ? Math.min(...yearsInHeaders) : new Date().getUTCFullYear();
  const maxYear = yearsInHeaders.length > 0 ? Math.max(...yearsInHeaders) : new Date().getUTCFullYear() + 1;

  const defaultCalendarMonth = date?.from instanceof Date ? date.from : new Date(Date.UTC(minYear, 0, 1));

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full lg:w-[380px] justify-start text-left font-normal h-9",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{clientButtonText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            weekStartsOn={1}
            captionLayout="dropdown-buttons"
            fromYear={minYear}
            toYear={maxYear}
            defaultMonth={defaultCalendarMonth}
            selected={date}
            onSelect={(range: DateRange | undefined) => {
              let newFrom = range?.from;
              let newTo = range?.to;

              if (newFrom) {
                newFrom = startOfWeek(newFrom, { weekStartsOn: 1 });
              }
              if (newTo) {
                newTo = endOfWeek(newTo, { weekStartsOn: 1 });
              }

              if (newFrom && newTo && isBefore(newTo, newFrom)) {
                newTo = endOfWeek(newFrom, { weekStartsOn: 1 });
              }

              const processedRange: DateRange | undefined = newFrom
                ? { from: newFrom, to: newTo || endOfWeek(newFrom, { weekStartsOn: 1 }) }
                : undefined;
              onDateChange(processedRange);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
