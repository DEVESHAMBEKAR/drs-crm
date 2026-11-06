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
    alert('Document digitally authorized and officially issued with company seal, Maroti Kadam signature & QR verification!');
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
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-black dark:text-white" />
            {isEmployeeOnly ? 'My Official Documents Vault' : 'DRS Document Automation Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {isEmployeeOnly
              ? 'Access, verify and download all official employment letters, certificates and contracts issued to you.'
              : 'Generate, review, digitally sign and track legally compliant HR documentation with official DRS company seal & stamp.'}
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Generate New Document
          </button>
        )}
      </div>

      {/* Founder Approval Alert */}
      {isFounder && pendingApprovalsCount > 0 && (
        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-black dark:text-white shrink-0" />
            <div>
              <p className="text-xs font-bold text-black dark:text-white">
                {pendingApprovalsCount} Document{pendingApprovalsCount > 1 ? 's' : ''} require Founder sign-off
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Prepared by Head of HR Maroti Kadam; authorize to release with official company seal & verification QR.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING_APPROVAL')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 whitespace-nowrap"
          >
            Show Pending
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, document ID (DRS/...), employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Status Select */}
          {!isEmployeeOnly && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none"
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
            className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-black dark:text-white focus:outline-none"
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
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
          <span>
            Showing <strong className="text-black dark:text-white">{filteredDocs.length}</strong> official documents
          </span>
          {(search || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-black dark:text-white underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredDocs.map((doc) => {
                const isApproved = doc.status === 'APPROVED' || doc.status === 'ISSUED';
                const isPending = doc.status === 'PENDING_APPROVAL';

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="font-mono font-bold text-black dark:text-white hover:underline"
                      >
                        {doc.documentNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="font-bold text-black dark:text-white hover:underline block truncate max-w-xs"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        {doc.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-black dark:text-white">{doc.employeeName}</p>
                      <p className="text-[11px] text-neutral-500">{doc.designation}</p>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-neutral-600 dark:text-neutral-400">
                      {doc.issueDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isApproved
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border-neutral-300 dark:border-neutral-700'
                            : isPending
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-400'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-300'
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
                            className="px-2.5 py-1 rounded text-xs font-bold bg-black text-white dark:bg-white dark:text-black shadow-xs flex items-center gap-1 hover:opacity-90"
                            title="Sign & Issue Officially with Stamp"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Sign
                          </button>
                        )}

                        <Link
                          href={`/documents/${doc.id}`}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 transition-colors"
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
