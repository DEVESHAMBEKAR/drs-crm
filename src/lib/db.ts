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
    return getStorage<CompanySettings>(KEYS.SETTINGS, initialCompanySettings);
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
    return getStorage<EmployeeProfile[]>(KEYS.EMPLOYEES, initialEmployees);
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
    return getStorage<DocumentTemplate[]>(KEYS.TEMPLATES, initialDocumentTemplates);
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

