'use client';

import { useAppStore, UserRole } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Satellite, Users2, Target } from 'lucide-react';
import { useState } from 'react';

export default function NASAHeader() {
  const { role, setRole } = useAppStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/papers', label: 'Papers' }
  ];

  const roleIcons = {
    'Scientist': <Satellite className="h-5 w-5" />,
    'Manager': <Users2 className="h-5 w-5" />,
    'Mission Planner': <Target className="h-5 w-5" />
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-blue-500/20 backdrop-blur-xl">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-24">
          {/* Left Section - Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/25 group-hover:shadow-xl">
                  <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-orbitron font-bold cosmic-text-gradient group-hover:scale-105 transition-transform duration-300">
                  SpaceScope
                </span>
                <span className="text-base text-white/60 font-rajdhani font-medium -mt-1">
                  Space Biology Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center Section - Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`smooth-nav-link relative px-5 py-4 rounded-lg font-rajdhani font-semibold text-lg ${
                    isActive(item.href)
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 shadow-lg shadow-cyan-400/20'
                      : 'text-white/80 hover:text-cyan-400 hover:bg-white/5'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section - Role Toggle and Status */}
          <div className="flex-shrink-0 flex items-center space-x-6">
            {/* Desktop Role Toggle */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex bg-gray-900/60 backdrop-blur-sm rounded-xl p-1.5 border border-blue-500/40 shadow-lg shadow-blue-500/10">
                {(['Scientist', 'Manager', 'Mission Planner'] as const).map((roleOption) => (
                  <Button
                    key={roleOption}
                    variant={role === roleOption ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setRole(roleOption)}
                    className={`rounded-lg transition-all duration-300 flex items-center space-x-2 px-5 py-4 ${
                      role === roleOption 
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40' 
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    <div className={`transition-colors duration-300 ${
                      role === roleOption ? 'text-white' : 'text-white/60 group-hover:text-white'
                    }`}>
                      {roleIcons[roleOption]}
                    </div>
                    <span className="hidden xl:inline font-rajdhani font-semibold text-base">{roleOption}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Role Status Badge */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-full px-5 py-3 border border-blue-400/40 shadow-lg">
              <div className="text-blue-400 animate-pulse">
                {roleIcons[role]}
              </div>
              <span className="text-lg text-blue-300 font-rajdhani font-bold hidden sm:inline">
                {role} Mode
              </span>
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse hidden sm:block" />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="lg"
              className="md:hidden text-white/80 hover:text-white hover:bg-white/10 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300 p-3"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-red-400" />
              ) : (
                <Menu className="h-6 w-6 text-blue-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-blue-500/20 py-4 glassmorphism rounded-b-xl mx-4 mt-2">
            <nav className="flex flex-col space-y-3 px-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`smooth-nav-link px-3 py-2 rounded-lg font-rajdhani font-medium ${
                    isActive(item.href)
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 shadow-lg shadow-cyan-400/20'
                      : 'text-white/80 hover:text-cyan-400 hover:bg-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Role Toggle */}
              <div className="pt-4 border-t border-white/10 mt-4">
                <span className="text-sm text-white/60 font-rajdhani font-medium mb-3 block px-3">Mission Role:</span>
                <div className="grid grid-cols-1 gap-2">
                  {(['Scientist', 'Manager', 'Mission Planner'] as const).map((roleOption) => (
                    <Button
                      key={roleOption}
                      variant={role === roleOption ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRole(roleOption)}
                      className={`justify-start px-3 py-3 rounded-lg transition-all duration-300 ${
                        role === roleOption 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'border-blue-400/50 text-white/80 hover:border-blue-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`transition-colors duration-300 ${
                          role === roleOption ? 'text-white' : 'text-white/60'
                        }`}>
                          {roleIcons[roleOption]}
                        </div>
                        <span className="font-rajdhani font-medium">{roleOption}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

