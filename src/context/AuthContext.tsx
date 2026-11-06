'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmployeeProfile, UserRole } from '@/types';
import { db } from '@/lib/db';

interface AuthContextType {
  currentUser: EmployeeProfile | null;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  switchUser: (employeeId: string) => void;
  isFounder: boolean;
  isHR: boolean;
  isEmployeeOnly: boolean;
  canApproveDocuments: boolean;
  canManageTemplates: boolean;
  canApprovePayroll: boolean;
  canManageEmployees: boolean;
  canViewAuditLogs: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<EmployeeProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize current user
    const currentId = db.getCurrentUserId();
    const user = db.getEmployeeById(currentId) || db.getEmployees()[0];
    if (user) {
      setCurrentUser(user);
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('drs_theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('drs_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const switchRole = (newRole: UserRole) => {
    const employees = db.getEmployees();
    let target = employees.find((e) => e.role === newRole);
    if (!target) {
      if (newRole === 'FOUNDER') target = employees.find((e) => e.id === 'emp-001') || employees[0];
      else if (newRole === 'HR_MANAGER') target = employees.find((e) => e.id === 'emp-002') || employees[1];
      else target = employees.find((e) => e.role === 'EMPLOYEE') || employees[2];
    }
    if (target) {
      db.setCurrentUserId(target.id);
      setCurrentUser(target);
    }
  };

  const switchUser = (employeeId: string) => {
    const user = db.getEmployeeById(employeeId);
    if (user) {
      db.setCurrentUserId(user.id);
      setCurrentUser(user);
    }
  };

  const refreshUserData = () => {
    if (currentUser) {
      const refreshed = db.getEmployeeById(currentUser.id);
      if (refreshed) setCurrentUser(refreshed);
    }
  };

  const role = currentUser?.role || 'FOUNDER';
  const isFounder = role === 'FOUNDER';
  const isHR = role === 'HR_MANAGER' || isFounder;
  const isEmployeeOnly = role === 'EMPLOYEE';

  const value: AuthContextType = {
    currentUser,
    role,
    switchRole,
    switchUser,
    isFounder,
    isHR,
    isEmployeeOnly,
    canApproveDocuments: isFounder,
    canManageTemplates: isFounder,
    canApprovePayroll: isFounder,
    canManageEmployees: isFounder || isHR,
    canViewAuditLogs: isFounder,
    theme,
    toggleTheme,
    refreshUserData,
  };

  if (!isClient) {
    return null; // Prevent SSR hydration mismatch
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
