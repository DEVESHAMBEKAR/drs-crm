'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { EmployeeProfile, EmploymentStatus, EmploymentType, UserRole } from '@/types';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function EmployeesPage() {
  const { role, isFounder, isHR, currentUser } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>(db.getEmployees());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeProfile | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE' as UserRole,
    designation: '',
    department: 'Data Annotation',
    employmentType: 'FULL_TIME' as EmploymentType,
    employmentStatus: 'ACTIVE' as EmploymentStatus,
    dateOfJoining: new Date().toISOString().split('T')[0],
    dateOfBirth: '2000-01-01',
    reportingManagerName: 'Devesh Sharma',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560102',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    annualCTC: 600000,
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: 'HDFC0000123',
    panNumber: '',
  });

  useEffect(() => {
    setEmployees(db.getEmployees());
  }, []);

  const departments = [
    'Data Annotation',
    'AI Evaluation & QA',
    'AI Agents & Automation',
    'Workflow Automation',
    'People Operations',
    'Executive Leadership',
  ];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || emp.employmentStatus === statusFilter;
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesType = typeFilter === 'ALL' || emp.employmentType === typeFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesType;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Generate next employee ID
    const count = db.getEmployees().length + 1;
    const nextEmpId = `DRS-EMP-${count.toString().padStart(3, '0')}`;

    // Auto-calculate monthly structure
    const monthlyGross = Math.round(formData.annualCTC / 12);
    const monthlyBasic = Math.round(monthlyGross * 0.5);
    const monthlyHRA = Math.round(monthlyBasic * 0.4);
    const monthlyConveyance = Math.min(monthlyGross * 0.1, 5000);
    const monthlySpecialAllowance = monthlyGross - monthlyBasic - monthlyHRA - monthlyConveyance;

    const newEmp = db.createEmployee(
      {
        employeeId: nextEmpId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        designation: formData.designation,
        department: formData.department,
        employmentType: formData.employmentType,
        employmentStatus: formData.employmentStatus,
        dateOfJoining: formData.dateOfJoining,
        dateOfBirth: formData.dateOfBirth,
        reportingManagerName: formData.reportingManagerName,
        address: {
          street: formData.street || 'Tech Park Hub',
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
        emergencyContact: {
          name: formData.emergencyName || 'Family Contact',
          phone: formData.emergencyPhone || formData.phone,
          relation: formData.emergencyRelation || 'Parent',
        },
        financialDetails: {
          bankName: formData.bankName,
          accountNumberMasked: formData.accountNumber
            ? `•••• •••• ${formData.accountNumber.slice(-4)}`
            : '•••• •••• 1001',
          ifscCode: formData.ifscCode,
          panNumber: formData.panNumber || 'ABCDE1234F',
          annualCTC: Number(formData.annualCTC),
          monthlyGross,
          monthlyBasic,
          monthlyHRA,
          monthlySpecialAllowance,
          monthlyConveyance,
          stipendAmount: formData.employmentType === 'INTERN' ? monthlyGross : undefined,
        },
        assignedResponsibilities: [
          `Execute operational benchmarks in ${formData.department}`,
          'Uphold DRS data privacy, annotation hygiene and security standards',
        ],
      },
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
    );

    setEmployees(db.getEmployees());
    setIsAddModalOpen(false);
    alert(`Successfully registered ${newEmp.fullName} as ${newEmp.employeeId}!`);
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'ON_PROBATION':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PENDING_ONBOARDING':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ON_LEAVE':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'COMPLETED_INTERNSHIP':
        return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-500" />
            Employee Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain the official workforce registry, KYC verification, compensation structures and profiles.
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add New Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, employee code (DRS-EMP-...), designation, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_PROBATION">On Probation</option>
            <option value="PENDING_ONBOARDING">Pending Onboarding</option>
            <option value="COMPLETED_INTERNSHIP">Completed Internship</option>
            <option value="RESIGNED">Resigned</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          {/* Employment Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Employment Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="INTERN">Intern</option>
            <option value="CONTRACT">Contract</option>
            <option value="PART_TIME">Part Time</option>
          </select>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-200">{filteredEmployees.length}</strong> of{' '}
            {employees.length} records
          </span>
          {(search || statusFilter !== 'ALL' || deptFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setDeptFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Employees Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-teal-500 transition-colors"
                        >
                          {emp.fullName}
                        </Link>
                        <p className="text-[11px] font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                          {emp.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">{emp.designation}</p>
                    <p className="text-[11px] text-slate-500">{emp.department}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {new Date(emp.dateOfJoining).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {emp.employmentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        emp.employmentStatus
                      )}`}
                    >
                      {emp.employmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/10 hover:text-teal-500 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        Profile
                      </Link>
                      {isHR && (
                        <Link
                          href={`/documents?action=new&employeeId=${emp.id}`}
                          className="p-1.5 rounded text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Generate Document for Employee"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-500" />
                  Register New Employee
                </h3>
                <p className="text-xs text-slate-500">
                  Adds record to Deep Root Studios database with verified compensation & KYC details
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateEmployee} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  1. Personal & Employment Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="name@deeprootstudios.ai"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. AI Evaluation Specialist"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employment Type *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) =>
                        setFormData({ ...formData, employmentType: e.target.value as EmploymentType })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="INTERN">Intern</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="PART_TIME">Part Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Joining Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Status *
                    </label>
                    <select
                      value={formData.employmentStatus}
                      onChange={(e) =>
                        setFormData({ ...formData, employmentStatus: e.target.value as EmploymentStatus })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_PROBATION">On Probation</option>
                      <option value="PENDING_ONBOARDING">Pending Onboarding</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Compensation & Banking */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  2. Remuneration & Bank Details (Restricted Access)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Annual CTC (INR) *
                    </label>
                    <input
                      required
                      type="number"
                      step="10000"
                      value={formData.annualCTC}
                      onChange={(e) => setFormData({ ...formData, annualCTC: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Approx monthly gross: INR {Math.round(formData.annualCTC / 12).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      PAN Card Number *
                    </label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs uppercase focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="50100234891102"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20"
                >
                  Create Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

