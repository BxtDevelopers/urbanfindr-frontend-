'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import BookingsTracker from '../../bookings-tracker';
import InteriorProjectHub from '../../interior/InteriorProjectHub';
import {
  Heart,
  Calendar,
  ClipboardList,
  Wrench,
  Search,
  MessageCircle,
  FileText,
  CreditCard,
  Bell,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Sparkles,
  House,
  ShieldCheck,
  Check,
  X,
  XCircle
} from 'lucide-react';

export default function CustomerWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData, loading: dashLoading, reload: reloadDash } = useData('dashboard');

  const stats = dashData?.customer || {
    favorites: user?.favorites?.length || 0,
    savedSearches: 0,
    enquiries: 0,
    upcomingVisits: 0,
    bookings: 0,
    activeBookings: 0,
    messages: 0
  };

  if (section === 'favorites') {
    return <SavedPropertiesSection />;
  }
  if (section === 'saved-searches') {
    return <SavedSearchesSection />;
  }
  if (section === 'visits' || section === 'enquiries') {
    return <PropertyVisitsSection />;
  }
  if (section === 'requests' || section === 'bookings') {
    return <CustomerRequestsSection />;
  }
  if (section === 'payments') {
    return <PaymentsInvoicesSection />;
  }
  if (section === 'messages') {
    return <CustomerMessagesSection />;
  }
  if (section === 'notifications') {
    return <CustomerNotificationsSection />;
  }
  if (section === 'profile') {
    return <CustomerProfileSection />;
  }

  // Default: Overview
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#163e35] via-[#1c4a40] to-[#24564a] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#d8edb3] font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} /> Customer Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Discover verified properties, manage your scheduled inspections, and track active doorstep services.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/properties"
            className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Search size={14} /> Explore Properties
          </Link>
          <Link
            href="/services"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Wrench size={14} /> Book Home Services
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saved Homes"
          value={stats.favorites}
          subtitle="Saved for comparison"
          icon={Heart}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('favorites')}
        />
        <StatCard
          title="Upcoming Visits"
          value={stats.upcomingVisits}
          subtitle="Scheduled on-site visits"
          icon={Calendar}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('visits')}
        />
        <StatCard
          title="Saved Searches"
          value={stats.savedSearches}
          subtitle="Alerts & preferences"
          icon={Search}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('saved-searches')}
        />
        <StatCard
          title="Service Bookings"
          value={stats.bookings}
          subtitle={`${stats.activeBookings || 0} currently in progress`}
          icon={Wrench}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('bookings')}
        />
      </div>

      {/* Quick Access Sections Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Service Bookings */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Active Home Services</h3>
              <p className="text-xs text-stone-500">Doorstep repair, cleaning, interior &amp; maintenance</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection('bookings')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <CustomerRecentBookingsList onSelectSection={onSelectSection} />
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Scheduled Site Visits</h3>
              <p className="text-xs text-stone-500">Inspections confirmed with property hosts</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection('visits')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <CustomerRecentVisitsList onSelectSection={onSelectSection} />
        </div>
      </div>
    </div>
  );
}

// Sub-component: Recent Bookings List
function CustomerRecentBookingsList({ onSelectSection }) {
  const { user } = useApp();
  const { data, loading } = useData('service-requests?limit=4');
  const items = data?.items || [];

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading your service bookings…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <Wrench size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No active service bookings yet.</p>
        <Link href="/services" className="inline-block text-xs font-bold text-emerald-700 hover:underline">
          Browse verified doorstep services →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.slice(0, 3).map((item) => (
        <div key={item._id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 truncate">
                {item.serviceType}
              </span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {item.city} {item.preferredDate ? `• Date: ${item.preferredDate}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('requests')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded bg-stone-50 hover:bg-stone-100 border border-stone-200 shrink-0"
          >
            {item.offer && ['contacted', 'quotation', 'quoted', 'pending'].includes(item.status) ? 'Review Offer' : 'Track'}
          </button>
        </div>
      ))}
    </div>
  );
}

// Sub-component: Recent Visits List
function CustomerRecentVisitsList({ onSelectSection }) {
  const { data: visitsData, loading: loadingVisits } = useData('visits?limit=10');
  const { data: leadsData } = useData('leads?limit=10');

  const items = useMemo(() => {
    const rawVisits = (visitsData?.items || []).map((v) => ({
      _id: v._id,
      title: v.property?.title || v.project?.title || 'Property Visit',
      property: v.property,
      project: v.project,
      images: v.property?.images || [],
      scheduledAt: v.scheduledAt,
      createdAt: v.createdAt || v.scheduledAt,
      status: v.status || 'requested',
      ownerName: v.owner?.name || 'Property Host',
      locality: v.property?.locality || '',
      city: v.property?.city || 'Bengaluru'
    }));

    const rawLeads = (leadsData?.items || [])
      .filter((l) => l.preferredAt || l.status === 'site_visit_scheduled')
      .map((l) => ({
        _id: l._id,
        title: l.property?.title || l.project?.title || 'Property Visit',
        property: l.property,
        project: l.project,
        images: l.property?.images || [],
        scheduledAt: l.preferredAt || l.createdAt,
        createdAt: l.createdAt,
        status: l.status === 'site_visit_scheduled' ? 'requested' : l.status,
        ownerName: l.manager?.name || 'Property Host',
        locality: l.property?.locality || '',
        city: l.property?.city || l.city || 'Bengaluru'
      }));

    const combined = [...rawVisits];
    const seen = new Set(rawVisits.map((v) => String(v.property?._id || v.project?._id || v._id)));

    for (const l of rawLeads) {
      const idKey = String(l.property?._id || l.project?._id || l._id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        combined.push(l);
      }
    }

    return combined.sort((a, b) => new Date(b.scheduledAt || b.createdAt) - new Date(a.scheduledAt || a.createdAt));
  }, [visitsData?.items, leadsData?.items]);

  if (loadingVisits) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading scheduled visits…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <Calendar size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No site visits scheduled right now.</p>
        <Link href="/properties" className="inline-block text-xs font-bold text-emerald-700 hover:underline">
          Find a home to schedule a visit →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.slice(0, 4).map((v) => {
        const d = v.scheduledAt ? new Date(v.scheduledAt) : null;
        const formattedDate = d
          ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : '—';
        const formattedTime = d
          ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <div key={v._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {v.images?.[0] ? (
                <img
                  src={v.images[0]}
                  alt={v.title}
                  className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <Calendar size={18} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900 truncate">
                    {v.title}
                  </span>
                  <StatusBadge status={v.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#163e35] font-semibold mt-0.5">
                  <Calendar size={12} className="text-[#059669]" />
                  <span>{formattedDate} • {formattedTime}</span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  Host: {v.ownerName}{v.locality ? ` • ${v.locality}` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection('visits')}
              className="text-xs font-bold text-[#163e35] hover:text-[#059669] px-3 py-1.5 rounded-lg bg-[#ecf2e4] hover:bg-[#d8edb3] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              View Visit
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Section: Property Enquiries
function PropertyEnquiriesSection() {
  const { data: leadsData } = useData('leads?page=1&limit=50');
  const { data: visitsData } = useData('visits?limit=50');

  const items = useMemo(() => {
    const leadItems = (leadsData?.items || []).map((l) => ({
      ...l,
      title: l.property?.title || l.project?.title || l.service || l.note || 'Property Enquiry',
      isVisit: false
    }));

    // Also include site visits booked via the property form so every visited/enquired property shows here
    const visitItems = (visitsData?.items || []).map((v) => ({
      _id: v._id,
      createdAt: v.createdAt || v.scheduledAt,
      property: v.property,
      project: v.project,
      title: v.property?.title || v.project?.title || 'Property Site Visit Enquiry',
      city: v.property?.city || 'Bengaluru',
      budget: v.property?.price || undefined,
      note: v.note || `Site visit scheduled for ${date(v.scheduledAt)}`,
      status: v.status === 'confirmed' ? 'confirmed' : 'visit_scheduled',
      isVisit: true
    }));

    // Combine and deduplicate if same property is in both
    const merged = [...leadItems];
    const seen = new Set(leadItems.map((l) => String(l.property?._id || l.project?._id || l._id)));

    for (const v of visitItems) {
      const idKey = String(v.property?._id || v.project?._id || v._id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        merged.push(v);
      }
    }

    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leadsData?.items, visitsData?.items]);

  const columns = [
    {
      header: 'Listing / Property',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.property?.images?.[0] ? (
            <img
              src={row.property.images[0]}
              alt={row.property.title || 'Listing'}
              className="w-12 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
            />
          ) : null}
          <div className="min-w-0">
            <span className="font-bold text-stone-900 block truncate max-w-[220px]">
              {row.property?.title || row.project?.title || row.service || row.note || 'Property Inquiry'}
            </span>
            <span className="text-[11px] text-stone-400 block truncate">
              {row.property?.locality ? `${row.property.locality}, ` : ''}{row.city || row.property?.city || 'Bengaluru'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Enquiry Date',
      render: (row) => <span className="text-stone-600 text-xs font-medium">{date(row.createdAt)}</span>
    },
    {
      header: 'Budget / Note',
      render: (row) => (
        <div className="space-y-0.5">
          {row.note ? (
            <span className="text-xs text-stone-800 line-clamp-1 max-w-[220px] block">
              {row.note}
            </span>
          ) : null}
          {row.budget ? (
            <span className="font-bold text-[#163e35] text-xs block">
              {money(row.budget)}
            </span>
          ) : !row.note ? <span className="text-stone-400 text-xs">—</span> : null}
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
          {row.property?._id ? (
            <Link
              href={`/properties/${row.property._id}`}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-xs"
            >
              <span>View</span>
              <ExternalLink size={12} />
            </Link>
          ) : row.project?._id ? (
            <Link
              href={`/projects/${row.project._id}`}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-xs"
            >
              <span>View</span>
              <ExternalLink size={12} />
            </Link>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Property Enquiries</h2>
          <p className="text-xs text-stone-500">Inquiries sent directly to owners and builder developers</p>
        </div>
        <Link href="/properties" className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold self-start">
          Explore Listings
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Search property enquiries…"
        emptyTitle="No property enquiries found"
        emptySubtitle="You haven't enquired about any properties yet. Find a home you like and contact the owner directly!"
      />
    </div>
  );
}

// Section: Property Visits
function PropertyVisitsSection() {
  const { toast } = useApp();
  const { data: visitsData, loading: loadingVisits, reload: reloadVisits } = useData('visits?page=1&limit=50');
  const { data: leadsData, reload: reloadLeads } = useData('leads?page=1&limit=50');
  const [busy, setBusy] = useState('');

  const items = useMemo(() => {
    const rawVisits = (visitsData?.items || []).map((v) => ({
      _id: v._id,
      title: v.property?.title || v.project?.title || 'Property Visit',
      property: v.property,
      project: v.project,
      images: v.property?.images || [],
      scheduledAt: v.scheduledAt,
      createdAt: v.createdAt || v.scheduledAt,
      status: v.status || 'requested',
      owner: v.owner,
      ownerName: v.owner?.name || 'Property Host',
      locality: v.property?.locality || '',
      city: v.property?.city || 'Bengaluru',
      price: v.property?.price,
      note: v.note || ''
    }));

    const rawLeads = (leadsData?.items || [])
      .filter((l) => l.preferredAt || l.status === 'site_visit_scheduled')
      .map((l) => ({
        _id: l._id,
        title: l.property?.title || l.project?.title || 'Property Visit',
        property: l.property,
        project: l.project,
        images: l.property?.images || [],
        scheduledAt: l.preferredAt || l.createdAt,
        createdAt: l.createdAt,
        status: l.status === 'site_visit_scheduled' ? 'requested' : l.status,
        owner: l.manager,
        ownerName: l.manager?.name || 'Property Host',
        locality: l.property?.locality || '',
        city: l.property?.city || l.city || 'Bengaluru',
        price: l.property?.price,
        note: l.note || ''
      }));

    const combined = [...rawVisits];
    const seen = new Set(rawVisits.map((v) => String(v.property?._id || v.project?._id || v._id)));

    for (const l of rawLeads) {
      const idKey = String(l.property?._id || l.project?._id || l._id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        combined.push(l);
      }
    }

    return combined.sort((a, b) => new Date(b.scheduledAt || b.createdAt) - new Date(a.scheduledAt || a.createdAt));
  }, [visitsData?.items, leadsData?.items]);

  async function handleCancel(id) {
    if (!window.confirm('Are you sure you want to cancel this scheduled property visit?')) return;
    setBusy(id);
    try {
      await api(`visits/${id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      toast('Visit has been cancelled.');
      reloadVisits();
      reloadLeads();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Property / Project',
      render: (row) => {
        const propId = row.property?._id || row.property;
        return (
          <div className="flex items-center gap-3 max-w-sm">
            {row.images?.[0] ? (
              <img
                src={row.images[0]}
                alt={row.title}
                className="w-14 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                <Calendar size={20} />
              </div>
            )}
            <div className="min-w-0">
              {propId ? (
                <Link
                  href={`/properties/${propId}`}
                  className="font-bold text-xs sm:text-sm text-stone-900 hover:text-[#163e35] hover:underline block truncate"
                >
                  {row.title}
                </Link>
              ) : (
                <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">
                  {row.title}
                </span>
              )}
              <span className="text-[11px] text-stone-400 block truncate">
                Host: <strong className="text-stone-600">{row.ownerName}</strong>
                {row.locality ? ` • ${row.locality}, ${row.city}` : ` • ${row.city}`}
                {row.price ? ` • ${money(row.price)}` : ''}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Scheduled Date & Time',
      render: (row) => {
        const d = row.scheduledAt ? new Date(row.scheduledAt) : null;
        if (!d || isNaN(d.getTime())) return <span className="text-stone-400 text-xs">—</span>;
        const formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#ecf2e4] text-[#163e35] shrink-0">
              <Calendar size={15} />
            </div>
            <div>
              <span className="font-bold text-xs text-stone-900 block">
                {formattedDate}
              </span>
              <span className="text-[11px] text-[#059669] font-bold block">
                {formattedTime}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Note / Request',
      render: (row) => (
        <span className="text-xs text-stone-600 line-clamp-2 max-w-xs">
          {row.note || 'Site visit tour'}
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
        const propId = row.property?._id || row.property;
        return (
          <div className="flex items-center gap-2.5">
            {propId && (
              <Link
                href={`/properties/${propId}`}
                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                View Listing
              </Link>
            )}
            {['requested', 'confirmed'].includes(row.status) && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => handleCancel(row._id)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                {busy === row._id ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Scheduled Property Visits</h2>
          <p className="text-xs text-stone-500">
            In-person property tours and site visits scheduled with hosts
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reloadVisits();
            reloadLeads();
          }}
          className="text-xs font-bold text-[#163e35] hover:text-[#059669] px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          Refresh Visits
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No property visits scheduled yet"
        emptySubtitle="When you choose a date and time on any property listing to schedule a visit, it will appear here."
      />
    </div>
  );
}

// Section: Saved Properties
function SavedPropertiesSection() {
  const { user, setUser, toast } = useApp();
  const { data, loading, reload } = useData('properties?favorites=true&limit=50');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function removeFavorite(id) {
    setBusy(id);
    try {
      const res = await api(`favorites/${id}`, { method: 'POST' });
      setUser((prev) => ({ ...prev, favorites: res.favorites }));
      toast('Property removed from saved homes.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Saved Properties</h2>
          <p className="text-xs text-stone-500">Your shortlisted properties and comparison candidates</p>
        </div>
        <Link href="/compare" className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold self-start">
          Compare Shortlist
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-3">
          <Heart size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-base">No saved properties yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click the heart icon on any property card to save it here for quick access and comparison.
          </p>
          <Link href="/properties" className="inline-block px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold mt-2">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((prop) => (
            <div key={prop._id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={propertyImages(prop)[0] || '/placeholder.jpg'}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      disabled={busy === prop._id}
                      onClick={() => removeFavorite(prop._id)}
                      className="p-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-full shadow-xs"
                      title="Remove from saved"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-900/80 text-white backdrop-blur-xs">
                      {prop.purpose}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="font-extrabold text-base text-stone-900">
                    {money(prop.price)}
                  </div>
                  <h4 className="font-bold text-sm text-stone-800 line-clamp-1">{prop.title}</h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                    <MapPin size={12} className="shrink-0" />
                    <span>{prop.locality}, {prop.city}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                <span className="text-xs text-stone-400">{prop.type}</span>
                <Link
                  href={`/properties/${prop._id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Customer Service Requests & Direct Offers
function CustomerRequestsSection() {
  const { user, toast } = useApp();
  const { data, loading, reload } = useData('service-requests?limit=50&as=customer');
  const [actingId, setActingId] = useState(null);

  const items = data?.items || [];

  async function handleAccept(item) {
    setActingId(item._id);
    try {
      await api(`service-requests/${item._id || item.requestId}`, {
        method: 'PATCH',
        body: { action: 'accept' }
      });
      toast('Offer accepted! The specialist has been notified.');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to accept offer.');
    } finally {
      setActingId(null);
    }
  }

  async function handleDecline(item) {
    setActingId(item._id);
    try {
      await api(`service-requests/${item._id || item.requestId}`, {
        method: 'PATCH',
        body: { action: 'decline', reason: 'Customer declined the offer.' }
      });
      toast('Offer declined.');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to decline offer.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Service Requests</h2>
          <p className="text-xs text-stone-500">
            Track direct inquiries across lawyers, electricians, maintenance and home services
          </p>
        </div>
        <Link
          href="/categories"
          className="px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all inline-flex items-center gap-1.5 self-start"
        >
          <Wrench size={14} />
          <span>New Service Request</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading service requests…</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-3">
          <Wrench size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No service requests yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Book trusted specialists across legal advisory, electrical, AC repair, and pest control.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all"
          >
            <span>Explore Services</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const hasOffer = Boolean(item.offer && (item.offer.amount !== undefined || item.offer.fee !== undefined || item.offer.title)) || Boolean(item.quotation && (item.quotation.amount !== undefined || item.quotation.title));
            const isOfferPending = ['contacted', 'quotation', 'quoted', 'submitted', 'requested', 'pending'].includes(item.status) && hasOffer && item.offer?.status !== 'declined' && item.offer?.status !== 'rejected' && item.offer?.status !== 'accepted';
            const isAccepted = item.status === 'accepted' || item.status === 'scheduled' || item.status === 'in_progress' || item.offer?.status === 'accepted';
            const isDeclined = item.status === 'rejected' || item.status === 'declined' || item.offer?.status === 'declined' || item.offer?.status === 'rejected';
            const isCompleted = item.status === 'completed';

            const providerPhone = item.offer?.providerPhone || item.technician?.phone || '';
            const cleanPhone = String(providerPhone).replace(/\D/g, '');

            return (
              <div
                key={item._id}
                className="bg-white border border-[#e6e8e1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecf2e4] text-[#163e35]">
                        {item.category || 'Service'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-stone-400">
                        {item.requestId}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-stone-900">
                      {item.serviceType}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-stone-400">{date(item.createdAt)}</span>
                  </div>
                </div>

                {/* Requirement note & location */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-stone-400 block font-semibold">Requirement Details:</span>
                    <p className="text-stone-700 bg-[#f7f8f3] p-3 rounded-xl border border-[#e6e8e1] leading-relaxed">
                      {item.customerMessage || item.description || 'Direct consultation requested.'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-stone-400 block font-semibold">Service Location:</span>
                      <span className="font-bold text-stone-800">
                        {item.locality ? `${item.locality}, ` : ''}{item.city}
                      </span>
                    </div>

                    {/* Specialist contact info */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-semibold">Assigned Specialist:</span>
                        <span className="font-bold text-[#163e35]">
                          {item.assignedSpecialist || item.offer?.providerName || 'Verified Partner'}
                        </span>
                      </div>
                      {cleanPhone && (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="px-3 py-1.5 bg-[#163e35] text-[#d8edb3] rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#24564a] transition-all"
                          >
                            <Phone size={12} />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=Hello%20regarding%20my%20${encodeURIComponent(item.serviceType)}%20request%20${item.requestId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#749546] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#5f7b38] transition-all"
                          >
                            <MessageCircle size={12} />
                            <span>Chat</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialist Offer Card (Accept / Decline) */}
                {hasOffer && (
                  <div className="p-4 rounded-xl border-2 border-[#163e35]/20 bg-[#ecf2e4]/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#749546] block">
                          Specialist Direct Offer
                        </span>
                        <h4 className="font-bold text-sm text-stone-900">
                          {item.offer?.title || item.quotation?.title || 'Consultation & Service Proposal'}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-[#163e35]">
                          {money(item.offer?.amount || item.offer?.fee || item.quotation?.amount || 0)}
                        </span>
                      </div>
                    </div>

                    {(item.offer?.notes || item.quotation?.notes) && (
                      <p className="text-xs text-stone-700 italic border-l-2 border-[#163e35] pl-3 py-0.5">
                        &ldquo;{item.offer?.notes || item.quotation?.notes}&rdquo;
                      </p>
                    )}

                    {isAccepted && (
                      <div className="pt-1 flex items-center gap-2 text-xs font-bold text-[#163e35]">
                        <CheckCircle2 size={16} />
                        <span>Offer Accepted • Service in progress</span>
                      </div>
                    )}

                    {isDeclined && (
                      <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-rose-700">
                        <XCircle size={16} />
                        <span>Offer was declined.</span>
                      </div>
                    )}
                  </div>
                )}

                {!hasOffer && !isAccepted && !isDeclined && (
                  <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-600 flex items-center gap-2">
                    <Clock size={15} className="text-amber-600 shrink-0" />
                    <span>Request sent to certified specialist. Awaiting specialist review and offer.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Section: Payments & Invoices
function PaymentsInvoicesSection() {
  const { data, loading } = useData('service-requests?limit=50');
  const items = (data?.items || []).filter((i) => i.invoice && (i.status === 'completed' || i.invoice.total > 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Payments &amp; Invoices</h2>
        <p className="text-xs text-stone-500">Official tax invoices and payment receipts for completed services</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <CreditCard size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No payment records found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Payment receipts are automatically generated when service bookings or interior milestones are completed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-700">
                    {item.invoice.invoiceNumber || `INV-${item.requestId}`}
                  </span>
                  <StatusBadge status={item.invoice.status === 'paid' ? 'completed' : 'pending'} />
                </div>
                <h4 className="font-bold text-stone-900 text-sm">{item.serviceType}</h4>
                <p className="text-xs text-stone-400">Issued on {date(item.invoice.issueDate || item.createdAt)}</p>
              </div>

              <div className="text-right">
                <div className="text-xl font-extrabold text-stone-900">
                  {money(item.invoice.total || item.invoice.subtotal || 0)}
                </div>
                <span className="text-xs text-stone-500">Includes all applicable taxes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Saved Searches
function SavedSearchesSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('saved-searches');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function toggleAlert(id) {
    setBusy(id);
    try {
      const res = await api(`saved-searches/${id}/alert`, { method: 'PATCH' });
      toast(res.alertEnabled ? 'Alerts active for this search.' : 'Alerts paused.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  async function deleteSearch(id) {
    if (!window.confirm('Delete this saved search?')) return;
    setBusy(id);
    try {
      await api(`saved-searches/${id}`, { method: 'DELETE' });
      toast('Saved search removed.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Saved Searches &amp; Alerts</h2>
          <p className="text-xs text-stone-500">Receive alerts when new homes matching your exact preferences are posted</p>
        </div>
        <Link href="/properties" className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold self-start">
          New Search
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <Search size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No saved searches</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When searching for properties, save your search to get notified immediately when matching listings are approved.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                    {item.purpose || 'buy'}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {item.city} {item.query ? `• Localities: ${item.query}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  disabled={busy === item._id}
                  onClick={() => toggleAlert(item._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    item.alertEnabled
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {item.alertEnabled ? 'Alerts Active' : 'Alerts Paused'}
                </button>
                <button
                  type="button"
                  disabled={busy === item._id}
                  onClick={() => deleteSearch(item._id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Messages
function CustomerMessagesSection() {
  const { user, toast } = useApp();
  const { data: threadData } = useData('threads?limit=20');
  const items = threadData?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Conversations</h2>
        <p className="text-xs text-stone-500">Direct message threads with property owners, brokers, and consultants</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <MessageCircle size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No active conversations</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When you send a message from any property page or builder project, the discussion will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((thread) => (
            <Link
              key={thread._id}
              href={`/dashboard/customer?section=messages&thread=${thread._id}`}
              className="block bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-sm">{thread.subject || 'Property Discussion'}</h4>
                <span className="text-[11px] text-stone-400">{date(thread.updatedAt || thread.createdAt)}</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Participants: {thread.participants?.map((p) => p.name).join(', ')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Notifications
function CustomerNotificationsSection() {
  const { toast } = useApp();
  const { data, reload } = useData('notifications?limit=50');
  const items = data?.items || [];

  async function markAllRead() {
    try {
      await api('notifications', { method: 'PATCH' });
      reload();
      toast('All notifications marked as read.');
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Notifications</h2>
          <p className="text-xs text-stone-500">Updates on visit requests and booking confirmations</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <Bell size={24} className="mx-auto text-stone-300 mb-2" />
            No notifications in your inbox.
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className={`p-4 ${!item.read ? 'bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="font-bold text-xs text-stone-900">{item.title}</span>
                <span className="text-[11px] text-stone-400">{date(item.createdAt)}</span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Section: Profile
function CustomerProfileSection() {
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
          bio: form.get('bio')
        }
      });
      setUser(res.user);
      toast('Profile updated successfully.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Personal Account &amp; Profile</h2>
        <p className="text-xs text-stone-500">Manage your contact information and platform identity</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
            <input
              name="phone"
              required
              defaultValue={user?.phone || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
          <input
            disabled
            value={user?.email || ''}
            className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg text-stone-500 cursor-not-allowed"
          />
          <p className="text-[11px] text-stone-400 mt-1">Email is tied to your primary authentication and cannot be changed.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Bio / Notes</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="Tell property owners a bit about yourself…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
