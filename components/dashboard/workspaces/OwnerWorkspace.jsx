'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import AnalyticsChart from '../shared/AnalyticsChart';
import PromotionModal from '../shared/PromotionModal';
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
  AlertCircle
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

  if (section === 'properties') {
    return <OwnerPropertiesSection />;
  }
  if (section === 'enquiries') {
    return <OwnerEnquiriesSection />;
  }
  if (section === 'visits') {
    return <OwnerVisitsSection />;
  }
  if (section === 'performance') {
    return <OwnerPerformanceSection stats={stats} />;
  }
  if (section === 'messages') {
    return <OwnerMessagesSection />;
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
            className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Add New Property
          </Link>
          <button
            type="button"
            onClick={() => onSelectSection('properties')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
          >
            Manage Listings ({stats.properties})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={stats.properties}
          subtitle={`${stats.activeListings} active listings`}
          icon={House}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('properties')}
        />
        <StatCard
          title="Awaiting Review"
          value={stats.pendingApproval}
          subtitle="Verification in progress"
          icon={Clock}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('properties')}
        />
        <StatCard
          title="Tenant Enquiries"
          value={stats.enquiries}
          subtitle="Direct prospective inquiries"
          icon={ClipboardList}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('enquiries')}
        />
        <StatCard
          title="Upcoming Visits"
          value={stats.upcomingVisits}
          subtitle="Confirmed inspection tours"
          icon={Calendar}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('visits')}
        />
      </div>

      {/* Performance Analytics Preview */}
      <AnalyticsChart
        title="Property Inquiries &amp; Discovery Views"
        subtitle="Organic search impressions across your active listings"
        height={240}
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
    </div>
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

// Section: My Properties
function OwnerPropertiesSection({ onPromote }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('properties?mine=true&limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

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
            className="text-stone-700 hover:text-stone-900 font-semibold"
            title="Preview"
          >
            View
          </Link>
          <Link
            href={`/properties/${row._id}/edit`}
            className="text-teal-800 hover:text-teal-900 font-semibold"
            title="Edit"
          >
            Edit
          </Link>
          {row.status !== 'closed' && row.status !== 'archived' ? (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleClose(row._id)}
              className="text-rose-600 hover:text-rose-800 font-semibold"
              title="Close listing and remove from public website"
            >
              Close
            </button>
          ) : (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleReopen(row._id)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold"
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Properties</h2>
          <p className="text-xs text-stone-500">
            Manage all your direct residential and commercial listings. Closed properties remain visible here but are hidden from visitors on the website.
          </p>
        </div>
        <Link
          href="/post-property"
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <Plus size={15} /> Add New Property
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Search your properties by title, locality or city…"
        filterKey="status"
        filterOptions={[
          { value: 'approved', label: 'Approved & Active' },
          { value: 'closed', label: 'Closed (Hidden from site)' },
          { value: 'pending', label: 'Pending Approval' },
          { value: 'archived', label: 'Archived' }
        ]}
        emptyTitle="No properties listed yet"
        emptySubtitle="Start reaching tenants and buyers directly with zero brokerage."
      />
    </div>
  );
}

// Section: Owner Enquiries
function OwnerEnquiriesSection() {
  const { toast } = useApp();
  const { data, loading } = useData('leads?page=1&limit=50');
  const items = data?.items || [];

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

        return (
          <div className="flex items-center gap-1.5">
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

            {/* Confirm button */}
            {row.status === 'requested' && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => updateVisit(row._id, 'confirmed')}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Check size={12} />
                <span>Confirm</span>
              </button>
            )}
            {row.status === 'confirmed' && (
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
          subtitle="+18% this month"
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
          value="12.4%"
          subtitle="Tour-to-inquiry ratio"
          icon={TrendingUp}
          color="#749546" bgIcon="#ecf2e4"
        />
      </div>

      <AnalyticsChart
        title="Weekly Discovery Views &amp; Enquiries"
        subtitle="Interaction volume across your active portfolio"
        type="area"
        height={260}
      />
    </div>
  );
}

// Section: Owner Promotions
function OwnerPromotionsSection({ onPromote }) {
  const { data } = useData('promotions');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Listing Promotions</h2>
          <p className="text-xs text-stone-500">Boost your properties to featured status on the UrbanFindr homepage</p>
        </div>
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
  const { data } = useData('threads?limit=20');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Tenant Messages</h2>
        <p className="text-xs text-stone-500">Direct inquiries from renters and buyers</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <MessageCircle size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No messages yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Tenant inquiries will appear here as soon as visitors message your listings.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t._id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{t.subject || 'Property Inquiry'}</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tenant: {t.participants?.map((p) => p.name).join(', ')}
                </p>
              </div>
              <span className="text-[11px] text-stone-400">{date(t.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
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

