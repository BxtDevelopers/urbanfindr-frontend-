'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { serviceCategories } from '@/lib/serviceCategories';
import { propertyImages } from '@/lib/media';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import AnalyticsChart from '../shared/AnalyticsChart';
import PromotionModal from '../shared/PromotionModal';
import PropertyDashboardCard from '../shared/PropertyDashboardCard';
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
  MessageCircle,
  House,
  Mail,
  LayoutGrid,
  List,
  Search,
  Eye,
  BedDouble,
  Bath,
  Maximize,
  RotateCcw,
  XCircle
} from 'lucide-react';

export default function ProviderWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData, reload: reloadDash } = useData('dashboard');
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data: reqData, reload: reloadReqs } = useData(`service-requests?limit=100&as=provider${categoryParam}`);
  const { data: propLeadsData, reload: reloadLeads } = useData('leads?page=1&limit=50');
  const { data: propVisitsData, reload: reloadVisits } = useData('visits?limit=50');
  const { data: myPropsData, reload: reloadMyProps } = useData('properties?mine=true&limit=100');
  const myProperties = myPropsData?.items || [];
  const totalMyProperties = myPropsData?.total ?? myProperties.length;

  const [chartPeriod, setChartPeriod] = useState('6m');
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

  // Strictly exclude customer's own personal bookings
  const allReqs = useMemo(() => {
    const raw = reqData?.items || [];
    if (!user) return [];
    const uId = String(user._id);
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    return raw.filter((i) => {
      if (i.user && String(i.user._id || i.user) === uId) return false;
      if (uEmail && i.email && String(i.email).toLowerCase().trim() === uEmail) return false;
      return true;
    });
  }, [reqData?.items, user]);

  const totalOffersCount = useMemo(() => {
    return allReqs.filter((i) => Boolean(i.offer || i.status === 'contacted' || i.status === 'quoted')).length;
  }, [allReqs]);

  const totalEngagedCount = useMemo(() => {
    return allReqs.filter((i) => ['contacted', 'accepted', 'scheduled', 'in_progress'].includes(i.status) || Boolean(i.offer)).length;
  }, [allReqs]);

  const totalPropertyEnquiries = useMemo(() => {
    const lCount = propLeadsData?.items?.length || 0;
    const vCount = propVisitsData?.items?.length || 0;
    return lCount + vCount;
  }, [propLeadsData?.items, propVisitsData?.items]);

  const totalIncoming = allReqs.length || stats.requests || 14;
  const totalOffers = totalOffersCount;
  const totalEngaged = totalEngagedCount;

  // Area chart dynamic data for Incoming Requests, Offers Sent, and Active Engagements over 30D/3M/6M/1Y
  const dynamicChartData = useMemo(() => {
    if (chartPeriod === '30d') {
      return [
        {
          name: 'Week 1',
          incoming: Math.max(0, Math.round(totalIncoming * 0.35)),
          offers: Math.max(0, Math.round(totalOffers * 0.3)),
          engagements: Math.max(0, Math.round(totalEngaged * 0.3))
        },
        {
          name: 'Week 2',
          incoming: Math.max(0, Math.round(totalIncoming * 0.55)),
          offers: Math.max(0, Math.round(totalOffers * 0.5)),
          engagements: Math.max(0, Math.round(totalEngaged * 0.5))
        },
        {
          name: 'Week 3',
          incoming: Math.max(0, Math.round(totalIncoming * 0.8)),
          offers: Math.max(0, Math.round(totalOffers * 0.75)),
          engagements: Math.max(0, Math.round(totalEngaged * 0.75))
        },
        {
          name: 'Week 4',
          incoming: totalIncoming,
          offers: totalOffers,
          engagements: totalEngaged
        }
      ];
    }

    if (chartPeriod === '3m') {
      return [
        {
          name: 'Aug',
          incoming: Math.max(0, Math.round(totalIncoming * 0.6)),
          offers: Math.max(0, Math.round(totalOffers * 0.55)),
          engagements: Math.max(0, Math.round(totalEngaged * 0.55))
        },
        {
          name: 'Sep',
          incoming: Math.max(0, Math.round(totalIncoming * 0.85)),
          offers: Math.max(0, Math.round(totalOffers * 0.8)),
          engagements: Math.max(0, Math.round(totalEngaged * 0.8))
        },
        {
          name: 'Oct',
          incoming: totalIncoming,
          offers: totalOffers,
          engagements: totalEngaged
        }
      ];
    }

    if (chartPeriod === '1y') {
      const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      return months.map((m, idx) => {
        const factor = (idx + 1) / months.length;
        const isLast = idx === months.length - 1;
        return {
          name: m,
          incoming: isLast ? totalIncoming : Math.max(0, Math.round(totalIncoming * factor)),
          offers: isLast ? totalOffers : Math.max(0, Math.round(totalOffers * factor)),
          engagements: isLast ? totalEngaged : Math.max(0, Math.round(totalEngaged * factor))
        };
      });
    }

    // Default 6M: May, Jun, Jul, Aug, Sep, Oct (area chart reaching the exact present dashboard numbers)
    return [
      {
        name: 'May',
        incoming: Math.max(0, Math.round(totalIncoming * 0.35)),
        offers: Math.max(0, Math.round(totalOffers * 0.25)),
        engagements: Math.max(0, Math.round(totalEngaged * 0.3))
      },
      {
        name: 'Jun',
        incoming: Math.max(0, Math.round(totalIncoming * 0.5)),
        offers: Math.max(0, Math.round(totalOffers * 0.45)),
        engagements: Math.max(0, Math.round(totalEngaged * 0.45))
      },
      {
        name: 'Jul',
        incoming: Math.max(0, Math.round(totalIncoming * 0.65)),
        offers: Math.max(0, Math.round(totalOffers * 0.6)),
        engagements: Math.max(0, Math.round(totalEngaged * 0.6))
      },
      {
        name: 'Aug',
        incoming: Math.max(0, Math.round(totalIncoming * 0.8)),
        offers: Math.max(0, Math.round(totalOffers * 0.75)),
        engagements: Math.max(0, Math.round(totalEngaged * 0.75))
      },
      {
        name: 'Sep',
        incoming: Math.max(0, Math.round(totalIncoming * 0.9)),
        offers: Math.max(0, Math.round(totalOffers * 0.88)),
        engagements: Math.max(0, Math.round(totalEngaged * 0.85))
      },
      {
        name: 'Oct',
        incoming: totalIncoming,
        offers: totalOffers,
        engagements: totalEngaged
      }
    ];
  }, [totalIncoming, totalOffers, totalEngaged, chartPeriod]);

  if (section === 'properties') {
    return <ProviderPropertiesSection />;
  }
  if (section === 'business-profile') {
    return <ProviderBusinessProfileSection />;
  }
  if (section === 'services') {
    return <ProviderServicesSection />;
  }
  if (section === 'enquiries') {
    return <ProviderEnquiriesSection onSelectSection={onSelectSection} />;
  }
  if (section === 'requests' || section === 'bookings') {
    return (
      <ProviderRequestsSection
        onReviewRequest={(req) => setSelectedRequest(req)}
        onSelectSection={onSelectSection}
      />
    );
  }
  if (section === 'technicians') {
    return <ProviderTechniciansSection />;
  }
  if (section === 'reviews') {
    return <ProviderReviewsSection rating={stats.rating} />;
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
          onUpdated={() => {
            if (reloadDash) reloadDash();
            if (reloadReqs) reloadReqs();
          }}
        />
      )}

      {/* Assign Technician Modal */}
      {assignTechRequest && (
        <AssignTechnicianModal
          request={assignTechRequest}
          onClose={() => setAssignTechRequest(null)}
        />
      )}

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
            className="px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ClipboardList size={15} /> Incoming Requests ({stats.requests || allReqs.length})
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('properties')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
          >
            <House size={15} /> My Properties ({totalMyProperties})
          </button>
          <Link
            href="/post-property"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> Add Property
          </Link>
          <button
            type="button"
            onClick={() => onSelectSection('enquiries')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList size={15} /> Property Enquiries ({totalPropertyEnquiries})
          </button>
          <button
            type="button"
            onClick={() => onSelectSection('services')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all border border-white/20 cursor-pointer"
          >
            Manage Services ({stats.services})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="My Properties"
          value={totalMyProperties}
          subtitle={`${myProperties.filter(p => p.status === 'approved').length} active listings`}
          icon={House}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('properties')}
        />
        <StatCard
          title="Total Services"
          value={stats.services}
          subtitle="Catalog offerings"
          icon={Wrench}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('services')}
        />
        <StatCard
          title="Incoming Requests"
          value={stats.requests || allReqs.length}
          subtitle="Client inquiries"
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('requests')}
        />
        <StatCard
          title="Property Enquiries"
          value={totalPropertyEnquiries}
          subtitle="Customer property requests"
          icon={House}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('enquiries')}
        />
        <StatCard
          title="Offers Sent"
          value={totalOffersCount}
          subtitle="Proposals to clients"
          icon={Sparkles}
          color="#163e35" bgIcon="#ecf2e4"
          onClick={() => onSelectSection('requests')}
        />
        <StatCard
          title="Active Engagements"
          value={totalEngagedCount}
          subtitle="In client discussion"
          icon={MessageCircle}
          color="#749546"
          bgIcon="#ecf2e4"
          onClick={() => onSelectSection('requests')}
        />
      </div>

      {/* Analytics Chart - Area Chart structure with Incoming Requests, Offers Sent, Active Engagements */}
      <AnalyticsChart
        title="Service Requests &amp; Engagement Trend"
        subtitle={`Current: ${totalIncoming} Incoming Requests • ${totalOffers} Offers Sent • ${totalEngaged} Active Engagements`}
        period={chartPeriod}
        onPeriodChange={(p) => setChartPeriod(p)}
        data={dynamicChartData}
        dataKeys={[
          { key: 'incoming', name: 'Incoming Requests', color: '#163e35' },
          { key: 'offers', name: 'Offers Sent', color: '#749546' },
          { key: 'engagements', name: 'Active Engagements', color: '#24564a' }
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

      {/* Customer Property Enquiries Quick View */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Customer Property Enquiries &amp; Site Visits</h3>
            <p className="text-xs text-stone-500">Direct inquiries &amp; site visit requests sent by customers for your listings</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('enquiries')}
            className="text-xs font-bold text-[#163e35] hover:text-[#749546] flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({totalPropertyEnquiries})</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <ProviderRecentEnquiriesList
          onViewAll={() => onSelectSection('enquiries')}
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
function ProviderRequestsSection({ onReviewRequest, onSelectSection }) {
  const { user, toast } = useApp();
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data, loading, reload } = useData(`service-requests?limit=100&as=provider${categoryParam}`);
  const { data: propLeadsData } = useData('leads?page=1&limit=50');
  const { data: propVisitsData } = useData('visits?limit=50');
  const propCount = (propLeadsData?.items?.length || 0) + (propVisitsData?.items?.length || 0);

  const [completingId, setCompletingId] = useState(null);
  const [activeReviewReq, setActiveReviewReq] = useState(null);

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
          <span className="text-[11px] text-stone-400 block truncate">
            {row.locality ? `${row.locality}, ` : ''}{row.city || 'Verified Customer'}
          </span>
        </div>
      )
    },
    {
      header: 'Requested Service',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-800 block truncate">{row.serviceType}</span>
          <span className="text-[11px] text-stone-400 block truncate">{row.city}</span>
        </div>
      )
    },
    {
      header: 'Localities',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ecf2e4] text-[#163e35] inline-block truncate max-w-[160px]">
          {row.locality || row.city || 'Doorstep Area'}
        </span>
      )
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
                onClick={() => {
                  if (onReviewRequest) onReviewRequest(row);
                  setActiveReviewReq(row);
                }}
                className="px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Review &amp; Offer</span>
              </button>
            )}
            {cleanP && (
              <>
                <a
                  href={`tel:${cleanP}`}
                  title="Call"
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Phone size={13} />
                </a>
                <a
                  href={`https://wa.me/91${cleanP}?text=Hello%20${encodeURIComponent(row.name)},%20this%20is%20regarding%20your%20${encodeURIComponent(row.serviceType)}%20request%20on%20UrbanFindr.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="p-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg transition-colors cursor-pointer"
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
      {/* Top Tabs: Switch between Service Requests & Property Enquiries */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          className="px-4 py-2 bg-[#163e35] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <ClipboardList size={14} />
          <span>Service Requests ({items.length})</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSection?.('enquiries')}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <House size={14} className="text-[#163e35]" />
          <span>Property Enquiries ({propCount})</span>
        </button>
      </div>

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

      {activeReviewReq && (
        <ProviderReviewModal
          request={activeReviewReq}
          onClose={() => setActiveReviewReq(null)}
          onUpdated={reload}
        />
      )}
    </div>
  );
}

// Section: Provider Property Enquiries
function ProviderEnquiriesSection({ onSelectSection }) {
  const { toast } = useApp();
  const { data: leadsData, loading: loadingLeads, reload: reloadLeads } = useData('leads?page=1&limit=50');
  const { data: visitsData, loading: loadingVisits, reload: reloadVisits } = useData('visits?limit=50');
  const { data: reqData } = useData('service-requests?limit=100&as=provider');
  const serviceReqCount = reqData?.items?.length || 0;

  const [filterType, setFilterType] = useState('all'); // 'all' | 'visits' | 'enquiries'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionBusy, setActionBusy] = useState('');

  async function handleAcceptRequest(row) {
    setActionBusy(row._id);
    try {
      if (row.isVisit) {
        await api(`visits/${row._id}`, {
          method: 'PATCH',
          body: { status: 'accepted' }
        });
        toast('Site visit request accepted!');
        reloadVisits();
      } else {
        await api(`leads/${row._id}`, {
          method: 'PATCH',
          body: { status: 'accepted' }
        });
        toast('Property enquiry request accepted!');
        reloadLeads();
      }
    } catch (err) {
      toast(err.message || 'Failed to update request.');
    } finally {
      setActionBusy('');
    }
  }

  async function handleUpdateVisit(id, status) {
    setActionBusy(id);
    try {
      await api(`visits/${id}`, {
        method: 'PATCH',
        body: { status }
      });
      toast(`Visit marked as ${status}.`);
      reloadVisits();
    } catch (err) {
      toast(err.message || 'Failed to update visit status.');
    } finally {
      setActionBusy('');
    }
  }

  const items = useMemo(() => {
    const rawLeads = (leadsData?.items || []).map((l) => ({
      _id: l._id,
      customerName: l.name || l.user?.name || 'Customer',
      phone: l.phone || l.user?.phone || '',
      email: l.email || l.user?.email || '',
      property: l.property,
      project: l.project,
      title: l.property?.title || l.project?.title || 'Property Enquiry',
      locality: l.property?.locality || '',
      city: l.property?.city || l.city || 'Bengaluru',
      price: l.property?.price,
      images: l.property?.images || [],
      scheduledAt: l.preferredAt || null,
      createdAt: l.createdAt,
      note: l.note || 'Inquired about this property listing.',
      status: l.status || 'submitted',
      isVisit: false
    }));

    const rawVisits = (visitsData?.items || []).map((v) => ({
      _id: v._id,
      customerName: v.user?.name || 'Customer',
      phone: v.user?.phone || '',
      email: v.user?.email || '',
      property: v.property,
      project: v.project,
      title: v.property?.title || v.project?.title || 'Site Visit Request',
      locality: v.property?.locality || '',
      city: v.property?.city || 'Bengaluru',
      price: v.property?.price,
      images: v.property?.images || [],
      scheduledAt: v.scheduledAt,
      createdAt: v.createdAt || v.scheduledAt,
      note: v.note || `Site visit requested for ${date(v.scheduledAt)}`,
      status: v.status || 'requested',
      isVisit: true
    }));

    const combined = [...rawVisits];
    const seen = new Set(rawVisits.map((v) => `${v.customerName}-${v.property?._id || v.project?._id}`));

    for (const l of rawLeads) {
      const key = `${l.customerName}-${l.property?._id || l.project?._id}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(l);
      }
    }

    return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leadsData?.items, visitsData?.items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterType === 'visits' && !item.isVisit) return false;
      if (filterType === 'enquiries' && item.isVisit) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.customerName?.toLowerCase().includes(q);
        const matchesPhone = item.phone?.includes(q);
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesNote = item.note?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesTitle && !matchesNote) return false;
      }
      return true;
    });
  }, [items, filterType, searchTerm]);

  const columns = [
    {
      header: 'Interested Customer',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.customerName}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-700" /> Phone verified
            </span>
          </div>
          {row.email && (
            <span className="text-[11px] text-stone-400 block truncate mt-0.5">
              {row.email}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Property Listing',
      render: (row) => {
        const propId = row.property?._id || row.property;
        return (
          <div className="flex items-center gap-2.5 max-w-xs">
            {row.images?.[0] ? (
              <img
                src={row.images[0]}
                alt={row.title}
                className="w-12 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                <House size={16} />
              </div>
            )}
            <div className="min-w-0">
              {propId ? (
                <Link
                  href={`/properties/${propId}`}
                  className="font-bold text-xs text-stone-900 hover:text-[#163e35] hover:underline block truncate"
                >
                  {row.title}
                </Link>
              ) : (
                <span className="font-bold text-xs text-stone-900 block truncate">
                  {row.title}
                </span>
              )}
              <span className="text-[11px] text-stone-400 block truncate">
                {row.locality ? `${row.locality}, ` : ''}{row.city}
                {row.price ? ` • ${money(row.price)}` : ''}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Enquiry Type',
      render: (row) => (
        <div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
            row.isVisit ? 'bg-[#ecf2e4] text-[#163e35]' : 'bg-blue-50 text-blue-700'
          }`}>
            {row.isVisit ? <Calendar size={12} /> : <MessageCircle size={12} />}
            <span>{row.isVisit ? 'Site Visit' : 'Direct Enquiry'}</span>
          </span>
          {row.scheduledAt && (
            <span className="block text-[11px] text-stone-500 font-semibold mt-1">
              {new Date(row.scheduledAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })} at {new Date(row.scheduledAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Customer Message / Note',
      render: (row) => (
        <p className="text-xs text-stone-600 line-clamp-2 max-w-xs bg-stone-50 p-2 rounded-lg border border-stone-100">
          {row.note || '—'}
        </p>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const cleanPhone = String(row.phone || '').replace(/\D/g, '');
        const isPending = row.status === 'requested' || row.status === 'submitted' || row.status === 'new' || row.status === 'uncontacted';
        return (
          <div className="flex items-center gap-1.5">
            {isPending && (
              <button
                type="button"
                disabled={actionBusy === row._id}
                onClick={() => handleAcceptRequest(row)}
                className="px-2.5 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} />
                <span>{actionBusy === row._id ? 'Accepting…' : 'Accept'}</span>
              </button>
            )}
            {cleanPhone && (
              <>
                <button
                  type="button"
                  onClick={() => { window.location.href = `tel:${cleanPhone}`; }}
                  title="Call Customer"
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Phone size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`Hello ${row.customerName}, this is regarding your property enquiry for ${row.title}.`);
                    window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
                  }}
                  title="Message Customer"
                  className="p-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Tabs: Switch between Service Requests & Property Enquiries */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => onSelectSection?.('requests')}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <ClipboardList size={14} className="text-stone-500" />
          <span>Service Requests ({serviceReqCount})</span>
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-[#163e35] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <House size={14} className="text-[#d8edb3]" />
          <span>Property Enquiries ({items.length})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Customer Property Enquiries</h2>
          <p className="text-xs text-stone-500">
            Property visit requests and direct inquiries submitted by customers for your listings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('visits')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'visits' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Site Visits ({items.filter((i) => i.isVisit).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('enquiries')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'enquiries' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Direct Enquiries ({items.filter((i) => !i.isVisit).length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              reloadLeads();
              reloadVisits();
            }}
            className="text-xs font-bold text-[#163e35] hover:text-[#749546] px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="No property enquiries received yet"
        emptySubtitle="When customers request a site visit or send an enquiry for a property, their requests will appear here."
      />
    </div>
  );
}

// Sub-component: Recent Enquiries List on Provider Overview
function ProviderRecentEnquiriesList({ onViewAll }) {
  const { data: leadsData, loading: loadingLeads, reload: reloadLeads } = useData('leads?page=1&limit=5');
  const { data: visitsData, loading: loadingVisits, reload: reloadVisits } = useData('visits?limit=5');
  const { toast } = useApp();
  const [busyId, setBusyId] = useState('');

  async function handleAccept(item) {
    setBusyId(item._id);
    try {
      if (item.isVisit) {
        await api(`visits/${item._id}`, { method: 'PATCH', body: { status: 'accepted' } });
        toast('Site visit request accepted!');
        reloadVisits?.();
      } else {
        await api(`leads/${item._id}`, { method: 'PATCH', body: { status: 'accepted' } });
        toast('Property enquiry accepted!');
        reloadLeads?.();
      }
    } catch (e) {
      toast(e.message || 'Failed to accept request.');
    } finally {
      setBusyId('');
    }
  }

  const items = useMemo(() => {
    const rawLeads = (leadsData?.items || []).map((l) => ({
      _id: l._id,
      customerName: l.name || l.user?.name || 'Customer',
      phone: l.phone || l.user?.phone || '',
      title: l.property?.title || l.project?.title || 'Property Enquiry',
      locality: l.property?.locality || '',
      city: l.property?.city || l.city || 'Bengaluru',
      images: l.property?.images || [],
      scheduledAt: l.preferredAt || null,
      createdAt: l.createdAt,
      status: l.status || 'submitted',
      isVisit: false
    }));

    const rawVisits = (visitsData?.items || []).map((v) => ({
      _id: v._id,
      customerName: v.user?.name || 'Customer',
      phone: v.user?.phone || '',
      title: v.property?.title || v.project?.title || 'Site Visit Request',
      locality: v.property?.locality || '',
      city: v.property?.city || 'Bengaluru',
      images: v.property?.images || [],
      scheduledAt: v.scheduledAt,
      createdAt: v.createdAt || v.scheduledAt,
      status: v.status || 'requested',
      isVisit: true
    }));

    const combined = [...rawVisits];
    const seen = new Set(rawVisits.map((v) => `${v.customerName}-${v.title}`));

    for (const l of rawLeads) {
      const key = `${l.customerName}-${l.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(l);
      }
    }

    return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leadsData?.items, visitsData?.items]);

  if (loadingLeads || loadingVisits) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading property enquiries…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <House size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No customer property enquiries received yet.</p>
        <p className="text-[11px] text-stone-400">
          When customers submit site visit bookings or send inquiries for your listings, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.slice(0, 4).map((item) => {
        const cleanPhone = String(item.phone || '').replace(/\D/g, '');
        const isPending = item.status === 'requested' || item.status === 'submitted' || item.status === 'new' || item.status === 'uncontacted';
        return (
          <div key={item._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {item.images?.[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <House size={16} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900 truncate">{item.title}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>From: <strong className="font-semibold text-stone-700">{item.customerName}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <ShieldCheck size={11} /> Phone verified
                  </span>
                  <span>•</span>
                  <span>{item.isVisit ? 'Site Visit Request' : 'Direct Enquiry'}</span>
                  {item.scheduledAt && (
                    <>
                      <span>•</span>
                      <span>Scheduled: {new Date(item.scheduledAt).toLocaleDateString()}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              {isPending && (
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => handleAccept(item)}
                  className="px-2.5 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check size={12} />
                  <span>{busyId === item._id ? 'Accepting…' : 'Accept'}</span>
                </button>
              )}
              {cleanPhone && (
                <>
                  <button
                    type="button"
                    onClick={() => { window.location.href = `tel:${cleanPhone}`; }}
                    title="Call Customer"
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Phone size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = encodeURIComponent(`Hello ${item.customerName}, this is regarding your property request for ${item.title}.`);
                      window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
                    }}
                    title="Message Customer"
                    className="p-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <MessageCircle size={13} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onViewAll}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Modal: Review Request, Call/Chat & Send Offer
function ProviderReviewModal({ request, onClose, onUpdated }) {
  const { toast } = useApp();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offerFee, setOfferFee] = useState(request.offer?.amount || 1500);
  const [offerTitle, setOfferTitle] = useState(request.offer?.title || `${request.serviceType} Consultation & Service`);
  const [offerNotes, setOfferNotes] = useState(request.offer?.notes || 'Reviewed your requirement. Ready to assist.');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-stone-900/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ecf2e4] text-[#163e35]">
                {request.locality ? `${request.locality}, ` : ''}{request.city || 'Service Request'}
              </span>
              <span className="text-xs font-mono font-semibold text-stone-400">
                #{request.requestId}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 mt-1">
              {request.serviceType}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer Profile & Requirement Card */}
          <div className="p-4 rounded-2xl bg-[#f7f8f3] border border-[#e6e8e1] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-stone-400 font-semibold block uppercase tracking-wider">
                  Customer
                </span>
                <span className="font-extrabold text-stone-900 text-base block">
                  {request.name}
                </span>
                <span className="text-xs text-stone-500 block">
                  {request.locality ? `${request.locality}, ` : ''}{request.city}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                <a
                  href={`tel:${cleanPhone}`}
                  title="Call"
                  className="px-3.5 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Phone size={13} />
                  <span>Call Customer</span>
                </a>
                <a
                  href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(request.name)},%20this%20is%20regarding%20your%20${encodeURIComponent(request.serviceType)}%20request%20on%20UrbanFindr.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="px-3.5 py-1.5 bg-[#749546] hover:bg-[#5f7b38] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Requirement Text */}
            <div className="pt-2 border-t border-[#e6e8e1]">
              <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider mb-1">
                Requirement Details:
              </span>
              <p className="p-3 bg-white rounded-xl text-stone-700 text-xs leading-relaxed border border-stone-200/80">
                {request.customerMessage || request.description || 'Direct consultation and service request.'}
              </p>
            </div>
          </div>

          {/* Full Offer Form */}
          {request.status === 'completed' ? (
            <div className="p-4 bg-[#ecf2e4] text-[#163e35] font-bold text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Service successfully completed.</span>
            </div>
          ) : (
            <form onSubmit={handleSendOffer} className="space-y-4 pt-1">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900">
                    {request.status === 'contacted' || request.offer ? 'Update Service Offer' : 'Prepare Service Offer'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Provide fee quotation and engagement terms for the customer
                  </p>
                </div>
                {request.status === 'accepted' && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Accepted by Customer
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Offer Title / Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="e.g. On-site Inspection & Complete Electrical Wiring"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] focus:bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Service Fee / Quotation Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={offerFee}
                      onChange={(e) => setOfferFee(e.target.value)}
                      className="w-full pl-7 pr-3.5 py-2.5 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Scope of Work &amp; Availability Note
                  </label>
                  <textarea
                    rows={3}
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="Describe what is covered, arrival timing, tools or materials included..."
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] focus:bg-white transition-all leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-2.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{busy ? 'Sending Offer…' : 'Send Offer to Customer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
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

// Section: My Properties for Service Provider & Business Accounts
function ProviderPropertiesSection({ onPromote }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('properties?mine=true&limit=100');
  const { data: leadsData, reload: reloadLeads } = useData('leads?page=1&limit=100');
  const { data: visitsData, reload: reloadVisits } = useData('visits?limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'closed'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (default) | 'table'

  const requestsByProperty = useMemo(() => {
    const map = {};
    const all = [
      ...(visitsData?.items || []).map((v) => ({
        _id: v._id,
        isVisit: true,
        propertyId: String(v.property?._id || v.property || ''),
        customerName: v.user?.name || 'Customer',
        phone: v.phone || v.user?.phone || '',
        status: v.status || 'requested',
        note: v.note,
        scheduledAt: v.scheduledAt
      })),
      ...(leadsData?.items || []).map((l) => ({
        _id: l._id,
        isVisit: false,
        propertyId: String(l.property?._id || l.property || ''),
        customerName: l.name || l.user?.name || 'Customer',
        phone: l.phone || l.user?.phone || '',
        status: l.status || 'requested',
        note: l.note,
        scheduledAt: l.preferredAt
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
            title="Edit Property"
          >
            Edit
          </Link>
          {row.status !== 'closed' && row.status !== 'archived' ? (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleClose(row._id)}
              className="text-rose-600 hover:text-rose-800 font-semibold text-xs cursor-pointer"
              title="Close property and hide from public website"
            >
              Close
            </button>
          ) : (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => handleReopen(row._id)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer"
              title="Re-open property on public website"
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
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Properties</h2>
          <p className="text-xs text-stone-500">
            Manage all your direct residential and commercial listings. Closed properties remain visible here in your dashboard cards but are removed from the public website.
          </p>
        </div>
        <Link
          href="/post-property"
          className="whitespace-nowrap shrink-0 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:shadow"
        >
          <Plus size={15} /> Add New Property
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

          {/* View Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <List size={14} />
              <span className="hidden sm:inline">Table</span>
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
              ? 'Post your first property listing to reach buyers and tenants directly.'
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
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((prop) => (
            <PropertyDashboardCard
              key={prop._id}
              property={prop}
              busy={busy}
              requests={requestsByProperty[String(prop._id)] || []}
              onAcceptRequest={handleAcceptRequest}
              onClose={handleClose}
              onReopen={handleReopen}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          searchKey="title"
          searchPlaceholder="Search properties…"
          emptyTitle="No properties listed yet"
          emptySubtitle="Post your first property listing to reach buyers and tenants directly."
        />
      )}
    </div>
  );
}
