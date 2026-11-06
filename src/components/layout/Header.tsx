'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Briefcase,
  User,
  Plus,
  Search,
  Bell,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
  onOpenQuickAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onOpenQuickAction }) => {
  const { role, switchRole, theme, toggleTheme, currentUser } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { id: UserRole; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      id: 'FOUNDER',
      title: 'Founder / Super Admin',
      subtitle: 'Full Approvals & Operations Control',
      icon: Shield,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'HR_MANAGER',
      title: 'HR / Operations Manager',
      subtitle: 'Employee Registry, Drafting & Payroll',
      icon: Briefcase,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    },
    {
      id: 'EMPLOYEE',
      title: 'Employee Portal',
      subtitle: 'Self-Service, Documents & Payslips',
      icon: User,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-400 w-64 lg:w-80 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees, documents, payslips..."
              className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 w-full text-xs"
            />
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side: Role Switcher, Quick Action, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all shadow-sm"
              title="Switch role persona to evaluate permissions"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="hidden md:inline text-slate-500 dark:text-slate-400">Persona:</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {role === 'FOUNDER' ? '👑 Founder' : role === 'HR_MANAGER' ? '💼 HR Manager' : '👤 Employee'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Switch Role Persona
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Test DRS role-based controls and permissions
                    </p>
                  </div>

                  <div className="space-y-1">
                    {roles.map((r) => {
                      const isSelected = role === r.id;
                      const Icon = r.icon;

                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            switchRole(r.id);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'bg-teal-500/10 dark:bg-teal-500/20 text-slate-900 dark:text-white border border-teal-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md border ${r.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{r.title}</span>
                              {isSelected && (
                                <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {r.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Action Button */}
          {onOpenQuickAction && (
            <button
              onClick={onOpenQuickAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-500/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
