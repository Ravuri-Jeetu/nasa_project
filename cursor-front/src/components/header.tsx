'use client';

import { useAppStore, UserRole } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const { role, setRole } = useAppStore();
  const pathname = usePathname();

  const toggleRole = () => {
    if (role === 'Scientist') {
      setRole('Manager');
    } else if (role === 'Manager') {
      setRole('Mission Planner');
    } else {
      setRole('Scientist');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50 cosmic-glow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and Navigation */}
          <div className="flex items-center justify-between lg:justify-start">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-white">
              Research Analytics
            </Link>
            
            {/* Mobile menu button could go here */}
            <div className="lg:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="secondary" className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/30 text-xs shadow-lg shadow-primary/25 rounded-full px-3 py-1">
                  {role}
                </Badge>
              </motion.div>
            </div>
          </div>
          
          <nav className="flex flex-wrap items-center gap-4 lg:gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/landing"
                className={`text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full ${
                  isActive('/landing') 
                    ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Home
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/papers"
                className={`text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full ${
                  isActive('/papers') 
                    ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Papers
              </Link>
            </motion.div>
          </nav>

          {/* Role Toggle - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
                <motion.button
                  onClick={() => setRole('Scientist')}
                  className={`px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full ${
                    role === 'Scientist' 
                      ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: role === 'Scientist' ? 1.08 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: role === 'Scientist' 
                      ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Scientist
                </motion.button>
                <motion.button
                  onClick={() => setRole('Manager')}
                  className={`px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full ${
                    role === 'Manager' 
                      ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: role === 'Manager' ? 1.08 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: role === 'Manager' 
                      ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Manager
                </motion.button>
                <motion.button
                  onClick={() => setRole('Mission Planner')}
                  className={`px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full ${
                    role === 'Mission Planner' 
                      ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: role === 'Mission Planner' ? 1.08 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: role === 'Mission Planner' 
                      ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Mission Planner
                </motion.button>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge variant="secondary" className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/30 shadow-lg shadow-primary/25 rounded-full px-3 py-1">
                {role}
              </Badge>
            </motion.div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
