'use client';

import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIButtonProps {
  onClick: () => void;
}

export default function AIButton({ onClick }: AIButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg flex items-center justify-center hover:from-primary/90 hover:to-accent/90 transition-all z-50 cosmic-glow"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Ask AI"
    >
      <Bot className="w-6 h-6" />
    </motion.button>
  );
}
