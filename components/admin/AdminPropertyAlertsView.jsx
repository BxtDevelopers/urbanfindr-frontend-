'use client';

import { useState } from 'react';
import { api, useApp, useData } from '../providers';
import { money } from '@/lib/format';
import {
  Bell,
  BellRing,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  SlidersHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Mail,
  User,
  X
} from 'lucide-react';

export default function AdminPropertyAlertsView() {
  const { toast } = useApp();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState(null);
  const [disablingAlert, setDisablingAlert] = useState(null);
  const [disableReason, setDisableReason] = useState('');
  const [busyId, setBusyId] = useState('');

  const queryUrl = `admin/property-alerts?page=${page}&limit=12${
    statusFilter !== 'all' ? `&status=${statusFilter}` : ''
  }${search ? `&q=${encodeURIComponent(search)}` : ''}`;

  const { data, loading, error, reload } = useData(queryUrl);

  const stats = data?.stats || {};
  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  async function handleToggleStatus(alert, nextStatus, reason = '') {
    setBusyId(alert._id);
    try {
      await api(`admin/property-alerts/${alert._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus, reason })
      });
      toast(`Alert status updated to ${nextStatus}.`);
      setDisablingAlert(null);
      setDisableReason('');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to update alert status.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <BellRing size={20} className="text-[#163e35]" />
            Smart Property Alerts &amp; Saved Searches
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor real-time search criteria, notification volume, delivery health, and manage abusive configurations.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Total Alerts</span>
          <span className="text-xl font-bold text-stone-900 mt-0.5 block">{stats.totalAlerts ?? '…'}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Active Alerts</span>
          <span className="text-xl font-bold text-emerald-800 mt-0.5 block">{stats.activeAlerts ?? '…'}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Paused Alerts</span>
          <span className="text-xl font-bold text-stone-600 mt-0.5 block">{stats.pausedAlerts ?? '…'}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-red-600 block">Disabled Alerts</span>
          <span className="text-xl font-bold text-red-700 mt-0.5 block">{stats.disabledAlerts ?? '…'}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#163e35] block">Notifications Sent</span>
          <span className="text-xl font-bold text-[#163e35] mt-0.5 block">{stats.totalNotificationsSent ?? '…'}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Email Failures</span>
          <span className="text-xl font-bold text-amber-800 mt-0.5 block">{stats.emailFailures ?? 0}</span>
        </div>
      </div>

      {/* Top Locations Summary */}
      {stats.topLocations?.length > 0 && (
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <MapPin size={13} className="text-[#163e35]" /> Most Alerted Cities:
          </span>
          <div className="flex flex-wrap gap-2">
            {stats.topLocations.map(loc => (
              <span key={loc.city} className="bg-white border border-stone-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-700 shadow-2xs">
                {loc.city} <strong className="text-[#163e35]">({loc.count})</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'active', label: 'Active' },
            { id: 'paused', label: 'Paused' },
            { id: 'disabled', label: 'Disabled' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-[#163e35] text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by alert name or city..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35]"
          />
        </div>
      </div>

      {/* Table of Alerts */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Alert Name</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Target Criteria</th>
                <th className="px-4 py-3">Matches</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Channels</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400 font-semibold">
                    Loading property alerts...
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                    No property alerts match your filter.
                  </td>
                </tr>
              )}

              {!loading && items.map(alert => {
                const f = alert.filters || {};
                const np = alert.notificationPreferences || {};
                const isDis = alert.status === 'disabled';

                return (
                  <tr key={alert._id} className="hover:bg-stone-50/70 transition">
                    <td className="px-4 py-3 font-bold text-stone-900">
                      <div>{alert.name}</div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        {new Date(alert.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-800">{alert.user?.name || 'User'}</div>
                      <div className="text-[10px] text-stone-400">{alert.user?.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-stone-700">
                        {f.city || 'Any City'}
                        {f.localities?.length ? ` (${f.localities.join(', ')})` : ''}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {f.listingType?.toUpperCase()} • {f.bhk?.length ? `${f.bhk.join(', ')} BHK` : 'Any BHK'} • {f.minPrice || f.maxPrice ? `${f.minPrice ? money(f.minPrice) : '₹0'} - ${f.maxPrice ? money(f.maxPrice) : 'No Max'}` : 'Any Budget'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#163e35]">
                      {alert.totalMatches || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        alert.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : alert.status === 'paused'
                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {alert.status}
                      </span>
                      {alert.adminDisabledReason && (
                        <div className="text-[10px] text-red-600 mt-0.5 line-clamp-1" title={alert.adminDisabledReason}>
                          {alert.adminDisabledReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-[11px]">
                      {np.inApp !== false && <span className="mr-1.5">📱 In-App</span>}
                      {np.email && <span>✉️ Email</span>}
                      <div className="text-[10px] text-stone-400">
                        {np.frequency === 'daily' ? 'Daily Digest' : 'Instant'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAlertForDetails(alert)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition"
                          title="View Full Criteria"
                        >
                          Details
                        </button>

                        {isDis ? (
                          <button
                            type="button"
                            disabled={busyId === alert._id}
                            onClick={() => handleToggleStatus(alert, 'active')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition"
                          >
                            Enable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDisablingAlert(alert)}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition"
                            title="Disable potentially abusive or spam alert"
                          >
                            Disable
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Showing page {page} of {pages} ({total} alerts)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-stone-200 rounded-lg text-stone-600 disabled:opacity-40 hover:bg-stone-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-stone-200 rounded-lg text-stone-600 disabled:opacity-40 hover:bg-stone-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAlertForDetails && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                Alert Configuration Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAlertForDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-xl">
                <div>
                  <span className="text-stone-400 block text-[10px]">Name</span>
                  <span className="font-bold text-stone-800">{selectedAlertForDetails.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Status</span>
                  <span className="font-bold uppercase text-stone-800">{selectedAlertForDetails.status}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">User Account</span>
                  <span className="font-semibold text-stone-800">{selectedAlertForDetails.user?.name} ({selectedAlertForDetails.user?.email})</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Created Date</span>
                  <span className="text-stone-800">{new Date(selectedAlertForDetails.createdAt).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-stone-900 block mb-1">Filters Applied:</span>
                <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedAlertForDetails.filters, null, 2)}
                </pre>
              </div>

              <div>
                <span className="font-bold text-stone-900 block mb-1">Notification Preferences:</span>
                <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedAlertForDetails.notificationPreferences, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAlertForDetails(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Abusive Alert Modal */}
      {disablingAlert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xl max-w-sm w-full space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Disable Property Alert</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Provide a reason for disabling &ldquo;{disablingAlert.name}&rdquo;. The user will be unable to resume this alert until re-enabled by admin.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Administrative Reason
              </label>
              <textarea
                rows={3}
                value={disableReason}
                onChange={e => setDisableReason(e.target.value)}
                placeholder="e.g. Abusive automated query pattern or invalid contact parameters."
                className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDisablingAlert(null);
                  setDisableReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === disablingAlert._id}
                onClick={() => handleToggleStatus(disablingAlert, 'disabled', disableReason || 'Disabled by platform administration')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-xs"
              >
                {busyId === disablingAlert._id ? 'Disabling...' : 'Confirm Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
