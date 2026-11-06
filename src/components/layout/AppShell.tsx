'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickActionModal } from './QuickActionModal';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const isPublicPage = pathname?.startsWith('/verify') || pathname === '/login';

  useEffect(() => {
    if (!isAuthenticated && !isPublicPage) {
      router.push('/login');
    }
  }, [isAuthenticated, isPublicPage, router]);

  // If viewing public verification page or login page, do not render dashboard shell
  if (isPublicPage) {
    return <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">{children}</main>;
  }

  // If not authenticated and waiting for redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-neutral-500">Redirecting to DRS Login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
      />
    </div>
  );
};
