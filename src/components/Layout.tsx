import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}

export function Layout({ children, showNav = true, className = '' }: LayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const shouldShowNav = showNav && isAuthenticated && user?.role;

  return (
    <div className="mobile-container bg-offwhite">
      <div
        className={`relative w-full h-full min-h-[100dvh] flex flex-col ${shouldShowNav ? 'pb-16' : ''} ${className}`}
      >
        {children}
      </div>

      {shouldShowNav && <Navbar />}
    </div>
  );
}
