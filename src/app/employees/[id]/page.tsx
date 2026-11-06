'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { EmployeeProfile, EmploymentStatus, EmploymentType, UserRole } from '@/types';
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
  Edit,
  X,
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, isFounder, isHR, currentUser } = useAuth();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<EmployeeProfile | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FINANCIAL' | 'DOCUMENTS' | 'ATTENDANCE'>('OVERVIEW');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('ACTIVE');

  // Edit Employee Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    employmentType: 'FULL_TIME' as EmploymentType,
    employmentStatus: 'ACTIVE' as EmploymentStatus,
    reportingManagerName: '',
    annualCTC: 0,
    bankName: '',
    accountNumberMasked: '',
    panNumber: '',
  });

  useEffect(() => {
    const emp = db.getEmployeeById(employeeId);
    setEmployee(emp);
    if (emp) {
      setNewStatus(emp.employmentStatus);
      setEditForm({
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        designation: emp.designation,
        department: emp.department,
        employmentType: emp.employmentType,
        employmentStatus: emp.employmentStatus,
        reportingManagerName: emp.reportingManagerName || 'Devesh Ambekar',
        annualCTC: emp.financialDetails?.annualCTC || 0,
        bankName: emp.financialDetails?.bankName || '',
        accountNumberMasked: emp.financialDetails?.accountNumberMasked || '',
        panNumber: emp.financialDetails?.panNumber || '',
      });
    }
  }, [employeeId]);

  if (!employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Employee Not Found</h2>
        <Link href="/employees" className="text-black dark:text-white underline text-sm">
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
        <Shield className="w-12 h-12 text-black dark:text-white mx-auto" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-xs text-neutral-500">
          You are not authorized to inspect this employee dossier.
        </p>
        <Link href="/" className="text-black dark:text-white underline text-sm">
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

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const monthlyGross = Math.round(editForm.annualCTC / 12);
    const monthlyBasic = Math.round(monthlyGross * 0.5);
    const monthlyHRA = Math.round(monthlyBasic * 0.4);
    const monthlyConveyance = Math.min(monthlyGross * 0.1, 5000);
    const monthlySpecialAllowance = monthlyGross - monthlyBasic - monthlyHRA - monthlyConveyance;

    const updated = db.updateEmployee(
      employee.id,
      {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        designation: editForm.designation,
        department: editForm.department,
        employmentType: editForm.employmentType,
        employmentStatus: editForm.employmentStatus,
        reportingManagerName: editForm.reportingManagerName,
        financialDetails: {
          ...employee.financialDetails,
          bankName: editForm.bankName,
          accountNumberMasked: editForm.accountNumberMasked,
          panNumber: editForm.panNumber,
          annualCTC: editForm.annualCTC,
          monthlyGross,
          monthlyBasic,
          monthlyHRA,
          monthlySpecialAllowance,
          monthlyConveyance,
          ifscCode: employee.financialDetails?.ifscCode || 'HDFC0001234',
        },
      },
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
    );

    setEmployee(updated);
    setShowEditModal(false);
    alert('Employee profile and compensation updated successfully by authorized personnel!');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            {employee.fullName.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                {employee.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              {employee.designation} • <span className="font-semibold text-black dark:text-white">{employee.department}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {employee.employmentType.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
                {employee.employmentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Both HR and Founder have authority to change details */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {isHR && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Employee
            </button>
          )}

          {isHR && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 transition-colors"
            >
              Update Status
            </button>
          )}

          {isHR && (
            <Link
              href={`/documents?action=new&employeeId=${employee.id}`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Document
            </Link>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Profile & Scope
        </button>
        <button
          onClick={() => setActiveTab('FINANCIAL')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'FINANCIAL'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Lock className="w-3 h-3 text-neutral-400" />
          Compensation & Bank
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTS'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Documents Vault ({issuedDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ATTENDANCE'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Attendance & Leaves
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Contact & Employment */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Employment Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Official Email</span>
                <span className="font-semibold text-black dark:text-white">{employee.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Phone Number</span>
                <span className="font-semibold text-black dark:text-white">{employee.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Date of Joining</span>
                <span className="font-semibold text-black dark:text-white">{employee.dateOfJoining}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Reporting Manager</span>
                <span className="font-semibold text-black dark:text-white">
                  {employee.reportingManagerName || 'Devesh Ambekar (Founder & CEO)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Probation Target</span>
                <span className="font-semibold text-black dark:text-white">
                  {employee.probationEndDate || 'Confirmed / NA'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Address & Emergency Contacts */}
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Address & Emergency Contact
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-neutral-500 mb-0.5">Residential Address</p>
                <p className="font-medium text-black dark:text-white">
                  {employee.address.street}, {employee.address.city}, {employee.address.state} -{' '}
                  {employee.address.postalCode}, {employee.address.country}
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-neutral-500 mb-0.5">Emergency Contact</p>
                <p className="font-bold text-black dark:text-white">
                  {employee.emergencyContact.name} ({employee.emergencyContact.relation})
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">{employee.emergencyContact.phone}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Assigned Responsibilities */}
          <div className="md:col-span-2 p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Assigned Responsibilities & Deliverables
            </h3>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {(employee.assignedResponsibilities || ['Standard operational role expectations']).map(
                (item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
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
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Compensation Structure & Bank Account
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Restricted financial records per Deep Root Studios data security guidelines.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
              AUDITED SALARY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Annual CTC</span>
              <p className="text-xl font-black text-black dark:text-white mt-1">
                INR {employee.financialDetails?.annualCTC.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Monthly Basic</span>
              <p className="text-xl font-black text-black dark:text-white mt-1">
                INR {employee.financialDetails?.monthlyBasic.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Monthly HRA</span>
              <p className="text-xl font-black text-black dark:text-white mt-1">
                INR {employee.financialDetails?.monthlyHRA.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Monthly Gross</span>
              <p className="text-xl font-black text-black dark:text-white mt-1">
                INR {employee.financialDetails?.monthlyGross.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>

          {/* Banking details */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-3">
              Banking & Statutory Tax Identifiers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-neutral-500">Bank Name</span>
                <p className="font-bold text-black dark:text-white mt-0.5">
                  {employee.financialDetails?.bankName || 'Not Provided'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Account Number</span>
                <p className="font-bold text-black dark:text-white mt-0.5">
                  {employee.financialDetails?.accountNumberMasked || '•••• •••• 0000'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">IFSC Code</span>
                <p className="font-bold text-black dark:text-white mt-0.5">
                  {employee.financialDetails?.ifscCode || 'DRSB0001'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">PAN Number</span>
                <p className="font-bold text-black dark:text-white mt-0.5">
                  {employee.financialDetails?.panNumber || 'ABCDE1234F'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">UAN (Provident Fund)</span>
                <p className="font-bold text-black dark:text-white mt-0.5">
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
            <h3 className="text-sm font-bold text-black dark:text-white">
              Official Documents Issued to {employee.fullName}
            </h3>
            {isHR && (
              <Link
                href={`/documents?action=new&employeeId=${employee.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black"
              >
                + Issue New
              </Link>
            )}
          </div>

          {issuedDocs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">No documents issued yet for this employee.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800">
              {issuedDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="text-xs sm:text-sm font-bold text-black dark:text-white hover:underline"
                      >
                        {doc.title}
                      </Link>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {doc.documentNumber} • Issued {doc.issueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                      {doc.status}
                    </span>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Casual Leave</span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {leaveBalance.casualTotal - leaveBalance.casualUsed} / {leaveBalance.casualTotal}
              </p>
              <span className="text-[11px] text-neutral-400">Used: {leaveBalance.casualUsed} days</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Sick Leave</span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {leaveBalance.sickTotal - leaveBalance.sickUsed} / {leaveBalance.sickTotal}
              </p>
              <span className="text-[11px] text-neutral-400">Used: {leaveBalance.sickUsed} days</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Earned / Paid Leave</span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {leaveBalance.earnedTotal - leaveBalance.earnedUsed} / {leaveBalance.earnedTotal}
              </p>
              <span className="text-[11px] text-neutral-400">Used: {leaveBalance.earnedUsed} days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Recent Attendance Check-Ins
            </h4>
            {employeeAttendance.length === 0 ? (
              <p className="text-xs text-neutral-500">No attendance records logged yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {employeeAttendance.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-black dark:text-white">{rec.date}</span>
                      <span className="ml-2 text-neutral-500">({rec.workMode})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>In: {rec.checkIn || '--:--'}</span>
                      <span>Out: {rec.checkOut || '--:--'}</span>
                      <span className="font-bold text-black dark:text-white">{rec.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Full Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Edit Employee Profile & Compensation
                </h3>
                <p className="text-xs text-neutral-500">
                  Authorized action by HR (Maroti Kadam) or Founder (Devesh Ambekar)
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone *
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Designation *
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  >
                    <option value="Data Annotation">Data Annotation</option>
                    <option value="AI Evaluation & QA">AI Evaluation & QA</option>
                    <option value="AI Agents & Automation">AI Agents & Automation</option>
                    <option value="Workflow Automation">Workflow Automation</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Employment Type *
                  </label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value as EmploymentType })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="INTERN">Intern</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Annual CTC (INR) *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={editForm.annualCTC}
                    onChange={(e) => setEditForm({ ...editForm, annualCTC: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    PAN Card *
                  </label>
                  <input
                    type="text"
                    value={editForm.panNumber}
                    onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 uppercase"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-black dark:text-white">
              Update Employment Status
            </h3>
            <p className="text-xs text-neutral-500">
              Modify operational status for {employee.fullName} ({employee.employeeId}).
            </p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as EmploymentStatus)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white"
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
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black"
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
