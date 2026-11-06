'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { CompanySettings } from '@/types';
import Link from 'next/link';
import {
  Settings,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Shield,
  FileText,
  RotateCcw,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { DrsLogo } from '@/components/brand/DrsLogo';

export default function CompanySettingsPage() {
  const { role, isFounder, currentUser } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>(db.getCompanySettings());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(db.getCompanySettings());
  }, []);

  if (!isFounder) {
    return (
      <div className="p-8 text-center space-y-4">
        <Shield className="w-12 h-12 text-black dark:text-white mx-auto" />
        <h2 className="text-xl font-bold">Founder Authorization Required</h2>
        <p className="text-xs text-neutral-500">
          Only the Founder / Super Admin (Devesh Ambekar) can configure company credentials and letterhead metadata.
        </p>
        <Link href="/" className="text-black dark:text-white underline text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    db.updateCompanySettings(settings, {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetFactoryData = () => {
    if (confirm('Are you sure you want to reset all portal records to the factory demonstration state?')) {
      db.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-black dark:text-white" />
            Company Profile & Letterhead Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure official corporate details, signatories, letterhead header & document tracking prefixes.
          </p>
        </div>

        <button
          onClick={handleResetFactoryData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 transition-all self-start sm:self-auto"
          title="Reset database to default seed state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Official Assets Showcase Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4">
          Configured Official Corporate Brand Assets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          {/* Logo */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center">
            <img
              src="/assets/drs-logo.jpg"
              alt="DRS Official Logo"
              className="w-20 h-20 object-contain rounded border border-neutral-300 p-1 bg-white mb-2"
            />
            <span className="font-bold text-black dark:text-white">Official DRS Wordmark</span>
            <span className="text-[10px] text-neutral-500 font-mono mt-0.5">/assets/drs-logo.jpg</span>
          </div>

          {/* Company Stamp */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center">
            <img
              src="/assets/drs-stamp.png"
              alt="Deep Root Studios Seal"
              className="w-20 h-20 object-contain rounded p-1 filter contrast-125 mb-2"
            />
            <span className="font-bold text-black dark:text-white">Corporate Seal & Stamp</span>
            <span className="text-[10px] text-neutral-500 font-mono mt-0.5">/assets/drs-stamp.png</span>
          </div>

          {/* Signature */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center">
            <img
              src="/assets/drs-signature.png"
              alt="Authorized Signature"
              className="h-16 w-auto object-contain filter contrast-125 mb-2 mt-2"
            />
            <span className="font-bold text-black dark:text-white">Authorized Signatory</span>
            <span className="text-[10px] text-neutral-500 font-mono mt-0.5">Maroti Kadam (Head of HR)</span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Official Corporate Identity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4" /> 1. Registered Corporate Identity
            </h2>
            <DrsLogo size="sm" variant="icon" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Company Legal Name *
              </label>
              <input
                required
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Trade Abbreviation *
              </label>
              <input
                required
                type="text"
                value={settings.abbreviation}
                onChange={(e) => setSettings({ ...settings, abbreviation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Corporate Identification Number (CIN) *
              </label>
              <input
                required
                type="text"
                value={settings.cinNumber}
                onChange={(e) => setSettings({ ...settings, cinNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Document Tracking Prefix *
              </label>
              <input
                required
                type="text"
                value={settings.documentPrefix}
                onChange={(e) => setSettings({ ...settings, documentPrefix: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Founder Full Name *
              </label>
              <input
                required
                type="text"
                value={settings.founderName}
                onChange={(e) => setSettings({ ...settings, founderName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Founder Designation *
              </label>
              <input
                required
                type="text"
                value={settings.founderTitle}
                onChange={(e) => setSettings({ ...settings, founderTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Official Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Strategic Market Positioning
              </label>
              <textarea
                rows={2}
                value={settings.positioning}
                onChange={(e) => setSettings({ ...settings, positioning: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact Information & Address */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 2. Official Communications & Registered Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                value={settings.officialEmail}
                onChange={(e) => setSettings({ ...settings, officialEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                HR Email (Maroti Kadam) *
              </label>
              <input
                type="email"
                value={settings.hrEmail}
                onChange={(e) => setSettings({ ...settings, hrEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Official Website *
              </label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Registered Office Address (Printed on Letterhead) *
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Executive Signatory Block */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4" /> 3. Authorized Executive Signatory
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Authorized Signatory Full Name *
              </label>
              <input
                type="text"
                value={settings.authorizedSignatoryName}
                onChange={(e) => setSettings({ ...settings, authorizedSignatoryName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Signatory Designation / Corporate Title *
              </label>
              <input
                type="text"
                value={settings.authorizedSignatoryTitle}
                onChange={(e) => setSettings({ ...settings, authorizedSignatoryTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Zoho Mail SMTP Configuration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4" /> 4. Zoho Mail Dispatch Configuration (SMTP)
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              Zoho Mail Powered
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Configure your official Deep Root Studios Zoho Mail credentials so official documents (Offer Letters, Certificates, Payslips) can be emailed directly to employees from the portal with authentic PDF attachments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Company Zoho Email Address *
              </label>
              <input
                type="email"
                placeholder="e.g. hr@deeprootstudios.ai or your zoho user"
                value={settings.smtpEmail || ''}
                onChange={(e) => setSettings({ ...settings, smtpEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                The sender email address matching your Zoho Mail account.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Zoho App Password *
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={settings.smtpPassword || ''}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Use an App-Specific Password if 2FA/MFA is enabled on Zoho.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Zoho SMTP Server Host
              </label>
              <select
                value={settings.smtpHost || 'smtp.zoho.in'}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
              >
                <option value="smtp.zoho.in">smtp.zoho.in (Zoho India Data Center - Recommended)</option>
                <option value="smtp.zoho.com">smtp.zoho.com (Zoho Global US/EU Data Center)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                SMTP Port (SSL/TLS)
              </label>
              <input
                type="number"
                value={settings.smtpPort || 465}
                onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 465 })}
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Port 465 (SSL secure, default for Zoho Mail).
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <p className="font-semibold text-black dark:text-white flex items-center gap-1.5">
              <span>💡</span> How to generate a Zoho App Password:
            </p>
            <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
              <li>Log in to your company Zoho account at <strong className="text-black dark:text-white">accounts.zoho.in</strong> (or zoho.com).</li>
              <li>Go to <strong className="text-black dark:text-white">Security → App Passwords</strong>.</li>
              <li>Click <strong className="text-black dark:text-white">Generate New Password</strong>, name it &quot;DRS Portal&quot;, and copy the 16-character code here.</li>
            </ol>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-semibold text-black dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Company settings updated successfully!
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black text-white dark:bg-white dark:text-black shadow-sm transition-all hover:opacity-90"
          >
            <Save className="w-4 h-4" />
            Save Company Settings
          </button>
        </div>
      </form>
    </div>
  );
}
