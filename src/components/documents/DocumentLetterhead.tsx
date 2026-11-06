'use client';

import React from 'react';
import { DrsLogo } from '../brand/DrsLogo';
import { CompanySettings } from '@/types';
import { db } from '@/lib/db';

interface DocumentLetterheadProps {
  documentNumber: string;
  issueDate: string;
  documentTitle: string;
  settings?: CompanySettings;
}

export const DocumentLetterhead: React.FC<DocumentLetterheadProps> = ({
  documentNumber,
  issueDate,
  documentTitle,
  settings: propSettings,
}) => {
  const settings = propSettings || db.getCompanySettings();

  return (
    <div className="border-b-2 border-teal-600 pb-5 mb-6 text-slate-800">
      {/* Top Header Grid */}
      <div className="flex items-start justify-between gap-4">
        {/* DRS Logo and Identity */}
        <div>
          <DrsLogo size="lg" variant="full" />
          <p className="text-[10px] uppercase font-mono tracking-wider text-teal-800 mt-1 font-semibold">
            {settings.tagline}
          </p>
        </div>

        {/* Corporate Registration & Contact Block */}
        <div className="text-right text-[10px] text-slate-600 space-y-0.5 leading-relaxed max-w-xs font-sans">
          <p className="font-bold text-slate-900">{settings.companyName}</p>
          <p>CIN: <span className="font-mono font-semibold">{settings.cinNumber}</span></p>
          <p>{settings.address}</p>
          <p>
            Email: <span className="text-teal-700">{settings.officialEmail}</span> • Web: {settings.website}
          </p>
          <p>Tel: {settings.phone}</p>
        </div>
      </div>

      {/* Official Reference & Date Bar */}
      <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 font-medium">Ref No: </span>
          <span className="font-mono font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {documentNumber}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-medium">Date of Issue: </span>
          <span className="font-semibold text-slate-900">{issueDate}</span>
        </div>
      </div>

      {/* Official Title Banner */}
      <div className="mt-4 text-center">
        <h2 className="text-lg font-black tracking-wide text-slate-900 uppercase underline decoration-teal-600 decoration-2 underline-offset-4">
          {documentTitle}
        </h2>
      </div>
    </div>
  );
};

