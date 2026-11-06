'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickActionModal } from './QuickActionModal';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/app/login/page';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isPublicVerify = pathname?.startsWith('/verify');
  const isLoginPage = pathname === '/login';

  // If viewing public verification page, render directly without internal shell
  if (isPublicVerify) {
    return <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">{children}</main>;
  }

  // If on login page, render directly
  if (isLoginPage) {
    return <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">{children}</main>;
  }

  // If not authenticated, render Login gateway directly (prevents blank screen or redirect loops)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <LoginPage />
      </main>
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
