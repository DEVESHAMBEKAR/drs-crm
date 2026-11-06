'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DocumentTemplate, DocumentType } from '@/types';
import Link from 'next/link';
import {
  FileCheck2,
  Edit2,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Sparkles,
  Plus,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function DocumentTemplatesPage() {
  const { role, isFounder, currentUser } = useAuth();
  const [templates, setTemplates] = useState<DocumentTemplate[]>(db.getTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editTerms, setEditTerms] = useState<string[]>([]);
  const [editSignatoryTitle, setEditSignatoryTitle] = useState('');
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    setTemplates(db.getTemplates());
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, []);

  if (!isFounder) {
    return (
      <div className="p-8 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Founder Authorization Required</h2>
        <p className="text-xs text-slate-500">
          Template management and legal terms configuration are restricted to the Super Admin / Founder.
        </p>
        <Link href="/" className="text-teal-500 hover:underline text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleSelectTemplate = (tpl: DocumentTemplate) => {
    setSelectedTemplate(tpl);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!selectedTemplate) return;
    setEditTitle(selectedTemplate.title);
    setEditBody(selectedTemplate.bodyMarkdown);
    setEditTerms([...selectedTemplate.termsAndConditions]);
    setEditSignatoryTitle(selectedTemplate.signatoryTitle);
    setEditActive(selectedTemplate.isActive);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !currentUser) return;

    const updated = db.updateTemplate(
      selectedTemplate.id,
      {
        title: editTitle,
        bodyMarkdown: editBody,
        termsAndConditions: editTerms,
        signatoryTitle: editSignatoryTitle,
        isActive: editActive,
      },
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
    );

    setTemplates(db.getTemplates());
    setSelectedTemplate(updated);
    setIsEditing(false);
    alert(`Template "${updated.title}" successfully updated!`);
  };

  const placeholders = [
    { code: '{{employee_name}}', desc: "Candidate / Employee's full legal name" },
    { code: '{{employee_id}}', desc: 'Official DRS Employee ID (e.g. DRS-EMP-003)' },
    { code: '{{designation}}', desc: 'Target job title / designation' },
    { code: '{{department}}', desc: 'Assigned operational department' },
    { code: '{{joining_date}}', desc: 'Official date of joining' },
    { code: '{{annual_ctc}}', desc: 'Annual Cost to Company in INR' },
    { code: '{{monthly_gross}}', desc: 'Monthly gross compensation' },
    { code: '{{reporting_manager}}', desc: 'Reporting manager / supervisor' },
    { code: '{{company_name}}', desc: 'Deep Root Studios Private Limited' },
    { code: '{{issue_date}}', desc: 'Date of document issuance' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileCheck2 className="w-6 h-6 text-teal-500" />
          Document Template Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure standardized legal phrasing, dynamic placeholders, regulatory covenants and signatory mandates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Templates */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Available Templates ({templates.length})
          </h2>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm text-xs">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full p-3.5 text-left flex items-start justify-between gap-2 transition-colors ${
                    isSelected
                      ? 'bg-teal-500/10 dark:bg-teal-500/20 text-slate-900 dark:text-white border-l-4 border-l-teal-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold">{tpl.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tpl.type}</p>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      tpl.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {tpl.isActive ? 'Active' : 'Disabled'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Placeholders Legend */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic Placeholders
            </h3>
            <p className="text-[11px] text-slate-500">
              Insert any of the following tags in template markdown to dynamically interpolate verified employee fields:
            </p>
            <div className="space-y-1.5 text-xs">
              {placeholders.map((p) => (
                <div key={p.code} className="flex items-center justify-between">
                  <code className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1 py-0.2 rounded">
                    {p.code}
                  </code>
                  <span className="text-[10px] text-slate-500">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Template Detail & Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              {!isEditing ? (
                <>
                  {/* View Mode Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        {selectedTemplate.type}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {selectedTemplate.title}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Category: {selectedTemplate.category} • Signatory: {selectedTemplate.signatoryTitle}
                      </p>
                    </div>

                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Template
                    </button>
                  </div>

                  {/* Body Content */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Template Phrasing & Structure (Markdown)
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                      {selectedTemplate.bodyMarkdown}
                    </div>
                  </div>

                  {/* Terms and conditions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Standard Terms & Regulatory Covenants
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {selectedTemplate.termsAndConditions.map((term, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Edit {selectedTemplate.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        Active Template
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Template Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Body Markdown (use placeholders) *
                    </label>
                    <textarea
                      required
                      rows={14}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-teal-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Signatory Designation Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={editSignatoryTitle}
                      onChange={(e) => setEditSignatoryTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20"
                    >
                      Save Template Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-xs text-slate-500">Select a template on the left to inspect or edit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

