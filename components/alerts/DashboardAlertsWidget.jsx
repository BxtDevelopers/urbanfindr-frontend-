'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData } from '../providers';
import { money } from '@/lib/format';
import CreateAlertModal from './CreateAlertModal';
import {
  BellRing,
  Sparkles,
  ArrowRight,
  Plus,
  Home,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DashboardAlertsWidget({ onNavigateToAlerts }) {
  const { data, loading, reload } = useData('property-alerts/stats');
  const [modalOpen, setModalOpen] = useState(false);

  const activeAlerts = data?.activeAlerts ?? 0;
  const pausedAlerts = data?.pausedAlerts ?? 0;
  const newMatches = data?.newMatches ?? 0;
  const latestMatch = data?.latestMatch;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ecf2e4] text-[#163e35] flex items-center justify-center">
            <BellRing size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 leading-tight">
              Smart Property Alerts
            </h3>
            <span className="text-[11px] text-stone-500">Live search monitoring</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#163e35] hover:text-[#205246] transition"
          title="Create New Alert"
        >
          <Plus size={14} /> New Alert
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 block">Active Alerts</span>
          <span className="text-xl font-extrabold text-[#163e35] block mt-0.5">
            {loading ? '…' : activeAlerts}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            {pausedAlerts > 0 ? `${pausedAlerts} paused` : 'All monitoring'}
          </span>
        </div>

        <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 block">Matched Homes</span>
          <span className="text-xl font-extrabold text-emerald-700 block mt-0.5">
            {loading ? '…' : newMatches}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">Across your saved alerts</span>
        </div>
      </div>

      {/* Latest Match Preview */}
      {latestMatch ? (
        <div className="bg-stone-50/60 rounded-xl p-3 border border-stone-200/70 flex items-center gap-3">
          {latestMatch.images?.[0] ? (
            <img
              src={latestMatch.images[0]}
              alt={latestMatch.title}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">
              <Home size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wide block">
              Latest Match
            </span>
            <h4 className="text-xs font-bold text-stone-900 truncate">
              {latestMatch.title}
            </h4>
            <p className="text-[11px] font-semibold text-[#163e35]">
              {money(latestMatch.price)} • {latestMatch.locality}, {latestMatch.city}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-stone-50/60 rounded-xl border border-stone-100 text-center">
          <p className="text-xs text-stone-500">
            {activeAlerts > 0 ? 'Monitoring listings for new matches' : 'No alerts active yet'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="pt-1 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNavigateToAlerts}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition"
        >
          View All Alerts <ArrowRight size={13} />
        </button>
      </div>

      <CreateAlertModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={reload}
      />
    </div>
  );
}
