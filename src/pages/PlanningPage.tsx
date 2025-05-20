
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import PlanningTab from '@/components/PlanningTab';
import CustomSidebar from '@/components/Sidebar';

const PlanningPage: React.FC = () => {
  // Add necessary state and handlers for Sidebar props
  const [activeTab, setActiveTab] = useState("planning");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Mock functions that would normally be passed down from a parent component
  const setOpenModal = () => {}; 
  const handleLogout = () => {};

  return (
    <div className="min-h-screen bg-background flex dark:bg-gray-950">
      <CustomSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setOpenModal={setOpenModal} 
        handleLogout={handleLogout} 
        isSidebarCollapsed={isSidebarCollapsed} 
      />
      <div className="flex-1">
        <DashboardHeader 
          title="Capacity Planning" 
          lastUpdated={new Date().toLocaleDateString()} 
          forecastPeriod="Weekly"
        />
        <main className="p-6">
          <div className="container mx-auto">
            <PlanningTab />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlanningPage;
