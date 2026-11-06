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
  Briefcase,
  House,
  Plus,
  ClipboardList,
  Calendar,
  Users,
  Sparkles,
  BarChart3,
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
  Award
} from 'lucide-react';

export default function BrokerWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData } = useData('dashboard');
  const [promotionTarget, setPromotionTarget] = useState(null);

  const stats = dashData?.broker || {
    properties: 0,
    activeListings: 0,
    totalLeads: 0,
    newLeads: 0,
    upcomingVisits: 0,
    clients: 0,
    promotions: 0,
    views: 0
  };

  if (section === 'listings') {
    return <BrokerListingsSection />;
  }
  if (section === 'leads') {
    return <BrokerLeadsSection />;
  }
  if (section === 'visits') {
    return <BrokerVisitsSection />;
  }
  if (section === 'clients') {
    return <BrokerClientsSection />;
  }
  if (section === 'analytics') {
    return <BrokerAnalyticsSection stats={stats} />;
  }
  if (section === 'messages') {
    return <BrokerMessagesSection />;
  }
  if (section === 'profile') {
    return <BrokerProfileSection />;
  }

  // Default: Overview
  return (
    <div className="space-y-8">

      {/* Header welcome banner */}
      <div className="bg-gradient-to-r from-[#163e35] via-[#1c4a40] to-[#24564a] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#d8edb3] font-bold text-xs uppercase tracking-wider">
            <Briefcase size={14} /> Broker &amp; Channel Command
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {user?.company || user?.name || 'Broker Agency'}
          </h2>
          <p className="text-xs sm:text-sm text-[#ecf2e4]/90 leading-relaxed">
            Manage your verified property portfolio, accelerate lead pipeline progression, organize inspection tours, and close buyer deals across key localities.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/post-property"
            className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Add Client Listing
          </Link>
          <button
            type="button"
            onClick={() => onSelectSection('leads')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
          >
            Leads Pipeline ({stats.totalLeads})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio"
          value={stats.properties}
          subtitle={`${stats.activeListings} active listings`}
          icon={House}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('listings')}
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          subtitle={`${stats.newLeads} new leads this week`}
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('leads')}
        />
        <StatCard
          title="Client Visits"
          value={stats.upcomingVisits}
          subtitle="Confirmed inspection tours"
          icon={Calendar}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('visits')}
        />
        <StatCard
          title="Client Network"
          value={stats.clients}
          subtitle="Active buyer engagements"
          icon={Users}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('clients')}
        />
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart
        title="Portfolio Leads &amp; Buyer Activity"
        subtitle="Weekly lead generation and property inquiry volume"
        dataKeys={[
          { key: 'views', name: 'Views', color: '#0369a1' },
          { key: 'enquiries', name: 'Inquiries', color: '#0284c7' },
          { key: 'visits', name: 'Visits', color: '#047857' }
        ]}
      />

      {/* Pipeline Quick View */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Recent Leads Pipeline</h3>
            <p className="text-xs text-stone-500">Prospective buyers inquiring on your properties</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('leads')}
            className="text-xs font-bold text-sky-800 hover:text-sky-900 flex items-center gap-1"
          >
            <span>Open Pipeline</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <BrokerRecentLeadsList onSelectSection={onSelectSection} />
      </div>
    </div>
  );
}

// Sub-component: Recent Leads List
function BrokerRecentLeadsList({ onSelectSection }) {
  const { data, loading } = useData('leads?page=1&limit=5');
  const items = data?.items || [];

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading pipeline leads…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <ClipboardList size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No leads generated yet.</p>
        <Link href="/post-property" className="inline-block text-xs font-bold text-sky-800 hover:underline">
          Publish listings to begin receiving buyer leads →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.map((lead) => (
        <div key={lead._id} className="py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 truncate">{lead.name || 'Prospect'}</span>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {lead.phone} • {lead.property?.title || lead.service || 'Property inquiry'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('leads')}
            className="px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded border border-stone-200 shrink-0"
          >
            Follow Up
          </button>
        </div>
      ))}
    </div>
  );
}

// Section: My Listings
function BrokerListingsSection({ onPromote }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('properties?mine=true&limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function handleArchive(id) {
    if (!window.confirm('Archive this listing?')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'DELETE' });
      toast('Listing archived.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Listing',
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
      header: 'Price / Purpose',
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
          <Link href={`/properties/${row._id}`} className="text-stone-700 hover:text-stone-900 font-semibold">
            View
          </Link>
          <Link href={`/properties/${row._id}/edit`} className="text-sky-800 hover:text-sky-900 font-semibold">
            Edit
          </Link>
          {row.status !== 'archived' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleArchive(row._id)}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Archive
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
          <h2 className="text-xl font-bold text-stone-900">Broker Portfolio Listings</h2>
          <p className="text-xs text-stone-500">Manage client listings, pricing, and promotional reach</p>
        </div>
        <Link
          href="/post-property"
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <Plus size={15} /> Add New Listing
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Search listings by title or city…"
        filterKey="status"
        filterOptions={[
          { value: 'approved', label: 'Approved & Active' },
          { value: 'pending', label: 'Pending Approval' },
          { value: 'archived', label: 'Archived' }
        ]}
      />
    </div>
  );
}

// Section: Leads Pipeline
function BrokerLeadsSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('leads?page=1&limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  const leadStatuses = [
    'new',
    'contacted',
    'interested',
    'visit_scheduled',
    'negotiation',
    'converted',
    'closed'
  ];

  async function updateStatus(id, newStatus) {
    setBusy(id);
    try {
      await api(`leads/${id}`, { method: 'PATCH', body: { status: newStatus } });
      toast(`Lead updated to ${newStatus}.`);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Customer / Lead',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.name || 'Prospect'}</span>
          <span className="text-[11px] text-stone-500 block truncate flex items-center gap-1">
            <Phone size={11} /> {row.phone}
          </span>
        </div>
      )
    },
    {
      header: 'Interested Property',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.property?.title || 'Property listing'}
        </span>
      )
    },
    {
      header: 'Enquiry Date',
      render: (row) => <span className="text-stone-500 text-xs">{date(row.createdAt)}</span>
    },
    {
      header: 'Pipeline Stage',
      render: (row) => (
        <select
          value={row.status}
          disabled={busy === row._id}
          onChange={(e) => updateStatus(row._id, e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-stone-800"
        >
          {leadStatuses.map((st) => (
            <option key={st} value={st}>
              {st.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      )
    },
    {
      header: 'Notes',
      render: (row) => (
        <span className="text-xs text-stone-500 line-clamp-1">
          {row.note || 'No notes added'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Leads Pipeline</h2>
        <p className="text-xs text-stone-500">Track prospective buyers across New, Contacted, Interested, Visit, Negotiation &amp; Converted</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No leads in your pipeline yet"
        emptySubtitle="Inquiries from interested buyers will appear here in real-time."
      />
    </div>
  );
}

// Section: Visits
function BrokerVisitsSection() {
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
      header: 'Client / Buyer',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.user?.name || 'Visitor'}</span>
          <span className="text-[11px] text-stone-400 block truncate">{row.user?.phone || 'Phone verified'}</span>
        </div>
      )
    },
    {
      header: 'Property',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.property?.title || 'Listing'}
        </span>
      )
    },
    {
      header: 'Time',
      render: (row) => <span className="font-semibold text-stone-800">{date(row.scheduledAt)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'requested' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'confirmed')}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold"
            >
              Confirm
            </button>
          )}
          {row.status === 'confirmed' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'completed')}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
            >
              Done
            </button>
          )}
          {['requested', 'confirmed'].includes(row.status) && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'cancelled')}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Client Property Visits</h2>
        <p className="text-xs text-stone-500">Coordinate and confirm buyer walkthroughs across your client listings</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No visits scheduled"
        emptySubtitle="Client visit requests will be listed here."
      />
    </div>
  );
}

// Section: Clients Directory
function BrokerClientsSection() {
  const { data } = useData('leads?page=1&limit=100');
  const items = data?.items || [];

  // Group unique clients by phone or name
  const clientMap = new Map();
  items.forEach((item) => {
    const key = item.phone || item.name || 'Unknown';
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        name: item.name || 'Client',
        phone: item.phone || '—',
        email: item.email || '—',
        city: item.city || 'Bengaluru',
        firstContact: item.createdAt,
        totalInquiries: 1,
        latestStatus: item.status
      });
    } else {
      clientMap.get(key).totalInquiries += 1;
    }
  });

  const clients = Array.from(clientMap.values());

  const columns = [
    {
      header: 'Client Name',
      render: (row) => <span className="font-bold text-stone-900">{row.name}</span>
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div className="text-xs">
          <span className="text-stone-800 block">{row.phone}</span>
          <span className="text-stone-400 block">{row.email}</span>
        </div>
      )
    },
    {
      header: 'City',
      render: (row) => <span className="text-stone-600 text-xs">{row.city}</span>
    },
    {
      header: 'Total Inquiries',
      render: (row) => <span className="font-bold text-stone-800">{row.totalInquiries}</span>
    },
    {
      header: 'Latest Status',
      render: (row) => <StatusBadge status={row.latestStatus} />
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Client Directory</h2>
        <p className="text-xs text-stone-500">Homebuyers and prospective investors who have engaged with your listings</p>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        emptyTitle="No clients recorded yet"
        emptySubtitle="Clients who inquire or schedule visits will be organized into your directory."
      />
    </div>
  );
}

// Section: Analytics
function BrokerAnalyticsSection({ stats }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Performance Analytics</h2>
        <p className="text-xs text-stone-500">Lead generation, tour completion rate, and listing reach</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Views"
          value={stats.views}
          subtitle="Total discovery reach"
          icon={Eye}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Buyer Leads"
          value={stats.totalLeads}
          subtitle="Pipeline opportunities"
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Tours Conducted"
          value={stats.upcomingVisits}
          subtitle="Site visits confirmed"
          icon={Calendar}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Conversion Rate"
          value="18.6%"
          subtitle="Lead-to-tour closure"
          icon={TrendingUp}
          color="#b45309"
          bgIcon="#fef3c7"
        />
      </div>

      <AnalyticsChart
        title="Weekly Deal Flow &amp; Interactions"
        subtitle="Trend analysis for your brokerage team"
        type="bar"
        height={260}
      />
    </div>
  );
}

// Section: Promotions
function BrokerPromotionsSection({ onPromote }) {
  const { data } = useData('promotions');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Listing Promotions</h2>
        <p className="text-xs text-stone-500">Featured visibility plans for fast-moving client properties</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <Sparkles size={32} className="mx-auto text-amber-400" />
          <h3 className="font-bold text-stone-800 text-sm">No active promotions</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Feature your top client properties on the homepage to generate 5x more buyer enquiries.
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

// Section: Messages
function BrokerMessagesSection() {
  const { data } = useData('threads?limit=20');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Client Messages</h2>
        <p className="text-xs text-stone-500">Direct message threads with buyers and property owners</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <MessageCircle size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No conversations yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Client messages from prospective buyers will be delivered here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t._id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{t.subject || 'Client Discussion'}</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Participants: {t.participants?.map((p) => p.name).join(', ')}
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

// Section: Profile
function BrokerProfileSection() {
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
          reraId: form.get('reraId'),
          experience: form.get('experience'),
          bio: form.get('bio')
        }
      });
      setUser(res.user);
      toast('Broker agency profile updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Broker &amp; Agency Accreditation</h2>
        <p className="text-xs text-stone-500">RERA licensing, firm name, and professional advisory details</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Lead Broker Name</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Agency / Brokerage Firm</label>
            <input
              name="company"
              defaultValue={user?.company || ''}
              placeholder="e.g. Skyline Realty, Apex Homes"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">RERA License ID *</label>
            <input
              name="reraId"
              required
              defaultValue={user?.reraId || ''}
              placeholder="e.g. PRM/KA/RERA/..."
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Years in Real Estate</label>
            <input
              name="experience"
              defaultValue={user?.experience || ''}
              placeholder="e.g. 10+ years"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Agency Overview &amp; Localities</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="Describe your property portfolio, key micro-markets, and advisory standard…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Broker Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

