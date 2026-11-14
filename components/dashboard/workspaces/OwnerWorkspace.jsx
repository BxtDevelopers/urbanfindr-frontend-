'use client';

import { useState, useEffect, useMemo } from 'react';
import MessageCenter from '../shared/MessageCenter';
import NotificationsCenter from '../shared/NotificationsCenter';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import AnalyticsChart from '../shared/AnalyticsChart';
import PromotionModal from '../shared/PromotionModal';
import PropertyDashboardCard from '../shared/PropertyDashboardCard';
import PropertyRequestsModal from '../shared/PropertyRequestsModal';
import {
  House,
  Plus,
  ClipboardList,
  Calendar,
  BarChart3,
  Sparkles,
  MessageCircle,
  Settings,
  ArrowUpRight,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  User,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Check,
  AlertCircle,
  LayoutGrid,
  List,
  Search,
  BedDouble,
  Bath,
  Maximize,
  RotateCcw,
  XCircle,
  Wrench,
  ArrowRight
} from 'lucide-react';

export default function OwnerWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData } = useData('dashboard');
  const [promotionTarget, setPromotionTarget] = useState(null);

  const stats = dashData?.owner || {
    properties: 0,
    activeListings: 0,
    pendingApproval: 0,
    enquiries: 0,
    upcomingVisits: 0,
    promotions: 0,
    views: 0
  };

  const renderSection = () => {
    if (section === 'properties' || section === 'listings') {
      return <OwnerPropertiesSection onPromote={setPromotionTarget} />;
    }
    if (section === 'enquiries' || section === 'leads') {
      return <OwnerEnquiriesSection />;
    }
    if (section === 'services' || section === 'requests' || section === 'service-requests') {
      return <OwnerServicesSection onSelectSection={onSelectSection} />;
    }
    if (section === 'visits') {
      return <OwnerVisitsSection />;
    }
    if (section === 'promotions') {
      return <OwnerPromotionsSection onPromote={setPromotionTarget} />;
    }
    if (section === 'performance' || section === 'analytics') {
      return <OwnerPerformanceSection stats={stats} />;
    }
    if (section === 'messages') {
      return <OwnerMessagesSection />;
    }
    if (section === 'notifications') {
      return <NotificationsCenter onSelectSection={onSelectSection} />;
    }
    if (section === 'profile') {
      return <OwnerProfileSection />;
    }

    // Default: Overview
    return (
      <div className="space-y-8">

      {/* Header welcome banner */}
      <div className="bg-gradient-to-r from-[#163e35] via-[#1c4a40] to-[#24564a] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#d8edb3] font-bold text-xs uppercase tracking-wider">
            <House size={14} /> Property Owner Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hello, {user?.name ? user.name.split(' ')[0] : 'Owner'}
          </h2>
          <p className="text-xs sm:text-sm text-[#ecf2e4]/90 leading-relaxed">
            Manage your verified rental and sale listings with zero brokerage fees. Connect with verified tenants, confirm on-site inspections, and review live inquiry interest.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/post-property"
            className="whitespace-nowrap shrink-0 px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} className="shrink-0" />
            <span className="whitespace-nowrap">Add New Property</span>
          </Link>
          <button
            type="button"
            onClick={() => onSelectSection('properties')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
          >
            Manage Listings ({stats.properties})
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('services')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20 inline-flex items-center gap-1.5"
          >
            <Wrench size={13} />
            <span>Booked Services</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Manage multiple listings, Manage leads, Track visits, Manage promotions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Manage Listings"
          value={stats.properties}
          subtitle={`${stats.activeListings} active listings`}
          icon={House}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('properties')}
        />
        <StatCard
          title="Manage Leads"
          value={stats.enquiries}
          subtitle="Direct prospective inquiries"
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('enquiries')}
        />
        <StatCard
          title="Track Visits"
          value={stats.upcomingVisits}
          subtitle="Confirmed inspection tours"
          icon={Calendar}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('visits')}
        />
        <StatCard
          title="Manage Promotions"
          value={stats.promotions || 0}
          subtitle="Featured spotlight reach"
          icon={Sparkles}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('promotions')}
        />
      </div>

      {/* Performance Analytics Preview */}
      <AnalyticsChart
        title="Property Inquiries &amp; Discovery Views"
        subtitle="Organic search impressions across your active listings"
        height={240}
        data={stats.analytics}
        dataKeys={[
          { key: 'views', name: 'Views', color: '#0f766e' },
          { key: 'enquiries', name: 'Inquiries', color: '#0369a1' },
          { key: 'visits', name: 'Visits', color: '#047857' }
        ]}
      />

      {/* Active Properties Quick List */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Your Active Properties</h3>
            <p className="text-xs text-stone-500">Listings visible to homebuyers and tenants</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('properties')}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            <span>All Properties</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <OwnerRecentPropertiesList />
      </div>

      {/* Active Booked Services Quick Preview */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Wrench size={16} className="text-[#163e35]" />
              Recent Home Service Bookings
            </h3>
            <p className="text-xs text-stone-500">Doorstep services booked for your properties</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('services')}
            className="text-xs font-bold text-[#163e35] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
        <OwnerRecentServicesList onSelectSection={onSelectSection} />
      </div>
    </div>
    );
  };

  return (
    <>
      {renderSection()}
      {promotionTarget && (
        <PromotionModal
          isOpen={Boolean(promotionTarget)}
          target={promotionTarget}
          targetType="property"
          onClose={() => setPromotionTarget(null)}
          onPromoted={() => {
            setPromotionTarget(null);
            if (toast) toast('Promotion activated successfully!');
          }}
        />
      )}
    </>
  );
}

// Sub-component: Owner Recent Properties List
function OwnerRecentPropertiesList({ onPromote }) {
  const { data, loading } = useData('properties?mine=true&limit=4');
  const items = data?.items || [];

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading your properties…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <House size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">You haven't listed any properties yet.</p>
        <Link href="/post-property" className="inline-block text-xs font-bold text-teal-800 hover:underline">
          Post your first property listing for free →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((prop) => (
        <div key={prop._id} className="p-4 border border-stone-200 rounded-xl flex gap-3.5 hover:border-stone-300 transition-all">
          <img
            src={propertyImages(prop)[0] || '/placeholder.jpg'}
            alt={prop.title}
            className="w-20 h-20 rounded-lg object-cover shrink-0 bg-stone-100"
          />
          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-stone-900 truncate">{prop.title}</span>
                <StatusBadge status={prop.status} />
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5">{prop.locality}, {prop.city}</p>
              <div className="font-extrabold text-sm text-stone-900 mt-1">{money(prop.price)}</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <Link href={`/properties/${prop._id}`} className="text-teal-800 font-semibold hover:underline">
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Sub-component: Owner Recent Services List
function OwnerRecentServicesList({ onSelectSection }) {
  const { data, loading } = useData('service-requests?limit=3&as=customer');
  const items = data?.items || [];

  if (loading) {
    return <div className="p-6 text-center text-xs text-stone-400">Loading service requests…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <Wrench size={22} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No active service bookings for your properties.</p>
        <Link href="/categories" className="inline-block text-xs font-bold text-[#163e35] hover:underline">
          Book trusted electricians, plumbers, or cleaners →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3.5">
      {items.map((item) => (
        <div key={item._id} className="p-3.5 border border-stone-200 rounded-xl bg-stone-50/50 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#163e35] bg-[#ecf2e4] px-2 py-0.5 rounded">
                {item.category || 'Service'}
              </span>
              <span className="text-[10px] font-mono text-stone-400">{item.requestId}</span>
            </div>
            <h4 className="font-bold text-xs text-stone-900 truncate mt-1.5">{item.serviceType}</h4>
            <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="shrink-0" /> {item.city}
            </p>
          </div>
          <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {item.status}
            </span>
            <button
              type="button"
              onClick={() => onSelectSection('services')}
              className="text-[11px] font-bold text-[#163e35] hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Section: My Properties
function OwnerPropertiesSection({ onPromote }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('properties?mine=true&limit=100');
  const { data: leadsData, reload: reloadLeads } = useData('leads?page=1&limit=100&for=owner');
  const { data: visitsData, reload: reloadVisits } = useData('visits?limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'closed'
  const [selectedPropertyForRequests, setSelectedPropertyForRequests] = useState(null);

  const requestsByProperty = useMemo(() => {
    const map = {};
    const all = [
      ...(visitsData?.items || []).map((v) => ({
        _id: v._id,
        isVisit: true,
        propertyId: String(v.property?._id || v.property || ''),
        customerName: v.user?.name || 'Customer',
        email: v.user?.email || '',
        phone: v.phone || v.user?.phone || '',
        status: v.status || 'requested',
        note: v.note || '',
        scheduledAt: v.scheduledAt,
        createdAt: v.createdAt || v.scheduledAt
      })),
      ...(leadsData?.items || [])
        .filter((l) => !l.service && l.kind !== 'general' && (!l.note || !l.note.startsWith('[SR-')))
        .map((l) => ({
        _id: l._id,
        isVisit: false,
        propertyId: String(l.property?._id || l.property || ''),
        customerName: l.name || l.user?.name || 'Customer',
        email: l.email || l.user?.email || '',
        phone: l.phone || l.user?.phone || '',
        status: l.status || 'requested',
        note: l.note || '',
        scheduledAt: l.preferredAt,
        createdAt: l.createdAt
      }))
    ];

    for (const req of all) {
      if (req.propertyId) {
        if (!map[req.propertyId]) map[req.propertyId] = [];
        map[req.propertyId].push(req);
      }
    }
    return map;
  }, [visitsData?.items, leadsData?.items]);

  async function handleAcceptRequest(request) {
    setBusy(request._id);
    try {
      if (request.isVisit) {
        await api(`visits/${request._id}`, { method: 'PATCH', body: { status: 'accepted' } });
      } else {
        await api(`leads/${request._id}`, { method: 'PATCH', body: { status: 'accepted' } });
      }
      toast('Customer request accepted!');
      reloadLeads();
      reloadVisits();
      setSelectedPropertyForRequests((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          requests: (prev.requests || []).map((r) =>
            r._id === request._id ? { ...r, status: 'accepted' } : r
          )
        };
      });
    } catch (e) {
      toast(e.message || 'Failed to accept request.');
    } finally {
      setBusy('');
    }
  }

  async function handleClose(id) {
    if (!window.confirm('Close this property? It will be removed from the public website so visitors cannot see it, but will stay saved in your dashboard.')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'PATCH', body: { status: 'closed' } });
      toast('Property closed. It is now hidden from the public website.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to close property.');
    } finally {
      setBusy('');
    }
  }

  async function handleReopen(id) {
    if (!window.confirm('Re-open this property listing so visitors can see it on the website again?')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'PATCH', body: { status: 'approved' } });
      toast('Property re-opened and visible on the website.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to re-open property.');
    } finally {
      setBusy('');
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'approved' && item.status !== 'approved' && item.status !== 'active') return false;
      if (statusFilter === 'closed' && item.status !== 'closed' && item.status !== 'archived') return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesLocality = item.locality?.toLowerCase().includes(q);
        const matchesCity = item.city?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocality && !matchesCity && !matchesType) return false;
      }
      return true;
    });
  }, [items, statusFilter, search]);

  const columns = [
    {
      header: 'Property',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <img
            src={propertyImages(row)[0] || '/placeholder.jpg'}
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover shrink-0 bg-stone-100"
          />
          <div className="min-w-0">
            <span className="font-bold text-stone-900 block truncate">{row.title}</span>
            <span className="text-[11px] text-stone-400 block truncate">
              {row.locality}, {row.city} • {row.type}
            </span>
            {row.status === 'closed' && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                Hidden from website
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Purpose / Price',
      render: (row) => (
        <div>
          <span className="font-extrabold text-stone-900 block">{money(row.price)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            For {row.purpose}
          </span>
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
        <div className="flex items-center gap-3">
          <Link
            href={`/properties/${row._id}`}
            className="text-stone-700 hover:text-stone-900 font-semibold text-xs"
            title="Preview"
          >
            View
          </Link>
          <Link
            href={`/properties/${row._id}/edit`}
            className="text-teal-800 hover:text-teal-900 font-semibold text-xs"
            title="Edit"
          >
            Edit
          </Link>
          {row.status !== 'closed' && row.status !== 'archived' ? (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleClose(row._id)}
              className="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer"
              title="Close listing and remove from public website"
            >
              Close
            </button>
          ) : (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleReopen(row._id)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer"
              title="Re-open listing to make it visible on website"
            >
              Re-open
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-stone-900">My Properties</h2>
          <p className="text-xs text-stone-500">
            Manage all your direct residential and commercial listings. Closed properties remain visible here in your dashboard cards but are hidden from visitors on the website.
          </p>
        </div>
        <Link
          href="/post-property"
          className="whitespace-nowrap shrink-0 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:shadow self-start sm:self-auto"
        >
          <Plus size={15} className="shrink-0" />
          <span className="whitespace-nowrap">Add New Property</span>
        </Link>
      </div>

      {/* Filter, Search & View Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by title, locality, city, or type…"
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'approved' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Active ({items.filter((i) => i.status !== 'closed' && i.status !== 'archived').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'closed' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Closed ({items.filter((i) => i.status === 'closed' || i.status === 'archived').length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading your properties…</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <House size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-sm text-stone-800">No properties match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {items.length === 0
              ? 'Start reaching tenants and buyers directly with zero brokerage.'
              : 'Try clearing your search or filter pills to see other properties.'}
          </p>
          {items.length === 0 && (
            <Link
              href="/post-property"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} /> Post Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((prop) => (
            <PropertyDashboardCard
              key={prop._id}
              property={prop}
              busy={busy}
              requests={requestsByProperty[String(prop._id)] || []}
              onOpenRequests={(p, r) => setSelectedPropertyForRequests({ property: p, requests: r })}
              onAcceptRequest={handleAcceptRequest}
              onClose={handleClose}
              onReopen={handleReopen}
              onPromote={onPromote}
            />
          ))}
        </div>
      )}

      {/* Property Visit Requests Modal */}
      <PropertyRequestsModal
        isOpen={!!selectedPropertyForRequests}
        onClose={() => setSelectedPropertyForRequests(null)}
        property={selectedPropertyForRequests?.property}
        requests={
          requestsByProperty[String(selectedPropertyForRequests?.property?._id || '')] ||
          selectedPropertyForRequests?.requests ||
          []
        }
        onAcceptRequest={handleAcceptRequest}
        busyId={busy}
      />
    </div>
  );
}

// Section: Owner Enquiries
function OwnerEnquiriesSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('leads?page=1&limit=50&for=owner');
  const allItems = data?.items || [];
  // Exclude personal service requests or non-property leads from property inquiries
  const items = allItems.filter((row) => {
    if (row.service || row.kind === 'general' || (row.note && row.note.startsWith('[SR-'))) return false;
    return true;
  });
  const [busyId, setBusyId] = useState('');

  async function handleAcceptLead(id) {
    setBusyId(id);
    try {
      await api(`leads/${id}`, {
        method: 'PATCH',
        body: { status: 'accepted' }
      });
      toast('Request accepted!');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to accept request.');
    } finally {
      setBusyId('');
    }
  }

  const columns = [
    {
      header: 'Interested Tenant / Buyer',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.name || 'Prospect'}</span>
          <span className="text-[11px] text-stone-500 block truncate flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-700" /> Phone verified
          </span>
        </div>
      )
    },
    {
      header: 'Listing',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.property?.title || 'Property Listing'}
        </span>
      )
    },
    {
      header: 'Date',
      render: (row) => <span className="text-stone-500 text-xs">{date(row.createdAt)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Note',
      render: (row) => <span className="text-stone-500 text-xs line-clamp-1">{row.note || '—'}</span>
    },
    {
      header: 'Actions',
      render: (row) => {
        const cleanPhone = String(row.phone || '').replace(/\D/g, '');
        const prospectName = row.name || 'Customer';
        const propertyTitle = row.property?.title || 'your property listing';
        const isPending = row.status === 'new' || row.status === 'uncontacted' || row.status === 'requested' || row.status === 'submitted';

        return (
          <div className="flex items-center gap-1.5">
            {isPending && (
              <button
                type="button"
                disabled={busyId === row._id}
                onClick={() => handleAcceptLead(row._id)}
                className="px-2.5 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="Confirm and accept request"
              >
                <Check size={12} />
                <span>{busyId === row._id ? 'Accepting…' : 'Accept'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (cleanPhone) window.location.href = `tel:${cleanPhone}`;
                else toast('No contact number available.');
              }}
              title="Call Customer"
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Phone size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (cleanPhone) {
                  const msg = encodeURIComponent(`Hello ${prospectName}, this is regarding your enquiry for ${propertyTitle}.`);
                  window.open(`https://wa.me/91${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
                } else {
                  toast('No contact number available.');
                }
              }}
              title="Message Customer"
              className="p-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg transition-colors cursor-pointer"
            >
              <MessageCircle size={13} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Tenant &amp; Buyer Enquiries</h2>
        <p className="text-xs text-stone-500">Direct inquiries from verified seekers interested in your listings</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No enquiries received yet"
        emptySubtitle="When prospective tenants contact you about your properties, they will appear here."
      />
    </div>
  );
}

// Section: Owner Booked Home Services
function OwnerServicesSection({ onSelectSection }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('service-requests?limit=50&as=customer');
  const [statusTab, setStatusTab] = useState('all');
  const [actingId, setActingId] = useState(null);

  const allItems = data?.items || [];

  const items = useMemo(() => {
    if (statusTab === 'all') return allItems;
    if (statusTab === 'active') {
      return allItems.filter((i) =>
        ['submitted', 'requested', 'pending', 'assigned', 'scheduled', 'in_progress', 'quoted', 'quotation', 'accepted'].includes(i.status)
      );
    }
    if (statusTab === 'completed') {
      return allItems.filter((i) => ['completed', 'closed'].includes(i.status));
    }
    if (statusTab === 'cancelled') {
      return allItems.filter((i) => ['cancelled', 'rejected', 'disputed'].includes(i.status));
    }
    return allItems;
  }, [allItems, statusTab]);

  async function handleCancel(item) {
    if (!window.confirm('Are you sure you want to cancel this service request?')) return;
    setActingId(item._id);
    try {
      await api(`service-requests/${item._id || item.requestId}`, {
        method: 'PATCH',
        body: { action: 'cancel', status: 'cancelled' }
      });
      toast('Service booking cancelled.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to cancel service.');
    } finally {
      setActingId(null);
    }
  }

  const getServiceStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
      case 'requested':
      case 'pending':
        return { label: 'Booking Requested', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'accepted':
      case 'assigned':
        return { label: 'Technician Assigned', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'scheduled':
        return { label: 'Appointment Confirmed', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'in_progress':
        return { label: 'Service In Progress', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'completed':
      case 'closed':
        return { label: 'Service Completed', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'cancelled':
      case 'rejected':
        return { label: 'Cancelled', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status || 'Pending', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Booking CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Wrench size={20} className="text-[#163e35]" />
            My Booked Home Services
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track doorstep service bookings, technician dispatch, schedule dates, and job status for your properties.
          </p>
        </div>

        <Link
          href="/categories"
          className="px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all inline-flex items-center gap-1.5 self-start"
        >
          <Plus size={14} />
          <span>Book Doorstep Service</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Bookings', count: allItems.length },
          {
            id: 'active',
            label: 'Active & Scheduled',
            count: allItems.filter((i) => ['submitted', 'requested', 'pending', 'assigned', 'scheduled', 'in_progress', 'quoted', 'quotation', 'accepted'].includes(i.status)).length
          },
          {
            id: 'completed',
            label: 'Completed',
            count: allItems.filter((i) => ['completed', 'closed'].includes(i.status)).length
          },
          {
            id: 'cancelled',
            label: 'Cancelled',
            count: allItems.filter((i) => ['cancelled', 'rejected', 'disputed'].includes(i.status)).length
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusTab === tab.id
                ? 'bg-[#163e35] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading your booked services…</div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center bg-white border border-stone-200 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#ecf2e4] text-[#163e35] mx-auto flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">No booked services found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Need verified electricians, plumbers, painters, or deep cleaners for your properties? Book reliable doorstep services with transparent rates.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { label: 'Electrician', path: '/categories/electrician' },
              { label: 'Plumbing', path: '/categories/plumbing' },
              { label: 'Deep Cleaning', path: '/categories/deep-cleaning' },
              { label: 'Home Painting', path: '/categories/home-painting' },
              { label: 'Home Interiors', path: '/interiors' }
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.path}
                className="px-3 py-1.5 bg-stone-100 hover:bg-[#ecf2e4] hover:text-[#163e35] text-stone-700 text-xs font-semibold rounded-lg transition-colors border border-stone-200"
              >
                {cat.label} →
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const statusInfo = getServiceStatusLabel(item.status);
            const providerPhone = item.offer?.providerPhone || item.assignedProvider?.phone || item.phone || '';
            const cleanPhone = String(providerPhone).replace(/\D/g, '');
            const technicianName = item.assignedSpecialist || item.assignedProvider?.name || item.technician?.name || null;
            const canCancel = ['submitted', 'requested', 'pending', 'assigned', 'scheduled'].includes(item.status);

            return (
              <div
                key={item._id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-emerald-600/30 transition-all"
              >
                {/* Card Top: Category, Reference, Status & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecf2e4] text-[#163e35] border border-[#d8edb3]">
                        {item.category || 'Home Service'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-stone-400">
                        {item.requestId}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-stone-900 mt-1">
                      {item.serviceType}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-stone-400 whitespace-nowrap">
                      {date(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Scope & Requirement description */}
                {(item.customerMessage || item.description) && (
                  <div className="space-y-1 text-xs">
                    <span className="text-stone-400 font-semibold block">Service Scope &amp; Notes:</span>
                    <p className="text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                      {item.customerMessage || item.description}
                    </p>
                  </div>
                )}

                {/* Key Service Metadata Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 py-2 text-xs">
                  {/* Service Address */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                    <span className="text-stone-400 block font-semibold flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-700" /> Service Location
                    </span>
                    <p className="font-bold text-stone-800 truncate">
                      {item.address || item.locality ? `${item.address || item.locality}, ` : ''}{item.city}
                    </p>
                  </div>

                  {/* Appointment Schedule */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                    <span className="text-stone-400 block font-semibold flex items-center gap-1">
                      <Calendar size={12} className="text-emerald-700" /> Scheduled Appointment
                    </span>
                    <p className="font-bold text-stone-800 truncate">
                      {item.preferredDate ? date(item.preferredDate) : 'Flexible Schedule'}
                    </p>
                    {item.preferredTime && (
                      <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                        <Clock size={10} /> {item.preferredTime}
                      </p>
                    )}
                  </div>

                  {/* Assigned Technician */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                    <span className="text-stone-400 block font-semibold flex items-center gap-1">
                      <User size={12} className="text-emerald-700" /> Assigned Professional
                    </span>
                    {technicianName ? (
                      <div>
                        <p className="font-bold text-stone-800 truncate">{technicianName}</p>
                        <p className="text-[11px] text-amber-600 font-semibold">★ {item.assignedSpecialistRating || 4.9} Verified Pro</p>
                      </div>
                    ) : (
                      <p className="text-stone-500 italic">Dispatching technician…</p>
                    )}
                  </div>

                  {/* Service Charges */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                    <span className="text-stone-400 block font-semibold">Estimated Charges</span>
                    <p className="font-black text-stone-900 text-sm">
                      {item.predefinedPrice ? money(item.predefinedPrice) : (item.quotation?.amount ? money(item.quotation.amount) : 'Inspection Quote')}
                    </p>
                    <p className="text-[10px] text-stone-400">Zero hidden markups</p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {cleanPhone && (
                      <>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Phone size={12} />
                          <span>Call Technician</span>
                        </a>

                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello, regarding my booked service ${item.serviceType} [${item.requestId}].`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp Pro</span>
                        </a>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        type="button"
                        disabled={actingId === item._id}
                        onClick={() => handleCancel(item)}
                        className="px-3 py-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        {actingId === item._id ? 'Cancelling…' : 'Cancel Booking'}
                      </button>
                    )}

                    <Link
                      href="/categories"
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Book Another Service</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Section: Owner Visits
function OwnerVisitsSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('visits?page=1&limit=50');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function updateVisit(id, status) {
    setBusy(id);
    try {
      await api(`visits/${id}`, { method: 'PATCH', body: { status } });
      toast(`Visit marked as ${status}.`);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Guest / Tenant',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.user?.name || 'Visitor'}</span>
          <span className="text-[11px] text-stone-400 block truncate flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-700" /> Phone verified
          </span>
        </div>
      )
    },
    {
      header: 'Property',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.property?.title || 'Property Tour'}
        </span>
      )
    },
    {
      header: 'Scheduled Time',
      render: (row) => <span className="font-semibold text-stone-800">{date(row.scheduledAt)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Host Actions',
      render: (row) => {
        const rawPhone = row.phone || row.user?.phone || '';
        const cleanPhone = String(rawPhone).replace(/\D/g, '');
        const guestName = row.user?.name || 'Visitor';
        const propertyTitle = row.property?.title || 'your property listing';

        return (
          <div className="flex items-center gap-1.5">
            {/* Call button - button element prevents browser URL preview from revealing mobile number on hover */}
            <button
              type="button"
              onClick={() => {
                if (cleanPhone) window.location.href = `tel:${cleanPhone}`;
                else toast('No contact number available for this visitor.');
              }}
              title="Call Customer"
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Phone size={13} />
            </button>

            {/* Text / WhatsApp button - button element prevents browser URL preview from revealing mobile number on hover */}
            <button
              type="button"
              onClick={() => {
                if (cleanPhone) {
                  const msg = encodeURIComponent(`Hello ${guestName}, this is regarding your visit request for ${propertyTitle}.`);
                  window.open(`https://wa.me/91${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
                } else {
                  toast('No contact number available for this visitor.');
                }
              }}
              title="Message Customer"
              className="p-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg transition-colors cursor-pointer"
            >
              <MessageCircle size={13} />
            </button>

            {/* Accept / Confirm button */}
            {row.status === 'requested' && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => updateVisit(row._id, 'accepted')}
                className="px-2.5 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title="Confirm and accept visit request"
              >
                <Check size={12} />
                <span>Accept</span>
              </button>
            )}
            {(row.status === 'confirmed' || row.status === 'accepted') && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => updateVisit(row._id, 'completed')}
                className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Mark Done
              </button>
            )}
            {['requested', 'confirmed'].includes(row.status) && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => updateVisit(row._id, 'cancelled')}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Property Inspection Tours</h2>
        <p className="text-xs text-stone-500">Confirm, reschedule, or complete in-person viewing requests</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No property visits requested"
        emptySubtitle="Viewing appointments scheduled by tenants will be organized here."
      />
    </div>
  );
}

// Section: Owner Performance
function OwnerPerformanceSection({ stats }) {
  const conversionRate = stats.views > 0
    ? (((Number(stats.enquiries) || 0) / Number(stats.views)) * 100).toFixed(1) + '%'
    : (stats.enquiries > 0 ? '100%' : '0.0%');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Listing Performance &amp; Analytics</h2>
        <p className="text-xs text-stone-500">Track discovery impressions, tenant leads, and tour completion rates</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={stats.views}
          subtitle="Portfolio reach"
          icon={Eye}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Inquiries"
          value={stats.enquiries}
          subtitle="Direct phone &amp; chats"
          icon={ClipboardList}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Completed Tours"
          value={stats.upcomingVisits}
          subtitle="Verified visits"
          icon={Calendar}
          color="#749546" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Conversion"
          value={conversionRate}
          subtitle="Tour-to-inquiry ratio"
          icon={TrendingUp}
          color="#749546" bgIcon="#ecf2e4"
        />
      </div>

      <AnalyticsChart
        title="Weekly Discovery Views &amp; Enquiries"
        subtitle="Interaction volume across your active portfolio"
        data={stats.analytics}
        dataKeys={[
          { key: 'views', name: 'Views', color: '#0f766e' },
          { key: 'enquiries', name: 'Inquiries', color: '#0369a1' },
          { key: 'visits', name: 'Visits', color: '#047857' }
        ]}
        type="area"
        height={260}
      />
    </div>
  );
}

// Section: Owner Promotions
function OwnerPromotionsSection({ onPromote }) {
  const { data } = useData('promotions');
  const { data: propData } = useData('properties?mine=true&limit=100');
  const items = data?.items || [];
  const myProperties = propData?.items || [];
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Listing Promotions</h2>
          <p className="text-xs text-stone-500">Boost your properties to featured status on the UrbanFindr homepage</p>
        </div>
        {myProperties.length > 0 && onPromote && (
          <div className="flex items-center gap-2">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl max-w-xs truncate"
            >
              <option value="">Select a property to promote…</option>
              {myProperties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({money(p.price)})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedPropertyId}
              onClick={() => {
                const targetProp = myProperties.find((p) => p._id === selectedPropertyId);
                if (targetProp) onPromote(targetProp);
              }}
              className="whitespace-nowrap shrink-0 px-4 py-2 bg-[#163e35] hover:bg-[#24564a] disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:shadow self-start sm:self-auto"
            >
              <Sparkles size={15} />
              <span>Promote Selected</span>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <Sparkles size={32} className="mx-auto text-amber-400" />
          <h3 className="font-bold text-stone-800 text-sm">No active promotions</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Promote any of your active properties to receive up to 5x higher reach and premium badge placement.
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
                  Active until {date(promo.endDate)} • {promo.impressions} impressions • {promo.clicks} clicks
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

// Section: Owner Messages
function OwnerMessagesSection() {
  const [initialThreadId, setInitialThreadId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tid = params.get('thread');
      if (tid) setInitialThreadId(tid);
    }
  }, []);

  return (
    <MessageCenter
      initialThreadId={initialThreadId}
      title="Tenant & Buyer Inquiries"
      subtitle="Direct messages and questions received on your rental and resale property listings"
    />
  );
}

// Section: Owner Profile
function OwnerProfileSection() {
  const { user, setUser, toast } = useApp();
  const [busy, setBusy] = useState(false);

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
          bio: form.get('bio')
        }
      });
      setUser(res.user);
      toast('Owner profile updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Property Owner Profile</h2>
        <p className="text-xs text-stone-500">Information visible on your public listing pages</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Host / Owner Name</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
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
          <label className="block text-xs font-semibold text-stone-700 mb-1">Property Localities</label>
          <input
            name="company"
            defaultValue={user?.company || ''}
            placeholder="e.g. Indiranagar, Whitefield, Koramangala"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Owner Bio &amp; Preferred Visiting Hours</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="e.g. Available for property inspections on weekends from 10 AM to 5 PM…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Owner Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

