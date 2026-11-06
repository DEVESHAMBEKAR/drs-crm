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
      alert(`Payroll cycle for ${selectedMonth}/${selectedYear} compiled by HR (Maroti Kadam)! Submitted for Founder approval.`);
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
    alert('Payroll approved by Founder Devesh Ambekar! Disbursement authorization granted.');
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
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-black dark:text-white" />
            {isEmployeeOnly ? 'My Salary Slips & Compensation' : 'Payroll Management & Payslip Engine'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {isEmployeeOnly
              ? 'View and download audited monthly payslips with transparent tax and provident fund breakdown.'
              : 'Calculate monthly compensations, process statutory deductions (PF, PT, TDS), review founder authorizations, and generate payslips.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Process Monthly Payroll
          </button>
        )}
      </div>

      {/* FOUNDER & HR VIEW: PAYROLL CYCLES LIST */}
      {!isEmployeeOnly && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
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
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 hover:border-black dark:hover:border-white transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {cycle.id}
                      </span>
                      <h3 className="text-lg font-bold text-black dark:text-white mt-1">
                        {monthNames[cycle.month - 1]} {cycle.year}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Prepared by {cycle.preparedBy} • {cycle.totalEmployees} Employees
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isPaid
                          ? 'bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white border-neutral-300 dark:border-neutral-700'
                          : isApproved
                          ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white border-neutral-400'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      }`}
                    >
                      {cycle.status}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500">Gross Payout</span>
                      <p className="font-bold text-black dark:text-white">
                        ₹{(cycle.totalGrossPayout / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500">Deductions</span>
                      <p className="font-bold text-neutral-600 dark:text-neutral-400">
                        -₹{(cycle.totalDeductions / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold">Net Payout</span>
                      <p className="font-black text-black dark:text-white">
                        ₹{(cycle.totalNetPayout / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  {/* Cycle Status info & Founder Actions */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs">
                    {cycle.paymentReference ? (
                      <span className="text-[11px] font-mono text-neutral-500">
                        Ref: {cycle.paymentReference}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-500">
                        {isDraft ? 'Awaiting Founder Approval' : 'Ready for bank disbursement'}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {isFounder && isDraft && (
                        <button
                          onClick={() => handleFounderApprove(cycle.id)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                        >
                          Approve Payout
                        </button>
                      )}

                      {isFounder && isApproved && (
                        <button
                          onClick={() => handleFounderMarkPaid(cycle.id)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {isEmployeeOnly ? 'My Official Payslips' : 'Generated Employee Payslips'}
          </h2>
          <span className="text-xs text-neutral-500">
            {userPayslips.length} payslip records available
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] font-bold tracking-wider">
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
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                {userPayslips.map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
                      {slip.payslipNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-black dark:text-white">{slip.employeeName}</p>
                      <p className="text-[11px] text-neutral-500">{slip.designation}</p>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {monthNames[slip.month - 1]} {slip.year}
                    </td>

                    <td className="py-3 px-4 font-semibold text-black dark:text-white">
                      ₹{slip.grossEarnings.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      -₹{slip.totalDeductions.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 font-black text-black dark:text-white">
                      ₹{slip.netSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          slip.paymentStatus === 'PAID'
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700'
                            : 'bg-neutral-200 text-neutral-800 border border-neutral-300'
                        }`}
                      >
                        {slip.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-black dark:text-white" />
              Prepare Monthly Payroll Cycle
            </h3>
            <p className="text-xs text-neutral-500">
              Retrieves active DRS workforce, verifies attendance days, calculates statutory deductions (PF, PT, TDS), and compiles a draft for founder authorization.
            </p>

            <form onSubmit={handleGeneratePayrollDraft} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Payroll Month *
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Payroll Year *
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white">
                <p className="font-bold">Transparent Statutory Compliance</p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Salaries are derived directly from verified employee compensation contracts and attendance records.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                >
                  Compile Draft Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payslip Modal / Sheet with DRS Stamp and Signatures */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white text-black border border-neutral-300 rounded-none shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Payslip Header with DRS Logo */}
            <div className="border-b-2 border-black pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/drs-logo.jpg"
                  alt="DRS Logo"
                  className="w-12 h-12 object-contain rounded border border-neutral-300 p-0.5"
                />
                <div>
                  <h2 className="text-lg font-black text-black tracking-tight">
                    DEEP ROOT STUDIOS PRIVATE LIMITED
                  </h2>
                  <p className="text-[11px] text-neutral-600">
                    Level 4, Orion Tech Park, HSR Layout, Bengaluru - 560102
                  </p>
                  <p className="text-xs font-bold text-black mt-1 uppercase">
                    SALARY SLIP FOR {monthNames[selectedPayslip.month - 1].toUpperCase()} {selectedPayslip.year}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-black bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
                  {selectedPayslip.payslipNumber}
                </span>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Status: <strong>{selectedPayslip.paymentStatus}</strong>
                </p>
              </div>
            </div>

            {/* Employee Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3.5 rounded border border-neutral-200">
              <div>
                <span className="text-neutral-500">Employee Name</span>
                <p className="font-bold text-black">{selectedPayslip.employeeName}</p>
              </div>
              <div>
                <span className="text-neutral-500">Employee ID</span>
                <p className="font-bold font-mono text-black">{selectedPayslip.employeeId}</p>
              </div>
              <div>
                <span className="text-neutral-500">Designation</span>
                <p className="font-bold text-black">{selectedPayslip.designation}</p>
              </div>
              <div>
                <span className="text-neutral-500">Department</span>
                <p className="font-bold text-black">{selectedPayslip.department}</p>
              </div>
              <div>
                <span className="text-neutral-500">Working Days</span>
                <p className="font-bold text-black">{selectedPayslip.workingDays}</p>
              </div>
              <div>
                <span className="text-neutral-500">Paid Days</span>
                <p className="font-bold text-black">{selectedPayslip.paidDays}</p>
              </div>
              <div>
                <span className="text-neutral-500">Bank Name</span>
                <p className="font-bold text-black">{selectedPayslip.bankName}</p>
              </div>
              <div>
                <span className="text-neutral-500">Account No.</span>
                <p className="font-bold text-black">{selectedPayslip.accountNumberMasked}</p>
              </div>
            </div>

            {/* Earnings vs Deductions Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="border border-neutral-300 rounded overflow-hidden">
                <div className="bg-neutral-100 p-2.5 font-bold uppercase text-black">
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
                  <div className="pt-2 border-t border-neutral-300 flex justify-between font-bold text-black">
                    <span>Total Gross Earnings</span>
                    <span>₹{selectedPayslip.grossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-neutral-300 rounded overflow-hidden">
                <div className="bg-neutral-100 p-2.5 font-bold uppercase text-black">
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
                  <div className="pt-2 border-t border-neutral-300 flex justify-between font-bold text-neutral-800">
                    <span>Total Deductions</span>
                    <span>₹{selectedPayslip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-black">Net Take-Home Salary</p>
                <p className="text-[11px] text-neutral-600 font-medium italic mt-0.5">
                  Amount in words: {selectedPayslip.netSalaryInWords}
                </p>
              </div>
              <p className="text-2xl font-black text-black">
                ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Stamp & Authorized Signature on Payslip */}
            <div className="pt-4 border-t-2 border-black flex items-end justify-between">
              <div>
                <img
                  src="/assets/drs-signature.png"
                  alt="Maroti Kadam Signature"
                  className="h-10 w-auto object-contain mb-1"
                />
                <div className="w-32 border-b border-black mb-1" />
                <p className="text-xs font-bold text-black">Maroti Kadam</p>
                <p className="text-[10px] text-neutral-600">Head of Human Resources & Operations</p>
                <p className="text-[9px] text-neutral-500">Devesh Ambekar (Founder & CEO)</p>
              </div>

              <div className="w-20 h-20">
                <img
                  src="/assets/drs-stamp.png"
                  alt="Official DRS Stamp"
                  className="w-full h-full object-contain filter contrast-125 opacity-90 rotate-[-4deg]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-neutral-200 hover:bg-neutral-300 text-black"
                >
                  Print
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-1.5 rounded text-xs font-bold bg-black text-white hover:opacity-90"
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
