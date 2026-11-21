'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData } from '../providers';
import { propertyImages } from '@/lib/media';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Clock,
  RotateCw,
  PlusCircle,
  Eye,
  MousePointerClick,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Building2
} from 'lucide-react';
import { money } from '@/lib/format';
import PromotionStatusBadge from './PromotionStatusBadge';
import PromotionAnalyticsModal from './PromotionAnalyticsModal';

function getPromotionTargetUrl(promo, myListings = []) {
  let targetId = promo?.targetId?._id || promo?.targetId;
  if (!targetId && promo?.targetTitle && myListings.length > 0) {
    const matched = myListings.find(l => l.title?.toLowerCase() === promo.targetTitle?.toLowerCase());
    if (matched) targetId = matched._id || matched.id;
  }
  if (!targetId) return null;
  const tType = String(promo?.targetType || 'property').toLowerCase();
  if (tType.includes('project')) {
    return `/projects/${targetId}`;
  }
  if (tType.includes('service')) {
    return `/services/${targetId}`;
  }
  return `/properties/${targetId}`;
}

export default function PromotionManagementView({
  myListings = [],
  targetType = 'property',
  onPromoteNew
}) {
  const { data, loading, error, reload } = useData('promotions');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListingToPromote, setSelectedListingToPromote] = useState('');
  const [analyticsPromo, setAnalyticsPromo] = useState(null);

  const promotions = data?.items || [];

  // Summary Metrics
  const totalCount = promotions.length;
  const activeCount = promotions.filter(p => p.promotionStatus === 'active').length;
  const pendingCount = promotions.filter(p => p.promotionStatus === 'pending_approval' || p.promotionStatus === 'pending').length;
  const expiredCount = promotions.filter(p => p.promotionStatus === 'expired').length;

  const totalImpressions = promotions.reduce((acc, p) => acc + (p.impressions || 0), 0);
  const totalClicks = promotions.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalEnquiries = promotions.reduce((acc, p) => acc + (p.enquiries || 0), 0);

  // Filtered campaigns
  const filteredPromotions = promotions.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return p.promotionStatus === 'active';
    if (statusFilter === 'pending') return p.promotionStatus === 'pending_approval' || p.promotionStatus === 'pending';
    if (statusFilter === 'expired') return p.promotionStatus === 'expired';
    return true;
  });

  // Eligible listings that are approved
  const eligibleListings = myListings.filter(l => l.status === 'approved' || l.active !== false);

  function handleStartPromotion() {
    if (!selectedListingToPromote) return;
    const item = eligibleListings.find(l => String(l._id || l.id) === String(selectedListingToPromote));
    if (item && onPromoteNew) {
      onPromoteNew(item);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ── HEADER & PROMOTION LAUNCHER ── */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">Promotions & Sponsored Reach</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Live Campaigns
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Promote your approved listings to appear at the top of search results and category spotlight sections across UrbanFindr.
          </p>
        </div>

        {/* Promote Dropdown Action */}
        {eligibleListings.length > 0 && onPromoteNew && (
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedListingToPromote}
              onChange={(e) => setSelectedListingToPromote(e.target.value)}
              className="text-xs rounded-xl border border-stone-300 py-2 px-3 bg-white text-stone-800 max-w-[220px] truncate"
            >
              <option value="">Select a listing to promote…</option>
              {eligibleListings.map(item => (
                <option key={item._id || item.id} value={item._id || item.id}>
                  {item.title || item.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedListingToPromote}
              onClick={handleStartPromotion}
              className="btn !bg-amber-600 hover:!bg-amber-700 text-white !py-2 !px-4 !text-xs font-bold inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Sparkles size={14} /> Promote Now
            </button>
          </div>
        )}
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <p className="text-xs text-stone-500 font-medium">Total Campaigns</p>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{totalCount}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">All time submissions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-medium">Active Sponsored</p>
            <Sparkles size={14} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">{activeCount}</p>
          <p className="text-[11px] text-emerald-700/80 mt-0.5">Currently boosted in search</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium">Under Review</p>
            <Clock size={14} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-950 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-amber-700/80 mt-0.5">Admin approval pending</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500 font-medium">Total Engagement</p>
            <TrendingUp size={14} className="text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{totalClicks.toLocaleString()}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Clicks across {totalImpressions.toLocaleString()} views</p>
        </div>
      </div>

      {/* ── CAMPAIGNS LIST & FILTERS ── */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 text-xs">
            {[
              { id: 'all', label: 'All Campaigns' },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'expired', label: `Expired (${expiredCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => reload()}
            className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1.5"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Campaign Records Table */}
        {filteredPromotions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">No promotions found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
              {statusFilter === 'all'
                ? 'You have not promoted any listings yet. Choose an approved listing and boost its reach to buyers and clients.'
                : `No campaigns in "${statusFilter}" status.`}
            </p>
            {eligibleListings.length > 0 && onPromoteNew && (
              <button
                onClick={() => onPromoteNew(eligibleListings[0])}
                className="btn !bg-stone-900 text-white !py-2 !px-4 !text-xs font-bold inline-flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Promote Your First Listing
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Promoted Listing</th>
                  <th className="py-3 px-4">Package & Amount</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Views & Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPromotions.map(promo => {
                  const expiry = promo.expiryDate ? new Date(promo.expiryDate) : null;
                  const remainingDays = expiry ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
                  const isExpired = promo.promotionStatus === 'expired';
                  const targetUrl = getPromotionTargetUrl(promo, myListings);
                  const targetListing = myListings.find(
                    l => String(l._id || l.id) === String(promo.targetId?._id || promo.targetId) ||
                         (promo.targetTitle && l.title?.toLowerCase() === promo.targetTitle?.toLowerCase())
                  );
                  const targetImages = targetListing ? propertyImages(targetListing) : [];
                  const targetImage = targetImages[0] || targetListing?.image || null;

                  return (
                    <tr key={promo._id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Title & Type */}
                      <td className="py-3.5 px-4">
                        {targetUrl ? (
                          <Link
                            href={targetUrl}
                            className="flex items-center gap-3 group cursor-pointer"
                            title={`Open ${promo.targetTitle || 'listing'}`}
                          >
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-500 border border-stone-200 overflow-hidden group-hover:border-[#163e35] transition-colors">
                              {targetImage ? (
                                <img
                                  src={targetImage}
                                  alt={promo.targetTitle || 'Property'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <Building2 size={18} className="group-hover:text-[#163e35] transition-colors" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 group-hover:text-[#163e35] group-hover:underline truncate max-w-xs flex items-center gap-1.5">
                                <span>{promo.targetTitle || 'Listing'}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-[#163e35] transition-opacity shrink-0" />
                              </p>
                              <span className="text-[11px] text-stone-500 uppercase font-medium">
                                {promo.targetType.replace('_', ' ')}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-stone-500 border border-stone-200">
                              <Building2 size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 truncate max-w-xs">{promo.targetTitle || 'Listing'}</p>
                              <span className="text-[11px] text-stone-500 uppercase font-medium">
                                {promo.targetType.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Package & Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800">{promo.plan || 'Sponsored Boost'}</span>
                        <p className="text-stone-500 font-semibold">{money(promo.amount)}</p>
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-4">
                        <p className="text-stone-700 font-medium">
                          {promo.startDate ? new Date(promo.startDate).toLocaleDateString('en-IN') : '–'} →{' '}
                          {expiry ? expiry.toLocaleDateString('en-IN') : '–'}
                        </p>
                        {promo.promotionStatus === 'active' && (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            {remainingDays} days remaining
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <PromotionStatusBadge status={promo.promotionStatus} paymentStatus={promo.paymentStatus} />
                        {promo.rejectionReason && (
                          <p className="text-[11px] text-rose-600 mt-1 max-w-xs">{promo.rejectionReason}</p>
                        )}
                      </td>

                      {/* Views & Clicks */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-3 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">
                          <span className="text-stone-600 flex items-center gap-1 font-medium">
                            <Eye size={12} className="text-blue-500" /> {promo.impressions || 0}
                          </span>
                          <span className="text-stone-600 flex items-center gap-1 font-medium">
                            <MousePointerClick size={12} className="text-amber-500" /> {promo.clicks || 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {targetUrl && (
                            <Link
                              href={targetUrl}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 hover:text-[#163e35] hover:border-[#163e35] text-stone-600 transition-colors"
                              title="Open Property Listing"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setAnalyticsPromo(promo)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 size={15} />
                          </button>

                          {isExpired && onPromoteNew && (
                            <button
                              type="button"
                              onClick={() => {
                                const target = myListings.find(l => String(l._id || l.id) === String(promo.targetId));
                                if (target) onPromoteNew(target);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors"
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {analyticsPromo && (
        <PromotionAnalyticsModal
          promotion={analyticsPromo}
          onClose={() => setAnalyticsPromo(null)}
        />
      )}
    </div>
  );
}
