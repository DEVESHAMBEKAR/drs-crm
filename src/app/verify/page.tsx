'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DrsLogo } from '@/components/brand/DrsLogo';
import { ShieldCheck, Search, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PublicVerifySearchPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    router.push(`/verify/${encodeURIComponent(tokenInput.trim())}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-12 font-sans">
      {/* Top Brand Nav */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <Link href="/">
          <DrsLogo size="md" variant="full" />
        </Link>
        <span className="text-xs font-mono text-white bg-neutral-900 px-3 py-1 rounded border border-neutral-800 flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          PUBLIC CREDENTIAL REGISTRY
        </span>
      </div>

      {/* Main Verification Lookup Box */}
      <div className="max-w-xl w-full mx-auto my-12 p-8 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">
            Verify Official DRS Credentials
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Enter the unique verification token or document reference number printed on your Deep Root Studios document or scanned from the official QR code.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. v-drs-7821-4902-auth or DRS/OFF/2024/001"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-neutral-200 shadow-md flex items-center justify-center gap-2 transition-all"
          >
            Authenticate Document <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-800 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Tamper-proof cryptographic records powered by Deep Root Studios</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-500">
        <p>© 2026 Deep Root Studios Private Limited • CIN U72900KA2024PTC189201</p>
        <p className="text-[10px] text-neutral-600 mt-1">
          Founder: Devesh Ambekar • Head of HR: Maroti Kadam • Bengaluru, Karnataka, India
        </p>
      </div>
    </div>
  );
}
