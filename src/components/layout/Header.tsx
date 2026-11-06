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
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
  onOpenQuickAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onOpenQuickAction }) => {
  const { role, switchRole, theme, toggleTheme, currentUser, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { id: UserRole; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      id: 'FOUNDER',
      title: 'Devesh Ambekar',
      subtitle: 'Founder & Managing Director / CEO',
      icon: Shield,
      color: 'text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700',
    },
    {
      id: 'HR_MANAGER',
      title: 'Maroti Kadam',
      subtitle: 'Head of Human Resources & Operations',
      icon: Briefcase,
      color: 'text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700',
    },
    {
      id: 'EMPLOYEE',
      title: 'Employee Portal',
      subtitle: 'Self-Service, Documents & Payslips',
      icon: User,
      color: 'text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 w-64 lg:w-80 text-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search employees, documents, payslips..."
              className="bg-transparent border-none outline-none text-black dark:text-white placeholder-neutral-400 w-full text-xs"
            />
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded border border-neutral-300 dark:border-neutral-700">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side: Role Persona Switcher, Quick Action, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-black dark:text-white transition-all shadow-sm"
              title="Switch role persona to evaluate permissions"
            >
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
              <span className="hidden md:inline text-neutral-500">Active User:</span>
              <span className="font-bold">
                {role === 'FOUNDER' ? '👑 Devesh Ambekar (Founder)' : role === 'HR_MANAGER' ? '💼 Maroti Kadam (HR)' : '👤 Employee'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                      Switch Role Persona
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Evaluate DRS role-based controls and permissions
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
                              ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-300 dark:border-neutral-700'
                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md border ${r.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{r.title}</span>
                              {isSelected && (
                                <CheckCircle className="w-3.5 h-3.5 text-black dark:text-white" />
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              {r.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sign Out Option */}
                  <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                        window.location.href = '/login';
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Action Button */}
          {onOpenQuickAction && (
            <button
              onClick={onOpenQuickAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-white" />
            ) : (
              <Moon className="w-4 h-4 text-black" />
            )}
          </button>

          {/* Direct Sign Out Button */}
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="p-2 rounded-lg text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
