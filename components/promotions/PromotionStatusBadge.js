'use client';

import { Sparkles, Clock, CheckCircle2, PauseCircle, AlertCircle, XCircle } from 'lucide-react';

export default function PromotionStatusBadge({ status, paymentStatus }) {
  const normStatus = String(status || '').toLowerCase();

  if (paymentStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} /> Payment Failed
      </span>
    );
  }

  switch (normStatus) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles size={12} className="text-emerald-600" /> Active Sponsored
        </span>
      );
    case 'pending_approval':
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} className="text-amber-600 animate-spin-slow" /> Pending Approval
        </span>
      );
    case 'paused':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
          <PauseCircle size={12} className="text-stone-500" /> Paused
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
          <AlertCircle size={12} /> Expired
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-50 text-stone-600 border border-stone-200">
          {normStatus || 'Unknown'}
        </span>
      );
  }
}
