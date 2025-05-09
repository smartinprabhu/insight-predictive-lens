import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Home, FileText, BarChart, Info, LogOut, RefreshCw, Upload } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DashboardHeader } from "./DashboardHeader";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton as SidebarMenuButtonOriginal,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ModelConfiguration } from "./ModelConfiguration";
import CircularProgress from '@mui/material/CircularProgress';
import LoadingSkeleton from "./LoadingSkeleton";
import { UploadDataForm } from "./UploadDataForm";
import { TabNavigation } from "./TabNavigation";
import { ActualDataTab } from "./ActualDataTab";
import { ForecastTab } from "./ForecastTab";
import { ModelValidationTab } from "./ModelValidationTab";
import { InsightsTab } from "./InsightsTab";
import { useToast } from "@/hooks/use-toast";
import { KPIMetricsCard } from "./KPIMetricsCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';

// Format large numbers with suffixes for better readability
function formatNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  const absValue = Math.abs(value);
  if (absValue >= 1.0e9) {
    return (value / 1.0e9).toFixed(2).replace(/\.00$/, "") + "B";
  } else if (absValue >= 1.0e6) {
    return (value / 1.0e6).toFixed(2).replace(/\.00$/, "") + "M";
  } else if (absValue >= 1.0e3) {
    return (value / 1.0e3).toFixed(2).replace(/\.00$/, "") + "K";
  } else {
    return value.toString();
  }
}

// Helper to get ISO week number from a date string
interface DashboardProps {
  onReset: () => void;
  apiResponse: any;
}

function getISOWeekNumber(dateStr: string): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  // Set to nearest Thursday: current date + 4 - current day number
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Monday=0, Sunday=6
  target.setDate(target.getDate() - dayNr + 3);

  // January 4th is always in week 1
  const jan4 = new Date(target.getFullYear(), 0, 4);
  const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
  return 1 + Math.floor(dayDiff / 7);
}

export const Dashboard = ({ onReset, apiResponse }: DashboardProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [modelType, setModelType] = useState<string>("Prophet");
  const [tempModelType, setTempModelType] = useState<string>("Prophet");
  const [forecastPeriod, setForecastPeriod] = useState(4);
  const [tempForecastPeriod, setTempForecastPeriod] = useState(4);
  const [aggregationType, setAggregationType] = useState("Weekly");
  const [tempAggregationType, setTempAggregationType] = useState("Weekly");
  const [modelValidationForecastPeriod, setModelValidationForecastPeriod] = useState(4);
  const [activeTab, setActiveTab] = useState("actualData");
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [futureData, setFutureData] = useState<any[]>([]);
  const [kpiSourceData, setKpiSourceData] = useState<any[]>([]);
  const [kpiInitialized, setKpiInitialized] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loadingIcons, setLoadingIcons] = useState({ forecast: false, insights: false });
  const [insights, setInsights] = useState<any>({});

  const [openModal, setOpenModal] = useState(false);
  const [explanation, setExplanation] = useState(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredData = kpiSourceData?.filter((item: any) => {
    const dateStr = item.date || item.ds;
    if (!dateStr) return false;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  }) || [];

  const computeKPIs = (weekNumber: number | null = null) => {
    const categories = [
      "Total IB Units",
      "exceptions",
      "inventory",
      "returns",
      "wfs_china",
    ];
    const labels = [
      "IB Units",
      "IB Exceptions",
      "Inventory",
      "Customer Returns",
      "WSF China",
    ];

    if (weekNumber === null && kpiSourceData && kpiSourceData.length > 0) {
      const lastRecord = kpiSourceData[kpiSourceData.length - 1];
      const dateStr = lastRecord.date || lastRecord.ds;
      weekNumber = getISOWeekNumber(dateStr);
    }

    if (!kpiSourceData || kpiSourceData.length < 2) {
      return categories.map((cat, idx) => ({
        title: `${labels[idx]}${weekNumber ? ` (W${weekNumber})` : ""}`,
        value: 0,
        subtitle: `Total ${labels[idx]}`,
        changeValue: 0,
        changeText: "from previous period",
      }));
    }

    const latest = kpiSourceData[kpiSourceData.length - 1];
    const previous = kpiSourceData[kpiSourceData.length - 2];

    return categories.map((cat, idx) => {
      const latestVal = Number(latest[cat]) || 0;
      const prevVal = Number(previous[cat]) || 0;
      const change = prevVal !== 0 ? ((latestVal - prevVal) / prevVal) * 100 : 0;
      const invertChange = ["exceptions", "inventory", "returns", "wfs_china"].includes(
        cat
      );

      return {
        title: `${labels[idx]}${weekNumber ? ` (W${weekNumber})` : ""}`,
        value: Number(latestVal.toFixed(2)),
        subtitle: `Total ${labels[idx]}`,
        changeValue: Number(change.toFixed(2)),
        changeText: "from previous period",
        invertChange: invertChange,
      };
    });
  };

  const [kpiData, setKpiData] = useState<any[]>([]);
  const [lastWeekNumber, setLastWeekNumber] = useState<number | null>(null);

  // Update KPIs only when analysisData changes
  useEffect(() => {
    let weekNum: number | null = null;
    if (analysisData && analysisData.length > 0) {
      const lastRecord = analysisData[analysisData.length - 1];
      let parsedWeek: number | null = null;

      if (lastRecord.week !== undefined && lastRecord.week !== null) {
        parsedWeek = Number(lastRecord.week);
        if (isNaN(parsedWeek) || parsedWeek < 1 || parsedWeek > 53) parsedWeek = null;
      }

      if (parsedWeek === null && lastRecord.Week !== undefined && lastRecord.Week !== null) {
        parsedWeek = Number(lastRecord.Week);
        if (isNaN(parsedWeek) || parsedWeek < 1 || parsedWeek > 53) parsedWeek = null;
      }

      if (parsedWeek === null) {
        const dateStr = lastRecord.date || lastRecord.ds || lastRecord.Week || lastRecord.week;
        const isoWeek = getISOWeekNumber(dateStr);
        if (isoWeek && !isNaN(isoWeek) && isoWeek >= 1 && isoWeek <= 53) {
          parsedWeek = isoWeek;
        } else {
          parsedWeek = null;
        }
      }

      if (parsedWeek !== null && !isNaN(parsedWeek)) {
        parsedWeek = parsedWeek + 1;
        if (parsedWeek > 53) parsedWeek = 1;
      }
      weekNum = parsedWeek;
    }
    setLastWeekNumber(weekNum);
    const newKPIs = computeKPIs(weekNum);
    setKpiData(newKPIs);
  }, [analysisData]);

  // Initial forecast API call on mount
  useEffect(() => {
    const fetchInitialForecast = async () => {
      const formData = new FormData();
      formData.append("weeks", "4");
      formData.append("model_type", modelType);

      try {
        const response = await axios.post("http://localhost:5011/forecast", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.data?.dz_df && response.data?.future_df) {
          setAnalysisData(response.data.dz_df);
          setFutureData(response.data.future_df);
          if (!kpiInitialized) {
            setKpiSourceData(response.data.dz_df);
            setKpiInitialized(true);
          }
        } else if (response.data?.dz_df) {
          setAnalysisData(response.data.dz_df);
          setFutureData([]);
          if (!kpiInitialized) {
            setKpiSourceData(response.data.dz_df);
            setKpiInitialized(true);
          }
        } else {
          setAnalysisData(response.data);
          setFutureData([]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch initial forecast data.",
        });
      }
    };

    fetchInitialForecast();
  }, []);

  // Fetch insights from analyze_forecasts
  useEffect(() => {
    const fetchAnalyzeForecasts = async () => {
      try {
        const response = await axios.post("http://localhost:5004/analyze_forecasts");

        setInsights(response.data.insights || {});
        toast({
          title: "Insights fetched",
          description: "Insights data has been successfully loaded.",
        });
      } catch (error) {
        console.error("Error fetching insights:", error); // Add error logging
        toast({
          title: "Error",
          description: "Failed to fetch insights data.",
        });
      }
    };

    fetchAnalyzeForecasts();
  }, []);

  const handleApplyChanges = async (forecastPeriod: number, modelType: string) => {
    try {
      setLoadingIcons(prev => ({ ...prev, forecast: true }));
      if (!file && forecastType === "external") {
        toast({
          title: "No file uploaded",
          description: "Please upload a file for external factors.",
        });
        setLoadingIcons(prev => ({ ...prev, forecast: false }));
        return;
      }

      const formData = new FormData();
      formData.append("weeks", tempForecastPeriod.toString());

      let model_type = "";
      if (forecastType === "single") {
        model_type = selectedModel;
      } else if (forecastType === "hybrid") {
        model_type = "hybrid";
        formData.append("hybrid_models", JSON.stringify(selectedHybridModels));
      } else if (forecastType === "external") {
        model_type = "external";
        // Remove the reference to externalFile as it's not defined
        // If needed, use externalFactors instead
        // if (externalFactors) {
        //   formData.append("external_factors", JSON.stringify(externalFactors));
        // }
      }
      formData.append("model_type", model_type);

      setFormData(formData);

      const response = await axios.post("http://localhost:5011/forecast", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Analysis complete",
        description: "Your dashboard has been updated successfully.",
      });

      let processedData = response.data;

      if (aggregationType === "Monthly" && Array.isArray(processedData)) {
        const monthlyData: Record<string, any> = {};

        processedData.forEach((item: any) => {
          const dateStr = item.date || item.ds; // support 'date' or 'ds'
          if (!dateStr) return;

          const monthKey = dateStr.slice(0, 7); // 'YYYY-MM'

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { ...item, count: 1 };
            monthlyData[monthKey].date = monthKey + "-01"; // set to first of month
          } else {
            Object.keys(item).forEach((key) => {
              if (typeof item[key] === "number") {
                monthlyData[monthKey][key] += item[key];
              }
            });
            monthlyData[monthKey].count += 1;
          }
        });

        // Average numeric fields
        processedData = Object.values(monthlyData).map((item: any) => {
          const count = item.count;
          const newItem: any = { ...item };
          Object.keys(newItem).forEach((key) => {
            if (typeof newItem[key] === "number" && key !== "count") {
              newItem[key] = newItem[key] / count;
            }
          });
          delete newItem.count;
          return newItem;
        });
      }

      if (processedData?.dz_df && processedData?.future_df) {
        setAnalysisData(processedData.dz_df);
        setFutureData(processedData.future_df);
        if (!kpiInitialized) {
          setKpiSourceData(processedData.dz_df);
          setKpiInitialized(true);
        }
      } else {
        setAnalysisData(processedData);
        setFutureData([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the dashboard.",
      });
    } finally {
      setLoadingIcons(prev => ({ ...prev, forecast: false }));
    }
  };

  const tabs = [
    { id: "actualData", name: "Historical Data" },
    { id: "forecast", name: "Trends & Forecast" },
    { id: "modelValidation", name: "Model Validation" },
    { id: "insights", name: "Insights" },
  ];

  const handleRefresh = () => {
    toast({
      title: "Refreshing Dashboard",
      description: "Updating with the latest data...",
    });
  };

  // Draggable Forecast Settings widget state
  const [showForecastSettings, setShowForecastSettings] = useState(true);

  useEffect(() => {
    if (activeTab === "forecast" || activeTab === "modelValidation") {
      setShowForecastSettings(true);
    } else {
      setShowForecastSettings(false);
    }
  }, [activeTab]);

  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: window.innerWidth - 380, // offset more to the left so fully visible
    y: 40, // a bit lower from top
  });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPos({
        x: e.clientX - rel.x,
        y: e.clientY - rel.y,
      });
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, rel]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "actualData":
        return apiResponse ? (
          <ActualDataTab data={apiResponse} aggregationType={aggregationType} />
        ) : (
          <div>No data available</div>
        );
      case "forecast":
        return analysisData.length > 0 || futureData.length > 0 ? (
          <ForecastTab
            aggregationType={aggregationType}
            modelType={modelType}
            forecastPeriod={forecastPeriod}
            data={{
              dz_df: Array.isArray(analysisData) ? analysisData : [],
              future_df: Array.isArray(futureData) ? futureData : [],
            }}
            insights={insights}
            loading={loadingIcons.forecast || loadingIcons.insights}
          />
        ) : (
          <div>No data available</div>
        );
      case "modelValidation":
        return apiResponse ? (
          <ModelValidationTab
            aggregationType={aggregationType}
            data={apiResponse}
            modelType={modelType}
          />
        ) : (
          <div>No data available</div>
        );
      case "insights":
        return loadingIcons.insights ? (
          <div className="space-y-4">
            <LoadingSkeleton />
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          </div>
        ) : (
          insights && Object.keys(insights).length > 0 ? (
            <InsightsTab data={apiResponse} insights={insights} />
          ) : (
            <div className="text-center text-gray-500 py-10">No insights data available</div>
          )
        );
      default:
        return apiResponse ? (
          <ActualDataTab data={apiResponse} aggregationType={aggregationType} />
        ) : (
          <div>No data available</div>
        );
    }
  };

  // Current date for KPI reporting
  const currentDate = new Date();
  const kpiTimePeriod = `${currentDate.toLocaleString("default", {
    month: "long",
  })} ${currentDate.getFullYear()}`;

  // New state variables for forecast settings
  const [forecastType, setForecastType] = useState("single");
  const [selectedModel, setSelectedModel] = useState("Prophet");
  const [selectedHybridModels, setSelectedHybridModels] = useState<string[]>([]);
  const [externalFactors, setExternalFactors] = useState({
    majorEvents: false,
    dynamicTarget: false,
    dynamicTargetStartDate: "",
    dynamicTargetEndDate: "",
    dynamicTargetDecreasePercentage: "",
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

return (
  <SidebarProvider>
  <div className="flex h-screen w-full overflow-hidden">
    <Sidebar collapsible="icon" className="bg-gray-100 dark:bg-gray-800">
      <SidebarContent>
        <div className="flex flex-col items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between w-full p-2">
            <SidebarTrigger />
            {!isSidebarCollapsed && (
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Predictive Analytics</span>
            )}
          </div>
          <img
            src="data:image/png;base64,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"
            alt="Logo"
            
            className="w-20 h-20 mb-3 mx-auto"
          />
          {/* Predictive Analytics */}
          {!isSidebarCollapsed && (
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200"></span>
          )}
        </div>
        <SidebarGroup className="w-auto mt-4">
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {tabs.map((tab) => (
                <SidebarMenuItem key={tab.id}>
                  <SidebarMenuButtonOriginal
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gray-200 dark:bg-gray-600 text-primary font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.id === "actualData" && <FileText className="h-5 w-5" />}
                    {tab.id === "forecast" && <BarChart className="h-5 w-5" />}
                    {tab.id === "modelValidation" && <BarChart className="h-5 w-5" />}
                    {tab.id === "insights" && <Info className="h-5 w-5" />}
                    <span className="text-sm font-medium">{tab.name}</span>
                  </SidebarMenuButtonOriginal>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButtonOriginal
                  tooltip="Upload Data"
                  onClick={() => setOpenModal(true)}
                  className="flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload Data</span>
                </SidebarMenuButtonOriginal>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButtonOriginal
              tooltip="Logout"
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </SidebarMenuButtonOriginal>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-0 sticky top-4 z-10">
            <DashboardHeader
              title="Walmart"
              lastUpdated={new Date().toLocaleDateString("en-GB")}
              forecastPeriod={`${forecastPeriod} weeks forecast | ${forecastPeriod} weeks history`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Dashboard
            </Button>
            <ThemeToggle />
          </div>
        </div>

          {/* Filter & Aggregation Button Moved Here */}
          <div className="flex justify-end mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Filter & Aggregation
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-4 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="Start Date"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="End Date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Aggregation</label>
                  <select
                    value={aggregationType}
                    onChange={(e) => setAggregationType(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* KPI Metrics */}
          <div className="mb-4 flex justify-between items-center px-1">
            <h2 className="text-lg font-medium text-foreground">
              Business Performance Metrics
            </h2>
            <div className="text-sm text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-3 py-1 rounded-md shadow-sm border border-border/30">
              <span>As of {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {kpiData.map((kpi, index) => (
              <KPIMetricsCard
                key={index}
                title={kpi.title}
                value={formatNumber(kpi.value)}
                subtitle={kpi.subtitle}
                changeValue={kpi.changeValue}
                changeText={kpi.changeText}
                invertChange={kpi.invertChange}
              />
            ))}
          </div>

          {/* Forecast Settings Button Moved Here (conditionally) */}
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              {activeTab === "forecast" && (
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Forecast Settings
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[1000px] h-screen bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto fixed top-0 right-0 z-[1000]"
                  >
                    <SheetHeader>
                      <SheetTitle>Forecast Settings</SheetTitle>
                    </SheetHeader>
                    {loadingIcons.forecast ? (
                      <div className="space-y-4 p-4">
                        <LoadingSkeleton />
                        <div className="flex justify-center">
                          <CircularProgress />
                        </div>
                      </div>
                    ) : (
                      <TabContext value={forecastType}>
                        <div className="space-y-4 p-4">
                          {/* Forecast Period */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Forecast Period</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={tempForecastPeriod}
                                onChange={(e) => setTempForecastPeriod(Number(e.target.value))}
                                className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                              />
                              <select
                                value={tempAggregationType}
                                onChange={(e) => setTempAggregationType(e.target.value)}
                                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                              >
                                <option value="Weekly">Weeks</option>
                                <option value="Monthly">Months</option>
                              </select>
                            </div>
                          </div>

                          {/* Model Type Tabs */}
                          <TabList
                            onChange={(event, newValue) => setForecastType(newValue)}
                            aria-label="model-type-tabs"
                          >
                            <Tab label="Modeling" value="single" />
                            <Tab label="Hybrid" value="hybrid" />
                          </TabList>

                          {/* Model Selection Panels */}
                          <TabPanel value="single">
                            <div>
                              <label className="block text-sm font-medium mb-2">Select Model</label>
                              <div className="space-y-2">
                                {["Prophet", "ARIMA", "SARIMAX", "CatBoost", "XGBoost", "LightGBM"].map(
                                  (model) => (
                                    <label key={model} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        value={model}
                                        checked={selectedModel === model}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="dark:bg-gray-700 dark:text-white"
                                      />
                                      <span>{model}</span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>
                          </TabPanel>
                          <TabPanel value="hybrid">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Select Hybrid Model</label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="ml-2 flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        <Info className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      className="w-[300px] bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs p-2 rounded-md"
                                    >
                                      <p className="font-bold mb-1">Hybrid Models:</p>
                                      <p className="mb-1"><span className="font-bold">Prophet + XGBoost:</span> Prophet captures broad trends/seasonality while XGBoost models residual irregularities.</p>
                                      <p className="mb-1"><span className="font-bold">ARIMA + LightGBM:</span> ARIMA handles linear autocorrelation, LightGBM captures nonlinear patterns.</p>
                                      <p><span className="font-bold">SARIMAX + CatBoost:</span> SARIMAX fits seasonal/exogenous factors, CatBoost learns complex interactions.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="space-y-2">
                                {[
                                  { label: "ARIMA + LightGBM", value: "ARIMA+LightGBM", description: "ARIMA provides a solid statistical backbone for linear autocorrelation, while LightGBM quickly captures any leftover nonlinear patterns at scale—great for large datasets." },
                                  { label: "Prophet + XGBoost", value: "Prophet+XGBoost", description: "Prophet nails the broad trend/seasonality and holiday effects, then XGBoost aggressively models the residual irregularities, giving you both interpretability and strong anomaly handling." },
                                  { label: "SARIMAX + CatBoost", value: "SARIMAX+CatBoost", description: "SARIMAX delivers fine‑grained seasonal and exogenous‑regressor fits; CatBoost then flexibly learns any complex interactions or nonlinear 'leftovers.'" },
                                ].map((hybridModel) => (
                                  <label key={hybridModel.value} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      value={hybridModel.value}
                                      checked={selectedHybridModels[0] === hybridModel.value}
                                      onChange={(e) => setSelectedHybridModels([e.target.value])}
                                      className="dark:bg-gray-700 dark:text-white"
                                    />
                                    <span>{hybridModel.label}</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="ml-2 flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                            <Info className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="right"
                                          className="w-[300px] bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs p-2 rounded-md"
                                        >
                                          <p>{hybridModel.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </TabPanel>

                          {/* External Factors Section (Always Visible) */}
                          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-sm font-medium">External Factors</h3>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={externalFactors.majorEvents}
                                onChange={(e) =>
                                  setExternalFactors({ ...externalFactors, majorEvents: e.target.checked })
                                }
                                className="dark:bg-gray-700 dark:text-white"
                              />
                              <span>Major Events</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="ml-2 flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                      <Info className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs p-1 rounded-md"
                                  >
                                    <p>Includes holidays and major events like Christmas, New Year, etc.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </label>
                            <div>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={externalFactors.dynamicTarget}
                                  onChange={(e) =>
                                    setExternalFactors({ ...externalFactors, dynamicTarget: e.target.checked })
                                  }
                                  className="dark:bg-gray-700 dark:text-white"
                                />
                                <span>Dynamic Target</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="ml-2 flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        <Info className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs p-1 rounded-md"
                                    >
                                      <p>
                                        Specify a percentage amount for a specific date range to see its impact
                                        on actual and predicted data.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </label>
                              {externalFactors.dynamicTarget && (
                                <div className="ml-6 space-y-2 mt-2">
                                  <input
                                    type="date"
                                    value={externalFactors.dynamicTargetStartDate}
                                    onChange={(e) =>
                                      setExternalFactors({
                                        ...externalFactors,
                                        dynamicTargetStartDate: e.target.value,
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="Start Date"
                                  />
                                  <input
                                    type="date"
                                    value={externalFactors.dynamicTargetEndDate}
                                    onChange={(e) =>
                                      setExternalFactors({
                                        ...externalFactors,
                                        dynamicTargetEndDate: e.target.value,
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="End Date"
                                  />
                                  <input
                                    type="number"
                                    value={externalFactors.dynamicTargetDecreasePercentage}
                                    onChange={(e) =>
                                      setExternalFactors({
                                        ...externalFactors,
                                        dynamicTargetDecreasePercentage: e.target.value,
                                      })
                                    }
                                    className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="Decrease Percentage"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Apply Changes Button */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={async () => {
                                setIsDrawerOpen(false);
                                await handleApplyChanges(tempForecastPeriod, modelType);
                                toast({
                                  title: "Settings Applied",
                                  description: "Forecast settings have been updated successfully.",
                                });
                              }}
                            >
                              Apply Changes
                            </Button>
                          </div>
                        </div>
                      </TabContext>
                    )}
                  </SheetContent>
                </Sheet>
              )}
              {activeTab === "modelValidation" && (
                <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Model Validation Settings
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[500px] h-screen bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto fixed top-0 right-0 z-[1000]"
                  >
                    <SheetHeader>
                      <SheetTitle>Model Validation Settings</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 p-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Model</label>
                        <div className="space-y-2">
                          {["Prophet", "ARIMA", "SARIMAX", "CatBoost", "XGBoost", "LightGBM"].map(
                            (model) => (
                              <label key={model} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={model}
                                  checked={(tempModelType as string[]).includes(model)}
                                  onChange={(e) => {
                                    const newModelType = [...tempModelType];
                                    if (newModelType.includes(model)) {
                                      newModelType.splice(newModelType.indexOf(model), 1);
                                    } else {
                                      newModelType.push(model);
                                    }
                                    setTempModelType(newModelType);
                                  }}
                                  className="dark:bg-gray-700 dark:text-white"
                                />
                                <span>{model}</span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      {/* External Factors Section */}
                      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-sm font-medium">External Factors</h3>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={externalFactors.majorEvents}
                            onChange={(e) =>
                              setExternalFactors({ ...externalFactors, majorEvents: e.target.checked })
                            }
                            className="dark:bg-gray-700 dark:text-white"
                          />
                          <span>Major Events</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="ml-2 flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                  <Info className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs p-1 rounded-md"
                              >
                                <p>Includes holidays and major events like Christmas, New Year, etc.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </label>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={externalFactors.dynamicTarget}
                              onChange={(e) =>
                                setExternalFactors({ ...externalFactors, dynamicTarget: e.target.checked })
                              }
                              className="dark:bg-gray-700 dark:text-white"
                            />
                            <span>Dynamic Target</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="ml-2 flex items-center justify-center w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    <Info className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs p-1 rounded-md"
                                >
                                  <p>
                                    Specify a percentage amount for a specific date range to see its impact
                                    on actual and predicted data.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </label>
                          {externalFactors.dynamicTarget && (
                            <div className="ml-6 space-y-2 mt-2">
                              <input
                                type="date"
                                value={externalFactors.dynamicTargetStartDate}
                                onChange={(e) =>
                                  setExternalFactors({
                                    ...externalFactors,
                                    dynamicTargetStartDate: e.target.value,
                                  })
                                }
                                className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                                placeholder="Start Date"
                              />
                              <input
                                type="date"
                                value={externalFactors.dynamicTargetEndDate}
                                onChange={(e) =>
                                  setExternalFactors({
                                    ...externalFactors,
                                    dynamicTargetEndDate: e.target.value,
                                  })
                                }
                                className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                                placeholder="End Date"
                              />
                              <input
                                type="number"
                                value={externalFactors.dynamicTargetDecreasePercentage}
                                onChange={(e) =>
                                  setExternalFactors({
                                    ...externalFactors,
                                    dynamicTargetDecreasePercentage: e.target.value,
                                  })
                                }
                                className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                                placeholder="Decrease Percentage"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            setIsDrawerOpen(false);
                            setModelType(tempModelType.join(','));
                            toast({
                              title: "Settings Applied",
                              description: "Model validation settings have been updated successfully.",
                            });
                          }}
                        >
                          Apply Changes
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
            <div className="p-4">
              {renderTabContent()}
            </div>
          </div>

          <footer className="mt-8 py-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 Zentere. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
