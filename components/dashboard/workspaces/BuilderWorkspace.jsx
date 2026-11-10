'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import AnalyticsChart from '../shared/AnalyticsChart';
import PromotionModal from '../shared/PromotionModal';
import {
  Building2,
  Layers,
  Plus,
  ClipboardList,
  Calendar,
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
  Award,
  Users,
  Mail,
  Globe,
  UploadCloud,
  X
} from 'lucide-react';

export default function BuilderWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData, reload: reloadDashboard } = useData('dashboard');
  const [promotionTarget, setPromotionTarget] = useState(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProjectSuccess = () => {
    reloadDashboard?.();
    setRefreshKey((k) => k + 1);
  };

  const stats = dashData?.builder || {
    projects: 0,
    activeProjects: 0,
    enquiries: 0,
    upcomingSiteVisits: 0,
    views: 0
  };

  const renderSection = () => {
    if (section === 'builder-profile') {
      return <BuilderProfileSection />;
    }
    if (section === 'projects') {
      return (
        <BuilderProjectsSection
          key={refreshKey}
          onOpenAdd={() => setAddProjectOpen(true)}
          onPromote={(proj) => setPromotionTarget(proj)}
        />
      );
    }
    if (section === 'enquiries') {
      return <BuilderEnquiriesSection />;
    }
    if (section === 'visits') {
      return <BuilderSiteVisitsSection />;
    }
    if (section === 'clients') {
      return <BuilderClientsSection />;
    }
    if (section === 'performance') {
      return <BuilderPerformanceSection stats={stats} />;
    }
    if (section === 'messages') {
      return <BuilderMessagesSection />;
    }
    if (section === 'profile') {
      return <BuilderSettingsSection />;
    }

    // Default: Overview
    return (
      <div className="space-y-8">
        {/* Header welcome banner */}
        <div className="bg-gradient-to-r from-[#163e35] via-[#1c4a40] to-[#24564a] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="max-w-2xl relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-[#d8edb3] font-bold text-xs uppercase tracking-wider">
              <Building2 size={14} /> Real Estate Developer Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Builder
            </h2>
            <p className="text-xs sm:text-sm text-[#ecf2e4]/90 leading-relaxed">
              Showcase residential townships, luxury developments, and commercial towers. Manage RERA brochures, floor configurations, and site inspection footfalls.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setAddProjectOpen(true)}
              className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={15} /> Add New Development
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('projects')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20"
            >
              Manage Projects ({stats.projects})
            </button>
          </div>
        </div>

        {/* KPI Cards: Manage projects, Manage project enquiries, Schedule site visits, Track project performance */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Manage Projects"
            value={stats.projects}
            subtitle={`${stats.activeProjects || stats.projects} developments`}
            icon={Building2}
            color="#163e35" bgIcon="#ecf2e4"
            onClick={() => onSelectSection('projects')}
          />
          <StatCard
            title="Manage Project Enquiries"
            value={stats.enquiries}
            subtitle="Direct buyer inquiries"
            icon={ClipboardList}
            color="#749546" bgIcon="#ecf2e4"
            onClick={() => onSelectSection('enquiries')}
          />
          <StatCard
            title="Schedule Site Visits"
            value={stats.upcomingSiteVisits}
            subtitle="Sample flat & tower tours"
            icon={Calendar}
            color="#163e35" bgIcon="#ecf2e4"
            onClick={() => onSelectSection('visits')}
          />
          <StatCard
            title="Track Project Performance"
            value={stats.views}
            subtitle="Catalog impressions"
            icon={BarChart3}
            color="#6d28d9"
            bgIcon="#f5f3ff"
            onClick={() => onSelectSection('performance')}
          />
        </div>

        {/* Analytics Chart */}
        <AnalyticsChart
          title="Project Discovery Impressions & Inquiries"
          subtitle="Weekly township interest across major cities"
          data={stats.analytics}
          dataKeys={[
            { key: 'views', name: 'Views', color: '#b45309' },
            { key: 'enquiries', name: 'Enquiries', color: '#0369a1' },
            { key: 'visits', name: 'Site Visits', color: '#047857' }
          ]}
        />

        {/* Recent Projects List */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Active Projects & Towers</h3>
              <p className="text-xs text-stone-500">Developments featured in public builder showcases</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection('projects')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <BuilderRecentProjectsList
            key={refreshKey}
            onOpenAdd={() => setAddProjectOpen(true)}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSection()}
      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        onSuccess={handleProjectSuccess}
      />
      {promotionTarget && (
        <PromotionModal
          isOpen={Boolean(promotionTarget)}
          target={promotionTarget}
          targetType="project"
          onClose={() => setPromotionTarget(null)}
          onPromoted={() => setPromotionTarget(null)}
        />
      )}
    </>
  );
}

// Sub-component: Recent Projects
function BuilderRecentProjectsList({ onOpenAdd }) {
  const { data, loading } = useData('projects?mine=true&limit=4');
  const items = data?.items || [];

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading developments…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <Building2 size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No builder projects published yet.</p>
        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-block text-xs font-bold text-amber-800 hover:underline"
        >
          Add your first project or tower development →
        </button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((proj) => (
        <div key={proj._id} className="p-4 border border-stone-200 rounded-xl flex gap-3.5 hover:border-stone-300 transition-all">
          <img
            src={proj.images?.[0] || '/placeholder.jpg'}
            alt={proj.title}
            className="w-20 h-20 rounded-lg object-cover shrink-0 bg-stone-100"
          />
          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-stone-900 truncate">{proj.title}</span>
                <StatusBadge status={proj.stage || proj.status} />
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5">{proj.locality}, {proj.city}</p>
              <div className="font-extrabold text-sm text-stone-900 mt-1">
                Starting {money(proj.price || 0)}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <Link href={`/projects/${proj._id}`} className="text-amber-800 font-semibold hover:underline">
                Brochure
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Section: Builder Profile
function BuilderProfileSection() {
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
      toast('Builder profile updated successfully.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Developer &amp; Firm Profile</h2>
        <p className="text-xs text-stone-500">Corporate RERA registration and public brand credentials</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Lead Contact Person</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Developer / Firm Name *</label>
            <input
              name="company"
              required
              defaultValue={user?.company || ''}
              placeholder="e.g. Prestige Urban Developers"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Corporate RERA Registration *</label>
            <input
              name="reraId"
              required
              defaultValue={user?.reraId || ''}
              placeholder="e.g. PRM/KA/RERA/DEV-1002"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Headquarters Phone</label>
            <input
              name="phone"
              required
              defaultValue={user?.phone || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Track Record &amp; Experience</label>
          <input
            name="experience"
            defaultValue={user?.experience || ''}
            placeholder="e.g. 15+ years in residential construction, 20+ delivered projects"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Developer Overview &amp; Vision</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="Describe your architectural standards, sustainability commitments, and delivery track record…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Builder Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Section: My Projects
function BuilderProjectsSection({ onPromote, onOpenAdd }) {
  const { data, loading } = useData('projects?mine=true&limit=100');
  const items = data?.items || [];

  const columns = [
    {
      header: 'Development / Township',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <img
            src={row.images?.[0] || '/placeholder.jpg'}
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover shrink-0 bg-stone-100"
          />
          <div className="min-w-0">
            <span className="font-bold text-stone-900 block truncate">{row.title}</span>
            <span className="text-[11px] text-stone-400 block truncate">
              {row.locality}, {row.city} • {row.acres || '10+'} Acres
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Price Range',
      render: (row) => (
        <div>
          <span className="font-extrabold text-stone-900 block">{money(row.price || 0)}</span>
          <span className="text-[11px] text-stone-400">up to {money(row.maxPrice || row.price || 0)}</span>
        </div>
      )
    },
    {
      header: 'Stage / Status',
      render: (row) => <StatusBadge status={row.stage || row.status} />
    },
    {
      header: 'Possession Date',
      render: (row) => <span className="font-semibold text-stone-800 text-xs">{row.possession || '2026'}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link href={`/projects/${row._id}`} className="text-stone-700 hover:text-stone-900 font-semibold text-xs">
            View
          </Link>
          {onPromote && (
            <button
              type="button"
              onClick={() => onPromote(row)}
              className="text-amber-700 hover:text-amber-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} className="text-amber-500" />
              Promote
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
          <h2 className="text-xl font-bold text-stone-900">Manage Projects</h2>
          <p className="text-xs text-stone-500">Add configurations, floor plans, possession dates, and promotional tiers</p>
        </div>
        <button
          type="button"
          onClick={onOpenAdd}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <Plus size={15} /> Add New Project
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Search developments by name or city…"
        filterKey="stage"
        filterOptions={[
          { value: 'New launch', label: 'New Launch' },
          { value: 'Under construction', label: 'Under Construction' },
          { value: 'Ready to move', label: 'Ready to Move' }
        ]}
      />
    </div>
  );
}

// Section: Project Enquiries
function BuilderEnquiriesSection() {
  const { toast } = useApp();
  const { data, reload } = useData('leads?kind=project&page=1&limit=50');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function updateStatus(id, newStatus) {
    setBusy(id);
    try {
      await api(`leads/${id}`, { method: 'PATCH', body: { status: newStatus } });
      if (['deal_closed', 'closed', 'converted'].includes(newStatus)) {
        toast('🎉 Deal marked as closed! Customer added to your Project Clients directory.');
      } else {
        toast(`Enquiry marked as ${newStatus.replace(/_/g, ' ')}.`);
      }
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Prospective Buyer',
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
      header: 'Project / Development',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.project?.title || 'Builder Project'}
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
      header: 'Customer Requirement',
      render: (row) => <span className="text-stone-500 text-xs line-clamp-1">{row.note || '—'}</span>
    },
    {
      header: 'Actions',
      render: (row) => {
        const isClosed = ['deal_closed', 'closed', 'converted'].includes(row.status);
        return (
          <div className="flex items-center gap-2">
            {!isClosed ? (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => updateStatus(row._id, 'deal_closed')}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Mark deal as closed & add customer to clients"
              >
                <CheckCircle2 size={12} />
                <span>Close Deal</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-600" /> Deal Closed
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Manage Project Enquiries</h2>
        <p className="text-xs text-stone-500">Inquiries submitted on your builder projects and townships</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No project inquiries found"
        emptySubtitle="Prospective homebuyer inquiries will be captured here."
      />
    </div>
  );
}

// Section: Builder Clients Directory
function BuilderClientsSection() {
  const { data, reload } = useData('leads?page=1&limit=100');
  const items = data?.items || [];
  const [activeTab, setActiveTab] = useState('buyers'); // 'buyers' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Group unique clients and categorize buyers
  const clientMap = new Map();
  items.forEach((item) => {
    const key = String(item.user?._id || item.user || item.phone || item.email || item.name || 'Unknown').toLowerCase().trim();
    const isClosedDeal = ['deal_closed', 'closed', 'converted'].includes(item.status);
    const propInfo = item.project || item.property;

    if (!clientMap.has(key)) {
      clientMap.set(key, {
        _id: item._id,
        leadId: item._id,
        customerId: item.user?._id || item.user || null,
        name: item.name || item.user?.name || 'Client',
        phone: item.phone || item.user?.phone || '—',
        email: item.email || item.user?.email || '—',
        city: item.city || 'Hyderabad',
        firstContact: item.createdAt,
        totalInquiries: 1,
        latestStatus: item.status,
        hasClosedDeal: isClosedDeal,
        closedDealsCount: isClosedDeal ? 1 : 0,
        purchasedProperties: isClosedDeal && propInfo ? [propInfo] : [],
        recentProperty: propInfo
      });
    } else {
      const existing = clientMap.get(key);
      existing.totalInquiries += 1;
      if (isClosedDeal) {
        existing.hasClosedDeal = true;
        existing.closedDealsCount += 1;
        if (propInfo && !existing.purchasedProperties.some((p) => String(p._id) === String(propInfo._id))) {
          existing.purchasedProperties.push(propInfo);
        }
        existing.latestStatus = item.status;
      }
    }
  });

  const allClients = Array.from(clientMap.values());
  const buyersList = allClients.filter((c) => c.hasClosedDeal);

  const displayedClients = (activeTab === 'buyers' ? buyersList : allClients).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.purchasedProperties.some((p) => (p.title || '').toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      header: 'Buyer / Client',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-stone-200">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">{row.name}</span>
              {row.hasClosedDeal && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 size={10} className="text-emerald-600" /> Closed Deal / Buyer
                </span>
              )}
            </div>
            <span className="text-[11px] text-stone-400 block">First engaged: {date(row.firstContact)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <a href={`tel:${row.phone}`} className="text-stone-800 hover:text-forest font-semibold flex items-center gap-1">
            <Phone size={11} className="text-stone-400" /> {row.phone}
          </a>
          <a href={`mailto:${row.email}`} className="text-stone-500 hover:text-forest flex items-center gap-1">
            <Mail size={11} className="text-stone-400" /> {row.email}
          </a>
        </div>
      )
    },
    {
      header: 'Purchased / Project Deal',
      render: (row) => {
        if (row.hasClosedDeal && row.purchasedProperties.length > 0) {
          const prop = row.purchasedProperties[0];
          return (
            <div className="text-xs max-w-xs">
              <span className="font-extrabold text-stone-900 block truncate text-[13px]">{prop.title}</span>
              <span className="text-[11px] text-emerald-700 font-bold block">
                {money(prop.price || prop.priceMin || 0)} • {prop.locality || row.city}
              </span>
            </div>
          );
        }
        return (
          <span className="text-xs text-stone-500 truncate block max-w-xs">
            {row.recentProperty?.title ? `Inquired on ${row.recentProperty.title}` : 'Project Inquiry'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.latestStatus} />
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.phone && row.phone !== '—' ? (
            <a
              href={`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </a>
          ) : (
            <span className="text-xs text-stone-400">—</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Project Buyers &amp; Clients</h2>
          <p className="text-xs text-stone-500">
            Clients who bought units or townships from you and prospective buyers who engaged with your projects
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('buyers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 size={12} className={activeTab === 'buyers' ? 'text-emerald-600' : ''} />
            <span>Closed Deals / Buyers ({buyersList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>All Clients ({allClients.length})</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search buyers by name, phone, email, or development…"
          className="w-full sm:max-w-md px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest text-stone-900 placeholder:text-stone-400 shadow-2xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={displayedClients}
        emptyTitle={activeTab === 'buyers' ? 'No closed deals / buyers yet' : 'No clients recorded yet'}
        emptySubtitle={
          activeTab === 'buyers'
            ? 'When you close a deal on a project enquiry, the buyer will automatically appear in this section.'
            : 'Clients who inquire or tour your projects will be organized into your directory.'
        }
      />
    </div>
  );
}

// Section: Site Visits
function BuilderSiteVisitsSection() {
  const { toast } = useApp();
  const { data, reload } = useData('visits?page=1&limit=50');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function updateVisit(id, status) {
    setBusy(id);
    try {
      await api(`visits/${id}`, { method: 'PATCH', body: { status } });
      toast(`Site visit marked as ${status}.`);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Visitor / Buyer',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.user?.name || 'Visitor'}</span>
          <span className="text-[11px] text-stone-400 block truncate">{row.user?.phone || 'Phone verified'}</span>
        </div>
      )
    },
    {
      header: 'Development',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.project?.title || row.property?.title || 'Township Site Visit'}
        </span>
      )
    },
    {
      header: 'Tour Date & Time',
      render: (row) => <span className="font-semibold text-stone-800">{date(row.scheduledAt)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Site Office Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'requested' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'confirmed')}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold"
            >
              Confirm Tour
            </button>
          )}
          {row.status === 'confirmed' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'completed')}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
            >
              Mark Visited
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Schedule Site Visits</h2>
        <p className="text-xs text-stone-500">Manage buyer walkthroughs and sample flat inspections</p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No site visits scheduled"
        emptySubtitle="Tour bookings on your developments will appear here."
      />
    </div>
  );
}

// Section: Performance
function BuilderPerformanceSection({ stats }) {
  const conversionRate = stats.views > 0
    ? (((Number(stats.enquiries) || 0) / Number(stats.views)) * 100).toFixed(1) + '%'
    : (stats.enquiries > 0 ? '100%' : '0.0%');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Track Project Performance</h2>
        <p className="text-xs text-stone-500">Brochure downloads, footfalls, and unit interest metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Catalog Views"
          value={stats.views}
          subtitle="Total discovery impressions"
          icon={Eye}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Unit Enquiries"
          value={stats.enquiries}
          subtitle="Brochure requests"
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Site Footfalls"
          value={stats.upcomingSiteVisits}
          subtitle="Sample flat visits"
          icon={Calendar}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Conversion"
          value={conversionRate}
          subtitle="Tour-to-inquiry ratio"
          icon={TrendingUp}
          color="#6d28d9"
          bgIcon="#f5f3ff"
        />
      </div>

      <AnalyticsChart
        title="Weekly Township Impressions & Tours"
        subtitle="Interaction volume across your development portfolio"
        data={stats.analytics}
        dataKeys={[
          { key: 'views', name: 'Views', color: '#b45309' },
          { key: 'enquiries', name: 'Enquiries', color: '#0369a1' },
          { key: 'visits', name: 'Site Visits', color: '#047857' }
        ]}
        type="area"
        height={260}
      />
    </div>
  );
}

// Section: Promotions
function BuilderPromotionsSection({ onPromote }) {
  const { data } = useData('promotions');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Township &amp; Launch Promotions</h2>
        <p className="text-xs text-stone-500">Feature your pre-launch towers with top banner visibility</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <Sparkles size={32} className="mx-auto text-amber-400" />
          <h3 className="font-bold text-stone-800 text-sm">No active promotions</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Promote new launches on the UrbanFindr homepage banner to reach thousands of prospective buyers.
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
function BuilderMessagesSection() {
  const { data } = useData('threads?limit=20');
  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Buyer &amp; Channel Inquiries</h2>
        <p className="text-xs text-stone-500">Direct message threads regarding pricing, units, and site visits</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <MessageCircle size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No discussions yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Discussions initiated by prospective buyers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t._id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{t.subject || 'Township Discussion'}</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Buyer: {t.participants?.map((p) => p.name).join(', ')}
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

// Section: Settings
function BuilderSettingsSection() {
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
          company: form.get('company')
        }
      });
      setUser(res.user);
      toast('Settings updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Builder Workspace Settings</h2>
        <p className="text-xs text-stone-500">Configure account preferences and team notification contacts</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Lead Admin Name</label>
          <input
            name="name"
            required
            defaultValue={user?.name || ''}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Company / Developer Name</label>
          <input
            name="company"
            defaultValue={user?.company || ''}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Phone</label>
          <input
            name="phone"
            defaultValue={user?.phone || ''}
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          {busy ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

// Modal: Add Project
function AddProjectModal({ isOpen, onClose, onSuccess }) {
  const { user, toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState(['/photos/builder-1.jpg']);
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api('uploads', { method: 'POST', body: fd });
      if (res?.url) {
        setImages((prev) => [res.url, ...prev.filter((img) => img !== '/photos/builder-1.jpg')]);
        toast('Project photo uploaded!');
      } else if (res?.urls?.length) {
        setImages((prev) => [...res.urls, ...prev.filter((img) => img !== '/photos/builder-1.jpg')]);
        toast('Project photos uploaded!');
      }
    } catch (err) {
      toast(err.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleAddCustomUrl() {
    const val = customUrl.trim();
    if (!val) return;
    if (!/^https:\/\//i.test(val) && !/^\/photos\//i.test(val) && !/^\/uploads\//i.test(val)) {
      toast('Please enter a valid HTTPS URL (e.g. https://...)');
      return;
    }
    setImages((prev) => [val, ...prev.filter((img) => img !== '/photos/builder-1.jpg')]);
    setCustomUrl('');
  }

  function handleRemoveImage(index) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : ['/photos/builder-1.jpg'];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const titleVal = String(form.get('title') || '').trim();
      const title = titleVal.length >= 4 ? titleVal : (titleVal ? `${titleVal} Residency` : 'Urban Heights Residency');
      const city = String(form.get('city') || 'Bengaluru').trim();
      const locality = String(form.get('locality') || 'Whitefield').trim();
      const price = Number(form.get('price')) || 7500000;
      const maxPrice = Number(form.get('maxPrice')) || Math.round(price * 1.5);
      const acres = Number(form.get('acres')) || 5;
      const units = Number(form.get('units')) || 120;
      const towers = Number(form.get('towers')) || 4;
      const area = Number(form.get('area')) || Math.round(price / 6500) || 1200;
      const possVal = String(form.get('possession') || '').trim();
      const possession = possVal.length >= 4 ? possVal : 'Dec 2026';
      const stage = form.get('stage') || 'New launch';
      const reraVal = String(form.get('rera') || '').trim();
      const rera = reraVal.length >= 3 ? reraVal : 'PRM/KA/RERA/2026/001';
      const descVal = String(form.get('description') || '').trim();
      const description = descVal.length >= 30
        ? descVal
        : `${title} is a premium residential development in ${locality}, ${city} offering luxury apartments, world-class clubhouse amenities, landscaped gardens, and 24/7 security.`;

      const safeImages = images.filter((img) =>
        /^https:\/\//i.test(img) ||
        /^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(img) ||
        /^\/photos\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(img)
      );
      const finalImages = safeImages.length > 0 ? safeImages : ['/photos/builder-1.jpg'];

      const data = {
        title,
        builder: user?.company || user?.name || 'Builder Developer',
        city,
        locality,
        price,
        maxPrice: Math.max(price, maxPrice),
        acres,
        units,
        towers,
        area,
        possession,
        stage,
        rera,
        description,
        amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Park', '24/7 Security'],
        images: finalImages,
        configurations: [
          { name: '2 BHK', area: Math.round(area * 0.9), price, plan: '/images/plan-1.svg' },
          { name: '3 BHK', area: Math.round(area * 1.3), price: maxPrice, plan: '/images/plan-2.svg' }
        ]
      };

      await api('projects', {
        method: 'POST',
        body: data
      });

      toast('New builder project published successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to publish project.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-900/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 truncate">Add New Project / Tower</h2>
              <p className="text-xs text-stone-500 truncate">Publish a new township or residential development</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Development / Project Name *</label>
              <input
                name="title"
                required
                minLength={4}
                placeholder="e.g. Prestige Lakeview Towers"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                <input
                  name="city"
                  required
                  defaultValue="Bengaluru"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Locality *</label>
                <input
                  name="locality"
                  required
                  placeholder="e.g. Whitefield"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Min Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="e.g. 7500000"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Max Price (₹) *</label>
                <input
                  name="maxPrice"
                  type="number"
                  required
                  placeholder="e.g. 18500000"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Total Acres</label>
                <input
                  name="acres"
                  type="number"
                  defaultValue={10}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Total Units</label>
                <input
                  name="units"
                  type="number"
                  defaultValue={120}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Towers</label>
                <input
                  name="towers"
                  type="number"
                  defaultValue={4}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Unit Area (sq ft)</label>
                <input
                  name="area"
                  type="number"
                  defaultValue={1450}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Stage *</label>
                <select
                  name="stage"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                >
                  <option value="New launch">New Launch</option>
                  <option value="Under construction">Under Construction</option>
                  <option value="Ready to move">Ready to Move</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Possession Year</label>
                <input
                  name="possession"
                  minLength={4}
                  defaultValue="Dec 2026"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">RERA Project Registration ID *</label>
              <input
                name="rera"
                required
                minLength={3}
                defaultValue="PRM/KA/RERA/2026/001"
                placeholder="e.g. PRM/KA/RERA/1251/2026"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 font-mono uppercase"
              />
              <p className="text-[11px] text-stone-400 mt-1">Minimum 3 characters (e.g. PRM/KA/RERA/2026/001).</p>
            </div>

            {/* Project Photos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700">Project Photos &amp; Elevation *</label>
                <label className="text-xs font-bold text-[#163e35] hover:underline cursor-pointer flex items-center gap-1">
                  <UploadCloud size={13} />
                  <span>{uploading ? 'Uploading…' : 'Upload photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Photo thumbnails */}
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-200 group bg-stone-100 shrink-0">
                    <img src={img} alt={`Project photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full hover:bg-black transition-opacity"
                        title="Remove photo"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom HTTPS Image URL input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Or enter HTTPS photo URL (https://...)"
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors shrink-0"
                >
                  Add URL
                </button>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Accepts uploaded JPEG/PNG/WebP photos or HTTPS image links.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Project Description *</label>
              <textarea
                name="description"
                rows={3}
                defaultValue="Exclusive residential community offering modern apartments and townhomes with scenic landscaping, clubhouse amenities, and 24/7 security."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
              />
              <p className="text-[11px] text-stone-400 mt-1">Minimum 30 characters describing development amenities and highlights.</p>
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="p-3.5 sm:p-4 border-t border-stone-100 flex items-center justify-end gap-3 bg-stone-50/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing…
                </>
              ) : (
                'Publish Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

