'use client';

import { motion } from 'framer-motion';

interface AIButtonProps {
  onClick: () => void;
}

export default function AIButton({ onClick }: AIButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl flex items-center justify-center hover:from-slate-700 hover:to-slate-800 transition-all z-50 cosmic-glow border-2 border-cyan-400/30"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Ask AI Spaceship"
    >
      {/* Spaceship with Robot */}
      <div className="relative w-10 h-10">
        {/* Spaceship Body */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg transform rotate-45 shadow-lg">
          {/* Robot Head */}
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full border border-gray-600">
            {/* Robot Eyes */}
            <div className="absolute top-1 left-0.5 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute top-1 right-0.5 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Spaceship Wings */}
          <div className="absolute -top-2 -right-2 w-3 h-2 bg-gradient-to-br from-cyan-300 to-blue-400 rounded transform rotate-12"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-2 bg-gradient-to-br from-cyan-300 to-blue-400 rounded transform -rotate-12"></div>
          
          {/* Engine Glow */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>
        </div>
        
        {/* Antenna */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-cyan-300 rounded-full"></div>
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
      </div>
    </motion.button>
  );
}
