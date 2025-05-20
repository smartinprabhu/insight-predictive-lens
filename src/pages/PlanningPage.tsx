
import React from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PlanningTab from '@/components/PlanningTab';

const PlanningPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Capacity Planning</h1>
            <PlanningTab />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlanningPage;
