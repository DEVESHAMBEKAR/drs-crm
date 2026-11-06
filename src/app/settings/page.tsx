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
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Founder Authorization Required</h2>
        <p className="text-xs text-slate-500">
          Only the Founder / Super Admin can configure company credentials and letterhead metadata.
        </p>
        <Link href="/" className="text-teal-500 hover:underline text-sm">
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-teal-500" />
            Company Profile & Letterhead Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure official corporate details, signatories, letterhead header & document tracking prefixes.
          </p>
        </div>

        <button
          onClick={handleResetFactoryData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all self-start sm:self-auto"
          title="Reset database to default seed state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Official Corporate Identity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Building className="w-4 h-4" /> 1. Registered Corporate Identity
            </h2>
            <DrsLogo size="sm" variant="icon" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name *
              </label>
              <input
                required
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trade Abbreviation *
              </label>
              <input
                required
                type="text"
                value={settings.abbreviation}
                onChange={(e) => setSettings({ ...settings, abbreviation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Identification Number (CIN) *
              </label>
              <input
                required
                type="text"
                value={settings.cinNumber}
                onChange={(e) => setSettings({ ...settings, cinNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Tracking Prefix *
              </label>
              <input
                required
                type="text"
                value={settings.documentPrefix}
                onChange={(e) => setSettings({ ...settings, documentPrefix: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Strategic Market Positioning
              </label>
              <textarea
                rows={2}
                value={settings.positioning}
                onChange={(e) => setSettings({ ...settings, positioning: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact Information & Address */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 2. Official Communications & Headquarters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Corporate Email *
              </label>
              <input
                type="email"
                value={settings.officialEmail}
                onChange={(e) => setSettings({ ...settings, officialEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                People Operations (HR) Email *
              </label>
              <input
                type="email"
                value={settings.hrEmail}
                onChange={(e) => setSettings({ ...settings, hrEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Website *
              </label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Office Address (Printed on Letterhead) *
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Executive Signatory Block */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 3. Authorized Executive Signatory & Seal
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Signatory Full Name *
              </label>
              <input
                type="text"
                value={settings.authorizedSignatoryName}
                onChange={(e) => setSettings({ ...settings, authorizedSignatoryName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Signatory Designation / Corporate Title *
              </label>
              <input
                type="text"
                value={settings.authorizedSignatoryTitle}
                onChange={(e) => setSettings({ ...settings, authorizedSignatoryTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Company settings updated successfully!
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Company Settings
          </button>
        </div>
      </form>
    </div>
  );
}

