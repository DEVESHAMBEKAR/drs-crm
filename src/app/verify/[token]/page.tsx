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
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-12 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <Link href="/">
          <DrsLogo size="md" variant="full" />
        </Link>
        <Link
          href="/verify"
          className="text-xs font-semibold text-neutral-400 hover:text-white hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> New Verification Search
        </Link>
      </div>

      {/* Main Result Card */}
      <div className="max-w-2xl w-full mx-auto my-8 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Verification Status Header */}
        {isIssued && (
          <div className="p-6 bg-neutral-900 border-b border-neutral-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto border border-neutral-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase">
              Official & Authenticated Credential
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              This document has been verified as an authentic, legally authorized record issued by Deep Root Studios Private Limited under the signature of Head of HR Maroti Kadam and Founder Devesh Ambekar.
            </p>
          </div>
        )}

        {isRevoked && (
          <div className="p-6 bg-neutral-900 border-b border-neutral-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center mx-auto border border-neutral-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase line-through">
              Document Status: Revoked
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              This credential has been officially revoked by Deep Root Studios and is no longer valid.
            </p>
            {doc.revocationReason && (
              <p className="text-xs text-neutral-300 italic">
                Reason: {doc.revocationReason}
              </p>
            )}
          </div>
        )}

        {!doc && (
          <div className="p-8 bg-neutral-900 border-b border-neutral-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center mx-auto border border-neutral-700">
              <ShieldX className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase">
              Record Not Verified
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              No official Deep Root Studios record matches verification token: <br />
              <strong className="font-mono text-white">{token}</strong>
            </p>
            <div className="pt-2">
              <Link
                href="/verify"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-neutral-200 inline-block"
              >
                Try Another Token
              </Link>
            </div>
          </div>
        )}

        {/* Record Details Body with Stamp & Signature */}
        {doc && (
          <div className="p-6 space-y-6 text-xs">
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-white">
                Document Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500">Document Type</span>
                  <p className="font-bold text-white mt-0.5">{doc.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Official Tracking Number</span>
                  <p className="font-mono font-bold text-white mt-0.5">{doc.documentNumber}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Recipient Name</span>
                  <p className="font-bold text-white mt-0.5">{doc.employeeName}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Designation</span>
                  <p className="font-bold text-white mt-0.5">{doc.designation}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Issue Date</span>
                  <p className="font-semibold text-white mt-0.5">{doc.issueDate}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Authorized Signatory</span>
                  <p className="font-semibold text-white mt-0.5">Maroti Kadam (Head of HR)</p>
                </div>
              </div>
            </div>

            {/* Stamp & Signature Verification Preview */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/drs-stamp.png"
                  alt="DRS Stamp"
                  className="w-16 h-16 object-contain filter contrast-125"
                />
                <div>
                  <p className="font-bold text-white">Deep Root Studios Private Limited</p>
                  <p className="text-[10px] text-neutral-400">Official Corporate Seal Authenticated</p>
                </div>
              </div>

              <div className="text-right">
                <img
                  src="/assets/drs-signature.png"
                  alt="Maroti Kadam Signature"
                  className="h-10 w-auto object-contain filter invert ml-auto"
                />
                <p className="text-[10px] text-neutral-400 mt-1 font-mono">Digitally Signed & Certified</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Verification Token Hash:</span>
              <span className="font-mono text-white font-bold">{doc.verificationToken}</span>
            </div>

            <div className="text-center pt-1">
              <Link
                href={`/documents/${doc.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:underline"
              >
                Inspect Official Letterhead Sheet <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-500">
        <p>© 2026 Deep Root Studios Private Limited • CIN U72900KA2024PTC189201</p>
        <p className="text-[10px] text-neutral-600 mt-0.5">
          Founder: Devesh Ambekar • Head of HR: Maroti Kadam
        </p>
      </div>
    </div>
  );
}
