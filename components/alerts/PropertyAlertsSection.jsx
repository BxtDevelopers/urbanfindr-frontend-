'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, useApp, useData } from '../providers';
import { money } from '@/lib/format';
import CreateAlertModal from './CreateAlertModal';
import AlertMatchesView from './AlertMatchesView';
import {
  Bell,
  BellRing,
  BellOff,
  Plus,
  Play,
  Pause,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building,
  Home,
  Mail,
  ShieldCheck,
  Search,
  Eye
} from 'lucide-react';

export default function PropertyAlertsSection() {
  const { toast } = useApp();
  const { data, loading, error, reload } = useData('property-alerts');
  const items = data?.items || [];

  const [activeTab, setActiveTab] = useState('all'); // all | active | paused
  const [selectedAlertForMatches, setSelectedAlertForMatches] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [alertToDelete, setAlertToDelete] = useState(null);
  const [busyId, setBusyId] = useState('');

  // Counts
  const totalCount = items.length;
  const activeCount = items.filter(a => a.status === 'active').length;
  const pausedCount = items.filter(a => a.status === 'paused').length;
  const totalMatchesCount = items.reduce((acc, a) => acc + (a.totalMatches || 0), 0);

  // Filtered items based on status tab
  const filteredItems = items.filter(item => {
    if (activeTab === 'active') return item.status === 'active';
    if (activeTab === 'paused') return item.status === 'paused';
    return true;
  });

  // Toggle Pause/Resume
  async function togglePause(alert) {
    const isPaused = alert.status === 'paused';
    const action = isPaused ? 'resume' : 'pause';
    setBusyId(alert._id);
    try {
      await api(`property-alerts/${alert._id}/${action}`, { method: 'PATCH' });
      toast(isPaused ? `Alert "${alert.name}" resumed!` : `Alert "${alert.name}" paused.`);
      reload();
    } catch (err) {
      toast(err.message || 'Failed to update alert status.');
    } finally {
      setBusyId('');
    }
  }

  // Delete Alert
  async function confirmDelete() {
    if (!alertToDelete) return;
    setBusyId(alertToDelete._id);
    try {
      await api(`property-alerts/${alertToDelete._id}`, { method: 'DELETE' });
      toast(`Alert "${alertToDelete.name}" deleted.`);
      setAlertToDelete(null);
      reload();
    } catch (err) {
      toast(err.message || 'Failed to delete alert.');
    } finally {
      setBusyId('');
    }
  }

  // If viewing matches for a specific alert
  if (selectedAlertForMatches) {
    return (
      <AlertMatchesView
        alertId={selectedAlertForMatches}
        onBack={() => setSelectedAlertForMatches(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2.5">
            <BellRing className="text-[#163e35]" size={24} />
            My Property Alerts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your saved searches and receive automatic alerts when new matching homes become available.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAlert(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#205246] transition shadow-xs self-start sm:self-auto"
        >
          <Plus size={15} />
          Create New Alert
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Total Alerts</span>
          <span className="text-xl font-bold text-stone-900 mt-0.5 block">{totalCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Active Alerts</span>
          <span className="text-xl font-bold text-emerald-800 mt-0.5 block">{activeCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Paused Alerts</span>
          <span className="text-xl font-bold text-stone-600 mt-0.5 block">{pausedCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-[#163e35] block">Total Matched Homes</span>
          <span className="text-xl font-bold text-[#163e35] mt-0.5 block">{totalMatchesCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2">
        {[
          { id: 'all', label: `All Alerts (${totalCount})` },
          { id: 'active', label: `Active (${activeCount})` },
          { id: 'paused', label: `Paused (${pausedCount})` }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[#163e35] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 bg-stone-100 rounded w-1/3" />
                <div className="h-5 bg-stone-100 rounded w-20" />
              </div>
              <div className="h-4 bg-stone-100 rounded w-2/3" />
              <div className="h-8 bg-stone-100 rounded w-1/4 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-50 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {activeTab === 'paused' ? 'No Paused Alerts' : activeTab === 'active' ? 'No Active Alerts' : 'You haven’t created any property alerts yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Save your search preferences and we will notify you automatically when new properties matching your requirements are listed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAlert(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#163e35] text-white text-xs font-bold rounded-xl hover:bg-[#205246] transition shadow-xs"
          >
            Create Your First Alert
          </button>
        </div>
      )}

      {/* Alert Cards List */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="space-y-4">
          {filteredItems.map(alert => {
            const isActive = alert.status === 'active';
            const f = alert.filters || {};
            const np = alert.notificationPreferences || {};
            const latestMatch = alert.latestMatch;

            return (
              <div
                key={alert._id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md ${
                  isActive
                    ? 'border-stone-200/90 hover:border-stone-300'
                    : 'border-stone-200 bg-stone-50/50 opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Alert Info & Criteria */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900">
                        {alert.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {/* Filter Badges Strip */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <MapPin size={12} className="text-stone-400" />
                        {f.city || 'Any City'}
                        {f.localities?.length > 0 ? ` (${f.localities.join(', ')})` : ''}
                      </span>

                      <span className="font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg uppercase">
                        {f.listingType || 'Buy / Rent'}
                      </span>

                      {f.propertyType && (
                        <span className="font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                          {f.propertyType}
                        </span>
                      )}

                      {f.bhk?.length > 0 && (
                        <span className="font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                          {f.bhk.join(', ')} BHK
                        </span>
                      )}

                      {(f.minPrice || f.maxPrice) && (
                        <span className="font-bold text-[#163e35] bg-[#ecf2e4]/70 px-2.5 py-1 rounded-lg">
                          {f.minPrice ? money(f.minPrice) : '₹0'} – {f.maxPrice ? money(f.maxPrice) : 'No Max'}
                        </span>
                      )}

                      {f.verifiedOnly && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                          <ShieldCheck size={12} /> Verified Only
                        </span>
                      )}
                    </div>

                    {/* Meta info: Dates, Preferences & Latest Match */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                      <span>Created: {new Date(alert.createdAt).toLocaleDateString('en-IN')}</span>
                      {alert.lastMatchedAt && (
                        <>
                          <span>•</span>
                          <span>Last Match: {new Date(alert.lastMatchedAt).toLocaleDateString('en-IN')}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-stone-600">
                        <Bell size={11} className="text-[#163e35]" />
                        {np.inApp !== false ? 'In-App' : ''}
                        {np.email ? (np.inApp !== false ? ' & Email' : 'Email') : ''}
                        {` (${np.frequency === 'daily' ? 'Daily Digest' : 'Instant'})`}
                      </span>
                    </div>

                    {/* Latest Matching Property Preview Chip */}
                    {latestMatch && (
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-stone-100/80 border border-stone-200 text-xs">
                          {latestMatch.images?.[0] ? (
                            <img
                              src={latestMatch.images[0]}
                              alt={latestMatch.title}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500">
                              <Home size={14} />
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] text-stone-400 block leading-tight">Latest Match</span>
                            <span className="font-semibold text-stone-800 line-clamp-1">
                              {latestMatch.title} • {money(latestMatch.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 shrink-0">
                    {/* View Matches Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedAlertForMatches(alert._id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#205246] transition shadow-xs"
                    >
                      <Eye size={13} />
                      View Matches ({alert.totalMatches || 0})
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center gap-1.5">
                      {/* Pause / Resume Button */}
                      <button
                        type="button"
                        disabled={busyId === alert._id}
                        onClick={() => togglePause(alert)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          isActive
                            ? 'border-stone-200 text-stone-600 hover:bg-stone-100'
                            : 'border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                        title={isActive ? 'Pause monitoring new properties' : 'Resume monitoring new properties'}
                      >
                        {isActive ? <Pause size={12} /> : <Play size={12} />}
                        {isActive ? 'Pause' : 'Resume'}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAlert(alert);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded-xl hover:bg-stone-50 transition"
                        title="Edit Alert Criteria"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setAlertToDelete(alert)}
                        className="p-1.5 text-stone-400 hover:text-red-600 border border-stone-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition"
                        title="Delete Alert"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Alert Modal */}
      <CreateAlertModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAlert(null);
        }}
        initialData={editingAlert || {}}
        isEditing={Boolean(editingAlert)}
        alertId={editingAlert?._id}
        onSaved={reload}
      />

      {/* Delete Confirmation Dialog */}
      {alertToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xl max-w-sm w-full space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Delete Property Alert?</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Are you sure you want to delete &ldquo;{alertToDelete.name}&rdquo;? You will no longer receive notifications for matching listings.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAlertToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === alertToDelete._id}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-xs"
              >
                {busyId === alertToDelete._id ? 'Deleting...' : 'Delete Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
