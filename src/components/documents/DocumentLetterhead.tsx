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
    <div className="border-b-2 border-black dark:border-white pb-5 mb-6 text-black select-text">
      {/* Top Header Grid */}
      <div className="flex items-start justify-between gap-4">
        {/* Official DRS Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/drs-logo.jpg"
            alt="Deep Root Studios Logo"
            className="w-14 h-14 object-contain rounded border border-neutral-300 p-0.5"
          />
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-xl font-black tracking-tight text-black">DEEP ROOT</span>
              <span className="text-xl font-light tracking-widest text-neutral-600">STUDIOS</span>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-700 font-semibold mt-0.5">
              End-to-End AI Operations Partner
            </p>
          </div>
        </div>

        {/* Corporate Registration & Contact Block */}
        <div className="text-right text-[10px] text-neutral-700 space-y-0.5 leading-relaxed max-w-xs font-sans">
          <p className="font-bold text-black">{settings.companyName}</p>
          <p>CIN: <span className="font-mono font-semibold">{settings.cinNumber}</span></p>
          <p>{settings.address}</p>
          <p>
            Email: <span className="text-black font-medium">{settings.officialEmail}</span> • Web: {settings.website}
          </p>
          <p>Tel: {settings.phone}</p>
        </div>
      </div>

      {/* Official Reference & Date Bar */}
      <div className="mt-4 pt-3 border-t border-neutral-300 flex items-center justify-between text-xs">
        <div>
          <span className="text-neutral-500 font-medium">Ref No: </span>
          <span className="font-mono font-bold text-black bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-300">
            {documentNumber}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 font-medium">Date of Issue: </span>
          <span className="font-semibold text-black">{issueDate}</span>
        </div>
      </div>

      {/* Official Title Banner */}
      <div className="mt-4 text-center">
        <h2 className="text-lg font-black tracking-wider text-black uppercase underline decoration-black decoration-2 underline-offset-4">
          {documentTitle}
        </h2>
      </div>
    </div>
  );
};
