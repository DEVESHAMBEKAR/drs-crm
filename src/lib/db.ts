'use client';

import {
  CompanySettings,
  EmployeeProfile,
  DocumentTemplate,
  DocumentRecord,
  AttendanceRecord,
  LeaveBalance,
  LeaveApplication,
  PayrollRecord,
  PayslipItem,
  AuditLog,
  Announcement,
  UserRole,
} from '@/types';

import {
  initialCompanySettings,
  initialEmployees,
  initialDocumentTemplates,
  initialDocuments,
  initialAttendance,
  initialLeaveBalances,
  initialLeaveApplications,
  initialPayrollCycles,
  initialPayslips,
  initialAuditLogs,
  initialAnnouncements,
} from './mockData';

// Storage keys
const KEYS = {
  SETTINGS: 'drs_company_settings',
  EMPLOYEES: 'drs_employees',
  TEMPLATES: 'drs_templates',
  DOCUMENTS: 'drs_documents',
  ATTENDANCE: 'drs_attendance',
  LEAVE_BALANCES: 'drs_leave_balances',
  LEAVE_APPS: 'drs_leave_applications',
  PAYROLL: 'drs_payroll_cycles',
  PAYSLIPS: 'drs_payslips',
  AUDIT: 'drs_audit_logs',
  ANNOUNCEMENTS: 'drs_announcements',
  CURRENT_USER_ID: 'drs_current_user_id',
};

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error setting localStorage for key ${key}:`, e);
  }
}

export const db = {
  // Company Settings
  getCompanySettings: (): CompanySettings => {
    const settings = getStorage<CompanySettings>(KEYS.SETTINGS, initialCompanySettings);
    let changed = false;
    if (settings.address && settings.address.includes('Orion Tech Park')) {
      settings.address = 'World Trade Center, Kharadi, Pune, Maharashtra - 411014';
      changed = true;
    }
    if (!settings.officialEmail || settings.officialEmail.includes('operations@') || settings.officialEmail.includes('.ai')) {
      settings.officialEmail = 'founders@deeprootstudios.in';
      changed = true;
    }
    if (!settings.hrEmail || settings.hrEmail.includes('maroti.kadam') || settings.hrEmail.includes('.ai')) {
      settings.hrEmail = 'hr@deeprootstudios.in';
      changed = true;
    }
    if (!settings.phone || settings.phone.includes('4567-8900')) {
      settings.phone = '+91 9579276597';
      changed = true;
    }
    if (!settings.website || settings.website.includes('.ai')) {
      settings.website = 'https://deeprootstudios.in';
      changed = true;
    }
    if (changed) {
      setStorage(KEYS.SETTINGS, settings);
    }
    return settings;
  },
  updateCompanySettings: (settings: Partial<CompanySettings>, actor: { id: string; name: string; role: UserRole }): CompanySettings => {
    const current = db.getCompanySettings();
    const updated = { ...current, ...settings };
    setStorage(KEYS.SETTINGS, updated);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UPDATE_COMPANY_SETTINGS',
      entityType: 'COMPANY_SETTINGS',
      entityId: 'global',
      details: `Updated company configuration: ${Object.keys(settings).join(', ')}`,
    });
    return updated;
  },

  // Employees
  getEmployees: (): EmployeeProfile[] => {
    const list = getStorage<EmployeeProfile[]>(KEYS.EMPLOYEES, initialEmployees);
    let changed = false;
    list.forEach((e) => {
      if (e.id === 'emp-001' && (e.email.includes('.ai') || e.email.includes('devesh.ambekar'))) {
        e.email = 'founders@deeprootstudios.in';
        changed = true;
      }
      if (e.id === 'emp-002' && (e.email.includes('.ai') || e.email.includes('maroti.kadam'))) {
        e.email = 'hr@deeprootstudios.in';
        changed = true;
      }
    });
    if (changed) {
      setStorage(KEYS.EMPLOYEES, list);
    }
    return list;
  },
  getEmployeeById: (id: string): EmployeeProfile | undefined => {
    return db.getEmployees().find((e) => e.id === id || e.employeeId === id);
  },
  createEmployee: (emp: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>, actor: { id: string; name: string; role: UserRole }): EmployeeProfile => {
    const employees = db.getEmployees();
    const newEmp: EmployeeProfile = {
      ...emp,
      id: `emp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    employees.push(newEmp);
    setStorage(KEYS.EMPLOYEES, employees);

    // Initialize leave balance for new employee
    const balances = db.getLeaveBalances();
    balances.push({
      employeeId: newEmp.id,
      year: new Date().getFullYear(),
      casualTotal: emp.employmentType === 'INTERN' ? 6 : 12,
      casualUsed: 0,
      sickTotal: emp.employmentType === 'INTERN' ? 4 : 8,
      sickUsed: 0,
      earnedTotal: emp.employmentType === 'INTERN' ? 0 : 15,
      earnedUsed: 0,
      unpaidTaken: 0,
    });
    setStorage(KEYS.LEAVE_BALANCES, balances);

    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'CREATE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: newEmp.id,
      details: `Registered new employee ${newEmp.fullName} (${newEmp.employeeId}) in ${newEmp.department}`,
    });
    return newEmp;
  },
  updateEmployee: (id: string, updates: Partial<EmployeeProfile>, actor: { id: string; name: string; role: UserRole }): EmployeeProfile => {
    const employees = db.getEmployees();
    const idx = employees.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    employees[idx] = {
      ...employees[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setStorage(KEYS.EMPLOYEES, employees);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: id,
      details: `Updated details for ${employees[idx].fullName}: ${Object.keys(updates).join(', ')}`,
    });
    return employees[idx];
  },
  deleteEmployee: (id: string, actor: { id: string; name: string; role: UserRole }): void => {
    let employees = db.getEmployees();
    const emp = employees.find((e) => e.id === id);
    employees = employees.filter((e) => e.id !== id);
    setStorage(KEYS.EMPLOYEES, employees);
    if (emp) {
      db.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'DELETE_EMPLOYEE',
        entityType: 'EMPLOYEE',
        entityId: id,
        details: `Deactivated and removed employee record: ${emp.fullName} (${emp.employeeId})`,
      });
    }
  },

  // Document Templates
  getTemplates: (): DocumentTemplate[] => {
    const stored = getStorage<DocumentTemplate[]>(KEYS.TEMPLATES, initialDocumentTemplates);
    const missing = initialDocumentTemplates.filter((t) => !stored.some((s) => s.id === t.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      setStorage(KEYS.TEMPLATES, merged);
      return merged;
    }
    return stored;
  },
  getTemplateById: (id: string): DocumentTemplate | undefined => {
    return db.getTemplates().find((t) => t.id === id || t.type === id);
  },
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>, actor: { id: string; name: string; role: UserRole }): DocumentTemplate => {
    const templates = db.getTemplates();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    templates[idx] = { ...templates[idx], ...updates, updatedAt: new Date().toISOString() };
    setStorage(KEYS.TEMPLATES, templates);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UPDATE_TEMPLATE',
      entityType: 'DOCUMENT_TEMPLATE',
      entityId: id,
      details: `Updated template: ${templates[idx].title}`,
    });
    return templates[idx];
  },

  // Documents
  getDocuments: (): DocumentRecord[] => {
    return getStorage<DocumentRecord[]>(KEYS.DOCUMENTS, initialDocuments);
  },
  getDocumentById: (id: string): DocumentRecord | undefined => {
    return db.getDocuments().find((d) => d.id === id || d.documentNumber === id || d.verificationToken === id);
  },
  createDocument: (doc: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt' | 'verificationToken'>, actor: { id: string; name: string; role: UserRole }): DocumentRecord => {
    const docs = db.getDocuments();
    const token = `v-drs-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(36).slice(-4)}`;
    const newDoc: DocumentRecord = {
      ...doc,
      id: `doc-${Date.now().toString(36)}`,
      verificationToken: token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docs.unshift(newDoc);
    setStorage(KEYS.DOCUMENTS, docs);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: doc.status === 'APPROVED' || doc.status === 'ISSUED' ? 'OFFICIAL_DOCUMENT_ISSUED' : 'DOCUMENT_DRAFT_CREATED',
      entityType: 'DOCUMENT',
      entityId: newDoc.id,
      details: `Document ${newDoc.documentNumber} (${newDoc.type}) created for ${newDoc.employeeName}. Status: ${newDoc.status}`,
    });
    return newDoc;
  },
  updateDocumentStatus: (
    id: string,
    status: DocumentRecord['status'],
    actor: { id: string; name: string; role: UserRole },
    options?: { revocationReason?: string }
  ): DocumentRecord => {
    const docs = db.getDocuments();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Document not found');

    const prevStatus = docs[idx].status;
    docs[idx].status = status;
    docs[idx].updatedAt = new Date().toISOString();

    if (status === 'APPROVED' || status === 'ISSUED') {
      docs[idx].approvedBy = actor.name;
      docs[idx].approvedAt = new Date().toISOString();
    } else if (status === 'REVOKED') {
      docs[idx].revokedAt = new Date().toISOString();
      docs[idx].revocationReason = options?.revocationReason || 'Revoked by authorized administrator.';
    }

    setStorage(KEYS.DOCUMENTS, docs);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: `DOCUMENT_${status}`,
      entityType: 'DOCUMENT',
      entityId: id,
      details: `Changed document ${docs[idx].documentNumber} status from ${prevStatus} to ${status}`,
    });
    return docs[idx];
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => {
    return getStorage<AttendanceRecord[]>(KEYS.ATTENDANCE, initialAttendance);
  },
  recordCheckIn: (employeeId: string, employeeName: string, workMode: AttendanceRecord['workMode']): AttendanceRecord => {
    const records = db.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const existingIdx = records.findIndex((r) => r.employeeId === employeeId && r.date === today);
    if (existingIdx !== -1) {
      records[existingIdx].workMode = workMode;
      records[existingIdx].checkIn = records[existingIdx].checkIn || nowTime;
      setStorage(KEYS.ATTENDANCE, records);
      return records[existingIdx];
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now().toString(36)}`,
      employeeId,
      employeeName,
      date: today,
      checkIn: nowTime,
      workMode,
      status: 'PRESENT',
    };
    records.unshift(newRecord);
    setStorage(KEYS.ATTENDANCE, records);
    return newRecord;
  },
  recordCheckOut: (employeeId: string): AttendanceRecord => {
    const records = db.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const existingIdx = records.findIndex((r) => r.employeeId === employeeId && r.date === today);
    if (existingIdx === -1) throw new Error('No check-in found for today');

    records[existingIdx].checkOut = nowTime;
    // Calculate working hours if checkIn exists
    if (records[existingIdx].checkIn) {
      const [inH, inM] = records[existingIdx].checkIn!.split(':').map(Number);
      const [outH, outM] = nowTime.split(':').map(Number);
      const totalHours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
      records[existingIdx].workingHours = Math.max(0, Math.round(totalHours * 100) / 100);
    }
    setStorage(KEYS.ATTENDANCE, records);
    return records[existingIdx];
  },

  // Leaves
  getLeaveBalances: (): LeaveBalance[] => {
    return getStorage<LeaveBalance[]>(KEYS.LEAVE_BALANCES, initialLeaveBalances);
  },
  getLeaveBalanceForEmployee: (employeeId: string, year: number = new Date().getFullYear()): LeaveBalance => {
    const balances = db.getLeaveBalances();
    const found = balances.find((b) => b.employeeId === employeeId && b.year === year);
    if (found) return found;
    const defaultBal: LeaveBalance = {
      employeeId,
      year,
      casualTotal: 12,
      casualUsed: 0,
      sickTotal: 8,
      sickUsed: 0,
      earnedTotal: 15,
      earnedUsed: 0,
      unpaidTaken: 0,
    };
    balances.push(defaultBal);
    setStorage(KEYS.LEAVE_BALANCES, balances);
    return defaultBal;
  },
  getLeaveApplications: (): LeaveApplication[] => {
    return getStorage<LeaveApplication[]>(KEYS.LEAVE_APPS, initialLeaveApplications);
  },
  applyLeave: (app: Omit<LeaveApplication, 'id' | 'status' | 'appliedOn'>): LeaveApplication => {
    const apps = db.getLeaveApplications();
    const newApp: LeaveApplication = {
      ...app,
      id: `leave-${Date.now().toString(36)}`,
      status: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    apps.unshift(newApp);
    setStorage(KEYS.LEAVE_APPS, apps);
    return newApp;
  },
  reviewLeave: (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    actor: { id: string; name: string; role: UserRole },
    remarks?: string
  ): LeaveApplication => {
    const apps = db.getLeaveApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Leave application not found');

    const app = apps[idx];
    app.status = status;
    app.reviewedBy = actor.name;
    app.reviewRemarks = remarks || '';
    app.reviewedAt = new Date().toISOString();

    if (status === 'APPROVED') {
      // Deduct from balance
      const balances = db.getLeaveBalances();
      const balIdx = balances.findIndex((b) => b.employeeId === app.employeeId && b.year === new Date().getFullYear());
      if (balIdx !== -1) {
        if (app.leaveType === 'CASUAL') balances[balIdx].casualUsed += app.totalDays;
        else if (app.leaveType === 'SICK') balances[balIdx].sickUsed += app.totalDays;
        else if (app.leaveType === 'EARNED') balances[balIdx].earnedUsed += app.totalDays;
        else if (app.leaveType === 'UNPAID') balances[balIdx].unpaidTaken += app.totalDays;
        setStorage(KEYS.LEAVE_BALANCES, balances);
      }
    }

    setStorage(KEYS.LEAVE_APPS, apps);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: `LEAVE_${status}`,
      entityType: 'LEAVE_APPLICATION',
      entityId: id,
      details: `${status} leave application of ${app.totalDays} days for ${app.employeeName}. Remarks: ${remarks || 'None'}`,
    });
    return app;
  },

  // Payroll
  getPayrollCycles: (): PayrollRecord[] => {
    return getStorage<PayrollRecord[]>(KEYS.PAYROLL, initialPayrollCycles);
  },
  getPayslips: (): PayslipItem[] => {
    return getStorage<PayslipItem[]>(KEYS.PAYSLIPS, initialPayslips);
  },
  createPayrollCycle: (month: number, year: number, actor: { id: string; name: string; role: UserRole }): PayrollRecord => {
    const cycles = db.getPayrollCycles();
    const employees = db.getEmployees().filter((e) => e.employmentStatus === 'ACTIVE' || e.employmentStatus === 'ON_PROBATION');

    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    const payslips = db.getPayslips();
    const cycleId = `pay-${year}-${month.toString().padStart(2, '0')}`;

    // Remove existing if any
    const existingIdx = cycles.findIndex((c) => c.month === month && c.year === year);
    if (existingIdx !== -1 && cycles[existingIdx].status === 'PAID') {
      throw new Error('This payroll cycle has already been disbursed and marked PAID.');
    }

    const newPayslips: PayslipItem[] = [];

    employees.forEach((emp, index) => {
      const basic = emp.financialDetails?.monthlyBasic || 25000;
      const hra = emp.financialDetails?.monthlyHRA || 10000;
      const special = emp.financialDetails?.monthlySpecialAllowance || 10000;
      const gross = basic + hra + special;

      // Deductions
      const pf = emp.employmentType === 'INTERN' ? 0 : 1800;
      const pt = gross > 15000 ? 200 : 0;
      const tds = gross > 100000 ? Math.round(gross * 0.1) : (gross > 50000 ? Math.round(gross * 0.05) : 0);
      const deductions = pf + pt + tds;
      const net = gross - deductions;

      totalGross += gross;
      totalDeductions += deductions;
      totalNet += net;

      newPayslips.push({
        id: `slip-${cycleId}-${emp.id}`,
        payrollId: cycleId,
        payslipNumber: `DRS/PAY/${year}/${month.toString().padStart(2, '0')}/${(index + 1).toString().padStart(3, '0')}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        month,
        year,
        workingDays: 22,
        paidDays: 22,
        lossOfPayDays: 0,
        basicSalary: basic,
        hra,
        specialAllowance: special,
        bonus: 0,
        grossEarnings: gross,
        providentFund: pf,
        professionalTax: pt,
        tdsTax: tds,
        otherDeductions: 0,
        totalDeductions: deductions,
        netSalary: net,
        netSalaryInWords: `${net.toLocaleString('en-IN')} Rupees Only`,
        paymentStatus: 'UNPAID',
        bankName: emp.financialDetails?.bankName || 'HDFC Bank',
        accountNumberMasked: emp.financialDetails?.accountNumberMasked || '•••• •••• 0000',
      });
    });

    const newCycle: PayrollRecord = {
      id: cycleId,
      month,
      year,
      totalEmployees: employees.length,
      totalGrossPayout: totalGross,
      totalDeductions,
      totalNetPayout: totalNet,
      status: 'DRAFT',
      preparedBy: actor.name,
      preparedAt: new Date().toISOString(),
      payslipsCount: employees.length,
    };

    if (existingIdx !== -1) {
      cycles[existingIdx] = newCycle;
    } else {
      cycles.unshift(newCycle);
    }
    setStorage(KEYS.PAYROLL, cycles);

    // Save generated payslips
    const remainingPayslips = payslips.filter((p) => p.payrollId !== cycleId);
    setStorage(KEYS.PAYSLIPS, [...newPayslips, ...remainingPayslips]);

    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PAYROLL_DRAFT_PREPARED',
      entityType: 'PAYROLL',
      entityId: cycleId,
      details: `Prepared payroll draft for ${month}/${year} with ${employees.length} employees. Total Net: INR ${totalNet.toLocaleString('en-IN')}`,
    });

    return newCycle;
  },
  updatePayrollStatus: (
    cycleId: string,
    status: PayrollRecord['status'],
    actor: { id: string; name: string; role: UserRole },
    paymentRef?: string
  ): PayrollRecord => {
    const cycles = db.getPayrollCycles();
    const idx = cycles.findIndex((c) => c.id === cycleId);
    if (idx === -1) throw new Error('Payroll cycle not found');

    cycles[idx].status = status;
    if (status === 'APPROVED') {
      cycles[idx].approvedBy = actor.name;
      cycles[idx].approvedAt = new Date().toISOString();
    } else if (status === 'PAID') {
      cycles[idx].paymentDate = new Date().toISOString().split('T')[0];
      cycles[idx].paymentReference = paymentRef || `NEFT-DRS-${Date.now().toString().slice(-8)}`;

      // Update related payslips to PAID
      const payslips = db.getPayslips();
      payslips.forEach((p) => {
        if (p.payrollId === cycleId) {
          p.paymentStatus = 'PAID';
          p.paymentDate = cycles[idx].paymentDate;
        }
      });
      setStorage(KEYS.PAYSLIPS, payslips);
    }

    setStorage(KEYS.PAYROLL, cycles);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: `PAYROLL_${status}`,
      entityType: 'PAYROLL',
      entityId: cycleId,
      details: `Updated payroll cycle ${cycles[idx].month}/${cycles[idx].year} to status: ${status}`,
    });
    return cycles[idx];
  },

  updatePayslip: (
    id: string,
    updates: Partial<PayslipItem>,
    actor: { id: string; name: string; role: UserRole }
  ): PayslipItem => {
    const payslips = db.getPayslips();
    const idx = payslips.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Payslip not found');

    const current = payslips[idx];
    const basic = updates.basicSalary !== undefined ? Number(updates.basicSalary) : current.basicSalary;
    const hra = updates.hra !== undefined ? Number(updates.hra) : current.hra;
    const special = updates.specialAllowance !== undefined ? Number(updates.specialAllowance) : current.specialAllowance;
    const bonus = updates.bonus !== undefined ? Number(updates.bonus) : current.bonus;
    const gross = basic + hra + special + bonus;

    const pf = updates.providentFund !== undefined ? Number(updates.providentFund) : current.providentFund;
    const pt = updates.professionalTax !== undefined ? Number(updates.professionalTax) : current.professionalTax;
    const tds = updates.tdsTax !== undefined ? Number(updates.tdsTax) : current.tdsTax;
    const other = updates.otherDeductions !== undefined ? Number(updates.otherDeductions) : current.otherDeductions;
    const deductions = pf + pt + tds + other;
    const net = gross - deductions;

    const updated: PayslipItem = {
      ...current,
      ...updates,
      basicSalary: basic,
      hra,
      specialAllowance: special,
      bonus,
      grossEarnings: gross,
      providentFund: pf,
      professionalTax: pt,
      tdsTax: tds,
      otherDeductions: other,
      totalDeductions: deductions,
      netSalary: net,
      netSalaryInWords: numberToIndianWords(net),
    };

    payslips[idx] = updated;
    setStorage(KEYS.PAYSLIPS, payslips);

    // Sync parent cycle totals if cycle exists
    if (updated.payrollId) {
      const cycles = db.getPayrollCycles();
      const cycleIdx = cycles.findIndex((c) => c.id === updated.payrollId);
      if (cycleIdx !== -1) {
        const cycleSlips = payslips.filter((p) => p.payrollId === updated.payrollId);
        cycles[cycleIdx].totalGrossPayout = cycleSlips.reduce((sum, s) => sum + s.grossEarnings, 0);
        cycles[cycleIdx].totalDeductions = cycleSlips.reduce((sum, s) => sum + s.totalDeductions, 0);
        cycles[cycleIdx].totalNetPayout = cycleSlips.reduce((sum, s) => sum + s.netSalary, 0);
        setStorage(KEYS.PAYROLL, cycles);
      }
    }

    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PAYSLIP_UPDATED',
      entityType: 'PAYSLIP',
      entityId: id,
      details: `Updated payslip ${updated.payslipNumber} for ${updated.employeeName}. Net: ₹${net.toLocaleString('en-IN')}`,
    });

    return updated;
  },

  createCustomPayslip: (
    data: Omit<PayslipItem, 'id' | 'grossEarnings' | 'totalDeductions' | 'netSalary' | 'netSalaryInWords'> & {
      grossEarnings?: number;
      totalDeductions?: number;
      netSalary?: number;
      netSalaryInWords?: string;
    },
    actor: { id: string; name: string; role: UserRole }
  ): PayslipItem => {
    const payslips = db.getPayslips();
    const basic = Number(data.basicSalary || 0);
    const hra = Number(data.hra || 0);
    const special = Number(data.specialAllowance || 0);
    const bonus = Number(data.bonus || 0);
    const gross = basic + hra + special + bonus;

    const pf = Number(data.providentFund || 0);
    const pt = Number(data.professionalTax || 0);
    const tds = Number(data.tdsTax || 0);
    const other = Number(data.otherDeductions || 0);
    const deductions = pf + pt + tds + other;
    const net = gross - deductions;

    const id = `slip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const payslipNumber = data.payslipNumber || `DRS/PAY/${data.year}/${data.month.toString().padStart(2, '0')}/${(payslips.length + 1).toString().padStart(3, '0')}`;

    const newSlip: PayslipItem = {
      ...data,
      id,
      payslipNumber,
      basicSalary: basic,
      hra,
      specialAllowance: special,
      bonus,
      grossEarnings: gross,
      providentFund: pf,
      professionalTax: pt,
      tdsTax: tds,
      otherDeductions: other,
      totalDeductions: deductions,
      netSalary: net,
      netSalaryInWords: numberToIndianWords(net),
      paymentStatus: data.paymentStatus || 'UNPAID',
    };

    payslips.unshift(newSlip);
    setStorage(KEYS.PAYSLIPS, payslips);

    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PAYSLIP_CREATED',
      entityType: 'PAYSLIP',
      entityId: id,
      details: `Generated individual custom payslip ${payslipNumber} for ${newSlip.employeeName}. Net: ₹${net.toLocaleString('en-IN')}`,
    });

    return newSlip;
  },

  deletePayslip: (
    id: string,
    actor: { id: string; name: string; role: UserRole }
  ): void => {
    const payslips = db.getPayslips();
    const target = payslips.find((p) => p.id === id);
    if (!target) return;

    const remaining = payslips.filter((p) => p.id !== id);
    setStorage(KEYS.PAYSLIPS, remaining);

    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PAYSLIP_DELETED',
      entityType: 'PAYSLIP',
      entityId: id,
      details: `Deleted payslip ${target.payslipNumber} for ${target.employeeName}`,
    });
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    return getStorage<AuditLog[]>(KEYS.AUDIT, initialAuditLogs);
  },
  logAudit: (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
    const logs = db.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 300 logs
    if (logs.length > 300) logs.pop();
    setStorage(KEYS.AUDIT, logs);
  },

  // Announcements
  getAnnouncements: (): Announcement[] => {
    return getStorage<Announcement[]>(KEYS.ANNOUNCEMENTS, initialAnnouncements);
  },
  createAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>, actor: { id: string; name: string; role: UserRole }): Announcement => {
    const anns = db.getAnnouncements();
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
    };
    anns.unshift(newAnn);
    setStorage(KEYS.ANNOUNCEMENTS, anns);
    db.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'CREATE_ANNOUNCEMENT',
      entityType: 'ANNOUNCEMENT',
      entityId: newAnn.id,
      details: `Published announcement: "${newAnn.title}"`,
    });
    return newAnn;
  },

  // Active Demo User Session
  getCurrentUserId: (): string => {
    return getStorage<string>(KEYS.CURRENT_USER_ID, 'emp-001'); // Default to Devesh Sharma (FOUNDER)
  },
  setCurrentUserId: (id: string): void => {
    setStorage(KEYS.CURRENT_USER_ID, id);
  },

  // Reset to Factory Default Data
  resetToDefaults: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    setStorage(KEYS.SETTINGS, initialCompanySettings);
    setStorage(KEYS.EMPLOYEES, initialEmployees);
    setStorage(KEYS.TEMPLATES, initialDocumentTemplates);
    setStorage(KEYS.DOCUMENTS, initialDocuments);
    setStorage(KEYS.ATTENDANCE, initialAttendance);
    setStorage(KEYS.LEAVE_BALANCES, initialLeaveBalances);
    setStorage(KEYS.LEAVE_APPS, initialLeaveApplications);
    setStorage(KEYS.PAYROLL, initialPayrollCycles);
    setStorage(KEYS.PAYSLIPS, initialPayslips);
    setStorage(KEYS.AUDIT, initialAuditLogs);
    setStorage(KEYS.ANNOUNCEMENTS, initialAnnouncements);
    setStorage(KEYS.CURRENT_USER_ID, 'emp-001');
  },
};

export function numberToIndianWords(num: number): string {
  if (!num || num <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanOneThousand(n: number): string {
    let s = '';
    if (n >= 100) {
      s += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      s += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      s += a[n] + ' ';
    }
    return s.trim();
  }

  let n = Math.round(num);
  const crores = Math.floor(n / 10000000);
  n %= 10000000;
  const lakhs = Math.floor(n / 100000);
  n %= 100000;
  const thousands = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  let res = '';
  if (crores > 0) res += convertLessThanOneThousand(crores) + ' Crore ';
  if (lakhs > 0) res += convertLessThanOneThousand(lakhs) + ' Lakh ';
  if (thousands > 0) res += convertLessThanOneThousand(thousands) + ' Thousand ';
  if (remainder > 0) res += convertLessThanOneThousand(remainder) + ' ';

  return res.trim() + ' Rupees Only';
}

