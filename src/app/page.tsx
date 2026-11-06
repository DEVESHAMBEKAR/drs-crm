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
      {/* Top Banner / Welcome Bar in Monochrome Tech Aesthetic */}
      <div className="relative overflow-hidden rounded-2xl bg-black text-white border border-neutral-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Deep Root Studios Operations Platform
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Member'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
              {isFounder && 'Founder Overview: Executive workforce oversight, document authorization, and monthly payroll liability.'}
              {role === 'HR_MANAGER' && 'People Operations Hub: Employee registry, document issuance with stamp & signature, and attendance audits.'}
              {isEmployeeOnly && 'Employee Self-Service: Track personal credentials, verify official documents, and view monthly payslips.'}
            </p>
          </div>

          {/* Quick Check-in pill */}
          <div className="flex items-center gap-3 bg-neutral-900/90 p-3 rounded-xl border border-neutral-800 backdrop-blur-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-neutral-400">Today's Attendance</p>
              <p className="text-xs font-bold text-white">
                {userTodayAtt ? `${userTodayAtt.checkIn} (${userTodayAtt.workMode})` : 'Not Checked In'}
              </p>
            </div>
            {!userTodayAtt?.checkIn ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleQuickCheckIn('OFFICE')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-all shadow-sm"
                >
                  Office
                </button>
                <button
                  onClick={() => handleQuickCheckIn('REMOTE')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all"
                >
                  Remote
                </button>
              </div>
            ) : !userTodayAtt.checkOut ? (
              <button
                onClick={handleQuickCheckOut}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-all shadow-sm"
              >
                Check Out
              </button>
            ) : (
              <span className="text-xs font-bold text-white bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-lg">
                Done ({userTodayAtt.workingHours} hrs)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FOUNDER & HR METRICS SECTION */}
      {!isEmployeeOnly && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Headcount */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-black dark:hover:border-white transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Headcount</span>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                {totalEmployees}
              </span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center">
                Active: {activeEmployees}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {totalInterns} Interns • {pendingOnboarding} Pending Onboarding
            </p>
          </div>

          {/* Card 2: Documents Engine */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-black dark:hover:border-white transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Documents</span>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                {totalDocs}
              </span>
              {pendingDocs.length > 0 ? (
                <span className="text-xs font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700">
                  {pendingDocs.length} Pending Sign-off
                </span>
              ) : (
                <span className="text-xs text-neutral-500 font-medium">All approved</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              With Stamp, Seal & QR Code
            </p>
          </div>

          {/* Card 3: Monthly Payroll */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-black dark:hover:border-white transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Current Payroll</span>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xs font-bold text-neutral-400">INR</span>
              <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                {latestPayroll ? (latestPayroll.totalNetPayout / 100000).toFixed(2) : '0'}L
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                {latestPayroll?.status || 'NO CYCLE'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Cycle: {latestPayroll ? `${latestPayroll.month}/${latestPayroll.year}` : 'N/A'} • {latestPayroll?.payslipsCount || 0} Payslips
            </p>
          </div>

          {/* Card 4: Leave Requests */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-black dark:hover:border-white transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Leave Queue</span>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                {pendingLeaves.length}
              </span>
              <span className="text-xs font-medium text-neutral-500">
                {pendingLeaves.length === 1 ? 'request waiting' : 'requests waiting'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Requires HR (Maroti) verification
            </p>
          </div>
        </div>
      )}

      {/* EMPLOYEE SELF-SERVICE SECTION */}
      {isEmployeeOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Casual Leave Balance</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-black dark:text-white">
                {(userLeaveBal?.casualTotal || 12) - (userLeaveBal?.casualUsed || 0)}
              </span>
              <span className="text-xs text-neutral-400">
                days remaining of {userLeaveBal?.casualTotal || 12}
              </span>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Sick Leave Balance</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-black dark:text-white">
                {(userLeaveBal?.sickTotal || 8) - (userLeaveBal?.sickUsed || 0)}
              </span>
              <span className="text-xs text-neutral-400">
                days remaining of {userLeaveBal?.sickTotal || 8}
              </span>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">My Issued Documents</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-black dark:text-white">
                {documents.filter((d) => d.employeeId === currentUser?.id && d.status === 'ISSUED').length}
              </span>
              <span className="text-xs text-neutral-400">
                verified documents available in vault
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FOUNDER ACTION ALERT: DOCUMENTS REQUIRING APPROVAL */}
      {isFounder && pendingDocs.length > 0 && (
        <div className="p-5 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {pendingDocs.length} Official Document{pendingDocs.length > 1 ? 's' : ''} Awaiting Founder Signature
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Drafted by Head of HR Maroti Kadam; requires Devesh Ambekar (Founder) sign-off before release.
              </p>
            </div>
          </div>

          <Link
            href="/documents?filter=PENDING_APPROVAL"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all whitespace-nowrap shadow-sm"
          >
            Review & Authorize Now →
          </Link>
        </div>
      )}

      {/* QUICK OPERATIONS ROW */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Quick Operations
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {isHR && (
            <Link
              href="/employees?action=new"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-center transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white group-hover:scale-110 transition-transform mb-2">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-black dark:text-white">Add Employee</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">Register Profile</span>
            </Link>
          )}

          {isHR && (
            <Link
              href="/documents?action=new"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-center transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white group-hover:scale-110 transition-transform mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-black dark:text-white">Offer / Letters</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">With Seal & Sign</span>
            </Link>
          )}

          <Link
            href="/documents"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white group-hover:scale-110 transition-transform mb-2">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-black dark:text-white">
              {isEmployeeOnly ? 'My Documents' : 'Document Vault'}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5">PDFs & History</span>
          </Link>

          <Link
            href="/payroll"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white group-hover:scale-110 transition-transform mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-black dark:text-white">
              {isEmployeeOnly ? 'My Payslips' : 'Payroll Cycles'}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Salary & Payslips</span>
          </Link>

          <Link
            href="/attendance"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white group-hover:scale-110 transition-transform mb-2">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-black dark:text-white">Attendance</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Timesheet & Leaves</span>
          </Link>

          <Link
            href="/verify"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-center transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white group-hover:scale-110 transition-transform mb-2">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-black dark:text-white">Verify QR</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Public Portal</span>
          </Link>
        </div>
      </div>

      {/* TWO COLUMN SECTION: RECENT DOCUMENTS & ANNOUNCEMENTS/ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Official Documents */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {isEmployeeOnly ? 'My Official Documents' : 'Recent Documents & Credentials'}
            </h2>
            <Link
              href="/documents"
              className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              View all ({documents.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(isEmployeeOnly
                ? documents.filter((d) => d.employeeId === currentUser?.id)
                : documents.slice(0, 5)
              ).map((doc) => {
                const isApproved = doc.status === 'APPROVED' || doc.status === 'ISSUED';
                const isPending = doc.status === 'PENDING_APPROVAL';

                return (
                  <div
                    key={doc.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="text-xs sm:text-sm font-bold text-black dark:text-white hover:underline truncate block"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-black dark:text-white">{doc.documentNumber}</span>
                          <span>•</span>
                          <span>{doc.employeeName}</span>
                          <span>•</span>
                          <span>{doc.issueDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
                        {doc.status.replace('_', ' ')}
                      </span>

                      <Link
                        href={`/documents/${doc.id}`}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-xs font-bold text-black dark:text-white hover:underline"
              >
                Feed →
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700">
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-neutral-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-black dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
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
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Security & Audit Trail
                </h2>
                <Link
                  href="/announcements?tab=audit"
                  className="text-xs font-bold text-black dark:text-white hover:underline"
                >
                  All Logs →
                </Link>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 divide-y divide-neutral-100 dark:divide-neutral-800 shadow-sm text-xs">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-black dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-1">
                      {log.details}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
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
