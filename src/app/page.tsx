'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  GraduationCap,
  Clock,
  FileText,
  FileCheck2,
  CreditCard,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Plus,
  Send,
  Building2,
  QrCode,
  Download,
  Calendar,
} from 'lucide-react';
import { DrsLogo } from '@/components/brand/DrsLogo';

export default function DashboardPage() {
  const { role, isFounder, isHR, isEmployeeOnly, currentUser } = useAuth();

  // Load live state from db
  const [employees, setEmployees] = useState(db.getEmployees());
  const [documents, setDocuments] = useState(db.getDocuments());
  const [attendance, setAttendance] = useState(db.getAttendance());
  const [leaveApps, setLeaveApps] = useState(db.getLeaveApplications());
  const [payrollCycles, setPayrollCycles] = useState(db.getPayrollCycles());
  const [auditLogs, setAuditLogs] = useState(db.getAuditLogs());
  const [announcements, setAnnouncements] = useState(db.getAnnouncements());
  const [userLeaveBal, setUserLeaveBal] = useState(
    currentUser ? db.getLeaveBalanceForEmployee(currentUser.id) : null
  );

  useEffect(() => {
    setEmployees(db.getEmployees());
    setDocuments(db.getDocuments());
    setAttendance(db.getAttendance());
    setLeaveApps(db.getLeaveApplications());
    setPayrollCycles(db.getPayrollCycles());
    setAuditLogs(db.getAuditLogs());
    setAnnouncements(db.getAnnouncements());
    if (currentUser) {
      setUserLeaveBal(db.getLeaveBalanceForEmployee(currentUser.id));
    }
  }, [currentUser, role]);

  // Calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employmentStatus === 'ACTIVE').length;
  const totalInterns = employees.filter((e) => e.employmentType === 'INTERN').length;
  const pendingOnboarding = employees.filter((e) => e.employmentStatus === 'PENDING_ONBOARDING').length;
  const totalDocs = documents.length;
  const pendingDocs = documents.filter((d) => d.status === 'PENDING_APPROVAL');
  const pendingLeaves = leaveApps.filter((l) => l.status === 'PENDING');
  const latestPayroll = payrollCycles[0] || null;

  // Today's attendance for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAtt = attendance.find(
    (a) => a.employeeId === currentUser?.id && a.date === todayStr
  );

  const handleQuickCheckIn = (mode: 'OFFICE' | 'REMOTE' | 'HYBRID') => {
    if (!currentUser) return;
    db.recordCheckIn(currentUser.id, currentUser.fullName, mode);
    setAttendance(db.getAttendance());
  };

  const handleQuickCheckOut = () => {
    if (!currentUser) return;
    try {
      db.recordCheckOut(currentUser.id);
      setAttendance(db.getAttendance());
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Deep Root Studios Operations Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.fullName.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isFounder && 'Executive overview: Company workforce, pending official document signatures, and payroll liability.'}
              {role === 'HR_MANAGER' && 'People operations: Onboarding pipeline, attendance timesheets, and documentation drafting.'}
              {isEmployeeOnly && 'Employee self-service: Track your official documents, monthly payslips, and attendance check-in.'}
            </p>
          </div>

          {/* Quick Check-in pill for all employees */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Today's Attendance</p>
              <p className="text-xs font-semibold text-teal-400">
                {userTodayAtt ? `${userTodayAtt.checkIn} (${userTodayAtt.workMode})` : 'Not Checked In'}
              </p>
            </div>
            {!userTodayAtt?.checkIn ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleQuickCheckIn('OFFICE')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-sm"
                >
                  Office
                </button>
                <button
                  onClick={() => handleQuickCheckIn('REMOTE')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-all"
                >
                  Remote
                </button>
              </div>
            ) : !userTodayAtt.checkOut ? (
              <button
                onClick={handleQuickCheckOut}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-sm"
              >
                Check Out
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                Completed ({userTodayAtt.workingHours} hrs)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FOUNDER & HR METRICS SECTION */}
      {!isEmployeeOnly && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Headcount */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</span>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalEmployees}
              </span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                Active: {activeEmployees}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalInterns} Interns • {pendingOnboarding} Pending Onboarding
            </p>
          </div>

          {/* Card 2: Documents Engine */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalDocs}
              </span>
              {pendingDocs.length > 0 ? (
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {pendingDocs.length} Pending Approval
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium">All approved</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Offers, Appointments & Certificates
            </p>
          </div>

          {/* Card 3: Monthly Payroll */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Payroll</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-400">INR</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {latestPayroll ? (latestPayroll.totalNetPayout / 100000).toFixed(2) : '0'}L
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                latestPayroll?.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {latestPayroll?.status || 'NO CYCLE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cycle: {latestPayroll ? `${latestPayroll.month}/${latestPayroll.year}` : 'N/A'} • {latestPayroll?.payslipsCount || 0} Payslips
            </p>
          </div>

          {/* Card 4: Leave Requests */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Queue</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {pendingLeaves.length}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {pendingLeaves.length === 1 ? 'request waiting' : 'requests waiting'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Requires HR / Manager verification
            </p>
          </div>
        </div>
      )}

      {/* EMPLOYEE SELF-SERVICE METRICS SECTION */}
      {isEmployeeOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Casual Leave Balance</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                {(userLeaveBal?.casualTotal || 12) - (userLeaveBal?.casualUsed || 0)}
              </span>
              <span className="text-xs text-slate-400">
                days remaining of {userLeaveBal?.casualTotal || 12}
              </span>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sick Leave Balance</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                {(userLeaveBal?.sickTotal || 8) - (userLeaveBal?.sickUsed || 0)}
              </span>
              <span className="text-xs text-slate-400">
                days remaining of {userLeaveBal?.sickTotal || 8}
              </span>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Issued Documents</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                {documents.filter((d) => d.employeeId === currentUser?.id && d.status === 'ISSUED').length}
              </span>
              <span className="text-xs text-slate-400">
                verified documents available in vault
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FOUNDER ACTION ALERT: DOCUMENTS REQUIRING APPROVAL */}
      {isFounder && pendingDocs.length > 0 && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {pendingDocs.length} Official Document{pendingDocs.length > 1 ? 's' : ''} Awaiting Founder Signature
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Per DRS business rules, only the Founder can authorize and issue binding official letters.
              </p>
            </div>
          </div>

          <Link
            href="/documents?filter=PENDING_APPROVAL"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all whitespace-nowrap"
          >
            Review & Authorize Now →
          </Link>
        </div>
      )}

      {/* QUICK ACTIONS ROW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Operations
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {isHR && (
            <Link
              href="/employees?action=new"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-center transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform mb-2">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Employee</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Register Profile</span>
            </Link>
          )}

          {isHR && (
            <Link
              href="/documents?action=new"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-center transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Offer / Letters</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Generate Official Doc</span>
            </Link>
          )}

          <Link
            href="/documents"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-2">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isEmployeeOnly ? 'My Documents' : 'Document Vault'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">PDFs & History</span>
          </Link>

          <Link
            href="/payroll"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isEmployeeOnly ? 'My Payslips' : 'Payroll Cycles'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Salary & Payslips</span>
          </Link>

          <Link
            href="/attendance"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Attendance</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Timesheet & Leaves</span>
          </Link>

          <Link
            href="/verify"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:bg-teal-950/20 text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verify QR</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Public Portal</span>
          </Link>
        </div>
      </div>

      {/* TWO COLUMN SECTION: RECENT DOCUMENTS & ANNOUNCEMENTS/ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Official Documents */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isEmployeeOnly ? 'My Official Documents' : 'Recent Documents & Certificates'}
            </h2>
            <Link
              href="/documents"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              View all ({documents.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {(isEmployeeOnly
                ? documents.filter((d) => d.employeeId === currentUser?.id)
                : documents.slice(0, 5)
              ).map((doc) => {
                const isApproved = doc.status === 'APPROVED' || doc.status === 'ISSUED';
                const isPending = doc.status === 'PENDING_APPROVAL';

                return (
                  <div
                    key={doc.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-teal-500 truncate block"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">{doc.documentNumber}</span>
                          <span>•</span>
                          <span>{doc.employeeName}</span>
                          <span>•</span>
                          <span>{doc.issueDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>

                      <Link
                        href={`/documents/${doc.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View / Print Document"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Company Announcements & Live Audit Trail */}
        <div className="space-y-6">
          {/* Announcements Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Feed →
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-500 border border-teal-500/20">
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs (Founder Only) */}
          {isFounder && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Security & Audit Trail
                </h2>
                <Link
                  href="/announcements?tab=audit"
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  All Logs →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-sm text-xs">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                      {log.details}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      By {log.actorName} ({log.actorRole})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

