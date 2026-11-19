'use client';

import { useState } from 'react';
import { useData, api, useApp } from '../providers';
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  Layers,
  Settings,
  Search,
  RotateCw,
  Plus,
  Edit2,
  Eye,
  MousePointerClick,
  MessageSquare,
  ShieldCheck,
  Building2,
  Check,
  X
} from 'lucide-react';
import { money } from '@/lib/format';
import PromotionStatusBadge from './PromotionStatusBadge';

export default function AdminPromotionManagement() {
  const { toast } = useApp();
  const [subTab, setSubTab] = useState('overview'); // overview, pending, active, rejected, expired, plans, payments
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectModalPromo, setRejectModalPromo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editPlanModal, setEditPlanModal] = useState(null); // plan object to edit, or 'new'

  // Fetch Admin Overview Metrics
  const { data: overviewData, reload: reloadOverview } = useData('admin/promotions/overview');

  // Fetch Promotions by status filter
  const promoStatusQuery =
    subTab === 'pending'
      ? 'pending'
      : subTab === 'active'
      ? 'active'
      : subTab === 'rejected'
      ? 'rejected'
      : subTab === 'expired'
      ? 'expired'
      : '';

  const {
    data: promosData,
    loading: promosLoading,
    reload: reloadPromos
  } = useData(
    ['pending', 'active', 'rejected', 'expired'].includes(subTab)
      ? `admin/promotions?status=${promoStatusQuery}&search=${encodeURIComponent(searchQuery)}`
      : null
  );

  // Fetch Plans
  const {
    data: plansData,
    loading: plansLoading,
    reload: reloadPlans
  } = useData(subTab === 'plans' ? 'promotion-plans?all=true' : null);

  // Fetch Payments Ledger
  const {
    data: paymentsData,
    loading: paymentsLoading,
    reload: reloadPayments
  } = useData(subTab === 'payments' ? 'admin/promotions/payments' : null);

  const overview = overviewData || {
    revenue: 0,
    campaigns: { total: 0, pending: 0, active: 0, rejected: 0, expired: 0 },
    metrics: { impressions: 0, clicks: 0, enquiries: 0 }
  };

  const promotionsList = promosData?.items || [];
  const plansList = plansData?.items || [];
  const paymentsList = paymentsData?.items || [];

  // Actions
  async function handleApprove(promoId) {
    setBusyId(promoId);
    try {
      await api(`admin/promotions/${promoId}/approve`, { method: 'PATCH' });
      toast('Promotion approved and activated!');
      reloadPromos();
      reloadOverview();
    } catch (err) {
      toast(err.message || 'Failed to approve promotion.');
    } finally {
      setBusyId('');
    }
  }

  async function handleRejectSubmit() {
    if (!rejectModalPromo) return;
    setBusyId(rejectModalPromo._id);
    try {
      await api(`admin/promotions/${rejectModalPromo._id}/reject`, {
        method: 'PATCH',
        body: { reason: rejectionReason || 'Does not meet promotional placement guidelines.' }
      });
      toast('Promotion rejected.');
      setRejectModalPromo(null);
      setRejectionReason('');
      reloadPromos();
      reloadOverview();
    } catch (err) {
      toast(err.message || 'Failed to reject promotion.');
    } finally {
      setBusyId('');
    }
  }

  async function handleTogglePause(promoId, isCurrentlyPaused) {
    setBusyId(promoId);
    try {
      const action = isCurrentlyPaused ? 'resume' : 'pause';
      await api(`admin/promotions/${promoId}/${action}`, { method: 'PATCH' });
      toast(`Promotion ${action}d successfully.`);
      reloadPromos();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId('');
    }
  }

  async function handleSavePlan(formData) {
    try {
      if (editPlanModal === 'new') {
        await api('admin/promotion-plans', {
          method: 'POST',
          body: formData
        });
        toast('New promotion package created successfully.');
      } else {
        await api(`admin/promotion-plans/${editPlanModal._id}`, {
          method: 'PATCH',
          body: formData
        });
        toast('Promotion package updated.');
      }
      setEditPlanModal(null);
      reloadPlans();
    } catch (err) {
      toast(err.message || 'Failed to save promotion package.');
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ── HEADER BANNER ── */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Promotions & Monetization Management
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              Revenue Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Approve sponsored listing submissions, customize package pricing, review payments ledger, and track search monetization performance.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'pending', label: `Pending (${overview.campaigns.pending || 0})` },
            { id: 'active', label: `Active (${overview.campaigns.active || 0})` },
            { id: 'rejected', label: 'Rejected' },
            { id: 'expired', label: 'Expired' },
            { id: 'plans', label: 'Packages & Pricing' },
            { id: 'payments', label: 'Payments' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                subTab === tab.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUB-TAB 1: OVERVIEW ── */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Promotion Revenue</span>
                <DollarSign size={18} className="text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">{money(overview.revenue)}</p>
              <p className="text-[11px] text-stone-400 mt-1">Verified collected transactions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">{overview.campaigns.active}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Currently ranking in search</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20">
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
                <Clock size={18} className="text-amber-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-950">{overview.campaigns.pending}</p>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting admin moderation</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
                <Eye size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {(overview.metrics.impressions || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                {(overview.metrics.clicks || 0).toLocaleString()} clicks · {(overview.metrics.enquiries || 0).toLocaleString()} enquiries
              </p>
            </div>
          </div>

          {/* Recent Payments Section */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            <h3 className="font-bold text-stone-900 text-sm mb-3">Recent Promotion Transactions</h3>
            {overview.recentPayments?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Gateway Order ID</th>
                      <th className="py-2.5 px-3">Advertiser</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Gateway Payment ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {overview.recentPayments.map(p => (
                      <tr key={p._id}>
                        <td className="py-2.5 px-3 font-mono font-medium text-stone-700">{p.gatewayOrderId}</td>
                        <td className="py-2.5 px-3 font-medium text-stone-900">{p.userId?.name || p.userId?.email || 'Advertiser'}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">{money(p.amount)}</td>
                        <td className="py-2.5 px-3 font-mono text-stone-500">{p.gatewayPaymentId || '–'}</td>
                        <td className="py-2.5 px-3 text-stone-500">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {p.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-6 text-center">No payment transactions recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TABS: PENDING, ACTIVE, REJECTED, EXPIRED ── */}
      {['pending', 'active', 'rejected', 'expired'].includes(subTab) && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50">
            <div className="relative min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by listing name or package…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-stone-300 pl-8 pr-3 py-1.5 bg-white text-stone-800"
              />
            </div>

            <button
              onClick={() => reloadPromos()}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1.5"
            >
              <RotateCw size={13} className={promosLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {/* Table */}
          {promotionsList.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-semibold text-stone-600">No {subTab} promotions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Listing & Type</th>
                    <th className="py-3 px-4">Advertiser Info</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Payment & Amount</th>
                    <th className="py-3 px-4">Status & Validity</th>
                    <th className="py-3 px-4 text-center">Analytics</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {promotionsList.map(promo => {
                    const isBusy = busyId === promo._id;
                    const expiry = promo.expiryDate ? new Date(promo.expiryDate) : null;
                    const remainingDays = expiry ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

                    return (
                      <tr key={promo._id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Title & Type */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-stone-900 truncate max-w-xs">{promo.targetTitle || 'Listing'}</p>
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                            {promo.targetType.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Advertiser */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-stone-900">{promo.userId?.name || 'User'}</p>
                          <p className="text-stone-500 text-[11px]">{promo.userId?.email}</p>
                          <span className="text-[10px] text-stone-400 capitalize">{promo.userId?.role}</span>
                        </td>

                        {/* Package */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-900">{promo.plan || 'Sponsored Boost'}</span>
                          <p className="text-stone-500 text-[11px]">{promo.days || 7} Days Duration</p>
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-stone-900">{money(promo.amount)}</span>
                          <p className="text-[10px] font-mono text-stone-400">{promo.paymentId?.gatewayOrderId || 'Gateway Verified'}</p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <PromotionStatusBadge status={promo.promotionStatus} paymentStatus={promo.paymentStatus} />
                          {promo.promotionStatus === 'active' && (
                            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                              {remainingDays} days left
                            </p>
                          )}
                          {promo.rejectionReason && (
                            <p className="text-[11px] text-rose-600 mt-1 max-w-xs truncate">{promo.rejectionReason}</p>
                          )}
                        </td>

                        {/* Views & Clicks */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-stone-700 font-semibold">{promo.impressions || 0} views</span>
                          <span className="text-stone-400 block text-[11px]">{promo.clicks || 0} clicks</span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Pending State Actions: Approve or Reject */}
                            {(promo.promotionStatus === 'pending_approval' || promo.approvalStatus === 'pending') && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleApprove(promo._id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs disabled:opacity-50"
                                >
                                  <Check size={12} className="stroke-[3]" /> Approve
                                </button>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => setRejectModalPromo(promo)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1 disabled:opacity-50"
                                >
                                  <X size={12} className="stroke-[3]" /> Reject
                                </button>
                              </>
                            )}

                            {/* Active State Actions: Pause or Resume */}
                            {promo.promotionStatus === 'active' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleTogglePause(promo._id, false)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs inline-flex items-center gap-1"
                              >
                                <PauseCircle size={13} /> Pause
                              </button>
                            )}

                            {promo.promotionStatus === 'paused' && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleTogglePause(promo._id, true)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1"
                              >
                                <PlayCircle size={13} /> Resume
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
      )}

      {/* ── SUB-TAB 6: PACKAGES & PRICING CONFIGURATION ── */}
      {subTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-600 font-medium">
              Configure marketplace promotion tiers, durations, priorities, and prices without modifying source code.
            </p>
            <button
              onClick={() => setEditPlanModal('new')}
              className="btn !bg-stone-900 text-white !py-2 !px-4 !text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} /> Add New Package
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plansList.map(plan => (
              <div key={plan._id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-extrabold text-stone-900 text-base">{plan.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plan.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-extrabold text-stone-900">{money(plan.price)}</span>
                    <span className="text-xs text-stone-500"> / {plan.duration} days</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs mb-3 space-y-1">
                    <p className="text-stone-700">
                      <strong>Priority Weight:</strong> {plan.priority}/100
                    </p>
                    <p className="text-stone-500 text-[11px] line-clamp-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-1.5 mb-4 text-xs text-stone-600">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setEditPlanModal(plan)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Edit2 size={13} /> Edit Package Settings
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 7: PAYMENTS LEDGER ── */}
      {subTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200/80 bg-stone-50/50 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">Full Gateway Transactions Ledger</h3>
            <button
              onClick={() => reloadPayments()}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1.5"
            >
              <RotateCw size={13} className={paymentsLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {paymentsList.length === 0 ? (
            <p className="text-xs text-stone-400 py-12 text-center">No payment transactions recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Gateway Order ID</th>
                    <th className="py-3 px-4">Gateway Payment ID</th>
                    <th className="py-3 px-4">Advertiser</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Signature Verified</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paymentsList.map(pay => (
                    <tr key={pay._id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-stone-800">{pay.gatewayOrderId}</td>
                      <td className="py-3 px-4 font-mono text-stone-500">{pay.gatewayPaymentId || '–'}</td>
                      <td className="py-3 px-4 font-medium text-stone-900">{pay.userId?.name || pay.userId?.email || 'Advertiser'}</td>
                      <td className="py-3 px-4 font-extrabold text-stone-900">{money(pay.amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pay.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          pay.signatureVerified ? 'text-emerald-700' : 'text-stone-400'
                        }`}>
                          {pay.signatureVerified ? <CheckCircle2 size={12} /> : null}
                          {pay.signatureVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500">{new Date(pay.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: REJECT PROMOTION REASON ── */}
      {rejectModalPromo && (
        <div className="fixed inset-0 z-[99999] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-base mb-1">Reject Promotion Request</h3>
            <p className="text-xs text-stone-500 mb-4">
              Specify the reason why &quot;{rejectModalPromo.targetTitle}&quot; does not qualify for promotional placement.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Incomplete property photos, incorrect pricing, or RERA verification mismatch…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-300 p-3 bg-stone-50 text-stone-900 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalPromo(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="btn !bg-rose-600 hover:!bg-rose-700 text-white !py-2 !px-4 !text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT / CREATE PLAN ── */}
      {editPlanModal && (
        <PlanEditorModal
          plan={editPlanModal === 'new' ? null : editPlanModal}
          onClose={() => setEditPlanModal(null)}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
}

// Plan Editor Modal
function PlanEditorModal({ plan, onClose, onSave }) {
  const isNew = !plan;
  const [name, setName] = useState(plan?.name || '');
  const [slug, setSlug] = useState(plan?.slug || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [price, setPrice] = useState(plan?.price ?? 999);
  const [duration, setDuration] = useState(plan?.duration ?? 15);
  const [priority, setPriority] = useState(plan?.priority ?? 60);
  const [features, setFeatures] = useState((plan?.features || []).join('\n'));
  const [isActive, setIsActive] = useState(plan?.isActive !== false);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      price: Number(price),
      duration: Number(duration),
      priority: Number(priority),
      features: features.split('\n').map(s => s.trim()).filter(Boolean),
      isActive
    });
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-stone-900 text-base mb-1">
          {isNew ? 'Create Promotion Package' : `Edit Package: ${plan.name}`}
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          All changes take effect immediately across all user dashboards and ranking algorithms.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Package Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Slug</label>
              <input
                type="text"
                required
                disabled={!isNew}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 font-mono disabled:bg-stone-100"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Price (₹ INR)</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Priority Weight (1 - 100)</label>
              <input
                type="number"
                required
                min={1}
                max={100}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Features (One per line)</label>
            <textarea
              rows={3}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Priority search placement&#10;Sponsored badge&#10;Detailed analytics"
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700 pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Active & Available for Purchase</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn !bg-stone-900 text-white !py-2 !px-5 font-bold"
            >
              Save Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
