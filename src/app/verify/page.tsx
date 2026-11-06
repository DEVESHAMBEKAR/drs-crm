'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DrsLogo } from '@/components/brand/DrsLogo';
import { ShieldCheck, Search, ArrowRight, Lock } from 'lucide-react';

export default function PublicVerifySearchPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    router.push(`/verify/${encodeURIComponent(tokenInput.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12">
      {/* Top Brand Nav */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <DrsLogo size="md" variant="full" />
        <span className="text-xs font-mono text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded border border-teal-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          PUBLIC VERIFICATION REGISTRY
        </span>
      </div>

      {/* Main Verification Lookup Box */}
      <div className="max-w-xl w-full mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">
            Verify Official DRS Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Enter the unique verification token or document reference number printed on your Deep Root Studios document or scanned from the official QR code.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. v-drs-7821-4902-auth or DRS/OFF/2024/001"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-850 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all"
          >
            Authenticate Document <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Tamper-proof cryptographic records powered by DRS Operations</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600">
        <p>© 2026 Deep Root Studios Private Limited. All rights reserved.</p>
        <p className="text-[10px] text-slate-700 mt-1">Bangalore, Karnataka, India • U72900KA2024PTC189201</p>
      </div>
    </div>
  );
}
