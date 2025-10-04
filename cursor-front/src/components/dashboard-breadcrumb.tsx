'use client';

import { useAppStore } from '@/store/appStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Brain, DollarSign, Rocket, BarChart3, Users, AlertTriangle, Calculator, Network } from 'lucide-react';

const getPageInfo = (pathname: string, role: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const roleIcon = {
    'Scientist': <Brain className="h-4 w-4" />,
    'Manager': <DollarSign className="h-4 w-4" />,
    'Mission Planner': <Rocket className="h-4 w-4" />,
  }[role] || <Brain className="h-4 w-4" />;

  const pageIcons: Record<string, React.ReactNode> = {
    'analytics': <BarChart3 className="h-4 w-4" />,
    'investment': <DollarSign className="h-4 w-4" />,
    'alerts': <AlertTriangle className="h-4 w-4" />,
    'simulation': <Calculator className="h-4 w-4" />,
    'synergy': <Network className="h-4 w-4" />,
    'papers': <Users className="h-4 w-4" />,
    'mission-planner': <Rocket className="h-4 w-4" />,
  };

  const breadcrumbItems: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
  }> = [
    {
      label: 'Home',
      href: '/',
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: roleIcon,
    },
  ];

  // Add role-specific pages
  if (pathSegments.includes('manager')) {
    const managerPages: Record<string, { label: string; icon: React.ReactNode }> = {
      'analytics': { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
      'investment': { label: 'Investment', icon: <DollarSign className="h-4 w-4" /> },
      'alerts': { label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
      'simulation': { label: 'Simulation', icon: <Calculator className="h-4 w-4" /> },
      'synergy': { label: 'Synergy Analysis', icon: <Network className="h-4 w-4" /> },
    };

    const currentPage = pathSegments[pathSegments.length - 1];
    if (managerPages[currentPage]) {
      breadcrumbItems.push({
        label: managerPages[currentPage].label,
        href: `/manager/${currentPage}`,
        icon: managerPages[currentPage].icon,
      });
    }
  } else if (pathSegments.includes('mission-planner')) {
    breadcrumbItems.push({
      label: 'Mission Planner',
      href: '/mission-planner',
      icon: <Rocket className="h-4 w-4" />,
    });
  } else if (pathSegments.includes('papers')) {
    breadcrumbItems.push({
      label: 'Papers',
      href: '/papers',
      icon: <Users className="h-4 w-4" />,
    });
  }

  return breadcrumbItems;
};

export default function DashboardBreadcrumb() {
  const { role } = useAppStore();
  const pathname = usePathname();
  const breadcrumbItems = getPageInfo(pathname, role);

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <div key={item.href} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2 text-white">
                    {item.icon}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      {item.icon}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
