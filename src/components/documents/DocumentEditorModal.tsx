'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DocumentType, DocumentRecord, EmployeeProfile } from '@/types';
import { FileText, X, Sparkles, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (doc: DocumentRecord) => void;
  initialEmployeeId?: string;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployeeId,
}) => {
  const { role, isFounder, isHR, currentUser } = useAuth();
  const employees = db.getEmployees();
  const templates = db.getTemplates().filter((t) => t.isActive);

  const [selectedType, setSelectedType] = useState<DocumentType>('OFFER_LETTER');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || employees[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Form Fields for placeholders
  const [fields, setFields] = useState<Record<string, string>>({
    employee_name: '',
    employee_id: '',
    designation: '',
    department: '',
    joining_date: '',
    reporting_manager: 'Devesh Sharma (Founder & CEO)',
    annual_ctc: '',
    annual_ctc_in_words: '',
    probation_period: '3 Months',
    monthly_gross: '',
    stipend_amount: '30,000',
    internship_duration: '3 Months',
    internship_end_date: '',
    work_mode: 'Hybrid (Bangalore Office)',
    exit_date: '',
    new_designation: '',
    revised_ctc: '',
    effective_date: '',
    advisory_subject: '',
    prior_discussion_date: '',
    remediation_days: '30',
  });

  const [notes, setNotes] = useState('');

  // When selected employee or document type changes, pre-fill values
  useEffect(() => {
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (emp) {
      const ctc = emp.financialDetails?.annualCTC || 600000;
      setFields((prev) => ({
        ...prev,
        employee_name: emp.fullName,
        employee_id: emp.employeeId,
        designation: emp.designation,
        department: emp.department,
        joining_date: emp.dateOfJoining,
        annual_ctc: ctc.toLocaleString('en-IN'),
        annual_ctc_in_words: `${ctc.toLocaleString('en-IN')} Rupees Only`,
        monthly_gross: (emp.financialDetails?.monthlyGross || 50000).toLocaleString('en-IN'),
        stipend_amount: (emp.financialDetails?.stipendAmount || 30000).toLocaleString('en-IN'),
        exit_date: emp.exitDate || new Date().toISOString().split('T')[0],
      }));
    }
  }, [selectedEmpId, selectedType]);

  if (!isOpen) return null;

  const handleFieldChange = (key: string, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Generate Document Number: e.g. DRS/OFF/2026/008
    const typeAbbr = selectedType.slice(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const docCount = db.getDocuments().length + 1;
    const documentNumber = `DRS/${typeAbbr}/${year}/${docCount.toString().padStart(3, '0')}`;

    const template = templates.find((t) => t.type === selectedType);
    const title = `${template?.title || 'Official Document'} - ${fields.employee_name}`;

    // Founders can directly issue or draft; HR drafts as PENDING_APPROVAL
    const initialStatus = isFounder ? 'ISSUED' : 'PENDING_APPROVAL';

    const newDoc = db.createDocument(
      {
        documentNumber,
        type: selectedType,
        title,
        employeeId: selectedEmpId,
        employeeName: fields.employee_name,
        designation: fields.designation,
        status: initialStatus,
        issueDate,
        preparedBy: currentUser.fullName,
        approvedBy: isFounder ? currentUser.fullName : undefined,
        approvedAt: isFounder ? new Date().toISOString() : undefined,
        content: fields,
        notes: notes || undefined,
      },
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
    );

    onSuccess(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Official Document / Certificate
              </h3>
              <p className="text-xs text-slate-500">
                Populates Deep Root Studios letterhead, verification QR code & digital seal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Top selection row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Type *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-semibold"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.type}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Employee *
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-semibold"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date of Issue *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Placeholders Config */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Verified Placeholders & Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  value={fields.employee_name}
                  onChange={(e) => handleFieldChange('employee_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={fields.designation}
                  onChange={(e) => handleFieldChange('designation', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={fields.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Joining Date / Effective Date
                </label>
                <input
                  type="text"
                  value={fields.joining_date}
                  onChange={(e) => handleFieldChange('joining_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Offer & Appointment Specific Fields */}
              {(selectedType === 'OFFER_LETTER' || selectedType === 'APPOINTMENT_LETTER') && (
                <>
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Annual CTC (INR)
                    </label>
                    <input
                      type="text"
                      value={fields.annual_ctc}
                      onChange={(e) => handleFieldChange('annual_ctc', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      value={fields.reporting_manager}
                      onChange={(e) => handleFieldChange('reporting_manager', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </>
              )}

              {/* Internship Specific Fields */}
              {selectedType.includes('INTERNSHIP') && (
                <>
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Monthly Stipend (INR)
                    </label>
                    <input
                      type="text"
                      value={fields.stipend_amount}
                      onChange={(e) => handleFieldChange('stipend_amount', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Internship Duration
                    </label>
                    <input
                      type="text"
                      value={fields.internship_duration}
                      onChange={(e) => handleFieldChange('internship_duration', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </>
              )}

              {/* Experience Certificate specific */}
              {(selectedType === 'EXPERIENCE_CERTIFICATE' || selectedType === 'INTERNSHIP_COMPLETION') && (
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Relieving / Exit Date
                  </label>
                  <input
                    type="text"
                    value={fields.exit_date}
                    onChange={(e) => handleFieldChange('exit_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Workflow Notice */}
          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isFounder ? 'Executive Founder Direct Issuance' : 'HR Drafting & Founder Approval Workflow'}
              </p>
              <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                {isFounder
                  ? 'As Founder / Super Admin, this document will be signed and officially issued immediately with verified QR code.'
                  : 'Per DRS business rules, your document draft will be submitted to the Founder for review and digital signature before official release.'}
              </p>
            </div>
          </div>

          {/* Submit controls */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20"
            >
              {isFounder ? 'Generate & Issue Officially' : 'Submit for Founder Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

