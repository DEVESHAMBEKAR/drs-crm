'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import {
  AttendanceRecord,
  LeaveApplication,
  LeaveBalance,
  LeaveType,
  WorkMode,
} from '@/types';
import {
  CalendarCheck,
  Clock,
  CalendarPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Building,
  Laptop,
  Users,
} from 'lucide-react';

export default function AttendancePage() {
  const { role, isFounder, isHR, isEmployeeOnly, currentUser } = useAuth();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(db.getAttendance());
  const [leaveApps, setLeaveApps] = useState<LeaveApplication[]>(db.getLeaveApplications());
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'LEAVES' | 'HOLIDAYS'>('ATTENDANCE');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');

  // Attendance Check-in State
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAtt = attendance.find(
    (a) => a.employeeId === currentUser?.id && a.date === todayStr
  );
  const userLeaveBal = currentUser
    ? db.getLeaveBalanceForEmployee(currentUser.id)
    : null;

  useEffect(() => {
    setAttendance(db.getAttendance());
    setLeaveApps(db.getLeaveApplications());
  }, [role, currentUser]);

  const refreshData = () => {
    setAttendance(db.getAttendance());
    setLeaveApps(db.getLeaveApplications());
  };

  const handleCheckIn = (mode: WorkMode) => {
    if (!currentUser) return;
    db.recordCheckIn(currentUser.id, currentUser.fullName, mode);
    refreshData();
  };

  const handleCheckOut = () => {
    if (!currentUser) return;
    try {
      db.recordCheckOut(currentUser.id);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    db.applyLeave({
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      leaveType,
      startDate,
      endDate,
      totalDays: Number(leaveDays),
      reason: leaveReason,
    });

    refreshData();
    setIsLeaveModalOpen(false);
    setLeaveReason('');
    alert('Leave request submitted successfully. Pending HR / Manager approval.');
  };

  const handleReviewLeave = (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!currentUser) return;
    const remarks = prompt(
      status === 'APPROVED' ? 'Approval remarks (optional):' : 'State reason for rejection:'
    );

    db.reviewLeave(
      id,
      status,
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role },
      remarks || undefined
    );
    refreshData();
  };

  // Indian Holidays 2026 (Bangalore Tech Calendar)
  const holidayCalendar = [
    { date: '2026-01-26', name: 'Republic Day', day: 'Monday' },
    { date: '2026-03-04', name: 'Holi', day: 'Wednesday' },
    { date: '2026-03-20', name: 'Ugadi / Gudi Padwa', day: 'Friday' },
    { date: '2026-04-03', name: 'Good Friday', day: 'Friday' },
    { date: '2026-05-01', name: 'May Day / Labor Day', day: 'Friday' },
    { date: '2026-08-15', name: 'Independence Day', day: 'Saturday' },
    { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', day: 'Friday' },
    { date: '2026-10-20', name: 'Maha Navami / Dussehra', day: 'Tuesday' },
    { date: '2026-11-01', name: 'Karnataka Rajyotsava', day: 'Sunday' },
    { date: '2026-11-08', name: 'Diwali (Deepavali)', day: 'Sunday' },
    { date: '2026-12-25', name: 'Christmas', day: 'Friday' },
  ];

  const displayedAttendance = isEmployeeOnly && currentUser
    ? attendance.filter((a) => a.employeeId === currentUser.id)
    : attendance;

  const displayedLeaves = isEmployeeOnly && currentUser
    ? leaveApps.filter((l) => l.employeeId === currentUser.id)
    : leaveApps;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-teal-500" />
            Attendance & Leave Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time daily check-in timesheets, multi-mode work tracking, leave quotas, and approvals.
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Daily Check-in Card for User */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Attendance Station ({todayStr})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-teal-600 dark:text-teal-400">{currentUser?.fullName}</strong> ({currentUser?.employeeId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!userTodayAtt?.checkIn ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select Work Mode:</span>
              <button
                onClick={() => handleCheckIn('OFFICE')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5" /> Office Check-In
              </button>
              <button
                onClick={() => handleCheckIn('REMOTE')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center gap-1.5"
              >
                <Laptop className="w-3.5 h-3.5" /> Remote Check-In
              </button>
              <button
                onClick={() => handleCheckIn('HYBRID')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Hybrid
              </button>
            </div>
          ) : !userTodayAtt.checkOut ? (
            <div className="flex items-center gap-4">
              <div className="text-right text-xs">
                <span className="text-slate-400">Checked in at: </span>
                <strong className="text-teal-500 font-mono text-sm">{userTodayAtt.checkIn}</strong>
                <span className="ml-2 text-slate-500 font-semibold uppercase">({userTodayAtt.workMode})</span>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20"
              >
                Check Out Now
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Day Completed ({userTodayAtt.checkIn} - {userTodayAtt.checkOut}) • {userTodayAtt.workingHours} Hours
            </div>
          )}
        </div>
      </div>

      {/* Leave Balances Grid */}
      {userLeaveBal && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Casual Leaves</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {userLeaveBal.casualTotal - userLeaveBal.casualUsed}
            </p>
            <span className="text-[10px] text-slate-500">of {userLeaveBal.casualTotal} days</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sick Leaves</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {userLeaveBal.sickTotal - userLeaveBal.sickUsed}
            </p>
            <span className="text-[10px] text-slate-500">of {userLeaveBal.sickTotal} days</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Earned Leaves</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {userLeaveBal.earnedTotal - userLeaveBal.earnedUsed}
            </p>
            <span className="text-[10px] text-slate-500">of {userLeaveBal.earnedTotal} days</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unpaid Taken</span>
            <p className="text-2xl font-black text-rose-500 mt-1">
              {userLeaveBal.unpaidTaken}
            </p>
            <span className="text-[10px] text-slate-500">Loss of pay days</span>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-3 border-b-2 transition-all ${
            activeTab === 'ATTENDANCE'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Daily Timesheets ({displayedAttendance.length})
        </button>
        <button
          onClick={() => setActiveTab('LEAVES')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'LEAVES'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Leave Applications ({displayedLeaves.length})
          {isHR && leaveApps.filter((l) => l.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black">
              {leaveApps.filter((l) => l.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('HOLIDAYS')}
          className={`px-4 py-3 border-b-2 transition-all ${
            activeTab === 'HOLIDAYS'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          2026 Holiday Calendar
        </button>
      </div>

      {/* TAB 1: ATTENDANCE TIMESHEET */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-4">Check-Out</th>
                  <th className="py-3.5 px-4">Work Mode</th>
                  <th className="py-3.5 px-4">Hours</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {displayedAttendance.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{rec.employeeName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{rec.employeeId}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">{rec.checkIn || '--:--'}</td>
                    <td className="py-3 px-4 font-mono">{rec.checkOut || '--:--'}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rec.workMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400 font-semibold">
                      {rec.workingHours ? `${rec.workingHours} hrs` : '--'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE APPLICATIONS */}
      {activeTab === 'LEAVES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {displayedLeaves.map((app) => {
                  const isPending = app.status === 'PENDING';
                  const isApproved = app.status === 'APPROVED';

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{app.employeeName}</p>
                        <p className="text-[10px] text-slate-400">Applied on {app.appliedOn}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {app.leaveType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {app.startDate} to {app.endDate}
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400">
                        {app.totalDays} Day{app.totalDays > 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-600 dark:text-slate-300">
                        {app.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isHR && isPending && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReviewLeave(app.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewLeave(app.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 border border-rose-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HOLIDAY CALENDAR */}
      {activeTab === 'HOLIDAYS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deep Root Studios 2026 Official Holiday Calendar (India / Bangalore Hub)
            </h3>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
              11 Official Paid Holidays
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {holidayCalendar.map((h, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{h.name}</p>
                    <p className="text-[11px] text-slate-500">{h.day}</p>
                  </div>
                </div>

                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {h.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-teal-500" />
              Apply for Leave
            </h3>
            <p className="text-slate-500">
              Submit formal leave request to People Operations & Reporting Manager.
            </p>

            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Leave Category *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="CASUAL">Casual Leave (Personal / Urgent Work)</option>
                  <option value="SICK">Sick Leave (Medical / Illness)</option>
                  <option value="EARNED">Earned / Paid Vacation</option>
                  <option value="UNPAID">Unpaid Leave (Loss of Pay)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Days *
                </label>
                <input
                  required
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Absence *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify reason for leave..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

