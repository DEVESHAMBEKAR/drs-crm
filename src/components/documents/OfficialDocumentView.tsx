'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { DocumentRecord, CompanySettings } from '@/types';
import { db } from '@/lib/db';
import { DocumentLetterhead } from './DocumentLetterhead';
import { Printer, Download, CheckCircle, ShieldCheck, AlertCircle, Mail, Send, X, Loader2 } from 'lucide-react';
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

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${doc.verificationToken}`
    : `https://deeprootstudios.ai/verify/${doc.verificationToken}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [verifyUrl]);

  // Generate PDF as base64 for email attachment
  const generatePDFBase64 = async (): Promise<{ base64: string; filename: string } | null> => {
    if (!documentRef.current) return null;
    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const base64 = pdf.output('datauristring').split(',')[1];
      const filename = `${doc.documentNumber.replace(/[\/\\]/g, '_')}_${doc.employeeName.replace(/\s+/g, '_')}.pdf`;
      return { base64, filename };
    } catch {
      return null;
    }
  };

  const handleExportPDF = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${doc.documentNumber.replace(/[\/\\]/g, '_')}_${doc.employeeName.replace(/\s+/g, '_')}.pdf`);
    } catch {
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Send document via Zoho Mail
  const handleSendEmail = async () => {
    if (!emailTo.trim()) return;
    setEmailSending(true);
    setEmailResult(null);

    try {
      // Generate PDF
      const pdfData = await generatePDFBase64();

      const payload = {
        to: emailTo.trim(),
        cc: emailCc.trim() || undefined,
        subject: `${doc.title} — ${settings.companyName} [Ref: ${doc.documentNumber}]`,
        documentTitle: doc.title,
        documentNumber: doc.documentNumber,
        employeeName: doc.employeeName,
        senderEmail: settings.smtpEmail || settings.officialEmail,
        senderPassword: settings.smtpPassword || '',
        senderName: settings.authorizedSignatoryName || 'HR Department',
        companyName: settings.companyName,
        pdfBase64: pdfData?.base64 || undefined,
        pdfFilename: pdfData?.filename || undefined,
      };

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailResult({ success: true, message: `Email sent successfully to ${emailTo}` });
        // Log audit
        const currentUser = db.getEmployeeById(db.getCurrentUserId() || 'emp-001');
        if (currentUser) {
          db.logAudit({
            actorId: currentUser.id,
            actorName: currentUser.fullName,
            actorRole: currentUser.role,
            action: 'DOCUMENT_SHARED',
            entityType: 'DOCUMENT',
            entityId: doc.id,
            details: `Document ${doc.documentNumber} emailed to ${emailTo}`,
          });
        }
      } else {
        setEmailResult({ success: false, message: data.error || 'Failed to send email' });
      }
    } catch (err: any) {
      setEmailResult({ success: false, message: err.message || 'Network error' });
    } finally {
      setEmailSending(false);
    }
  };

  const isApproved = doc.status === 'APPROVED' || doc.status === 'ISSUED';
  const isDraft = doc.status === 'DRAFT';
  const isPending = doc.status === 'PENDING_APPROVAL';
  const isRevoked = doc.status === 'REVOKED';

  // Format content
  const renderFormattedContent = () => {
    const template = db.getTemplateById(doc.type);
    let body = template ? template.bodyMarkdown : '';
    const placeholders = doc.content || {};
    Object.keys(placeholders).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, placeholders[key] || '');
    });
    body = body
      .replace(/{{company_name}}/g, settings.companyName)
      .replace(/{{website}}/g, settings.website)
      .replace(/{{issue_date}}/g, doc.issueDate);
    return body;
  };

  const contentText = renderFormattedContent();
  const template = db.getTemplateById(doc.type);

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
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

          {/* Share via Email Button */}
          {isApproved && (
            <button
              onClick={() => {
                setShowEmailModal(true);
                setEmailResult(null);
                // Pre-fill employee email
                const emp = db.getEmployeeById(doc.employeeId);
                if (emp) setEmailTo(emp.email);
              }}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Share via Email
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ===== A4 DOCUMENT SHEET ===== */}
      <div className="flex justify-center">
        <div
          ref={documentRef}
          className="document-sheet relative w-full max-w-[850px] bg-white text-black shadow-2xl border border-neutral-300 rounded-none flex flex-col justify-between select-text"
          style={{
            minHeight: '1122px',
            padding: '48px 56px',
            fontFamily: "'Times New Roman', 'Georgia', serif",
            fontSize: '12px',
            lineHeight: '1.7',
            color: '#1a1a1a',
          }}
        >
          {/* Watermark */}
          {!isApproved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
              <span
                className={`font-black uppercase tracking-widest -rotate-45 ${
                  isRevoked ? 'text-black line-through' : 'text-neutral-500'
                }`}
                style={{ fontSize: '72px', opacity: 0.06, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
              >
                {doc.status.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Main Content */}
          <div>
            <DocumentLetterhead
              documentNumber={doc.documentNumber}
              issueDate={doc.issueDate}
              documentTitle={doc.title}
              settings={settings}
            />

            {/* Recipient Block */}
            <div style={{ marginBottom: '20px', fontSize: '11px' }}>
              <p style={{ color: '#666', marginBottom: '2px' }}>To,</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#000' }}>{doc.employeeName}</p>
              <p style={{ color: '#444' }}>{doc.designation}</p>
              <p style={{ color: '#555' }}>
                Employee ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#000' }}>{doc.employeeId || doc.content?.employee_id}</span>
              </p>
            </div>

            {/* Subject Line */}
            <div style={{ marginBottom: '16px', fontSize: '11px' }}>
              <p>
                <span style={{ fontWeight: 700, color: '#000' }}>Sub: </span>
                <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>{doc.title}</span>
              </p>
            </div>

            {/* Salutation + Body */}
            <div style={{ fontSize: '11.5px', color: '#222', lineHeight: '1.8', textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {contentText}
            </div>

            {/* Terms and Conditions */}
            {template?.termsAndConditions && template.termsAndConditions.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #ccc' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#000', marginBottom: '6px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                  Terms & Conditions:
                </p>
                <ol style={{ paddingLeft: '16px', margin: 0 }}>
                  {template.termsAndConditions.map((term, i) => (
                    <li key={i} style={{ fontSize: '9.5px', color: '#555', lineHeight: '1.6', marginBottom: '3px' }}>
                      {term}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Closing */}
            <div style={{ marginTop: '28px', fontSize: '11px' }}>
              <p style={{ color: '#333' }}>Thanking you,</p>
              <p style={{ color: '#333', marginTop: '2px' }}>
                For <strong style={{ color: '#000' }}>{settings.companyName}</strong>
              </p>
            </div>
          </div>

          {/* ===== BOTTOM: Signature + Seal + QR ===== */}
          <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: '2px solid #000' }}>
            <div className="flex items-end justify-between gap-4">
              {/* Authorized Signatory */}
              <div>
                {isApproved ? (
                  <div>
                    <img
                      src="/assets/drs-signature.png"
                      alt="Authorized Signature"
                      style={{ height: '52px', width: 'auto', objectFit: 'contain', filter: 'contrast(1.3)' }}
                    />
                    <div style={{ width: '160px', borderBottom: '1px solid #000', marginTop: '2px', marginBottom: '4px' }} />
                  </div>
                ) : (
                  <div style={{ height: '56px', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '150px', borderBottom: '1px dashed #999', marginBottom: '4px' }} />
                  </div>
                )}
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#000' }}>
                  {settings.authorizedSignatoryName}
                </p>
                <p style={{ fontSize: '9.5px', color: '#555' }}>
                  {settings.authorizedSignatoryTitle}
                </p>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#333', marginTop: '1px' }}>
                  {settings.companyName}
                </p>
              </div>

              {/* Official Company Seal */}
              <div className="flex flex-col items-center">
                <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                  <img
                    src="/assets/drs-stamp.png"
                    alt="Company Seal"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'contrast(1.2)',
                      opacity: 0.85,
                      transform: 'rotate(-5deg)',
                    }}
                  />
                </div>
              </div>

              {/* QR Verification */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#fafafa', border: '1px solid #ddd' }}>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="Verification QR" style={{ width: '56px', height: '56px', border: '1px solid #ccc' }} />
                )}
                <div style={{ maxWidth: '100px' }}>
                  <p style={{ fontSize: '8px', fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck className="w-3 h-3 text-black shrink-0" />
                    VERIFIED
                  </p>
                  <p style={{ fontSize: '7px', color: '#888', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.3', marginTop: '2px' }}>
                    {doc.verificationToken}
                  </p>
                  <p style={{ fontSize: '7px', color: '#aaa', marginTop: '2px' }}>
                    Scan to verify authenticity
                  </p>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
              <p style={{ fontSize: '8px', color: '#888', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                This is a computer-generated document issued by {settings.companyName} (CIN: {settings.cinNumber}).
              </p>
              <p style={{ fontSize: '7.5px', color: '#aaa', marginTop: '2px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                {settings.address} • {settings.officialEmail} • {settings.website}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EMAIL MODAL ===== */}
      {showEmailModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Share Document via Zoho Mail
                </h3>
                <button onClick={() => setShowEmailModal(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* SMTP Warning if not configured */}
              {(!settings.smtpEmail || !settings.smtpPassword) && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Zoho Mail not configured</p>
                    <p className="mt-0.5">Go to <strong>Company Settings → Email Configuration</strong> to add your Zoho Mail credentials (email + app password).</p>
                  </div>
                </div>
              )}

              {/* Document Info */}
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                <p className="font-bold text-black dark:text-white">{doc.title}</p>
                <p className="text-neutral-500 font-mono mt-0.5">{doc.documentNumber}</p>
                <p className="text-neutral-500 mt-0.5">Employee: {doc.employeeName}</p>
              </div>

              {/* Email Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="employee@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    CC (optional)
                  </label>
                  <input
                    type="email"
                    value={emailCc}
                    onChange={(e) => setEmailCc(e.target.value)}
                    placeholder="hr@deeprootstudios.ai"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Result Message */}
              {emailResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  emailResult.success
                    ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                }`}>
                  {emailResult.success ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{emailResult.message}</span>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendEmail}
                disabled={emailSending || !emailTo.trim() || !settings.smtpEmail || !settings.smtpPassword}
                className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
              >
                {emailSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending via Zoho Mail...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Document via Zoho Mail
                  </>
                )}
              </button>

              <p className="text-[10px] text-neutral-400 text-center">
                Document will be sent as PDF attachment from {settings.smtpEmail || 'your configured Zoho email'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
