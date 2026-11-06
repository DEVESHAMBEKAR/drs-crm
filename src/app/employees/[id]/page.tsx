'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { EmployeeProfile, EmploymentStatus } from '@/types';
import Link from 'next/link';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  CreditCard,
  FileText,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lock,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, isFounder, isHR, currentUser } = useAuth();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<EmployeeProfile | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FINANCIAL' | 'DOCUMENTS' | 'ATTENDANCE'>('OVERVIEW');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('ACTIVE');

  useEffect(() => {
    const emp = db.getEmployeeById(employeeId);
    setEmployee(emp);
    if (emp) setNewStatus(emp.employmentStatus);
  }, [employeeId]);

  if (!employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Employee Not Found</h2>
        <Link href="/employees" className="text-teal-500 hover:underline text-sm">
          ← Back to Employee Directory
        </Link>
      </div>
    );
  }

  // Security check: Only Founder, HR, or the employee himself can view this profile
  const isSelf = currentUser?.id === employee.id;
  if (!isFounder && !isHR && !isSelf) {
    return (
      <div className="p-8 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          You are not authorized to inspect this employee dossier.
        </p>
        <Link href="/" className="text-teal-500 hover:underline text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const issuedDocs = db.getDocuments().filter((d) => d.employeeId === employee.id);
  const leaveBalance = db.getLeaveBalanceForEmployee(employee.id);
  const employeeAttendance = db.getAttendance().filter((a) => a.employeeId === employee.id);

  const handleUpdateStatus = () => {
    if (!currentUser) return;
    const updated = db.updateEmployee(
      employee.id,
      { employmentStatus: newStatus },
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
    );
    setEmployee(updated);
    setShowStatusModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-black text-2xl text-teal-300">
              {employee.fullName.charAt(0)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {employee.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {employee.designation} • <span className="text-teal-500 font-medium">{employee.department}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {employee.employmentType.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {employee.employmentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {isHR && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              Update Status
            </button>
          )}

          {isHR && (
            <Link
              href={`/documents?action=new&employeeId=${employee.id}`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Document
            </Link>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Profile & Scope
        </button>
        <button
          onClick={() => setActiveTab('FINANCIAL')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'FINANCIAL'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Lock className="w-3 h-3 text-slate-400" />
          Compensation & Bank
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTS'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Documents Vault ({issuedDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ATTENDANCE'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Attendance & Leaves
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Contact & Employment */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Employment Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Official Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Date of Joining</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.dateOfJoining}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {employee.reportingManagerName || 'Founder & CEO'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Probation Target</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.probationEndDate || 'Confirmed / NA'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Address & Emergency Contacts */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Address & Emergency Contact
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Residential Address</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {employee.address.street}, {employee.address.city}, {employee.address.state} -{' '}
                  {employee.address.postalCode}, {employee.address.country}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 mb-0.5">Emergency Contact</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {employee.emergencyContact.name} ({employee.emergencyContact.relation})
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{employee.emergencyContact.phone}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Assigned Responsibilities */}
          <div className="md:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Responsibilities & Deliverables
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {(employee.assignedResponsibilities || ['Standard operational role expectations']).map(
                (item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: FINANCIAL & SALARY */}
      {activeTab === 'FINANCIAL' && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-500" />
                Compensation Structure & Bank Account
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Restricted financial records per Deep Root Studios data security guidelines.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              AUDITED SALARY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual CTC</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                INR {employee.financialDetails?.annualCTC.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Basic</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                INR {employee.financialDetails?.monthlyBasic.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly HRA</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                INR {employee.financialDetails?.monthlyHRA.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Gross</span>
              <p className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
                INR {employee.financialDetails?.monthlyGross.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>

          {/* Banking details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Banking & Statutory Tax Identifiers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Bank Name</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.financialDetails?.bankName || 'Not Provided'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Account Number</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.financialDetails?.accountNumberMasked || '•••• •••• 0000'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">IFSC Code</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.financialDetails?.ifscCode || 'DRSB0001'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">PAN Number</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.financialDetails?.panNumber || 'ABCDE1234F'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">UAN (Provident Fund)</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {employee.financialDetails?.uanPfNumber || 'Not Applicable (Intern/Contract)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Documents Issued to {employee.fullName}
            </h3>
            {isHR && (
              <Link
                href={`/documents?action=new&employeeId=${employee.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                + Issue New
              </Link>
            )}
          </div>

          {issuedDocs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No documents issued yet for this employee.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80">
              {issuedDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-teal-500"
                      >
                        {doc.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {doc.documentNumber} • Issued {doc.issueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {doc.status}
                    </span>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: ATTENDANCE & LEAVES */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Casual Leave</span>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {leaveBalance.casualTotal - leaveBalance.casualUsed} / {leaveBalance.casualTotal}
              </p>
              <span className="text-[11px] text-slate-400">Used: {leaveBalance.casualUsed} days</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sick Leave</span>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {leaveBalance.sickTotal - leaveBalance.sickUsed} / {leaveBalance.sickTotal}
              </p>
              <span className="text-[11px] text-slate-400">Used: {leaveBalance.sickUsed} days</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Earned / Paid Leave</span>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                {leaveBalance.earnedTotal - leaveBalance.earnedUsed} / {leaveBalance.earnedTotal}
              </p>
              <span className="text-[11px] text-slate-400">Used: {leaveBalance.earnedUsed} days</span>
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Attendance Check-Ins
            </h4>
            {employeeAttendance.length === 0 ? (
              <p className="text-xs text-slate-500">No attendance records logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {employeeAttendance.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.date}</span>
                      <span className="ml-2 text-slate-500">({rec.workMode})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>In: {rec.checkIn || '--:--'}</span>
                      <span>Out: {rec.checkOut || '--:--'}</span>
                      <span className="font-bold text-emerald-500">{rec.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Update Employment Status
            </h3>
            <p className="text-xs text-slate-500">
              Modify operational status for {employee.fullName} ({employee.employeeId}).
            </p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_PROBATION">ON PROBATION</option>
              <option value="PENDING_ONBOARDING">PENDING ONBOARDING</option>
              <option value="ON_LEAVE">ON LEAVE</option>
              <option value="COMPLETED_INTERNSHIP">COMPLETED INTERNSHIP</option>
              <option value="RESIGNED">RESIGNED</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
