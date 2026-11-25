'use client';

import { useState } from 'react';
import { Copy, Check, ShieldCheck, Building2, User, Briefcase, House, Wrench } from 'lucide-react';

const ROLE_INFO = {
  channel_partner: {
    label: 'Channel Partner',
    icon: Briefcase,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  broker: {
    label: 'Broker / Agent',
    icon: Briefcase,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  builder: {
    label: 'Builder',
    icon: Building2,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  service_provider: {
    label: 'Service Provider',
    icon: Wrench,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  provider: {
    label: 'Service Provider',
    icon: Wrench,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  'service-provider': {
    label: 'Service Provider',
    icon: Wrench,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
};

export default function AccountIdCard({
  accountId,
  accountType,
  holderName,
  verificationStatus = 'Verified',
  variant = 'card',
  className = ''
}) {
  const [copied, setCopied] = useState(false);

  if (!accountId) return null;

  const roleKey = accountType?.toLowerCase?.();
  const info = ROLE_INFO[roleKey] || {
    label: accountType || 'Account ID',
    icon: ShieldCheck,
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200'
  };
  const Icon = info.icon;

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(accountId);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = accountId;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy ID:', e);
    }
  };

  const getStatusBadge = () => {
    if (!verificationStatus) return null;
    const statusLower = String(verificationStatus).toLowerCase();
    if (statusLower === 'verified' || statusLower === 'approved' || statusLower === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
          Verified
        </span>
      );
    }
    if (statusLower === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Verification Pending
      </span>
    );
  };

  // Compact variant: ideal for dashboard headers or inline cards
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 bg-white border border-stone-200/90 rounded-xl px-3 py-1.5 shadow-xs ${className}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Account ID
          </span>
          <span className="font-mono text-xs font-bold text-stone-900 tracking-wide">
            {accountId}
          </span>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          title={copied ? 'Copied!' : 'Copy Account ID'}
          aria-label="Copy Account ID"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>
      </div>
    );
  }

  // Full premium Card variant
  return (
    <div
      className={`bg-white rounded-xl border border-stone-200/85 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden ${className}`}
    >
      {/* Top subtle decorative pattern */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center font-bold">
            <Icon size={14} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Your UrbanFindr Account
            </h4>
            {holderName && (
              <p className="text-xs font-bold text-stone-900 leading-tight">
                {holderName}
              </p>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Main Account ID Display */}
      <div className="space-y-0.5">
        <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5">
          <span>{info.label}</span>
          <span>·</span>
          <span>Account ID</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="font-mono text-lg sm:text-xl font-bold tracking-wider text-stone-900 select-all">
            {accountId}
          </div>

          <button
            type="button"
            onClick={copyToClipboard}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                : 'bg-stone-50 hover:bg-[#163e35] text-stone-700 hover:text-white border border-stone-200/90 shadow-2xs'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
