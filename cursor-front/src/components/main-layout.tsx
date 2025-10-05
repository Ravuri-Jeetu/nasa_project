'use client';

import NASAHeader from '@/components/nasa-header';
import AIButton from '@/components/ai-button';
import ChatbotPanel from '@/components/chatbot-panel';
import SmoothTransition from '@/components/smooth-transition';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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
      <NASAHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-4 sm:pb-6 lg:pb-8 relative z-10">
        <SmoothTransition>
          {children}
        </SmoothTransition>
      </main>
      
      {/* AI Button */}
      <AIButton onClick={() => setIsChatbotOpen(true)} />
      
      {/* Chatbot Panel */}
      <ChatbotPanel 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );
}
