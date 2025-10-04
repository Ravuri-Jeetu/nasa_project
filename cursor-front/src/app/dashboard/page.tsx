'use client';

import MainLayout from '@/components/main-layout';
import ScientistDashboard from '@/components/scientist-dashboard';
import ManagerDashboard from '@/components/manager-dashboard';
import MissionPlannerDashboard from '@/components/mission-planner-dashboard';
import { useAppStore } from '@/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { role } = useAppStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const pageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: {
        duration: 0.3,
        ease: "easeIn" as const
      }
    }
  };

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
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          variants={pageVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          exit="exit"
          className="w-full"
        >
          {renderDashboard()}
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}
