'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UserPlus,
  FilePlus2,
  FileCheck,
  CreditCard,
  Clock,
  CalendarPlus,
  Megaphone,
  X,
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { role, isFounder, isHR } = useAuth();

  if (!isOpen) return null;

  const actions = [
    {
      title: 'Add New Employee',
      desc: 'Register employee profile, compensation & KYC details',
      icon: UserPlus,
      href: '/employees?action=new',
      roles: ['FOUNDER', 'HR_MANAGER'],
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    },
    {
      title: 'Draft / Issue Document',
      desc: 'Generate Offer, Appointment, Internship or Experience doc',
      icon: FilePlus2,
      href: '/documents?action=new',
      roles: ['FOUNDER', 'HR_MANAGER'],
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      title: 'Review Pending Approvals',
      desc: 'Examine official documents waiting for founder signature',
      icon: FileCheck,
      href: '/documents?filter=PENDING_APPROVAL',
      roles: ['FOUNDER'],
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    {
      title: 'Process Monthly Payroll',
      desc: 'Calculate salary, deductions, and generate payslips',
      icon: CreditCard,
      href: '/payroll?action=new',
      roles: ['FOUNDER', 'HR_MANAGER'],
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    {
      title: 'Log Daily Attendance',
      desc: 'Check in or check out with current work mode',
      icon: Clock,
      href: '/attendance?action=checkin',
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      title: 'Apply for Leave',
      desc: 'Submit casual, sick, or earned leave request',
      icon: CalendarPlus,
      href: '/attendance?action=leave',
      roles: ['FOUNDER', 'HR_MANAGER', 'EMPLOYEE'],
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    {
      title: 'Post Company Announcement',
      desc: 'Broadcast updates, policy changes, or milestones',
      icon: Megaphone,
      href: '/announcements?action=new',
      roles: ['FOUNDER', 'HR_MANAGER'],
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    },
  ];

  const filtered = actions.filter((a) => a.roles.includes(role));

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Operations Quick Actions
            </h3>
            <p className="text-xs text-slate-500">
              Select an action based on your authorized role permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => handleSelect(item.href)}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-left transition-all group"
              >
                <div className={`p-2.5 rounded-lg border ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

