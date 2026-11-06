'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DrsLogo } from '../brand/DrsLogo';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  CalendarCheck,
  FileCheck2,
  BellRing,
  Settings,
  ShieldCheck,
  ChevronRight,
  FolderKanban,
  ClipboardList,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { role, isFounder, isHR, isEmployeeOnly, currentUser, logout } = useAuth();

  // Dynamic counts for notification badges
  const pendingDocsCount = isFounder ? db.getDocuments().filter((d) => d.status === 'PENDING_APPROVAL').length : 0;
  const pendingLeavesCount = isHR ? db.getLeaveApplications().filter((l) => l.status === 'PENDING').length : 0;

  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      title: 'Employee Directory',
      href: '/employees',
      icon: Users,
      roles: ['FOUNDER', 'HR_MANAGER'],
    },
    {
      title: isEmployeeOnly ? 'My Documents' : 'Document Engine',
      href: '/documents',
      icon: FileText,
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
      badgeColor: 'bg-black text-white dark:bg-white dark:text-black',
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      title: isEmployeeOnly ? 'My Payslips' : 'Payroll Operations',
      href: '/payroll',
      icon: CreditCard,
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      title: isEmployeeOnly ? 'Attendance & Leave' : 'Attendance & Leaves',
      href: '/attendance',
      icon: CalendarCheck,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black',
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      title: 'Document Templates',
      href: '/templates',
      icon: FileCheck2,
      roles: ['FOUNDER'],
    },
    {
      title: 'Company Feed & Audit',
      href: '/announcements',
      icon: BellRing,
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      title: 'Company Settings',
      href: '/settings',
      icon: Settings,
      roles: ['FOUNDER'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-900 text-neutral-800 dark:text-neutral-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* DRS Branding Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-850">
          <Link href="/" onClick={onClose} className="block">
            <DrsLogo size="md" variant="full" />
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
              DEEP ROOT STUDIOS
            </span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
            Operations & Management
          </div>

          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white dark:text-black' : 'text-neutral-400 group-hover:text-black dark:group-hover:text-white'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </Link>
            );
          })}

          {/* Quick Verification Link */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
            Public Credentials
          </div>
          <Link
            href="/verify"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Verify Official Credentials</span>
          </Link>
        </nav>

        {/* Current User Card */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center font-bold text-white dark:text-black text-xs shrink-0">
              {currentUser?.fullName.charAt(0) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {currentUser?.fullName}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {currentUser?.designation}
              </p>
              <p className="text-[9px] font-mono text-neutral-400">
                {currentUser?.employeeId}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              title="Sign Out of DRS Portal"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
