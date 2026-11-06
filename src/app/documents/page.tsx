'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DocumentRecord, DocumentStatus, DocumentType } from '@/types';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Printer,
  Download,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { DocumentEditorModal } from '@/components/documents/DocumentEditorModal';

export default function DocumentsHubPage() {
  const { role, isFounder, isHR, isEmployeeOnly, currentUser } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>(db.getDocuments());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    // If user is employee only, filter to only their own docs
    let all = db.getDocuments();
    if (isEmployeeOnly && currentUser) {
      all = all.filter((d) => d.employeeId === currentUser.id && d.status === 'ISSUED');
    }
    setDocuments(all);
  }, [currentUser, isEmployeeOnly, role]);

  const refreshDocs = () => {
    let all = db.getDocuments();
    if (isEmployeeOnly && currentUser) {
      all = all.filter((d) => d.employeeId === currentUser.id && d.status === 'ISSUED');
    }
    setDocuments(all);
  };

  const handleFounderQuickApprove = (docId: string) => {
    if (!currentUser) return;
    db.updateDocumentStatus(docId, 'ISSUED', {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
    });
    refreshDocs();
    alert('Document digitally authorized and officially issued with verification QR code!');
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      doc.employeeName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingApprovalsCount = db.getDocuments().filter((d) => d.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-teal-500" />
            {isEmployeeOnly ? 'My Official Documents Vault' : 'DRS Document Automation Engine'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEmployeeOnly
              ? 'Access, verify and download all official employment letters, certificates and contracts issued to you.'
              : 'Generate, review, digitally sign and track legally compliant HR documentation with anti-tamper QR verification.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Generate New Document
          </button>
        )}
      </div>

      {/* Founder Approval Alert */}
      {isFounder && pendingApprovalsCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {pendingApprovalsCount} Document{pendingApprovalsCount > 1 ? 's' : ''} require your official founder sign-off
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Review below and authorize to release to employees with authenticated verification QR.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING_APPROVAL')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white whitespace-nowrap"
          >
            Show Pending
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, document ID (DRS/...), employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Status Tabs/Select */}
          {!isEmployeeOnly && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Founder Approval ({pendingApprovalsCount})</option>
              <option value="ISSUED">Issued / Active</option>
              <option value="DRAFT">Draft</option>
              <option value="REVOKED">Revoked</option>
            </select>
          )}

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Document Types</option>
            <option value="OFFER_LETTER">Offer Letters</option>
            <option value="APPOINTMENT_LETTER">Appointment Letters</option>
            <option value="INTERNSHIP_OFFER">Internship Offers</option>
            <option value="INTERNSHIP_COMPLETION">Internship Certificates</option>
            <option value="EXPERIENCE_CERTIFICATE">Experience Certificates</option>
            <option value="APPRECIATION_LETTER">Appreciation Certificates</option>
            <option value="PROMOTION_LETTER">Promotion Letters</option>
            <option value="WARNING_LETTER">Warning Letters</option>
          </select>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-200">{filteredDocs.length}</strong> official documents
          </span>
          {(search || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredDocs.map((doc) => {
                const isApproved = doc.status === 'APPROVED' || doc.status === 'ISSUED';
                const isPending = doc.status === 'PENDING_APPROVAL';

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="font-mono font-bold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        {doc.documentNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-teal-500 block truncate max-w-xs"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {doc.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.employeeName}</p>
                      <p className="text-[11px] text-slate-500">{doc.designation}</p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {doc.issueDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Founder Approve */}
                        {isFounder && isPending && (
                          <button
                            onClick={() => handleFounderQuickApprove(doc.id)}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1"
                            title="Sign & Issue Immediately"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Sign
                          </button>
                        )}

                        <Link
                          href={`/documents/${doc.id}`}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/10 hover:text-teal-500 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          View Letter
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <DocumentEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSuccess={(doc) => {
          refreshDocs();
          alert(`Document ${doc.documentNumber} created successfully!`);
        }}
      />
    </div>
  );
}
