'use client';

import React from 'react';
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
    <div className="pb-4 mb-6 text-black select-text" style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>
      {/* Top colored rule */}
      <div className="w-full h-[3px] bg-black mb-4" />

      {/* Header: Logo + Company Identity + Contact */}
      <div className="flex items-start justify-between gap-6">
        {/* Left: Logo + Company Name */}
        <div className="flex items-start gap-3">
          <img
            src="/assets/drs-logo.jpg"
            alt="DRS Logo"
            className="w-[56px] h-[56px] object-contain"
            style={{ filter: 'grayscale(100%) contrast(1.5)' }}
          />
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '1px', lineHeight: '1.1', color: '#000', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              DEEP ROOT STUDIOS
            </h1>
            <p style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#555', fontWeight: 600, marginTop: '2px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              PRIVATE LIMITED
            </p>
            <p style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', fontWeight: 500, marginTop: '3px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              End-to-End AI Operations Partner
            </p>
          </div>
        </div>

        {/* Right: Registered Office & Contact */}
        <div style={{ textAlign: 'right', maxWidth: '280px' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#000', letterSpacing: '0.5px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            Registered Office:
          </p>
          <p style={{ fontSize: '8.5px', color: '#444', lineHeight: '1.5', marginTop: '1px' }}>
            {settings.address}
          </p>
          <p style={{ fontSize: '8.5px', color: '#444', marginTop: '2px' }}>
            Tel: {settings.phone}
          </p>
          <p style={{ fontSize: '8.5px', color: '#444' }}>
            Email: <span style={{ color: '#000', fontWeight: 500 }}>{settings.officialEmail}</span>
          </p>
          <p style={{ fontSize: '8.5px', color: '#444' }}>
            Web: <span style={{ color: '#000', fontWeight: 500 }}>{settings.website}</span>
          </p>
          <p style={{ fontSize: '8px', color: '#666', fontFamily: 'monospace', marginTop: '3px', fontWeight: 600 }}>
            CIN: {settings.cinNumber}
          </p>
        </div>
      </div>

      {/* Thin rule separator */}
      <div className="w-full h-[1px] bg-neutral-400 mt-4 mb-3" />

      {/* Reference Line */}
      <div className="flex items-center justify-between" style={{ fontSize: '10px' }}>
        <div>
          <span style={{ color: '#666' }}>Ref No.: </span>
          <span style={{ fontWeight: 700, color: '#000', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
            {documentNumber}
          </span>
        </div>
        <div>
          <span style={{ color: '#666' }}>Date: </span>
          <span style={{ fontWeight: 600, color: '#000' }}>
            {issueDate}
          </span>
        </div>
      </div>

      {/* Document Title */}
      <div className="mt-5 mb-1 text-center">
        <h2 style={{
          fontSize: '15px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#000',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
          textDecorationThickness: '1.5px',
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}>
          {documentTitle}
        </h2>
      </div>
    </div>
  );
};
