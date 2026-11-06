'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { DocumentRecord } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, Award, FileText } from 'lucide-react';
import { OfficialDocumentView } from '@/components/documents/OfficialDocumentView';
import { CeremonialCertificateView } from '@/components/documents/CeremonialCertificateView';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, isFounder, isHR, currentUser } = useAuth();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentRecord | undefined>(undefined);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [renderMode, setRenderMode] = useState<'LETTERHEAD' | 'CEREMONIAL'>('LETTERHEAD');

  useEffect(() => {
    const doc = db.getDocumentById(documentId);
    setDocument(doc);
    if (
      doc &&
      (doc.type.includes('COMPLETION') ||
        doc.type.includes('APPRECIATION') ||
        doc.type.includes('ACHIEVEMENT'))
    ) {
      setRenderMode('CEREMONIAL');
    }
  }, [documentId]);

  if (!document) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <Link href="/documents" className="text-black dark:text-white underline text-sm">
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
        <Shield className="w-12 h-12 text-black dark:text-white mx-auto" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-xs text-neutral-500">
          You are not authorized to inspect this official company record.
        </p>
        <Link href="/documents" className="text-black dark:text-white underline text-sm">
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
    alert('Document successfully authorized by Founder Devesh Ambekar! Released with official seal, Maroti Kadam signature & verification QR!');
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
    alert('Document status marked as REVOKED across all systems.');
  };

  const isCertificateType =
    document.type.includes('COMPLETION') ||
    document.type.includes('APPRECIATION') ||
    document.type.includes('ACHIEVEMENT');

  return (
    <div className="space-y-6">
      {/* Navigation & Layout Switcher */}
      <div className="no-print flex items-center justify-between">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Document Hub
        </Link>

        {isCertificateType && (
          <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
            <button
              onClick={() => setRenderMode('CEREMONIAL')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                renderMode === 'CEREMONIAL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Ceremonial Certificate
            </button>
            <button
              onClick={() => setRenderMode('LETTERHEAD')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                renderMode === 'LETTERHEAD'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Letterhead Format
            </button>
          </div>
        )}
      </div>

      {/* Render selected view mode */}
      {renderMode === 'CEREMONIAL' ? (
        <CeremonialCertificateView document={document} />
      ) : (
        <OfficialDocumentView
          document={document}
          canApprove={isFounder}
          onApprove={handleApprove}
          onRevoke={() => setShowRevokeModal(true)}
        />
      )}

      {/* Revocation Reason Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neutral-500" />
              Revoke Official Document
            </h3>
            <p className="text-xs text-neutral-500">
              This action will permanently invalidate verification token <strong>{document.verificationToken}</strong> and mark the credential as REVOKED.
            </p>

            <textarea
              required
              rows={3}
              placeholder="State legal or operational reason for revocation..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
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
