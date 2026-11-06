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
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { role, isFounder, isHR, isEmployeeOnly, currentUser } = useAuth();

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
      badgeColor: 'bg-amber-500 text-black',
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
      badgeColor: 'bg-teal-500 text-black',
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* DRS Branding Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link href="/" onClick={onClose} className="block">
            <DrsLogo size="md" variant="full" />
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              PORTAL v2.4 • PROD
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                </div>
              </Link>
            );
          })}

          {/* Quick Verification Link */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Public Utilities
          </div>
          <Link
            href="/verify"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Document Verification</span>
          </Link>
        </nav>

        {/* Current User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-teal-300 text-sm">
                {currentUser?.fullName.charAt(0) || 'D'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {currentUser?.fullName}
              </p>
              <p className="text-[11px] text-teal-400 truncate">
                {currentUser?.designation}
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                {currentUser?.employeeId}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
