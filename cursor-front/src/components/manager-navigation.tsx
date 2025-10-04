'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  PiggyBank, 
  AlertTriangle, 
  Calculator, 
  Network,
  Home
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: Home,
    description: 'Main dashboard hub'
  },
  {
    name: 'Analytics',
    href: '/manager/analytics',
    icon: BarChart3,
    description: 'Research analytics & metrics'
  },
  {
    name: 'Investment',
    href: '/manager/investment',
    icon: PiggyBank,
    description: 'Investment recommendations'
  },
  {
    name: 'Alerts',
    href: '/manager/alerts',
    icon: AlertTriangle,
    description: 'Red flag alerts & warnings'
  },
  {
    name: 'Simulation',
    href: '/manager/simulation',
    icon: Calculator,
    description: 'Budget simulation & modeling'
  },
  {
    name: 'Synergy',
    href: '/manager/synergy',
    icon: Network,
    description: 'Cross-domain collaboration'
  }
];

export default function ManagerNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Manager Tools</span>
          </div>
          
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
