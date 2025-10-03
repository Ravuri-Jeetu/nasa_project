'use client';

import { useAppStore, UserRole } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs cosmic-glow">
                {role}
              </Badge>
            </div>
          </div>
          
          <nav className="flex flex-wrap items-center gap-4 lg:gap-6">
            <Link
              href="/landing"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/landing') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/search') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Search
            </Link>
            <Link
              href="/papers"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/papers') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Papers
            </Link>
            <Link
              href="/mission-planner"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/mission-planner') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Mission Planner
            </Link>
          </nav>

          {/* Role Toggle - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
                <Button
                  variant={role === 'Scientist' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRole('Scientist')}
                  className="rounded-md"
                >
                  Scientist
                </Button>
                <Button
                  variant={role === 'Manager' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRole('Manager')}
                  className="rounded-md"
                >
                  Manager
                </Button>
                <Button
                  variant={role === 'Mission Planner' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRole('Mission Planner')}
                  className="rounded-md"
                >
                  Mission Planner
                </Button>
              </div>
            </div>
            
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 cosmic-glow">
              {role}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
