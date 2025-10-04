'use client';

import Header from '@/components/header';
import AIButton from '@/components/ai-button';
import ChatbotPanel from '@/components/chatbot-panel';
import DashboardBreadcrumb from '@/components/dashboard-breadcrumb';
import { Toaster } from './ui/toaster';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const pathname = usePathname();
  
  // Show breadcrumbs for dashboard and sub-pages
  const showBreadcrumbs = pathname === '/dashboard' || 
    pathname.startsWith('/manager/') || 
    pathname.startsWith('/mission-planner') ||
    pathname.startsWith('/papers');

  // Listen for summary events to auto-open chat panel
  useEffect(() => {
    const handleShowSummary = () => {
      setIsChatbotOpen(true);
    };

    window.addEventListener('showSummary', handleShowSummary);
    return () => window.removeEventListener('showSummary', handleShowSummary);
  }, []);

  return (
    <div className="min-h-screen relative">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        {showBreadcrumbs && <DashboardBreadcrumb />}
        {children}
      </main>
      
      {/* AI Button */}
      <AIButton onClick={() => setIsChatbotOpen(true)} />
      
      {/* Chatbot Panel */}
      <ChatbotPanel 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
