'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DrsLogo } from '@/components/brand/DrsLogo';
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [identity, setIdentity] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(identity, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickLogin = (userType: 'admin' | 'hr') => {
    setError('');
    setLoading(true);
    const u = userType === 'admin' ? 'admin' : 'hr';
    const p = userType === 'admin' ? 'admin123' : 'hr123';
    setIdentity(u);
    setPassword(p);

    setTimeout(() => {
      const res = login(u, p);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Login failed');
        setLoading(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-white dark:bg-black text-black dark:text-white p-4 transition-colors">
      {/* Background Subtle Grid Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <DrsLogo size="lg" variant="full" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded font-bold">
              DEEP ROOT STUDIOS • MANAGEMENT PORTAL
            </span>
            <h1 className="text-2xl font-black tracking-tight mt-3">
              Sign In to DRS Console
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              End-to-End AI Operations Partner for Data, Annotation & Automation
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Username or Official Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="admin or user@deeprootstudios.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Password
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Default: admin123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Credentials Card */}
          <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Verified Demo Access Credentials
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-black dark:text-white">Founder & Admin</span>
                  <Shield className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                </div>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">admin / admin123</p>
                <p className="text-[9px] text-neutral-400">Devesh Ambekar</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hr')}
                className="p-2.5 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-black dark:text-white">HR & Operations</span>
                  <User className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                </div>
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">hr / hr123</p>
                <p className="text-[9px] text-neutral-400">Maroti Kadam</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-neutral-500 font-mono">
            Deep Root Studios Private Limited • CIN: U72900KA2024PTC189201
          </p>
          <p className="text-[10px] text-neutral-400">
            World Trade Center, Kharadi, Pune, Maharashtra - 411014
          </p>
        </div>
      </div>
    </div>
  );
}
