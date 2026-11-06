'use client';

import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DocumentRecord, CompanySettings } from '@/types';
import { db } from '@/lib/db';
import { Printer, Download, ShieldCheck, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CeremonialCertificateProps {
  document: DocumentRecord;
  settings?: CompanySettings;
}

export const CeremonialCertificateView: React.FC<CeremonialCertificateProps> = ({
  document: doc,
  settings: propSettings,
}) => {
  const settings = propSettings || db.getCompanySettings();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${doc.verificationToken}`
    : `https://deeprootstudios.ai/verify/${doc.verificationToken}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((url) => setQrDataUrl(url));
  }, [verifyUrl]);

  const handleExportPDF = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DRS_Certificate_${doc.employeeName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="no-print p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-black dark:text-white" />
          <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
            Ceremonial Certificate Mode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
          >
            <Printer className="w-3.5 h-3.5 inline mr-1" /> Print
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 inline mr-1" />
            {isExporting ? 'Generating...' : 'Download Certificate PDF'}
          </button>
        </div>
      </div>

      {/* LANDSCAPE CERTIFICATE CANVAS */}
      <div className="flex justify-center overflow-x-auto pb-4">
        <div
          ref={certRef}
          className="relative w-[950px] min-h-[660px] bg-white text-black p-10 shadow-2xl border-8 border-black flex flex-col justify-between font-serif select-text"
        >
          {/* Inner Decorative Double Border */}
          <div className="absolute inset-3 border-2 border-dashed border-neutral-400 pointer-events-none" />

          {/* Top Brand Header */}
          <div className="text-center relative z-10 pt-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src="/assets/drs-logo.jpg"
                alt="DRS Logo"
                className="w-14 h-14 object-contain filter contrast-125"
              />
              <div className="text-left font-sans">
                <h1 className="text-2xl font-black tracking-tight text-black">DEEP ROOT STUDIOS</h1>
                <p className="text-[10px] tracking-widest uppercase font-mono text-neutral-600 font-semibold">
                  End-to-End AI Operations Partner • Bengaluru, India
                </p>
              </div>
            </div>

            <div className="mt-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 border-y border-black py-1 px-8 inline-block">
                OFFICIAL CERTIFICATION OF MERIT
              </span>
            </div>

            <h2 className="text-2xl font-black uppercase tracking-wider text-black mt-3 font-sans">
              {doc.title.replace(` - ${doc.employeeName}`, '')}
            </h2>
          </div>

          {/* Middle: Certificate Recipient & Body */}
          <div className="text-center my-6 space-y-3 relative z-10 px-12">
            <p className="text-xs font-sans uppercase tracking-widest text-neutral-500">
              This is proudly presented to
            </p>
            <p className="text-3xl font-black text-black font-serif underline decoration-neutral-400 decoration-1 underline-offset-8">
              {doc.employeeName}
            </p>
            <p className="text-xs font-mono font-semibold text-neutral-600">
              Employee ID: {doc.employeeId} • {doc.designation}
            </p>

            <p className="text-xs sm:text-sm font-sans leading-relaxed text-neutral-800 max-w-2xl mx-auto pt-2 text-center">
              {doc.content?.customParagraph ||
                (db.getTemplateById(doc.type)?.bodyMarkdown
                  ? db.getTemplateById(doc.type)!.bodyMarkdown
                      .replace(/{{employee_name}}/g, doc.employeeName || '')
                      .replace(/{{employee_id}}/g, doc.employeeId || '')
                      .replace(/{{designation}}/g, doc.designation || '')
                      .replace(/{{department}}/g, doc.content?.department || '')
                      .replace(/{{company_name}}/g, settings.companyName || 'Deep Root Studios Private Limited')
                      .replace(/{{issue_date}}/g, doc.issueDate || (doc.createdAt ? doc.createdAt.split('T')[0] : ''))
                  : 'In formal recognition of exemplary dedication, technical proficiency, and high-impact contributions to Deep Root Studios. Conferred with the highest appreciation of the Executive Leadership.')}
            </p>
          </div>

          {/* Bottom: Signatures, Seal & QR Verification */}
          <div className="pt-4 border-t border-neutral-300 relative z-10 flex items-end justify-between px-6 font-sans">
            {/* HR Signatory */}
            <div className="text-center">
              <img
                src={settings.authorizedSignatorySignatureUrl || '/assets/drs-signature.png'}
                alt="Authorized Signature"
                className="h-12 w-auto object-contain mx-auto mb-1 filter contrast-125"
              />
              <div className="w-36 border-b border-black mb-1 mx-auto" />
              <p className="text-xs font-bold text-black">{settings.authorizedSignatoryName || 'Maroti Kadam'}</p>
              <p className="text-[10px] text-neutral-600">{settings.authorizedSignatoryTitle || 'Head of Human Resources & Operations'}</p>
            </div>

            {/* Official Company Seal in Center */}
            <div className="text-center">
              <img
                src={settings.sealUrl || '/assets/drs-stamp.png'}
                alt="Deep Root Studios Seal"
                className="w-24 h-24 object-contain mx-auto filter contrast-125 opacity-90 rotate-[-3deg]"
              />
              <p className="text-[8px] font-mono font-semibold text-neutral-500 mt-0.5">
                CORPORATE SEAL
              </p>
            </div>

            {/* Founder Signatory & QR */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="h-12 flex items-end justify-center">
                  <span className="font-serif italic font-bold text-base text-black">{settings.founderName || 'Devesh Ambekar'}</span>
                </div>
                <div className="w-36 border-b border-black mb-1 mx-auto" />
                <p className="text-xs font-bold text-black">{settings.founderName || 'Devesh Ambekar'}</p>
                <p className="text-[10px] text-neutral-600">{settings.founderTitle || 'Founder & Managing Director / CEO'}</p>
              </div>

              {qrDataUrl && (
                <div className="text-center border border-neutral-300 p-1 rounded bg-neutral-50">
                  <img src={qrDataUrl} alt="Verify QR" className="w-14 h-14 mx-auto" />
                  <p className="text-[7px] font-mono text-neutral-500 mt-0.5">VERIFIED</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

