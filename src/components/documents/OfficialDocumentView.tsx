'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { DocumentRecord, CompanySettings } from '@/types';
import { db } from '@/lib/db';
import { DocumentLetterhead } from './DocumentLetterhead';
import { Printer, Download, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OfficialDocumentViewProps {
  document: DocumentRecord;
  settings?: CompanySettings;
  onApprove?: () => void;
  onRevoke?: () => void;
  canApprove?: boolean;
}

export const OfficialDocumentView: React.FC<OfficialDocumentViewProps> = ({
  document: doc,
  settings: propSettings,
  onApprove,
  onRevoke,
  canApprove = false,
}) => {
  const settings = propSettings || db.getCompanySettings();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  // Verification URL
  const verifyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify/${doc.verificationToken}`
    : `https://deeprootstudios.ai/verify/${doc.verificationToken}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [verifyUrl]);

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${doc.documentNumber.replace(/[\/\\]/g, '_')}_${doc.employeeName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback to browser print
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isApproved = doc.status === 'APPROVED' || doc.status === 'ISSUED';
  const isDraft = doc.status === 'DRAFT';
  const isPending = doc.status === 'PENDING_APPROVAL';
  const isRevoked = doc.status === 'REVOKED';

  // Format markdown paragraphs
  const renderFormattedContent = () => {
    const template = db.getTemplateById(doc.type);
    let body = template ? template.bodyMarkdown : '';

    // Interpolate placeholders
    const placeholders = doc.content || {};
    Object.keys(placeholders).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, placeholders[key] || '');
    });

    // Replace any remaining company settings placeholders
    body = body
      .replace(/{{company_name}}/g, settings.companyName)
      .replace(/{{website}}/g, settings.website)
      .replace(/{{issue_date}}/g, doc.issueDate);

    return body;
  };

  const contentText = renderFormattedContent();

  return (
    <div className="space-y-4">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isApproved
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : isPending
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : isRevoked
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
            }`}
          >
            Status: {doc.status.replace('_', ' ')}
          </span>
          {doc.approvedBy && (
            <span className="text-xs text-slate-500">
              Authorized by <strong className="text-teal-600 dark:text-teal-400">{doc.approvedBy}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Founder Approval Actions */}
          {canApprove && isPending && onApprove && (
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Sign & Issue Officially
            </button>
          )}

          {canApprove && isApproved && onRevoke && (
            <button
              onClick={onRevoke}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30"
            >
              Revoke Document
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Letterhead
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER - A4 PROPORTIONS */}
      <div className="flex justify-center">
        <div
          ref={documentRef}
          className="document-sheet relative w-full max-w-[850px] min-h-[1100px] bg-white text-slate-900 p-8 sm:p-14 shadow-2xl border border-slate-200 rounded-sm flex flex-col justify-between font-sans leading-relaxed select-text"
        >
          {/* Watermark for Non-Issued Documents */}
          {!isApproved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
              <span
                className={`text-6xl sm:text-7xl font-black uppercase tracking-widest -rotate-45 opacity-10 ${
                  isRevoked ? 'text-red-600' : 'text-amber-500'
                }`}
              >
                {doc.status.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Top: Letterhead */}
          <div>
            <DocumentLetterhead
              documentNumber={doc.documentNumber}
              issueDate={doc.issueDate}
              documentTitle={doc.title}
              settings={settings}
            />

            {/* Recipient Details Block */}
            <div className="mb-6 text-xs text-slate-800 space-y-0.5">
              <p className="font-semibold text-slate-500">To,</p>
              <p className="text-sm font-bold text-slate-900">{doc.employeeName}</p>
              <p className="text-slate-700">{doc.designation}</p>
              <p className="text-slate-600">Employee ID: <span className="font-mono font-semibold">{doc.employeeId}</span></p>
            </div>

            {/* Document Body Markdown / Interpolated */}
            <div className="text-xs sm:text-sm text-slate-800 space-y-4 leading-relaxed whitespace-pre-line text-justify">
              {contentText}
            </div>

            {/* Terms and Conditions Block if applicable */}
            {db.getTemplateById(doc.type)?.termsAndConditions && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Terms & Regulatory Conditions:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  {db.getTemplateById(doc.type)!.termsAndConditions.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Bottom: Signatures, Seal & Public QR Verification Code */}
          <div className="mt-12 pt-6 border-t border-slate-300">
            <div className="flex items-end justify-between gap-6">
              {/* Authorized Signatory Block */}
              <div className="space-y-1">
                {isApproved ? (
                  <div className="relative inline-block">
                    {/* Founder Digital Stamp and Sign */}
                    <div className="text-teal-800 font-serif italic text-lg tracking-wider mb-1">
                      Devesh Sharma
                    </div>
                    <div className="w-32 border-b-2 border-teal-700 mb-1" />
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded">
                      DIGITALLY AUTHORIZED
                    </span>
                  </div>
                ) : (
                  <div className="h-16 flex items-end">
                    <div className="w-32 border-b border-dashed border-slate-400 mb-1" />
                  </div>
                )}

                <p className="text-xs font-bold text-slate-900">{settings.authorizedSignatoryName}</p>
                <p className="text-[11px] text-slate-600">{settings.authorizedSignatoryTitle}</p>
                <p className="text-[10px] font-semibold text-teal-700">{settings.companyName}</p>
              </div>

              {/* Employee Acceptance block for Offer / Appointment */}
              {(doc.type === 'OFFER_LETTER' || doc.type === 'APPOINTMENT_LETTER' || doc.type === 'INTERNSHIP_OFFER') && (
                <div className="text-right space-y-1 max-w-[200px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Candidate Acceptance
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    I accept the offer on terms & conditions stipulated.
                  </p>
                  <div className="h-10 flex items-end justify-end">
                    <div className="w-28 border-b border-dashed border-slate-400" />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800">{doc.employeeName}</p>
                </div>
              )}

              {/* Official Seal & QR Verification Code */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="DRS Document Verification QR"
                    className="w-16 h-16 rounded border border-teal-600/30"
                  />
                )}
                <div className="text-[9px] space-y-0.5 max-w-[130px]">
                  <p className="font-bold text-teal-900 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                    AUTHENTICATED
                  </p>
                  <p className="text-slate-500 font-mono text-[8px] break-all leading-tight">
                    {doc.verificationToken}
                  </p>
                  <p className="text-slate-500 text-[8px]">
                    Scan QR or visit deeprootstudios.ai/verify
                  </p>
                </div>
              </div>
            </div>

            {/* Official Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-500">
              <p>
                This is an official document of {settings.companyName}. Registered in India under CIN {settings.cinNumber}.
              </p>
              <p className="text-slate-400 mt-0.5">
                Page 1 of 1 • System Generated by Deep Root Studios Centralized Operations Engine
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

