'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, numberToIndianWords } from '@/lib/db';
import { PayrollRecord, PayslipItem, EmployeeProfile } from '@/types';
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
  Edit2,
  Mail,
  Send,
  Trash2,
  X,
  Loader2,
  Shield,
  UserCheck,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PayrollPage() {
  const { role, isFounder, isHR, isEmployeeOnly, currentUser } = useAuth();
  const [cycles, setCycles] = useState<PayrollRecord[]>(db.getPayrollCycles());
  const [payslips, setPayslips] = useState<PayslipItem[]>(db.getPayslips());
  const [employees, setEmployees] = useState<EmployeeProfile[]>(db.getEmployees());
  const [settings, setSettings] = useState(db.getCompanySettings());

  // Batch Payroll Wizard Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Individual Payslip Creator Modal
  const [isCreateIndividualOpen, setIsCreateIndividualOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [indMonth, setIndMonth] = useState(new Date().getMonth() + 1);
  const [indYear, setIndYear] = useState(new Date().getFullYear());
  const [indWorkingDays, setIndWorkingDays] = useState(22);
  const [indPaidDays, setIndPaidDays] = useState(22);
  const [indLopDays, setIndLopDays] = useState(0);
  const [indBasic, setIndBasic] = useState(25000);
  const [indHra, setIndHra] = useState(10000);
  const [indSpecial, setIndSpecial] = useState(10000);
  const [indBonus, setIndBonus] = useState(0);
  const [indPf, setIndPf] = useState(1800);
  const [indPt, setIndPt] = useState(200);
  const [indTds, setIndTds] = useState(0);
  const [indOther, setIndOther] = useState(0);
  const [indStatus, setIndStatus] = useState<'UNPAID' | 'PROCESSED' | 'PAID'>('UNPAID');

  // Fix / Edit Payslip Modal
  const [editingSlip, setEditingSlip] = useState<PayslipItem | null>(null);
  const [editBasic, setEditBasic] = useState(0);
  const [editHra, setEditHra] = useState(0);
  const [editSpecial, setEditSpecial] = useState(0);
  const [editBonus, setEditBonus] = useState(0);
  const [editPf, setEditPf] = useState(0);
  const [editPt, setEditPt] = useState(0);
  const [editTds, setEditTds] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editWorkingDays, setEditWorkingDays] = useState(22);
  const [editPaidDays, setEditPaidDays] = useState(22);
  const [editLopDays, setEditLopDays] = useState(0);
  const [editStatus, setEditStatus] = useState<'UNPAID' | 'PROCESSED' | 'PAID'>('UNPAID');

  // Payslip detail preview modal
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);
  const payslipSheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Email modal state
  const [emailModalSlip, setEmailModalSlip] = useState<PayslipItem | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setCycles(db.getPayrollCycles());
    setPayslips(db.getPayslips());
    setEmployees(db.getEmployees());
    setSettings(db.getCompanySettings());
  }, [role, currentUser]);

  const refreshData = () => {
    setCycles(db.getPayrollCycles());
    setPayslips(db.getPayslips());
    setEmployees(db.getEmployees());
    setSettings(db.getCompanySettings());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // When employee is picked in Individual Creator, populate their salary structure
  const handleSelectIndividualEmp = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      const basic = emp.financialDetails?.monthlyBasic || 25000;
      const hra = emp.financialDetails?.monthlyHRA || 10000;
      const special = emp.financialDetails?.monthlySpecialAllowance || 10000;
      setIndBasic(basic);
      setIndHra(hra);
      setIndSpecial(special);
      setIndBonus(0);

      const gross = basic + hra + special;
      setIndPf(emp.employmentType === 'INTERN' ? 0 : 1800);
      setIndPt(gross > 15000 ? 200 : 0);
      setIndTds(gross > 100000 ? Math.round(gross * 0.1) : (gross > 50000 ? Math.round(gross * 0.05) : 0));
      setIndOther(0);
      setIndWorkingDays(22);
      setIndPaidDays(22);
      setIndLopDays(0);
      setIndStatus('UNPAID');
    }
  };

  // Open Fix/Edit Modal
  const handleStartEdit = (slip: PayslipItem) => {
    setEditingSlip(slip);
    setEditBasic(slip.basicSalary);
    setEditHra(slip.hra);
    setEditSpecial(slip.specialAllowance);
    setEditBonus(slip.bonus || 0);
    setEditPf(slip.providentFund);
    setEditPt(slip.professionalTax);
    setEditTds(slip.tdsTax);
    setEditOther(slip.otherDeductions || 0);
    setEditWorkingDays(slip.workingDays || 22);
    setEditPaidDays(slip.paidDays || 22);
    setEditLopDays(slip.lossOfPayDays || 0);
    setEditStatus(slip.paymentStatus);
  };

  // Save Fix/Edit Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlip || !currentUser) return;

    try {
      const updated = db.updatePayslip(
        editingSlip.id,
        {
          basicSalary: editBasic,
          hra: editHra,
          specialAllowance: editSpecial,
          bonus: editBonus,
          providentFund: editPf,
          professionalTax: editPt,
          tdsTax: editTds,
          otherDeductions: editOther,
          workingDays: editWorkingDays,
          paidDays: editPaidDays,
          lossOfPayDays: editLopDays,
          paymentStatus: editStatus,
        },
        { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
      );

      refreshData();
      if (selectedPayslip?.id === updated.id) {
        setSelectedPayslip(updated);
      }
      setEditingSlip(null);
      alert(`Payslip ${updated.payslipNumber} for ${updated.employeeName} updated successfully!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Save Individual Custom Payslip
  const handleSaveIndividualPayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) {
      alert('Please select an employee.');
      return;
    }

    try {
      const gross = indBasic + indHra + indSpecial + indBonus;
      const deductions = indPf + indPt + indTds + indOther;
      const net = gross - deductions;

      const created = db.createCustomPayslip(
        {
          payrollId: `custom-${indYear}-${indMonth.toString().padStart(2, '0')}`,
          payslipNumber: `DRS/PAY/${indYear}/${indMonth.toString().padStart(2, '0')}/${(payslips.length + 1).toString().padStart(3, '0')}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          designation: emp.designation,
          department: emp.department,
          month: indMonth,
          year: indYear,
          workingDays: indWorkingDays,
          paidDays: indPaidDays,
          lossOfPayDays: indLopDays,
          basicSalary: indBasic,
          hra: indHra,
          specialAllowance: indSpecial,
          bonus: indBonus,
          providentFund: indPf,
          professionalTax: indPt,
          tdsTax: indTds,
          otherDeductions: indOther,
          paymentStatus: indStatus,
          bankName: emp.financialDetails?.bankName || 'HDFC Bank',
          accountNumberMasked: emp.financialDetails?.accountNumberMasked || '•••• •••• 0000',
        },
        { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
      );

      refreshData();
      setIsCreateIndividualOpen(false);
      setSelectedPayslip(created);
      alert(`Custom payslip generated for ${emp.fullName}!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Batch Cycle Draft
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
      alert(`Payroll cycle for ${selectedMonth}/${selectedYear} compiled! Submitted for Founder approval.`);
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

  const handleDeleteSlip = (slip: PayslipItem) => {
    if (!currentUser) return;
    if (confirm(`Are you sure you want to delete payslip ${slip.payslipNumber} for ${slip.employeeName}?`)) {
      db.deletePayslip(slip.id, { id: currentUser.id, name: currentUser.fullName, role: currentUser.role });
      refreshData();
      if (selectedPayslip?.id === slip.id) setSelectedPayslip(null);
    }
  };

  // Export Payslip PDF
  const handleExportPDF = async () => {
    if (!payslipSheetRef.current || !selectedPayslip) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(payslipSheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DRS_Payslip_${selectedPayslip.payslipNumber.replace(/[\/\\]/g, '_')}_${selectedPayslip.employeeName.replace(/\s+/g, '_')}.pdf`);
    } catch {
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Send Payslip via Zoho Mail
  const handleSendPayslipEmail = async () => {
    if (!emailModalSlip || !emailTo.trim()) return;
    setEmailSending(true);
    setEmailResult(null);

    try {
      let pdfBase64: string | undefined = undefined;
      let pdfFilename: string | undefined = undefined;

      if (payslipSheetRef.current) {
        const canvas = await html2canvas(payslipSheetRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdfBase64 = pdf.output('datauristring').split(',')[1];
        pdfFilename = `Payslip_${emailModalSlip.payslipNumber.replace(/[\/\\]/g, '_')}.pdf`;
      }

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo.trim(),
          cc: emailCc.trim() || undefined,
          subject: `Official Salary Slip - ${monthNames[emailModalSlip.month - 1]} ${emailModalSlip.year} [${emailModalSlip.payslipNumber}]`,
          documentTitle: `Salary Slip - ${monthNames[emailModalSlip.month - 1]} ${emailModalSlip.year}`,
          documentNumber: emailModalSlip.payslipNumber,
          employeeName: emailModalSlip.employeeName,
          senderEmail: settings.smtpEmail || settings.officialEmail,
          senderPassword: settings.smtpPassword || '',
          senderName: settings.authorizedSignatoryName || 'HR Operations',
          companyName: settings.companyName,
          smtpHost: settings.smtpHost || 'smtp.zoho.in',
          smtpPort: settings.smtpPort || 465,
          pdfBase64,
          pdfFilename,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailResult({ success: true, message: `Payslip emailed successfully to ${emailTo}` });
      } else {
        setEmailResult({ success: false, message: data.error || 'Failed to dispatch email' });
      }
    } catch (err: any) {
      setEmailResult({ success: false, message: err.message || 'Network dispatch failure' });
    } finally {
      setEmailSending(false);
    }
  };

  const userPayslips = isEmployeeOnly && currentUser
    ? payslips.filter((p) => p.employeeId === currentUser.id)
    : payslips;

  // Live calculation helpers for edit modal
  const editGross = editBasic + editHra + editSpecial + editBonus;
  const editDeductions = editPf + editPt + editTds + editOther;
  const editNet = editGross - editDeductions;

  // Live calculation helpers for individual creator modal
  const indGross = indBasic + indHra + indSpecial + indBonus;
  const indDeductions = indPf + indPt + indTds + indOther;
  const indNet = indGross - indDeductions;

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
              : 'Calculate monthly compensations, fine-tune individual earnings & deductions, and generate official payslips.'}
          </p>
        </div>

        {isHR && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (employees.length > 0) handleSelectIndividualEmp(employees[0].id);
                setIsCreateIndividualOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-black dark:bg-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm transition-all"
            >
              <UserCheck className="w-4 h-4" />
              + Create Individual Payslip
            </button>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Process Monthly Payroll
            </button>
          </div>
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
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border-neutral-400'
                          : isApproved
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border-neutral-400'
                          : 'bg-neutral-200 text-neutral-700 border-neutral-400'
                      }`}
                    >
                      {cycle.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500">Gross Payout</span>
                      <p className="font-bold text-black dark:text-white">
                        ₹{cycle.totalGrossPayout.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500">Deductions</span>
                      <p className="font-bold text-neutral-600 dark:text-neutral-400">
                        ₹{cycle.totalDeductions.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500">Net Take-Home</span>
                      <p className="font-bold text-black dark:text-white">
                        ₹{cycle.totalNetPayout.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {isFounder && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {isDraft && (
                        <button
                          onClick={() => handleFounderApprove(cycle.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                        >
                          Approve Cycle (Founder)
                        </button>
                      )}
                      {isApproved && (
                        <button
                          onClick={() => handleFounderMarkPaid(cycle.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                        >
                          Mark Disbursed & Paid
                        </button>
                      )}
                    </div>
                  )}
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
          <span className="text-xs text-neutral-500 font-mono">
            {userPayslips.length} payslips on file
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
                  <th className="py-3.5 px-4">Status</th>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPayslip(slip)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 transition-colors"
                        >
                          View
                        </button>
                        {isHR && (
                          <button
                            onClick={() => handleStartEdit(slip)}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Fix / Edit
                          </button>
                        )}
                        {isHR && (
                          <button
                            onClick={() => handleDeleteSlip(slip)}
                            title="Delete payslip"
                            className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FIX / EDIT INDIVIDUAL PAYSLIP ENTRY                              */}
      {/* ========================================================================= */}
      {editingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  {editingSlip.payslipNumber}
                </span>
                <h3 className="text-lg font-black text-black dark:text-white mt-0.5">
                  Fix / Edit Payslip Entries — {editingSlip.employeeName}
                </h3>
                <p className="text-xs text-neutral-500">
                  {editingSlip.designation} • {monthNames[editingSlip.month - 1]} {editingSlip.year}
                </p>
              </div>
              <button
                onClick={() => setEditingSlip(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5 text-xs">
              {/* Working Days & Attendance */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  1. Attendance & Days Calculation
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Total Working Days
                    </label>
                    <input
                      type="number"
                      value={editWorkingDays}
                      onChange={(e) => setEditWorkingDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Paid Days
                    </label>
                    <input
                      type="number"
                      value={editPaidDays}
                      onChange={(e) => setEditPaidDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Loss of Pay (LOP) Days
                    </label>
                    <input
                      type="number"
                      value={editLopDays}
                      onChange={(e) => setEditLopDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                      2. Earnings (INR)
                    </h4>
                    <span className="text-xs font-mono font-bold text-black dark:text-white">
                      Gross: ₹{editGross.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        Basic Salary *
                      </label>
                      <input
                        type="number"
                        required
                        value={editBasic}
                        onChange={(e) => setEditBasic(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        House Rent Allowance (HRA)
                      </label>
                      <input
                        type="number"
                        value={editHra}
                        onChange={(e) => setEditHra(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        Special Allowance
                      </label>
                      <input
                        type="number"
                        value={editSpecial}
                        onChange={(e) => setEditSpecial(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        Performance Bonus / Incentive
                      </label>
                      <input
                        type="number"
                        value={editBonus}
                        onChange={(e) => setEditBonus(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                      3. Deductions (INR)
                    </h4>
                    <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                      Total: -₹{editDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        Provident Fund (PF)
                      </label>
                      <input
                        type="number"
                        value={editPf}
                        onChange={(e) => setEditPf(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        Professional Tax (PT)
                      </label>
                      <input
                        type="number"
                        value={editPt}
                        onChange={(e) => setEditPt(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        TDS (Income Tax)
                      </label>
                      <input
                        type="number"
                        value={editTds}
                        onChange={(e) => setEditTds(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                        Other Deductions / LOP
                      </label>
                      <input
                        type="number"
                        value={editOther}
                        onChange={(e) => setEditOther(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Summary Banner */}
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase font-bold text-black dark:text-white">
                    Recalculated Net Take-Home Salary
                  </p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">
                    {numberToIndianWords(editNet)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Status</span>
                    <select
                      value={editStatus}
                      onChange={(e: any) => setEditStatus(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PROCESSED">PROCESSED</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                  <p className="text-2xl font-black text-black dark:text-white font-mono">
                    ₹{editNet.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingSlip(null)}
                  className="px-4 py-2 rounded-lg font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm"
                >
                  Save & Recalculate Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GENERATE INDIVIDUAL CUSTOM PAYSLIP                               */}
      {/* ========================================================================= */}
      {isCreateIndividualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-black dark:text-white" />
                  Generate Individual Custom Payslip
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select an employee and adjust exact earnings, bonuses, or deductions specifically for their payslip.
                </p>
              </div>
              <button
                onClick={() => setIsCreateIndividualOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIndividualPayslip} className="space-y-4 text-xs">
              {/* Employee & Month Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Select Employee *
                  </label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={(e) => handleSelectIndividualEmp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.employeeId}) — {e.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Salary Month *
                  </label>
                  <select
                    value={indMonth}
                    onChange={(e) => setIndMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={indYear}
                    onChange={(e) => setIndYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Working Days */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    Working Days
                  </label>
                  <input
                    type="number"
                    value={indWorkingDays}
                    onChange={(e) => setIndWorkingDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    Paid Days
                  </label>
                  <input
                    type="number"
                    value={indPaidDays}
                    onChange={(e) => setIndPaidDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                    Loss of Pay (LOP) Days
                  </label>
                  <input
                    type="number"
                    value={indLopDays}
                    onChange={(e) => setIndLopDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                  />
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                      Earnings (INR)
                    </h4>
                    <span className="text-xs font-mono font-bold text-black dark:text-white">
                      Gross: ₹{indGross.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Basic Salary *</label>
                    <input
                      type="number"
                      required
                      value={indBasic}
                      onChange={(e) => setIndBasic(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">House Rent Allowance (HRA)</label>
                    <input
                      type="number"
                      value={indHra}
                      onChange={(e) => setIndHra(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Special Allowance</label>
                    <input
                      type="number"
                      value={indSpecial}
                      onChange={(e) => setIndSpecial(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Performance Bonus / Incentive</label>
                    <input
                      type="number"
                      value={indBonus}
                      onChange={(e) => setIndBonus(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                      Deductions (INR)
                    </h4>
                    <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                      Total: -₹{indDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Provident Fund (PF)</label>
                    <input
                      type="number"
                      value={indPf}
                      onChange={(e) => setIndPf(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Professional Tax (PT)</label>
                    <input
                      type="number"
                      value={indPt}
                      onChange={(e) => setIndPt(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">TDS (Income Tax)</label>
                    <input
                      type="number"
                      value={indTds}
                      onChange={(e) => setIndTds(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 mb-1">Other Deductions / LOP</label>
                    <input
                      type="number"
                      value={indOther}
                      onChange={(e) => setIndOther(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Net Payout Summary Banner */}
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase font-bold text-black dark:text-white">
                    Calculated Net Take-Home Salary
                  </p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">
                    {numberToIndianWords(indNet)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Status</span>
                    <select
                      value={indStatus}
                      onChange={(e: any) => setIndStatus(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PROCESSED">PROCESSED</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                  <p className="text-2xl font-black text-black dark:text-white font-mono">
                    ₹{indNet.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateIndividualOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm"
                >
                  Generate & Issue Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BATCH PAYROLL WIZARD                                             */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* MODAL 4: OFFICIAL PAYSLIP SHEET PREVIEW (PRINT & PDF & EMAIL)             */}
      {/* ========================================================================= */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white text-black border border-neutral-300 rounded-none shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Action Bar at Top */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                Official DRS Salary Slip
              </span>
              <div className="flex items-center gap-2">
                {isHR && (
                  <button
                    onClick={() => {
                      const slip = selectedPayslip;
                      setSelectedPayslip(null);
                      handleStartEdit(slip);
                    }}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Fix / Edit Entries
                  </button>
                )}
                <button
                  onClick={() => {
                    setEmailModalSlip(selectedPayslip);
                    const emp = employees.find((e) => e.id === selectedPayslip.employeeId);
                    if (emp) setEmailTo(emp.email);
                    setEmailResult(null);
                  }}
                  className="px-3 py-1.5 rounded text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Share via Email
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-3 py-1.5 rounded text-xs font-bold bg-black text-white hover:opacity-90 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded text-neutral-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PAYSLIP PRINT CANVAS */}
            <div ref={payslipSheetRef} className="space-y-6 bg-white p-2">
              {/* Header with DRS Logo and Pune Address */}
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
                      {settings.address || 'World Trade Center, Kharadi, Pune, Maharashtra - 411014'}
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
                    {selectedPayslip.otherDeductions > 0 && (
                      <div className="flex justify-between">
                        <span>Other Deductions / LOP</span>
                        <span className="font-semibold">₹{selectedPayslip.otherDeductions.toLocaleString('en-IN')}</span>
                      </div>
                    )}
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
                    src={settings.authorizedSignatorySignatureUrl || '/assets/drs-signature.png'}
                    alt="Authorized Signature"
                    className="h-10 w-auto object-contain mb-1"
                  />
                  <div className="w-32 border-b border-black mb-1" />
                  <p className="text-xs font-bold text-black">{settings.authorizedSignatoryName || 'Maroti Kadam'}</p>
                  <p className="text-[10px] text-neutral-600">{settings.authorizedSignatoryTitle || 'Head of Human Resources & Operations'}</p>
                  <p className="text-[9px] text-neutral-500">{settings.founderName || 'Devesh Ambekar'} (Founder & CEO)</p>
                </div>

                <div className="w-20 h-20">
                  <img
                    src={settings.sealUrl || '/assets/drs-stamp.png'}
                    alt="Official DRS Stamp"
                    className="w-full h-full object-contain filter contrast-125 opacity-90 rotate-[-4deg]"
                  />
                </div>

                <div className="text-right text-[10px] text-neutral-500 font-mono">
                  <p>Deep Root Studios Private Limited</p>
                  <p>CIN: {settings.cinNumber}</p>
                  <p>System Generated & Audited</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SHARE PAYSLIP VIA ZOHO MAIL                                      */}
      {/* ========================================================================= */}
      {emailModalSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Payslip via Zoho Mail
              </h3>
              <button
                onClick={() => setEmailModalSlip(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {(!settings.smtpEmail || !settings.smtpPassword) && (
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-700 dark:text-yellow-400">
                <p className="font-bold">Zoho Mail credentials missing</p>
                <p className="mt-0.5">Please add your company Zoho email & app password in <strong>Settings</strong>.</p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
              <p className="font-bold text-black dark:text-white">{emailModalSlip.employeeName}</p>
              <p className="text-neutral-500 font-mono mt-0.5">{emailModalSlip.payslipNumber}</p>
              <p className="text-neutral-500 mt-0.5">
                Period: {monthNames[emailModalSlip.month - 1]} {emailModalSlip.year} • Net: ₹{emailModalSlip.netSalary.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Recipient Employee Email *
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="employee@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  CC (optional)
                </label>
                <input
                  type="email"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  placeholder="hr@deeprootstudios.ai"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white"
                />
              </div>
            </div>

            {emailResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  emailResult.success
                    ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                }`}
              >
                {emailResult.success ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{emailResult.message}</span>
              </div>
            )}

            <button
              onClick={handleSendPayslipEmail}
              disabled={emailSending || !emailTo.trim() || !settings.smtpEmail || !settings.smtpPassword}
              className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
            >
              {emailSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Payslip via Zoho Mail...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Payslip with PDF Attached
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
