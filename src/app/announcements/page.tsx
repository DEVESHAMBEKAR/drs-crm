'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Announcement, AuditLog } from '@/types';
import {
  BellRing,
  Plus,
  Shield,
  Pin,
  Clock,
  Send,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function AnnouncementsAndAuditPage() {
  const { role, isFounder, isHR, currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(db.getAnnouncements());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(db.getAuditLogs());
  const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'AUDIT'>('ANNOUNCEMENTS');

  // New Announcement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'GENERAL' | 'POLICY' | 'CELEBRATION' | 'URGENT'>('GENERAL');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    setAnnouncements(db.getAnnouncements());
    setAuditLogs(db.getAuditLogs());
  }, [role, currentUser]);

  const refreshData = () => {
    setAnnouncements(db.getAnnouncements());
    setAuditLogs(db.getAuditLogs());
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    db.createAnnouncement(
      {
        title,
        category,
        content,
        authorName: `${currentUser.fullName} (${currentUser.designation})`,
        isPinned,
      },
      { id: currentUser.id, name: currentUser.fullName, role: currentUser.role }
    );

    refreshData();
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    alert('Announcement published successfully to company feed!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-teal-500" />
            Company Feed & Operational Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official Deep Root Studios updates, organizational notices, and immutable compliance audit logs.
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post Announcement
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-4 py-3 border-b-2 transition-all ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Company Announcements ({announcements.length})
        </button>

        {isFounder && (
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Security & Compliance Audit Trail ({auditLogs.length})
          </button>
        )}
      </div>

      {/* TAB 1: ANNOUNCEMENTS FEED */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                ann.isPinned
                  ? 'border-teal-500/50 shadow-md shadow-teal-500/5'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === 'CELEBRATION'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : ann.category === 'POLICY'
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        : ann.category === 'URGENT'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-teal-500/10 text-teal-500 border border-teal-500/20'
                    }`}
                  >
                    {ann.category}
                  </span>

                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Pin className="w-3 h-3 fill-amber-500" /> Pinned
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {ann.date}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {ann.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Posted by <strong className="text-slate-700 dark:text-slate-300">{ann.authorName}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: AUDIT LOGS (FOUNDER ONLY) */}
      {activeTab === 'AUDIT' && isFounder && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Immutable Operations & Financial Audit Trail
            </h3>
            <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
              STRICT COMPLIANCE LOGGING
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold">{log.actorName}</p>
                      <span className="text-[10px] text-slate-400 uppercase">{log.actorRole}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3 px-4 max-w-md text-xs">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-[11px] text-slate-400">
                      {log.ipAddress || '103.21.144.12'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-teal-500" />
              Publish Company Announcement
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Q4 Company All-Hands & Strategy Briefing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="POLICY">Policy & Compliance</option>
                    <option value="CELEBRATION">Milestone & Celebration</option>
                    <option value="URGENT">Urgent Action</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    Pin to top of feed
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Draft announcement text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

