'use client';

import NASAHeader from '@/components/nasa-header';
import AIButton from '@/components/ai-button';
import ChatbotPanel from '@/components/chatbot-panel';
import SmoothTransition from '@/components/smooth-transition';
import { useState, useEffect } from 'react';

// Particle component for animated background
const Particle = ({ delay, duration, size = '2px', left, top }: { delay: number; duration: number; size?: string; left: number; top: number }) => (
  <div
    className="absolute rounded-full bg-blue-400/60 animate-pulse"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

// Animated background particles - client-side only
const ParticleField = () => {
  const [particles, setParticles] = useState<Array<{ left: number; top: number; delay: number; duration: number; size: string }>>([]);

  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const generatedParticles = Array.from({ length: 30 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: Math.random() > 0.7 ? '3px' : '2px'
    }));
    
    setParticles(generatedParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="particles-container">
      {particles.map((particle, i) => (
        <Particle
          key={i}
          delay={particle.delay}
          duration={particle.duration}
          size={particle.size}
          left={particle.left}
          top={particle.top}
        />
      ))}
    </div>
  );
};

interface NASALayoutProps {
  children: React.ReactNode;
}

export default function NASALayout({ children }: NASALayoutProps) {
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Immersive NASA Space Background */}
      <div className="fixed inset-0 z-0">
        {/* NASA Space Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://i.postimg.cc/5NR95W0c/space-nasa.jpg")',
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Animated starfield overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="stars-layer-1" />
          <div className="stars-layer-2" />
          <div className="stars-layer-3" />
        </div>
        
        {/* Cosmic nebula overlay for enhanced atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/3 to-cyan-500/5 animate-pulse" />
        
        {/* Floating particles */}
        <ParticleField />
      </div>

      {/* Header */}
      <NASAHeader />
      
      {/* Main Content */}
      <main className="relative z-10 pt-24">
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

      {/* Enhanced CSS for starfield animation */}
      <style jsx>{`
        .stars-layer-1, .stars-layer-2, .stars-layer-3 {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(2px 2px at 20px 30px, #4a9eff, transparent),
                           radial-gradient(2px 2px at 40px 70px, #6c5ce7, transparent),
                           radial-gradient(1px 1px at 90px 40px, #00d4aa, transparent),
                           radial-gradient(1px 1px at 130px 80px, #ffd93d, transparent),
                           radial-gradient(2px 2px at 160px 30px, #ff6b6b, transparent);
          background-repeat: repeat;
        }
        
        .stars-layer-1 {
          background-size: 200px 100px;
          animation: twinkle 20s infinite linear;
        }
        
        .stars-layer-2 {
          background-size: 150px 75px;
          animation: twinkle 25s infinite linear reverse;
        }
        
        .stars-layer-3 {
          background-size: 100px 50px;
          animation: twinkle 30s infinite linear;
        }
        
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(74, 158, 255, 0.8);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

