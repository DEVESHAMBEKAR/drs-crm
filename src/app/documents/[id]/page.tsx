'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DocumentRecord } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { OfficialDocumentView } from '@/components/documents/OfficialDocumentView';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, isFounder, isHR, currentUser } = useAuth();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentRecord | undefined>(undefined);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    const doc = db.getDocumentById(documentId);
    setDocument(doc);
  }, [documentId]);

  if (!document) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <Link href="/documents" className="text-teal-500 hover:underline text-sm">
          ← Back to Document Hub
        </Link>
      </div>
    );
  }

  // Security check: Employee can only view their own documents
  const isOwner = currentUser?.id === document.employeeId;
  if (!isFounder && !isHR && !isOwner) {
    return (
      <div className="p-8 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          You are not authorized to inspect this official company record.
        </p>
        <Link href="/documents" className="text-teal-500 hover:underline text-sm">
          Return to My Documents
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    if (!currentUser) return;
    const updated = db.updateDocumentStatus(document.id, 'ISSUED', {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
    });
    setDocument({ ...updated });
    alert('Document successfully authorized, signed, and issued with official QR verification!');
  };

  const handleRevoke = () => {
    if (!currentUser) return;
    const updated = db.updateDocumentStatus(
      document.id,
      'REVOKED',
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role },
      { revocationReason: revokeReason || 'Administrative revocation by founder.' }
    );
    setDocument({ ...updated });
    setShowRevokeModal(false);
    alert('Document status marked as REVOKED. Public QR check will reflect this status.');
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="no-print flex items-center justify-between">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Document Hub
        </Link>
      </div>

      {/* Official Document View Component */}
      <OfficialDocumentView
        document={document}
        canApprove={isFounder}
        onApprove={handleApprove}
        onRevoke={() => setShowRevokeModal(true)}
      />

      {/* Revocation Reason Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Revoke Official Document
            </h3>
            <p className="text-xs text-slate-500">
              This action will permanently invalidate verification token <strong>{document.verificationToken}</strong> and mark the document as REVOKED across all systems.
            </p>

            <textarea
              required
              rows={3}
              placeholder="State legal or operational reason for revocation..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

