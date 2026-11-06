'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DocumentType, DocumentRecord, EmployeeProfile } from '@/types';
import { FileText, X, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Eye, Edit3 } from 'lucide-react';
import { DocumentLetterhead } from './DocumentLetterhead';

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
  const companySettings = db.getCompanySettings();

  const [selectedType, setSelectedType] = useState<DocumentType>('OFFER_LETTER');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || employees[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'FORM' | 'PREVIEW'>('FORM');

  // Form Fields for placeholders
  const [fields, setFields] = useState<Record<string, string>>({
    employee_name: '',
    employee_id: '',
    designation: '',
    department: '',
    joining_date: '',
    reporting_manager: 'Devesh Ambekar (Founder & CEO)',
    annual_ctc: '',
    annual_ctc_in_words: '',
    probation_period: '3 Months',
    monthly_gross: '',
    stipend_amount: '30,000',
    internship_duration: '3 Months',
    internship_end_date: '',
    work_mode: 'Hybrid (Bengaluru Headquarters)',
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

  const currentTemplate = templates.find((t) => t.type === selectedType);

  const renderInterpolatedPreview = () => {
    let body = currentTemplate ? currentTemplate.bodyMarkdown : '';
    Object.keys(fields).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, fields[key] || '');
    });
    body = body
      .replace(/{{company_name}}/g, companySettings.companyName)
      .replace(/{{website}}/g, companySettings.website)
      .replace(/{{issue_date}}/g, issueDate);
    return body;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Generate Document Number: e.g. DRS/OFF/2026/008
    const typeAbbr = selectedType.slice(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const docCount = db.getDocuments().length + 1;
    const documentNumber = `DRS/${typeAbbr}/${year}/${docCount.toString().padStart(3, '0')}`;

    const title = `${currentTemplate?.title || 'Official Document'} - ${fields.employee_name}`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-sm">
              DRS
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                Generate Official Company Document
              </h3>
              <p className="text-xs text-neutral-500">
                Authorized Signatory: Maroti Kadam (Head of HR) • Endorsed: Devesh Ambekar (Founder & CEO)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View / Edit Mode Toggle */}
            <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('FORM')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  viewMode === 'FORM'
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Configure
              </button>
              <button
                type="button"
                onClick={() => setViewMode('PREVIEW')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  viewMode === 'PREVIEW'
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {viewMode === 'FORM' ? (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Top Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Document Type *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white font-semibold"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.type}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Target Employee *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white font-semibold"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Date of Issue *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white"
                />
              </div>
            </div>

            {/* Dynamic Placeholders Config */}
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-black dark:text-white">
                Placeholders & Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Employee Full Name
                  </label>
                  <input
                    type="text"
                    value={fields.employee_name}
                    onChange={(e) => handleFieldChange('employee_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={fields.designation}
                    onChange={(e) => handleFieldChange('designation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={fields.department}
                    onChange={(e) => handleFieldChange('department', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Joining Date / Effective Date
                  </label>
                  <input
                    type="text"
                    value={fields.joining_date}
                    onChange={(e) => handleFieldChange('joining_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                {/* Offer & Appointment Specific Fields */}
                {(selectedType === 'OFFER_LETTER' || selectedType === 'APPOINTMENT_LETTER') && (
                  <>
                    <div>
                      <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Annual CTC (INR)
                      </label>
                      <input
                        type="text"
                        value={fields.annual_ctc}
                        onChange={(e) => handleFieldChange('annual_ctc', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Reporting Manager
                      </label>
                      <input
                        type="text"
                        value={fields.reporting_manager}
                        onChange={(e) => handleFieldChange('reporting_manager', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </>
                )}

                {/* Internship Specific Fields */}
                {selectedType.includes('INTERNSHIP') && (
                  <>
                    <div>
                      <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Monthly Stipend (INR)
                      </label>
                      <input
                        type="text"
                        value={fields.stipend_amount}
                        onChange={(e) => handleFieldChange('stipend_amount', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Internship Duration
                      </label>
                      <input
                        type="text"
                        value={fields.internship_duration}
                        onChange={(e) => handleFieldChange('internship_duration', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </>
                )}

                {/* Experience & Exit Specific Fields */}
                {(selectedType === 'EXPERIENCE_CERTIFICATE' || selectedType === 'INTERNSHIP_COMPLETION' || selectedType === 'RELIEVING_LETTER') && (
                  <div>
                    <label className="block font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Relieving / Exit Date
                    </label>
                    <input
                      type="text"
                      value={fields.exit_date}
                      onChange={(e) => handleFieldChange('exit_date', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Notice */}
            <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Official Seal & Signature Guarantee
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  This document will carry the official Deep Root Studios Company Seal and the authorized signature of Maroti Kadam (Head of HR).
                </p>
              </div>
            </div>

            {/* Submit Controls */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black shadow-sm"
              >
                {isFounder ? 'Generate & Issue Officially' : 'Submit for Founder Approval'}
              </button>
            </div>
          </form>
        ) : (
          /* Live Document Preview Sheet */
          <div className="p-6 overflow-y-auto flex-1 bg-neutral-100 dark:bg-neutral-950 flex justify-center">
            <div className="w-full max-w-[750px] bg-white text-black p-8 shadow-xl border border-neutral-300 font-sans leading-relaxed select-text flex flex-col justify-between min-h-[850px]">
              <div>
                {/* Letterhead */}
                <DocumentLetterhead
                  documentNumber={`DRS/${selectedType.slice(0, 3)}/2026/PREVIEW`}
                  issueDate={issueDate}
                  documentTitle={currentTemplate?.title || selectedType}
                  settings={companySettings}
                />

                <div className="mb-4 text-xs text-neutral-800 space-y-0.5">
                  <p className="font-semibold text-neutral-500">To,</p>
                  <p className="text-sm font-bold text-black">{fields.employee_name || '[Employee Name]'}</p>
                  <p className="text-neutral-700">{fields.designation || '[Designation]'}</p>
                  <p className="text-neutral-600">Employee ID: <span className="font-mono font-semibold text-black">{fields.employee_id}</span></p>
                </div>

                <div className="text-xs text-neutral-900 space-y-3 leading-relaxed whitespace-pre-line text-justify">
                  {renderInterpolatedPreview()}
                </div>
              </div>

              {/* Bottom Signatures & Seal */}
              <div className="mt-8 pt-4 border-t-2 border-black flex items-end justify-between">
                <div>
                  <img
                    src="/assets/drs-signature.png"
                    alt="Authorized Signature"
                    className="h-12 w-auto object-contain mb-1"
                  />
                  <div className="w-36 border-b border-black mb-1" />
                  <p className="text-xs font-bold text-black">Maroti Kadam</p>
                  <p className="text-[10px] text-neutral-600">Head of Human Resources & Operations</p>
                  <p className="text-[9px] text-neutral-500">Deep Root Studios Private Limited</p>
                </div>

                <div className="w-20 h-20">
                  <img
                    src="/assets/drs-stamp.png"
                    alt="DRS Company Seal"
                    className="w-full h-full object-contain filter contrast-125 opacity-90 rotate-[-5deg]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
