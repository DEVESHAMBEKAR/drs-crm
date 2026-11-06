'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { PayrollRecord, PayslipItem } from '@/types';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  CheckCircle,
  Clock,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Building,
} from 'lucide-react';

export default function PayrollPage() {
  const { role, isFounder, isHR, isEmployeeOnly, currentUser } = useAuth();
  const [cycles, setCycles] = useState<PayrollRecord[]>(db.getPayrollCycles());
  const [payslips, setPayslips] = useState<PayslipItem[]>(db.getPayslips());

  // Payroll Wizard Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Payslip detail modal
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);

  useEffect(() => {
    setCycles(db.getPayrollCycles());
    setPayslips(db.getPayslips());
  }, [role, currentUser]);

  const refreshData = () => {
    setCycles(db.getPayrollCycles());
    setPayslips(db.getPayslips());
  };

  const handleGeneratePayrollDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const cycle = db.createPayrollCycle(selectedMonth, selectedYear, {
        id: currentUser.id,
        name: currentUser.fullName,
        role: currentUser.role,
      });
      refreshData();
      setIsWizardOpen(false);
      alert(`Payroll cycle for ${selectedMonth}/${selectedYear} prepared successfully!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFounderApprove = (cycleId: string) => {
    if (!currentUser) return;
    db.updatePayrollStatus(cycleId, 'APPROVED', {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
    });
    refreshData();
    alert('Payroll approved by Founder! Payout authorization granted.');
  };

  const handleFounderMarkPaid = (cycleId: string) => {
    if (!currentUser) return;
    const ref = prompt('Enter Bank / NEFT Transaction Reference for Disbursement:', `NEFT-DRS-${Date.now().toString().slice(-8)}`);
    if (!ref) return;

    db.updatePayrollStatus(
      cycleId,
      'PAID',
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role },
      ref
    );
    refreshData();
    alert('Payroll cycle confirmed and marked PAID. Payslips updated across employee portals.');
  };

  // If user is employee, show only their own payslips
  const userPayslips = isEmployeeOnly && currentUser
    ? payslips.filter((p) => p.employeeId === currentUser.id)
    : payslips;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-teal-500" />
            {isEmployeeOnly ? 'My Salary Slips & Compensation' : 'Payroll Management & Payslip Engine'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEmployeeOnly
              ? 'View and download audited monthly payslips with transparent tax and provident fund breakdown.'
              : 'Calculate monthly compensations, process statutory deductions (PF, PT, TDS), review founder authorizations, and generate payslips.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Process Monthly Payroll
          </button>
        )}
      </div>

      {/* FOUNDER & HR VIEW: PAYROLL CYCLES LIST */}
      {!isEmployeeOnly && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Payroll Cycles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cycles.map((cycle) => {
              const isPaid = cycle.status === 'PAID';
              const isApproved = cycle.status === 'APPROVED';
              const isDraft = cycle.status === 'DRAFT';

              return (
                <div
                  key={cycle.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cycle.id}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {monthNames[cycle.month - 1]} {cycle.year}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Prepared by {cycle.preparedBy} • {cycle.totalEmployees} Employees
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : isApproved
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      }`}
                    >
                      {cycle.status}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Gross Payout</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        ₹{(cycle.totalGrossPayout / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Deductions</span>
                      <p className="font-bold text-rose-500">
                        -₹{(cycle.totalDeductions / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Net Payout</span>
                      <p className="font-black text-teal-600 dark:text-teal-400">
                        ₹{(cycle.totalNetPayout / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  {/* Cycle Status info & Founder Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    {cycle.paymentReference ? (
                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: {cycle.paymentReference}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {isDraft ? 'Awaiting Founder Approval' : 'Ready for bank disbursement'}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {isFounder && isDraft && (
                        <button
                          onClick={() => handleFounderApprove(cycle.id)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          Approve Payout
                        </button>
                      )}

                      {isFounder && isApproved && (
                        <button
                          onClick={() => handleFounderMarkPaid(cycle.id)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Confirm & Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAYSLIPS DIRECTORY SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEmployeeOnly ? 'My Official Payslips' : 'Generated Employee Payslips'}
          </h2>
          <span className="text-xs text-slate-500">
            {userPayslips.length} payslip records available
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Payslip Number</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Gross Earnings</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Salary</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {userPayslips.map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {slip.payslipNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{slip.employeeName}</p>
                      <p className="text-[11px] text-slate-500">{slip.designation}</p>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {monthNames[slip.month - 1]} {slip.year}
                    </td>

                    <td className="py-3 px-4 font-semibold">
                      ₹{slip.grossEarnings.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-rose-500">
                      -₹{slip.totalDeductions.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 font-black text-teal-600 dark:text-teal-400">
                      ₹{slip.netSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          slip.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {slip.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/10 hover:text-teal-500 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        Inspect Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Payroll Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-500" />
              Prepare Monthly Payroll Cycle
            </h3>
            <p className="text-xs text-slate-500">
              Retrieves active DRS workforce, verifies attendance days, calculates statutory deductions (PF, PT, TDS), and compiles a draft for founder authorization.
            </p>

            <form onSubmit={handleGeneratePayrollDraft} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payroll Month *
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payroll Year *
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-200">
                <p className="font-bold">Transparent Calculation Guarantees</p>
                <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                  Salaries are derived directly from employee compensation contracts and attendance verified records.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Compile Draft Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payslip Modal / Sheet */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white text-slate-900 border border-slate-300 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Payslip Header */}
            <div className="border-b-2 border-teal-700 pb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  DEEP ROOT STUDIOS PRIVATE LIMITED
                </h2>
                <p className="text-xs text-slate-600">
                  Level 4, Orion Tech Park, HSR Layout, Bengaluru - 560102
                </p>
                <p className="text-xs font-semibold text-teal-800 mt-1 uppercase">
                  SALARY SLIP FOR {monthNames[selectedPayslip.month - 1].toUpperCase()} {selectedPayslip.year}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                  {selectedPayslip.payslipNumber}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Status: <strong>{selectedPayslip.paymentStatus}</strong>
                </p>
              </div>
            </div>

            {/* Employee Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">Employee Name</span>
                <p className="font-bold text-slate-900">{selectedPayslip.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-500">Employee ID</span>
                <p className="font-bold font-mono text-teal-800">{selectedPayslip.employeeId}</p>
              </div>
              <div>
                <span className="text-slate-500">Designation</span>
                <p className="font-bold text-slate-900">{selectedPayslip.designation}</p>
              </div>
              <div>
                <span className="text-slate-500">Department</span>
                <p className="font-bold text-slate-900">{selectedPayslip.department}</p>
              </div>
              <div>
                <span className="text-slate-500">Working Days</span>
                <p className="font-bold text-slate-900">{selectedPayslip.workingDays}</p>
              </div>
              <div>
                <span className="text-slate-500">Paid Days</span>
                <p className="font-bold text-slate-900">{selectedPayslip.paidDays}</p>
              </div>
              <div>
                <span className="text-slate-500">Bank Name</span>
                <p className="font-bold text-slate-900">{selectedPayslip.bankName}</p>
              </div>
              <div>
                <span className="text-slate-500">Account No.</span>
                <p className="font-bold text-slate-900">{selectedPayslip.accountNumberMasked}</p>
              </div>
            </div>

            {/* Earnings vs Deductions Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 font-bold uppercase text-slate-700">
                  Earnings Breakdown
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-semibold">₹{selectedPayslip.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-semibold">₹{selectedPayslip.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Allowance</span>
                    <span className="font-semibold">₹{selectedPayslip.specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedPayslip.bonus > 0 && (
                    <div className="flex justify-between">
                      <span>Performance Bonus</span>
                      <span className="font-semibold">₹{selectedPayslip.bonus.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-teal-800">
                    <span>Total Gross Earnings</span>
                    <span>₹{selectedPayslip.grossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 font-bold uppercase text-slate-700">
                  Deductions Breakdown
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Provident Fund (PF)</span>
                    <span className="font-semibold">₹{selectedPayslip.providentFund.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax (PT)</span>
                    <span className="font-semibold">₹{selectedPayslip.professionalTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS (Income Tax)</span>
                    <span className="font-semibold">₹{selectedPayslip.tdsTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-600">
                    <span>Total Deductions</span>
                    <span>₹{selectedPayslip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-teal-800">Net Take-Home Salary</p>
                <p className="text-[11px] text-teal-700 font-medium italic mt-0.5">
                  Amount in words: {selectedPayslip.netSalaryInWords}
                </p>
              </div>
              <p className="text-2xl font-black text-teal-900">
                ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Signatures & Close */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                <p className="font-bold text-slate-800">Deep Root Studios Human Resources</p>
                <p className="text-[10px]">Computer generated payslip; requires no physical signature.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Print
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

