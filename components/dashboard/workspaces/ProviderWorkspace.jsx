'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { serviceCategories } from '@/lib/serviceCategories';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import AnalyticsChart from '../shared/AnalyticsChart';
import PromotionModal from '../shared/PromotionModal';
import { InvoiceAndDetailsModal } from '../../bookings-tracker';
import {
  Wrench,
  Building2,
  ClipboardList,
  Calendar,
  FileText,
  Users,
  Star,
  CreditCard,
  Sparkles,
  Settings,
  Plus,
  ArrowUpRight,
  Phone,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Check,
  X,
  ExternalLink,
  Edit,
  Trash2,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  MessageCircle
} from 'lucide-react';

export default function ProviderWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData } = useData('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignTechRequest, setAssignTechRequest] = useState(null);
  const [promotionTarget, setPromotionTarget] = useState(null);

  const stats = dashData?.provider || {
    services: 0,
    requests: 0,
    activeBookings: 0,
    completedJobs: 0,
    technicians: 0,
    earnings: 0,
    rating: '4.9'
  };

  if (section === 'business-profile') {
    return <ProviderBusinessProfileSection />;
  }
  if (section === 'services') {
    return <ProviderServicesSection onPromote={(svc) => setPromotionTarget(svc)} />;
  }
  if (section === 'requests' || section === 'bookings') {
    return (
      <ProviderRequestsSection
        onReviewRequest={(req) => setSelectedRequest(req)}
      />
    );
  }
  if (section === 'technicians') {
    return <ProviderTechniciansSection />;
  }
  if (section === 'reviews') {
    return <ProviderReviewsSection rating={stats.rating} />;
  }
  if (section === 'promotions') {
    return <ProviderPromotionsSection onPromote={(svc) => setPromotionTarget(svc)} />;
  }
  if (section === 'profile') {
    return <ProviderSettingsSection />;
  }

  // Default: Overview
  return (
    <div className="space-y-8">
      {/* Review & Offer Modal */}
      {selectedRequest && (
        <ProviderReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={() => reloadDash && reloadDash()}
        />
      )}

      {/* Assign Technician Modal */}
      {assignTechRequest && (
        <AssignTechnicianModal
          request={assignTechRequest}
          onClose={() => setAssignTechRequest(null)}
        />
      )}

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={Boolean(promotionTarget)}
        onClose={() => setPromotionTarget(null)}
        target={promotionTarget}
        targetType="service"
        onPromoted={() => toast('Service promoted successfully!')}
      />

      {/* Header welcome banner */}
      <div className="bg-gradient-to-r from-[#163e35] via-[#1c4a40] to-[#24564a] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#d8edb3] font-bold text-xs uppercase tracking-wider">
            <Wrench size={14} /> Service Professional Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {user?.company || user?.name || 'Service Partner'}
          </h2>
          <p className="text-xs sm:text-sm text-[#ecf2e4]/90 leading-relaxed">
            Manage your service catalogue, dispatch field technicians, and track completed jobs with verified customer reviews.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onSelectSection('requests')}
            className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ClipboardList size={15} /> Incoming Requests ({stats.requests})
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('services')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
          >
            Manage Services ({stats.services})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Services"
          value={stats.services}
          subtitle="Catalog offerings"
          icon={Wrench}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('services')}
        />
        <StatCard
          title="New Requests"
          value={stats.requests}
          subtitle="Awaiting dispatch"
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('requests')}
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeBookings}
          subtitle="Scheduled &amp; in-progress"
          icon={Calendar}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('bookings')}
        />
        <StatCard
          title="Client Rating"
          value={`★ ${stats.rating || '5.0'}`}
          subtitle="Verified feedback"
          icon={Star}
          color="#749546"
          bgIcon="#ecf2e4"
          onClick={() => onSelectSection('reviews')}
        />
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart
        title="Service Requests &amp; Job Completions"
        subtitle="Weekly demand flow for your service category"
        dataKeys={[
          { key: 'views', name: 'Views', color: '#163e35' },
          { key: 'enquiries', name: 'Requests', color: '#749546' },
          { key: 'visits', name: 'Completed', color: '#24564a' }
        ]}
      />

      {/* Incoming Requests Quick View */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Incoming Service Requests</h3>
            <p className="text-xs text-stone-500">Customer requests matching your business category</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('requests')}
            className="text-xs font-bold text-[#163e35] hover:text-[#749546] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <ProviderRecentRequestsList
          onOpenQuote={(req) => setQuoteModalRequest(req)}
          onOpenDetails={(req) => setSelectedRequest(req)}
        />
      </div>
    </div>
  );
}

// Sub-component: Recent Requests List
function ProviderRecentRequestsList({ onOpenQuote, onOpenDetails }) {
  const { user, toast } = useApp();
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data, loading, reload } = useData(`service-requests?limit=10${categoryParam}`);
  const [completingId, setCompletingId] = useState(null);

  async function handleMarkCompleted(item) {
    setCompletingId(item._id);
    try {
      await api(`service-requests/${item._id || item.requestId}`, {
        method: 'PATCH',
        body: { action: 'complete' }
      });
      toast('Service marked as completed!');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to complete service.');
    } finally {
      setCompletingId(null);
    }
  }

  // Strictly exclude Danish's customer bookings
  const items = useMemo(() => {
    const raw = data?.items || [];
    if (!user) return [];
    const uId = String(user._id);
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    return raw.filter((i) => {
      if (i.user && String(i.user._id || i.user) === uId) return false;
      if (uEmail && i.email && String(i.email).toLowerCase().trim() === uEmail) return false;
      return true;
    });
  }, [data?.items, user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading incoming requests…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <ClipboardList size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No new incoming requests right now.</p>
        <p className="text-[11px] text-stone-400">
          Make sure your service profile and categories are up to date!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.slice(0, 4).map((item) => (
        <div key={item._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 truncate">{item.serviceType}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              Client: {item.name} • {item.city} • Contact pref: {item.contactPreference || 'Call'}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {item.status === 'accepted' ? (
              <button
                type="button"
                onClick={() => handleMarkCompleted(item)}
                disabled={completingId === item._id}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 size={12} />
                <span>{completingId === item._id ? 'Completing…' : 'Mark Completed'}</span>
              </button>
            ) : item.status === 'completed' || item.status === 'closed' ? (
              <span className="px-2.5 py-1 bg-[#ecf2e4] text-[#163e35] text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Completed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onOpenDetails(item)}
                className="px-3 py-1 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                Review &amp; Offer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Section: My Services
function ProviderServicesSection({ onPromote }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('provider-services');
  const items = data?.items || [];
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [busy, setBusy] = useState('');

  async function toggleServiceActive(id, currentActive) {
    setBusy(id);
    try {
      await api(`provider-services/${id}`, {
        method: 'PATCH',
        body: { active: !currentActive }
      });
      toast(`Service ${!currentActive ? 'activated' : 'paused'}.`);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  async function deleteService(id) {
    if (!window.confirm('Delete this service offering?')) return;
    setBusy(id);
    try {
      await api(`provider-services/${id}`, { method: 'DELETE' });
      toast('Service deleted.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Service Offering',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.title}</span>
          <span className="text-[11px] text-stone-400 block truncate">{row.category}</span>
        </div>
      )
    },
    {
      header: 'Pricing Model',
      render: (row) => (
        <div>
          <span className="font-extrabold text-stone-900 block">
            {row.pricingType === 'fixed' ? money(row.startingPrice) : `From ${money(row.startingPrice)}`}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {row.pricingType === 'fixed' ? 'Fixed Price' : 'Standard Rate'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.active ? 'active' : 'paused'} />
    },
    {
      header: 'Coverage',
      render: (row) => (
        <span className="text-xs text-stone-600 truncate block max-w-xs">
          {row.coverageCities?.join(', ') || 'Bengaluru'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy === row._id}
            onClick={() => toggleServiceActive(row._id, row.active)}
            className="text-xs font-semibold text-stone-700 hover:text-stone-900"
          >
            {row.active ? 'Pause' : 'Activate'}
          </button>
          <button
            type="button"
            disabled={busy === row._id}
            onClick={() => deleteService(row._id)}
            className="p-1 text-stone-400 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {addModalOpen && (
        <AddServiceModal
          isOpen={addModalOpen}
          onClose={() => {
            setAddModalOpen(false);
            reload();
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Service Offerings</h2>
          <p className="text-xs text-stone-500">Configure door-to-door packages, standard rates, and coverage areas</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <Plus size={15} /> Add New Service
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Search services by title or category…"
        emptyTitle="No services listed yet"
        emptySubtitle="Add your services to start receiving direct booking inquiries from homeowners."
      />
    </div>
  );
}

// Modal: Add Service
function AddServiceModal({ isOpen, onClose }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);

  const providerServices = serviceCategories.filter((c) => c.slug !== 'properties');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        title: form.get('title'),
        category: form.get('category'),
        pricingType: form.get('pricingType'),
        startingPrice: Number(form.get('startingPrice')),
        duration: form.get('duration') || '60 mins',
        warranty: form.get('warranty') || '30-Day Service Guarantee',
        description: form.get('description') || '',
        coverageCities: ['Bengaluru', 'Mumbai', 'Pune']
      };

      await api('provider-services', {
        method: 'POST',
        body: data
      });

      toast('Service added to your catalogue!');
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to add service.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Add Service Offering</h2>
              <p className="text-xs text-stone-500">Publish a new doorstep service or package</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Service Title *</label>
            <input
              name="title"
              required
              placeholder="e.g. Complete 2BHK Modular Kitchen Execution"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category *</label>
              <select
                name="category"
                required
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              >
                {providerServices.map((cat) => (
                  <option key={cat.slug} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pricing Model *</label>
              <select
                name="pricingType"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              >
                <option value="quote">Custom Estimate</option>
                <option value="fixed">Fixed Price</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Starting Price (₹) *</label>
              <input
                name="startingPrice"
                type="number"
                required
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Job Duration</label>
              <input
                name="duration"
                defaultValue="90 mins"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Warranty Term</label>
              <input
                name="warranty"
                defaultValue="30-Day Guarantee"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Scope of Work &amp; Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe materials included, diagnostic checks, and work steps…"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {busy ? 'Saving…' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Section: Service Requests
function ProviderRequestsSection({ onReviewRequest }) {
  const { user, toast } = useApp();
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data, loading, reload } = useData(`service-requests?limit=100&as=provider${categoryParam}`);
  const [completingId, setCompletingId] = useState(null);

  async function handleMarkCompleted(row) {
    setCompletingId(row._id);
    try {
      await api(`service-requests/${row._id || row.requestId}`, {
        method: 'PATCH',
        body: { action: 'complete' }
      });
      toast('Service marked as completed!');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to complete service.');
    } finally {
      setCompletingId(null);
    }
  }

  // Strictly exclude customer's own personal bookings
  const items = useMemo(() => {
    const raw = data?.items || [];
    if (!user) return [];
    const uId = String(user._id);
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    return raw.filter((i) => {
      if (i.user && String(i.user._id || i.user) === uId) return false;
      if (uEmail && i.email && String(i.email).toLowerCase().trim() === uEmail) return false;
      return true;
    });
  }, [data?.items, user]);

  const columns = [
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.name}</span>
          <span className="text-[11px] text-stone-500 block truncate flex items-center gap-1">
            <Phone size={11} /> {row.phone}
          </span>
        </div>
      )
    },
    {
      header: 'Requested Service',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-800 block truncate">{row.serviceType}</span>
          <span className="text-[11px] text-stone-400 block truncate">{row.city} • {row.locality || 'Doorstep'}</span>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecf2e4] text-[#163e35]">
          {row.category || user?.serviceCategory || 'Service'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const cleanP = String(row.phone || '').replace(/\D/g, '');
        const isAccepted = row.status === 'accepted';
        const isCompleted = row.status === 'completed' || row.status === 'closed';

        return (
          <div className="flex items-center gap-1.5">
            {isAccepted ? (
              <button
                type="button"
                onClick={() => handleMarkCompleted(row)}
                disabled={completingId === row._id}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>{completingId === row._id ? 'Completing…' : 'Mark Completed'}</span>
              </button>
            ) : isCompleted ? (
              <span className="px-2.5 py-1 bg-[#ecf2e4] text-[#163e35] text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Completed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onReviewRequest(row)}
                className="px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Review &amp; Offer</span>
              </button>
            )}
            {cleanP && (
              <>
                <a
                  href={`tel:${cleanP}`}
                  title={`Call ${row.phone}`}
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                >
                  <Phone size={13} />
                </a>
                <a
                  href={`https://wa.me/91${cleanP}?text=Hello%20${encodeURIComponent(row.name)},%20this%20is%20regarding%20your%20${encodeURIComponent(row.serviceType)}%20request%20on%20UrbanFindr.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="p-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg transition-colors"
                >
                  <MessageCircle size={13} />
                </a>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Incoming Client Requests</h2>
          <p className="text-xs text-stone-500">
            Inquiries specifically for {user?.serviceCategory ? user.serviceCategory.replace(/-/g, ' ') : 'your specialized category'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => reload()}
          className="text-xs font-bold text-[#163e35] hover:text-[#749546]"
        >
          Refresh Requests
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No client requests pending"
        emptySubtitle="New customer requests in your service category will appear here immediately."
      />
    </div>
  );
}

// Modal: Review Request, Call/Chat & Send Offer
function ProviderReviewModal({ request, onClose, onUpdated }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [offerFee, setOfferFee] = useState(request.offer?.amount || 1500);
  const [offerTitle, setOfferTitle] = useState(request.offer?.title || `${request.serviceType} Consultation & Service`);
  const [offerNotes, setOfferNotes] = useState(request.offer?.notes || 'Reviewed your requirement. Ready to assist.');

  const cleanPhone = String(request.phone || '').replace(/\D/g, '');

  async function handleSendOffer(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`service-requests/${request._id || request.requestId}`, {
        method: 'PATCH',
        body: {
          action: 'offer',
          amount: Number(offerFee),
          title: offerTitle,
          notes: offerNotes
        }
      });
      toast('Direct offer sent to customer!');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to send offer.');
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    setBusy(true);
    try {
      await api(`service-requests/${request._id || request.requestId}`, {
        method: 'PATCH',
        body: { action: 'complete' }
      });
      toast('Service marked as completed!');
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to complete service.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#749546]">
              {request.category} • {request.requestId}
            </span>
            <h2 className="text-lg font-extrabold text-stone-900">{request.serviceType}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Profile Card */}
          <div className="p-4 bg-[#f7f8f3] rounded-xl border border-[#e6e8e1] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-stone-900 text-sm block">{request.name}</span>
                <span className="text-xs text-stone-500 block">{request.locality ? `${request.locality}, ` : ''}{request.city}</span>
              </div>
              <StatusBadge status={request.status} />
            </div>

            {/* Direct Communication Bar */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Phone size={13} />
                <span>Call {request.phone}</span>
              </a>
              <a
                href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(request.name)},%20this%20is%20regarding%20your%20${encodeURIComponent(request.serviceType)}%20request%20on%20UrbanFindr.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <MessageCircle size={13} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Customer Inquiry Details */}
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-stone-500 block">Customer's Requirement:</span>
            <p className="p-3 bg-stone-50 rounded-lg text-stone-700 leading-relaxed border border-stone-200/60">
              {request.customerMessage || request.description || 'Customer submitted direct service inquiry.'}
            </p>
          </div>

          {/* Send Offer or Status Action */}
          {request.status === 'accepted' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 size={16} />
                <span>Customer Accepted Your Offer!</span>
              </div>
              <p className="text-xs text-emerald-700">
                You can coordinate directly with the customer via call or chat. Once work is finished, mark as complete.
              </p>
              <button
                type="button"
                onClick={handleComplete}
                disabled={busy}
                className="w-full py-2 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all"
              >
                {busy ? 'Completing…' : 'Mark Service Completed'}
              </button>
            </div>
          ) : request.status === 'completed' ? (
            <div className="p-4 bg-[#ecf2e4] text-[#163e35] font-bold text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Service successfully completed.</span>
            </div>
          ) : request.status === 'rejected' || request.status === 'declined' ? (
            <div className="p-4 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl">
              Customer declined this offer.
            </div>
          ) : (
            <form onSubmit={handleSendOffer} className="space-y-3 pt-2 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-900 block">
                {request.status === 'contacted' ? 'Update Offer to Customer' : 'Send Direct Offer to Customer'}
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#163e35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Consultation / Service Fee (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={offerFee}
                  onChange={(e) => setOfferFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#163e35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Scope &amp; Availability Note</label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#163e35]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all"
                >
                  {busy ? 'Sending…' : 'Send Offer to Customer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Section: Bookings
function ProviderBookingsSection({ onOpenDetails, onAssignTech }) {
  const { user } = useApp();
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data, loading } = useData(`service-requests?limit=100${categoryParam}`);

  // Strictly exclude Danish's customer bookings
  const items = useMemo(() => {
    const raw = data?.items || [];
    if (!user) return [];
    const uId = String(user._id);
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    return raw.filter((i) => {
      if (i.user && String(i.user._id || i.user) === uId) return false;
      if (uEmail && i.email && String(i.email).toLowerCase().trim() === uEmail) return false;
      return true;
    });
  }, [data?.items, user]);

  const columns = [
    {
      header: 'Booking Ref / Service',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-stone-700 block">{row.requestId}</span>
          <span className="font-bold text-stone-900 block truncate">{row.serviceType}</span>
        </div>
      )
    },
    {
      header: 'Client & Address',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-stone-800 block">{row.name}</span>
          <span className="text-stone-400 block truncate">{row.locality || row.address}, {row.city}</span>
        </div>
      )
    },
    {
      header: 'Assigned Tech',
      render: (row) => (
        <div>
          {row.technician?.name ? (
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <User size={12} className="text-[#163e35]" />
              {row.technician.name}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onAssignTech(row)}
              className="text-xs font-bold text-[#163e35] hover:underline"
            >
              + Assign Tech
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenDetails(row)}
            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
          >
            Manage
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Job Bookings Lifecycle</h2>
        <p className="text-xs text-stone-500">Track jobs across Requested, Quoted, Accepted, Scheduled, In Progress, and Completed</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No active bookings found"
        emptySubtitle="Customer confirmed bookings will be tracked here through completion."
      />
    </div>
  );
}

// Section: Technicians
function ProviderTechniciansSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('technicians');
  const items = data?.items || [];
  const [addTechOpen, setAddTechOpen] = useState(false);
  const [busy, setBusy] = useState('');

  async function deleteTech(id) {
    if (!window.confirm('Delete this technician profile?')) return;
    setBusy(id);
    try {
      await api(`technicians/${id}`, { method: 'DELETE' });
      toast('Technician removed.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Technician Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] font-bold text-xs flex items-center justify-center shrink-0">
            {row.name ? row.name[0] : 'T'}
          </div>
          <div>
            <span className="font-bold text-stone-900 block truncate">{row.name}</span>
            <span className="text-[11px] text-stone-400 block truncate">{row.role}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Direct Phone',
      render: (row) => <span className="font-semibold text-stone-800 text-xs">{row.phone}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status === 'available' ? 'active' : 'paused'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          disabled={busy === row._id}
          onClick={() => deleteTech(row._id)}
          className="p-1 text-stone-400 hover:text-rose-600"
        >
          <Trash2 size={14} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {addTechOpen && (
        <AddTechnicianModal
          isOpen={addTechOpen}
          onClose={() => {
            setAddTechOpen(false);
            reload();
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Technicians &amp; Field Staff</h2>
          <p className="text-xs text-stone-500">Manage field specialists, assign job bookings, and track service dispatch</p>
        </div>
        <button
          type="button"
          onClick={() => setAddTechOpen(true)}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <Plus size={15} /> Add Technician
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No technicians added yet"
        emptySubtitle="Individual providers can also service jobs directly without additional staff."
      />
    </div>
  );
}

// Modal: Add Technician
function AddTechnicianModal({ isOpen, onClose }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      await api('technicians', {
        method: 'POST',
        body: {
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email'),
          role: form.get('role') || 'Service Specialist'
        }
      });
      toast('Technician profile added.');
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to add technician.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Add Field Specialist</h2>
              <p className="text-xs text-stone-500">Register technician for job assignments</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Technician Name *</label>
            <input
              name="name"
              required
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Phone *</label>
            <input
              name="phone"
              required
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Role / Designation</label>
            <input
              name="role"
              defaultValue="Senior Technician"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {busy ? 'Saving…' : 'Add Technician'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal: Assign Technician
function AssignTechnicianModal({ request, onClose }) {
  const { toast } = useApp();
  const { data: techData } = useData('technicians');
  const technicians = techData?.items || [];
  const [busy, setBusy] = useState(false);

  async function handleAssign(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const techName = form.get('techName');
      const techPhone = form.get('techPhone');

      await api(`service-requests/${request._id || request.requestId}`, {
        method: 'PATCH',
        body: {
          action: 'assign-technician',
          name: techName,
          phone: techPhone
        }
      });

      toast(`Assigned ${techName} to ${request.requestId}.`);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to assign technician.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Assign Technician</h2>
            <p className="text-xs text-stone-500">{request.serviceType} • {request.requestId}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Technician Name *</label>
            <input
              name="techName"
              required
              defaultValue={technicians[0]?.name || ''}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Technician Phone *</label>
            <input
              name="techPhone"
              required
              defaultValue={technicians[0]?.phone || ''}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 text-xs font-semibold text-stone-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {busy ? 'Assigning…' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Section: Schedule
function ProviderScheduleSection({ onOpenDetails }) {
  const { user } = useApp();
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data } = useData(`service-requests?limit=50${categoryParam}`);

  // Strictly exclude Danish's customer bookings
  const items = useMemo(() => {
    const raw = data?.items || [];
    if (!user) return [];
    const uId = String(user._id);
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    return raw.filter((i) => {
      if (i.user && String(i.user._id || i.user) === uId) return false;
      if (uEmail && i.email && String(i.email).toLowerCase().trim() === uEmail) return false;
      return true;
    });
  }, [data?.items, user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Job Calendar &amp; Schedule</h2>
        <p className="text-xs text-stone-500">Upcoming appointments and field technician assignments</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <Calendar size={24} className="mx-auto text-stone-300 mb-2" />
            No scheduled appointments found.
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900">{item.serviceType}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-stone-500">
                  Client: {item.name} • Slot: {item.preferredDate || 'Date set'} ({item.preferredTimeSlot || 'Standard'})
                </p>
                <p className="text-[11px] text-stone-400 flex items-center gap-1">
                  <MapPin size={11} /> {item.locality || item.address}, {item.city}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenDetails(item)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 self-start sm:self-auto"
              >
                View Job Sheet
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Section: Reviews
function ProviderReviewsSection({ rating }) {
  const { user } = useApp();
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data } = useData(`service-requests?limit=50${categoryParam}`);

  // Strictly exclude Danish's customer bookings
  const reviews = useMemo(() => {
    const raw = data?.items || [];
    if (!user) return [];
    const uId = String(user._id);
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    return raw
      .filter((i) => {
        if (i.user && String(i.user._id || i.user) === uId) return false;
        if (uEmail && i.email && String(i.email).toLowerCase().trim() === uEmail) return false;
        return Boolean(i.review?.rating);
      })
      .map((i) => ({
        ...i.review,
        client: i.name,
        service: i.serviceType,
        date: i.review?.reviewedAt || i.updatedAt
      }));
  }, [data?.items, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Customer Ratings &amp; Reviews</h2>
          <p className="text-xs text-stone-500">Verified feedback submitted by clients on completed bookings</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
          <Star size={16} className="text-amber-600 fill-amber-500" />
          <span className="font-extrabold text-stone-900 text-sm">{rating}</span>
          <span className="text-xs text-stone-500">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-xs">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <Star size={24} className="mx-auto text-stone-300 mb-2" />
            No customer reviews posted yet. Completed jobs will receive ratings here.
          </div>
        ) : (
          reviews.map((rev, idx) => (
            <div key={idx} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">{rev.client}</span>
                <span className="text-[11px] text-stone-400">{date(rev.date)}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-stone-600 italic">"{rev.comment || 'Excellent service!'}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Section: Promotions
function ProviderPromotionsSection({ onPromote }) {
  const { data } = useData('promotions');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Service Category Promotions</h2>
        <p className="text-xs text-stone-500">Highlight your business at the top of UrbanFindr category listings</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <Sparkles size={32} className="mx-auto text-amber-400" />
          <h3 className="font-bold text-stone-800 text-sm">No active promotions</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Feature your services on the category discovery page to capture up to 3x higher direct consultation requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((promo) => (
            <div key={promo._id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 text-sm">{promo.targetTitle}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {promo.plan}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Active until {date(promo.endDate)} • {promo.impressions} views • {promo.clicks} clicks
                </p>
              </div>
              <StatusBadge status={promo.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Business Profile
function ProviderBusinessProfileSection() {
  const { user, setUser, toast } = useApp();
  const [busy, setBusy] = useState(false);

  const providerServices = serviceCategories.filter((c) => c.slug !== 'properties');

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await api('auth/profile', {
        method: 'PATCH',
        body: {
          name: form.get('name'),
          phone: form.get('phone'),
          company: form.get('company'),
          serviceCategory: form.get('serviceCategory'),
          experience: form.get('experience'),
          bio: form.get('bio')
        }
      });
      setUser(res.user);
      toast('Business profile updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Service Business Profile</h2>
        <p className="text-xs text-stone-500">Verification details, primary service category, and working credentials</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Business / Firm Name *</label>
            <input
              name="company"
              required
              defaultValue={user?.company || ''}
              placeholder="e.g. UrbanCraft Interiors & Renovations"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Lead Professional Name</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Category *</label>
            <select
              name="serviceCategory"
              defaultValue={user?.serviceCategory || 'interior-designers'}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            >
              {providerServices.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Direct Contact Phone</label>
            <input
              name="phone"
              required
              defaultValue={user?.phone || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Years of Craft &amp; Experience</label>
          <input
            name="experience"
            defaultValue={user?.experience || ''}
            placeholder="e.g. 8+ years in turnkey home interiors"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Business Bio &amp; Quality Guarantees</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="Highlight warranties, material grades, safety protocols, and free inspection terms…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Business Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Section: Settings
function ProviderSettingsSection() {
  const { user, toast } = useApp();
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Service Provider Settings</h2>
        <p className="text-xs text-stone-500">Dispatch preferences and automated booking alerts</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-stone-900 text-sm">Instant SMS / WhatsApp Lead Alerts</h4>
            <p className="text-xs text-stone-500">Receive real-time mobile notifications when homeowners request services</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
