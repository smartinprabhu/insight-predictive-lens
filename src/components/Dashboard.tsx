import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Home, FileText, BarChart, Info, LogOut, RefreshCw, Upload } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DashboardHeader } from "./DashboardHeader";
import CustomSidebar from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import KPIMetrics from "./KPIMetrics";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import PlanningTab from "./PlanningTab";
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
import { Checkbox } from "@/components/ui/checkbox";

// List of API URLs to try
const apiUrls = [
  "http://localhost:5011",
  "http://15.206.169.202:5011",
  "http://aptino-dev.zentere.com:5011"
];

// Helper function to try each URL until one succeeds
async function tryApiUrls(endpoint, formData) {
  for (const url of apiUrls) {
    try {
      const response = await axios.post(`${url}/${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(`Failed to connect to ${url}:`, error);
    }
  }
  throw new Error("All API URLs failed");
}

// Helper to get ISO week number from a date string
function getISOWeekNumber(dateStr: string | undefined): number | null {
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

interface DashboardProps {
  onReset: () => void;
  apiResponse: any;
}

export const Dashboard = ({ onReset, apiResponse }: DashboardProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [modelType, setModelType] = useState("Prophet");
  const [tempModelType, setTempModelType] = useState("Prophet");
  const [forecastPeriod, setForecastPeriod] = useState(4);
  const [tempForecastPeriod, setTempForecastPeriod] = useState(4);
  const [aggregationType, setAggregationType] = useState("Weekly");
  const [tempAggregationType, setTempAggregationType] = useState("Weekly");
  const [modelValidationForecastPeriod, setModelValidationForecastPeriod] = useState(4);
  const [activeTab, setActiveTab] = useState("businessPerformance");
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const handleFileUpload = (file) => {
    setFile(file);
    setActiveTab("businessPerformance");
  };
  const [analysisData, setAnalysisData] = useState([]);
  const [futureData, setFutureData] = useState([]);
  const [kpiSourceData, setKpiSourceData] = useState([]);
  const [kpiInitialized, setKpiInitialized] = useState(false);
  const [formData, setFormData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingIcons, setLoadingIcons] = useState({ forecast: false, insights: false });
  const [insights, setInsights] = useState({});

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredData = kpiSourceData?.filter((item) => {
    const dateStr = item.date || item.ds;
    if (!dateStr) return false;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  }) || [];

  const computeKPIs = (weekNumber = null) => {
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

  const [kpiData, setKpiData] = useState([]);
  const [lastWeekNumber, setLastWeekNumber] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  // Update KPIs only when analysisData changes
  useEffect(() => {
    const fetchKpiData = async () => {
      setKpiLoading(true);
      try {
        let weekNum = null;
        if (analysisData && analysisData.length > 0) {
          const lastRecord = analysisData[analysisData.length - 1];
          let parsedWeek = null;

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
          setLastWeekNumber(weekNum);
          const newKPIs = computeKPIs(weekNum);
          setKpiData(newKPIs);
        }
      } catch (error) {
        console.error("Error fetching KPI data:", error);
      } finally {
        setKpiLoading(false);
      }
    };

    fetchKpiData();
  }, [analysisData]);

  // Initial forecast API call on mount
  useEffect(() => {
    const fetchInitialForecast = async () => {
      const formData = new FormData();
      formData.append("weeks", "4");
      formData.append("model_type", modelType);

      try {
        const response = await tryApiUrls("forecast", formData);
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

  useEffect(() => {
    const fetchAnalyzeForecasts = async () => {
      try {
        const response = await tryApiUrls("analyze_forecasts", new FormData());
        console.log("Insights API response:", response.data); // Add debug logging
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

    fetchAnalyzeForecasts(); // Don't forget to call the function
  }, []);

  const handleApplyChanges = async (forecastPeriod, modelType) => {
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
        // Handle external factors if needed
      }
      formData.append("model_type", model_type);

      setFormData(formData);

      const response = await tryApiUrls("forecast", formData);
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
          const newItem = { ...item };
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
    { id: "planning", name: "Planning" },
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

  const [pos, setPos] = useState({ x: window.innerWidth - 380, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
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
          <ActualDataTab
            data={apiResponse}
            aggregationType={aggregationType}
            setAggregationType={setAggregationType}
            plotAggregationType={aggregationType}
            setPlotAggregationType={setAggregationType}
          />
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
      case "planning":
        return <PlanningTab />;
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
  const [selectedModels, setSelectedModels] = useState([]);
  const handleModelChange = (model) => {
    setSelectedModels((prevSelectedModels) => {
      if (prevSelectedModels.includes(model)) {
        return prevSelectedModels.filter((m) => m !== model);
      } else {
        return [...prevSelectedModels, model];
      }
    });
  };
  const [selectedHybridModels, setSelectedHybridModels] = useState([]);
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

  const handleNavigateToPlanningPage = () => {
    navigate("/planning");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <CustomSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setOpenModal={setIsDrawerOpen}
          handleLogout={handleLogout}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-0 sticky top-4 z-10">
              <DashboardHeader
                title="Walmart Fulfillment Services"
                lastUpdated={new Date().toLocaleDateString("en-GB")}
                forecastPeriod={`${forecastPeriod} weeks forecast | ${forecastPeriod} weeks history`}
                onLogout={handleLogout}
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
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateToPlanningPage}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Planning
              </Button> */}
              <ThemeToggle />
            </div>
          </div>

          {activeTab === "businessPerformance" && (
            <KPIMetrics kpiData={kpiData} loading={kpiLoading} />
          )}

          {activeTab === "planning" && (
            <PlanningTab />
          )}

          {activeTab !== "businessPerformance" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
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
                                <label className="block text-sm font-medium mb-2">Select a Forecasting Model</label>
                                <div className="space-y-2">
                                  {["Prophet", "ARIMA", "SARIMAX", "ETS", "Weighted Moving Average", "CatBoost", "XGBoost", "LightGBM"].map(
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
              </div>
              <div className="p-4">
                {renderTabContent()}
              </div>
            </div>
          )}

          <footer className="fixed bottom-0 left-0 w-full py-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            <p>© 2025 Zentere. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
