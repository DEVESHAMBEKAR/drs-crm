'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { DocumentRecord } from '@/types';
import { DrsLogo } from '@/components/brand/DrsLogo';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Calendar,
  User,
  Building,
  CheckCircle2,
  FileText,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export default function DocumentVerificationResultPage() {
  const params = useParams();
  const token = params.token as string;
  const [doc, setDoc] = useState<DocumentRecord | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = db.getDocumentById(token);
    setDoc(found);
    setLoaded(true);
  }, [token]);

  if (!loaded) return null;

  const isIssued = doc && (doc.status === 'ISSUED' || doc.status === 'APPROVED');
  const isRevoked = doc && doc.status === 'REVOKED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12">
      {/* Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <Link href="/">
          <DrsLogo size="md" variant="full" />
        </Link>
        <Link
          href="/verify"
          className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> New Verification Search
        </Link>
      </div>

      {/* Main Result Card */}
      <div className="max-w-2xl w-full mx-auto my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Verification Status Header */}
        {isIssued && (
          <div className="p-6 bg-emerald-500/10 border-b border-emerald-500/20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-emerald-400 tracking-wide uppercase">
              Official & Authenticated Document
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              This document has been verified as an authentic, legally authorized record issued by Deep Root Studios Private Limited.
            </p>
          </div>
        )}

        {isRevoked && (
          <div className="p-6 bg-rose-500/10 border-b border-rose-500/20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-rose-400 tracking-wide uppercase">
              Document Status: Revoked
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              This credential has been officially revoked by Deep Root Studios and is no longer valid.
            </p>
            {doc.revocationReason && (
              <p className="text-xs text-rose-300 italic">
                Reason: {doc.revocationReason}
              </p>
            )}
          </div>
        )}

        {!doc && (
          <div className="p-8 bg-amber-500/10 border-b border-amber-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <ShieldX className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-amber-400 tracking-wide uppercase">
              Record Not Verified
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              No official Deep Root Studios record matches verification token: <br />
              <strong className="font-mono text-amber-300">{token}</strong>
            </p>
            <div className="pt-2">
              <Link
                href="/verify"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white inline-block"
              >
                Try Another Token
              </Link>
            </div>
          </div>
        )}

        {/* Record Details Body */}
        {doc && (
          <div className="p-6 space-y-5 text-xs">
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-teal-400">
                Document Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Document Type</span>
                  <p className="font-bold text-slate-200 mt-0.5">{doc.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Official Tracking Number</span>
                  <p className="font-mono font-bold text-teal-400 mt-0.5">{doc.documentNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Recipient Name</span>
                  <p className="font-bold text-slate-200 mt-0.5">{doc.employeeName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Designation</span>
                  <p className="font-bold text-slate-200 mt-0.5">{doc.designation}</p>
                </div>
                <div>
                  <span className="text-slate-500">Issue Date</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{doc.issueDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Authorized Signatory</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{doc.approvedBy || 'Founder & CEO'}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Verification Hash:</span>
              <span className="font-mono text-teal-400">{doc.verificationToken}</span>
            </div>

            <div className="text-center pt-2">
              <Link
                href={`/documents/${doc.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                Inspect Official Letterhead Sheet <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600">
        <p>© 2026 Deep Root Studios Private Limited • CIN U72900KA2024PTC189201</p>
      </div>
    </div>
  );
}
