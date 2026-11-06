'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { DocumentRecord, CompanySettings } from '@/types';
import { db } from '@/lib/db';
import { DocumentLetterhead } from './DocumentLetterhead';
import { Printer, Download, CheckCircle, ShieldCheck, AlertCircle, Stamp } from 'lucide-react';
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
        dark: '#000000',
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
      <div className="no-print p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isApproved
                ? 'bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white border-neutral-300 dark:border-neutral-700'
                : isPending
                ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-neutral-400'
                : isRevoked
                ? 'bg-neutral-200 text-black line-through border-neutral-400'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300'
            }`}
          >
            Status: {doc.status.replace('_', ' ')}
          </span>
          {doc.approvedBy && (
            <span className="text-xs text-neutral-500">
              Approved by <strong className="text-black dark:text-white">{doc.approvedBy}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Founder Approval Actions */}
          {canApprove && isPending && onApprove && (
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Sign & Issue Officially
            </button>
          )}

          {canApprove && isApproved && onRevoke && (
            <button
              onClick={onRevoke}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
            >
              Revoke Document
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Letterhead
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
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
          className="document-sheet relative w-full max-w-[850px] min-h-[1100px] bg-white text-black p-8 sm:p-14 shadow-2xl border border-neutral-300 rounded-none flex flex-col justify-between font-sans leading-relaxed select-text"
        >
          {/* Watermark for Non-Issued Documents */}
          {!isApproved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
              <span
                className={`text-6xl sm:text-7xl font-black uppercase tracking-widest -rotate-45 opacity-10 ${
                  isRevoked ? 'text-black line-through' : 'text-neutral-600'
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
            <div className="mb-6 text-xs text-neutral-800 space-y-0.5">
              <p className="font-semibold text-neutral-500">To,</p>
              <p className="text-sm font-bold text-black">{doc.employeeName}</p>
              <p className="text-neutral-700">{doc.designation}</p>
              <p className="text-neutral-600">Employee ID: <span className="font-mono font-semibold text-black">{doc.employeeId}</span></p>
            </div>

            {/* Document Body Markdown / Interpolated */}
            <div className="text-xs sm:text-sm text-neutral-900 space-y-4 leading-relaxed whitespace-pre-line text-justify">
              {contentText}
            </div>

            {/* Terms and Conditions Block if applicable */}
            {db.getTemplateById(doc.type)?.termsAndConditions && (
              <div className="mt-6 pt-4 border-t border-neutral-300">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                  Terms & Regulatory Conditions:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-700">
                  {db.getTemplateById(doc.type)!.termsAndConditions.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Bottom: Signatures, Official DRS Stamp & Public QR Verification Code */}
          <div className="mt-12 pt-6 border-t-2 border-black">
            <div className="flex items-end justify-between gap-4">
              {/* Authorized Signatory Block: Maroti Kadam (HR) & Devesh Ambekar (Founder) */}
              <div className="space-y-1 relative">
                {isApproved ? (
                  <div className="relative inline-block">
                    {/* Real Authorized Handwritten Signature of Maroti Kadam */}
                    <div className="mb-1">
                      <img
                        src="/assets/drs-signature.png"
                        alt="Authorized Signature"
                        className="h-14 w-auto object-contain filter contrast-125"
                      />
                    </div>
                    <div className="w-40 border-b border-black mb-1" />
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-neutral-100 text-black border border-neutral-300 rounded">
                      DIGITALLY AUTHORIZED
                    </span>
                  </div>
                ) : (
                  <div className="h-16 flex items-end">
                    <div className="w-36 border-b border-dashed border-neutral-400 mb-1" />
                  </div>
                )}

                <p className="text-xs font-bold text-black">Maroti Kadam</p>
                <p className="text-[11px] text-neutral-600">Head of Human Resources & Operations</p>
                <p className="text-[10px] font-bold text-neutral-800">
                  Deep Root Studios Private Limited
                </p>
                <p className="text-[10px] text-neutral-500">
                  Endorsed: Devesh Ambekar (Founder & CEO)
                </p>
              </div>

              {/* Official Deep Root Studios Company Stamp */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                  <img
                    src="/assets/drs-stamp.png"
                    alt="Official Deep Root Studios Private Limited Seal"
                    className="w-full h-full object-contain filter contrast-125 opacity-90 rotate-[-4deg]"
                  />
                </div>
                <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-neutral-500 mt-1">
                  OFFICIAL COMPANY SEAL
                </span>
              </div>

              {/* Official Public QR Verification Code */}
              <div className="flex items-center gap-2.5 bg-neutral-50 p-2.5 rounded border border-neutral-300 shrink-0">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="DRS Document Verification QR"
                    className="w-16 h-16 rounded border border-black/30"
                  />
                )}
                <div className="text-[9px] space-y-0.5 max-w-[120px]">
                  <p className="font-bold text-black flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-black shrink-0" />
                    VERIFIED DOC
                  </p>
                  <p className="text-neutral-600 font-mono text-[8px] break-all leading-tight">
                    {doc.verificationToken}
                  </p>
                  <p className="text-neutral-500 text-[8px]">
                    Scan QR or visit deeprootstudios.ai/verify
                  </p>
                </div>
              </div>
            </div>

            {/* Official Footer */}
            <div className="mt-6 pt-3 border-t border-neutral-300 text-center text-[9px] text-neutral-600">
              <p>
                This is an official document of Deep Root Studios Private Limited • CIN {settings.cinNumber}.
              </p>
              <p className="text-neutral-500 mt-0.5">
                Founder: Devesh Ambekar • Head of HR: Maroti Kadam • Deep Root Studios Operations Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
