'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmployeeProfile, UserRole } from '@/types';
import { db } from '@/lib/db';

interface AuthContextType {
  currentUser: EmployeeProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (identity: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check existing auth session
    const sessionToken = localStorage.getItem('drs_auth_session');
    const savedUserId = db.getCurrentUserId();

    if (sessionToken && savedUserId) {
      const user = db.getEmployeeById(savedUserId);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
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

  const login = (identity: string, pass: string): { success: boolean; error?: string } => {
    const cleanIdentity = identity.trim().toLowerCase();
    const cleanPass = pass.trim();

    const employees = db.getEmployees();

    // 1. Admin / Founder Check (Devesh Ambekar)
    if (
      (cleanIdentity === 'admin' ||
        cleanIdentity === 'admin@deeprootstudios.in' ||
        cleanIdentity === 'founders@deeprootstudios.in' ||
        cleanIdentity === 'devesh' ||
        cleanIdentity === 'devesh.ambekar@deeprootstudios.in' ||
        cleanIdentity === 'admin@deeprootstudios.ai' ||
        cleanIdentity === 'devesh.ambekar@deeprootstudios.ai') &&
      cleanPass === 'admin123'
    ) {
      const founder = employees.find((e) => e.role === 'FOUNDER') || employees[0];
      setCurrentUser(founder);
      setIsAuthenticated(true);
      db.setCurrentUserId(founder.id);
      localStorage.setItem('drs_auth_session', `session_${founder.id}_${Date.now()}`);
      db.logAudit({
        actorId: founder.id,
        actorName: founder.fullName,
        actorRole: founder.role,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: founder.id,
        details: 'Founder & Super Admin authenticated successfully',
      });
      return { success: true };
    }

    // 2. HR Manager Check (Maroti Kadam)
    if (
      (cleanIdentity === 'hr' ||
        cleanIdentity === 'hr@deeprootstudios.in' ||
        cleanIdentity === 'maroti' ||
        cleanIdentity === 'maroti.kadam@deeprootstudios.in' ||
        cleanIdentity === 'maroti.kadam@deeprootstudios.ai' ||
        cleanIdentity === 'hr@deeprootstudios.ai') &&
      (cleanPass === 'admin123' || cleanPass === 'hr123')
    ) {
      const hr = employees.find((e) => e.role === 'HR_MANAGER') || employees[1];
      setCurrentUser(hr);
      setIsAuthenticated(true);
      db.setCurrentUserId(hr.id);
      localStorage.setItem('drs_auth_session', `session_${hr.id}_${Date.now()}`);
      db.logAudit({
        actorId: hr.id,
        actorName: hr.fullName,
        actorRole: hr.role,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: hr.id,
        details: 'Head of HR & Operations authenticated successfully',
      });
      return { success: true };
    }

    // 3. Employee Check by Email or Employee Code
    const matchedEmployee = employees.find(
      (e) =>
        e.email.toLowerCase() === cleanIdentity ||
        e.employeeId.toLowerCase() === cleanIdentity
    );

    if (matchedEmployee && (cleanPass === 'admin123' || cleanPass === 'employee123')) {
      setCurrentUser(matchedEmployee);
      setIsAuthenticated(true);
      db.setCurrentUserId(matchedEmployee.id);
      localStorage.setItem('drs_auth_session', `session_${matchedEmployee.id}_${Date.now()}`);
      db.logAudit({
        actorId: matchedEmployee.id,
        actorName: matchedEmployee.fullName,
        actorRole: matchedEmployee.role,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: matchedEmployee.id,
        details: `Employee ${matchedEmployee.fullName} (${matchedEmployee.employeeId}) logged in`,
      });
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Default Super Admin: username "admin", password "admin123".',
    };
  };

  const logout = () => {
    if (currentUser) {
      db.logAudit({
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'USER_LOGOUT',
        entityType: 'AUTH',
        entityId: currentUser.id,
        details: 'User logged out of active session',
      });
    }
    localStorage.removeItem('drs_auth_session');
    setIsAuthenticated(false);
  };

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
      setIsAuthenticated(true);
      localStorage.setItem('drs_auth_session', `session_${target.id}_${Date.now()}`);
    }
  };

  const switchUser = (employeeId: string) => {
    const user = db.getEmployeeById(employeeId);
    if (user) {
      db.setCurrentUserId(user.id);
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('drs_auth_session', `session_${user.id}_${Date.now()}`);
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
    isAuthenticated,
    login,
    logout,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
