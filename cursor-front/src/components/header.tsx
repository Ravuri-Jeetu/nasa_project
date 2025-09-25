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
    setRole(role === 'Scientist' ? 'Manager' : 'Scientist');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and Navigation */}
          <div className="flex items-center justify-between lg:justify-start">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900">
              Research Analytics
            </Link>
            
            {/* Mobile menu button could go here */}
            <div className="lg:hidden">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                {role}
              </Badge>
            </div>
          </div>
          
          <nav className="flex flex-wrap items-center gap-4 lg:gap-6">
            <Link
              href="/landing"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/landing') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/search') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Search
            </Link>
            <Link
              href="/papers"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActive('/papers') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              Papers
            </Link>
          </nav>

          {/* Role Toggle - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Role:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
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
              </div>
            </div>
            
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {role}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
