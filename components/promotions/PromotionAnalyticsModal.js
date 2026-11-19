'use client';

import { useState } from 'react';
import { useData } from '../providers';
import { X, BarChart3, Eye, MousePointerClick, MessageSquare, Phone, CalendarCheck, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { money } from '@/lib/format';
import PromotionStatusBadge from './PromotionStatusBadge';

export default function PromotionAnalyticsModal({ promotion, onClose }) {
  const [rangeDays, setRangeDays] = useState(30);
  const { data, loading, error } = useData(
    promotion ? `promotions/${promotion._id}/analytics?days=${rangeDays}` : null
  );

  if (!promotion) return null;

  const stats = data?.stats || {
    impressions: promotion.impressions || 0,
    clicks: promotion.clicks || 0,
    enquiries: promotion.enquiries || 0,
    phoneCalls: promotion.phoneCalls || 0,
    siteVisits: promotion.siteVisits || 0
  };

  const ctr = data?.ctr ?? (stats.impressions > 0 ? Math.round((stats.clicks / stats.impressions) * 1000) / 10 : 0);
  const conversionRate = data?.conversionRate ?? (stats.clicks > 0 ? Math.round((stats.enquiries / stats.clicks) * 1000) / 10 : 0);

  const expiry = promotion.expiryDate ? new Date(promotion.expiryDate) : null;
  const remainingDays = expiry ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">Campaign Analytics</h2>
                <PromotionStatusBadge status={promotion.promotionStatus} paymentStatus={promotion.paymentStatus} />
              </div>
              <p className="text-xs text-stone-500 truncate max-w-sm sm:max-w-md">
                {promotion.targetTitle || 'Promoted Listing'} · {promotion.plan}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Controls & Expiry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
            <div>
              <p className="text-xs text-stone-500 font-medium">Campaign Timeline</p>
              <p className="text-xs font-bold text-stone-800">
                {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('en-IN') : 'Pending'} →{' '}
                {expiry ? expiry.toLocaleDateString('en-IN') : '–'}{' '}
                {promotion.promotionStatus === 'active' && (
                  <span className="text-emerald-700 font-semibold ml-1">({remainingDays} days left)</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-stone-200 text-xs">
              {[7, 15, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setRangeDays(d)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    rangeDays === d ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Last {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1.5">
                <span className="text-xs font-medium">Impressions</span>
                <Eye size={16} className="text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900">{stats.impressions.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-1">Times shown in search</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1.5">
                <span className="text-xs font-medium">Listing Clicks</span>
                <MousePointerClick size={16} className="text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900">{stats.clicks.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-1">Detail page visits</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1.5">
                <span className="text-xs font-medium">Enquiries</span>
                <MessageSquare size={16} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900">{stats.enquiries.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-1">Direct buyer messages</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1.5">
                <span className="text-xs font-medium">Phone Calls</span>
                <Phone size={16} className="text-teal-500" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900">{stats.phoneCalls || 0}</p>
              <p className="text-[11px] text-stone-400 mt-1">Initiated call actions</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1.5">
                <span className="text-xs font-medium">Site Visits</span>
                <CalendarCheck size={16} className="text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900">{stats.siteVisits || 0}</p>
              <p className="text-[11px] text-stone-400 mt-1">Booked site tours</p>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 mb-1.5">
                <span className="text-xs font-medium">Click Rate (CTR)</span>
                <TrendingUp size={16} className="text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-amber-950">{ctr}%</p>
              <p className="text-[11px] text-amber-700/80 mt-1">Conversion: {conversionRate}%</p>
            </div>
          </div>

          {/* Performance Summary Banner */}
          <div className="rounded-xl p-4 bg-stone-50 border border-stone-200 flex items-start gap-3">
            <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">Verified Marketplace Performance</p>
              <p>
                Metrics are deduplicated using session and visitor identifiers to prevent artificial inflation.
                Higher search priority listings typically achieve 3x to 5x more verified direct inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex justify-end shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
