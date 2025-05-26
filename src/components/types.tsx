import { DateRange } from '../types/shared';

export interface DashboardData {
  date: string;
  volume: number;
  aht: number;
  csat: number;
}

export interface Insight {
  date: string;
  event: string;
  impact: string;
}

export interface LobData {
  date: string;
  [lob: string]: number | string;
}

export interface PlanningData {
  date: string;
  [lob: string]: number | string;
}

export interface PlanningFormValues {
  date: Date;
  [lob: string]: number;
}

export interface ActualsFormValues {
  date: Date;
  [lob: string]: number;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface HeaderSectionProps {
  selectedDateRange: DateRange;
  forecastPeriod: string;
  onDateRangeChange: (range: DateRange) => void;
  onForecastPeriodChange: (period: string) => void;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  isPercentage?: boolean;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export interface ForecastTabProps {
  aggregationType: string;
  modelType: string;
  forecastPeriod: string;
  data: any[];
  insights: any[];
}
