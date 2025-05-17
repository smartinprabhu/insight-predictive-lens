
import React from 'react';
import { 
  Home, 
  FileText, 
  BarChart, 
  Settings, 
  LogOut, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar as UISidebar, SidebarTrigger } from '@/components/ui/sidebar';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setOpenModal: (open: boolean) => void;
  handleLogout: () => void;
  isSidebarCollapsed: boolean;
}

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  setOpenModal, 
  handleLogout, 
  isSidebarCollapsed 
}: SidebarProps) => {
  const tabs = [
    { id: 'businessPerformance', name: 'Business Performance', icon: Home },
    { id: 'actualData', name: 'Historical Data', icon: FileText },
    { id: 'forecast', name: 'Trends & Forecast', icon: BarChart },
    { id: 'modelValidation', name: 'Model Validation', icon: BarChart },
    { id: 'insights', name: 'Insights', icon: Info },
    { id: 'planning', name: 'Planning', icon: Settings },
  ];

  return (
    <UISidebar 
      className={`h-screen ${isSidebarCollapsed ? 'w-16' : 'w-60'} bg-background border-r transition-all duration-300 flex flex-col`}
    >
      <div className="p-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => console.log('Toggle sidebar')}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-col flex-1 space-y-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'secondary' : 'ghost'}
            className={`justify-start ${isSidebarCollapsed ? 'px-3' : 'px-2'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
            {!isSidebarCollapsed && <span>{tab.name}</span>}
          </Button>
        ))}
      </div>

      <div className="p-2 space-y-2">
        <Button
          variant="ghost"
          className={`justify-start ${isSidebarCollapsed ? 'px-3' : 'px-2'} w-full`}
          onClick={() => setOpenModal(true)}
        >
          <Settings className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
          {!isSidebarCollapsed && <span>Settings</span>}
        </Button>
        <Button
          variant="ghost"
          className={`justify-start ${isSidebarCollapsed ? 'px-3' : 'px-2'} w-full`}
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
          {!isSidebarCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </UISidebar>
  );
};
