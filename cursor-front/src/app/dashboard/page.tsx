'use client';

import MainLayout from '@/components/main-layout';
import ScientistDashboard from '@/components/scientist-dashboard';
import ManagerDashboard from '@/components/manager-dashboard';
import { useAppStore } from '@/store/appStore';

export default function DashboardPage() {
  const { role } = useAppStore();

  return (
    <MainLayout>
      {role === 'Scientist' ? <ScientistDashboard /> : <ManagerDashboard />}
    </MainLayout>
  );
}
