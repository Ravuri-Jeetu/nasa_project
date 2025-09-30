'use client';

import MainLayout from '@/components/main-layout';
import ScientistDashboard from '@/components/scientist-dashboard';
import ManagerDashboard from '@/components/manager-dashboard';
import MissionPlannerDashboard from '@/components/mission-planner-dashboard';
import { useAppStore } from '@/store/appStore';

export default function DashboardPage() {
  const { role } = useAppStore();

  const renderDashboard = () => {
    switch (role) {
      case 'Scientist':
        return <ScientistDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      case 'Mission Planner':
        return <MissionPlannerDashboard role={role} />;
      default:
        return <ScientistDashboard />;
    }
  };

  return (
    <MainLayout>
      {renderDashboard()}
    </MainLayout>
  );
}
