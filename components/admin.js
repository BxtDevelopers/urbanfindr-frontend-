'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  BriefcaseBusiness,
  Wrench,
  Mail,
  LifeBuoy,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Calendar,
  Home,
  Check,
  X,
  Trash2,
  ArrowUpRight,
  Eye,
  Filter,
  UserCheck,
  Award,
  ShieldAlert,
} from 'lucide-react';
import { api, useApp, useData } from './providers';
import { Field, Pagination, State, Submit, Image } from './ui';
import { cities, money, date } from '@/lib/format';
import { cityGuides } from '@/lib/catalog';
import { initialServiceProviders } from '@/lib/serviceProviders';
import { serviceCategories } from '@/lib/serviceCategories';

export default function Admin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, toast } = useApp();

  const initialTab = searchParams?.get('tab') || 'overview';
  const initialPropId = searchParams?.get('propertyId') || searchParams?.get('review') || searchParams?.get('id');
  const initialStatus = searchParams?.get('status') || searchParams?.get('filter') || '';
  const initialUserId = searchParams?.get('userId');

  const [tab, setTab] = useState(initialTab);
  const [prevTab, setPrevTab] = useState('overview');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState(initialStatus);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropId || null);
  const [selectedPartnerForModal, setSelectedPartnerForModal] = useState(null);

  // Live platform statistics
  const stats = useData('admin/stats');
  const { data: notificationsData, reload: reloadNotifications } = useData('notifications');
  const unreadCount = notificationsData?.unread ?? 0;

  // React to searchParams updates from URL
  useEffect(() => {
    const qTab = searchParams?.get('tab');
    const qPropId = searchParams?.get('propertyId') || searchParams?.get('review') || searchParams?.get('id');
    const qStatus = searchParams?.get('status') || searchParams?.get('filter');

    if (qTab && navSections.some((s) => s.id === qTab)) {
      setTab(qTab);
    }
    if (qPropId) {
      setSelectedPropertyId(qPropId);
      if (!qTab) setTab('properties');
    }
    if (qStatus) {
      setPropertyStatusFilter(qStatus);
    }
  }, [searchParams]);

  // Sidebar navigation sections
  const navSections = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'service-providers', label: 'Service Providers', icon: Wrench, count: initialServiceProviders.length },
    { id: 'channel-partners', label: 'Channel Partners', icon: Handshake, count: stats.data?.channelPartners || 0 },
    { id: 'builders', label: 'Builders & Projects', icon: Building2, count: stats.data?.projects || 8 },
    { id: 'agents', label: 'Brokers & Agents', icon: BriefcaseBusiness, count: stats.data?.brokers || 0 },
    { id: 'users', label: 'All Users & Owners', icon: Users, count: stats.data?.users || 0 },
    { id: 'properties', label: 'Properties & Listings', icon: Home, badgeColor: Number(stats.data?.pending) > 0 ? 'bg-amber-500' : null },
    { id: 'enquiries', label: 'Enquiries & Visits', icon: Mail, count: stats.data?.leads || 0 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badgeColor: unreadCount > 0 ? 'bg-red-500' : null },
    { id: 'support', label: 'Customer Support', icon: LifeBuoy, count: stats.data?.openTickets || 0, badgeColor: Number(stats.data?.openTickets) > 0 ? 'bg-red-500' : null },
    { id: 'cities', label: 'Operational Cities', icon: MapPin },
  ];

  function handleBellClick() {
    if (tab === 'notifications') {
      setTab(prevTab || 'overview');
    } else {
      setPrevTab(tab);
      setTab('notifications');
    }
  }

  function handleNavigate(targetTab, options = {}) {
    setTab(targetTab);
    if (options.status !== undefined) {
      setPropertyStatusFilter(options.status);
    }
    if (options.property) {
      setSelectedPropertyForModal(options.property);
      setSelectedPropertyId(options.property._id);
    } else if (options.propertyId) {
      setSelectedPropertyId(options.propertyId);
      setSelectedPropertyForModal(null);
    }
    if (options.user) {
      setSelectedPartnerForModal(options.user);
    }
  }

  function handleOpenProperty(propOrId) {
    if (typeof propOrId === 'string') {
      setSelectedPropertyId(propOrId);
      setSelectedPropertyForModal(null);
    } else if (propOrId && typeof propOrId === 'object') {
      setSelectedPropertyForModal(propOrId);
      setSelectedPropertyId(propOrId._id);
    }
  }

  function handleClosePropertyModal() {
    setSelectedPropertyForModal(null);
    setSelectedPropertyId(null);
  }

  return (
    <div className="wrap py-10 pb-20">
      <div className="dashboard-grid">
        {/* ── SIDEBAR NAVIGATION ── */}
        <aside className="dashboard-nav">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="eyebrow !mb-0 hidden sm:block">ADMINISTRATION</p>
            {/* Notification Bell Icon */}
            <button
              type="button"
              onClick={handleBellClick}
              className={`relative p-1.5 transition-colors ${
                tab === 'notifications'
                  ? 'text-forest bg-stone-100 rounded-md'
                  : 'text-stone-500 hover:text-forest'
              }`}
              title="Platform Notifications"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          {navSections.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center justify-between w-full text-left transition-colors ${
                  isActive ? 'active font-semibold' : ''
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} className={isActive ? 'text-forest' : 'text-stone-400'} />
                  <span>{item.label}</span>
                </span>

                {item.badgeColor ? (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${item.badgeColor} shrink-0 ring-2 ring-stone-100`}
                    title={item.id === 'properties' ? 'Pending review' : 'Unread notifications'}
                  />
                ) : item.count !== undefined ? (
                  <span className="text-xs muted font-mono">{item.count}</span>
                ) : null}
              </button>
            );
          })}

          <div className="border-t border-stone-200 pt-4 mt-4 px-4 space-y-2">
            <Link href="/dashboard?view=user" className="text-link !text-sm flex items-center gap-1.5">
              ← User Dashboard
            </Link>
            <Link href="/" className="muted text-xs hover:text-forest flex items-center gap-1">
              Public Portal <ExternalLink size={12} />
            </Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT VIEWPORT ── */}
        <main className="min-w-0">
          {tab === 'overview' && (
            <OverviewView
              stats={stats.data}
              loading={stats.loading}
              error={stats.error}
              onNavigate={handleNavigate}
              onOpenProperty={handleOpenProperty}
            />
          )}

          {tab === 'service-providers' && (
            <ServiceProvidersView onInspectProperty={handleOpenProperty} />
          )}

          {tab === 'channel-partners' && (
            <ChannelPartnersView
              onReload={stats.reload}
              onInspectProperty={handleOpenProperty}
            />
          )}

          {tab === 'builders' && (
            <BuildersProjectsView onReload={stats.reload} />
          )}

          {tab === 'agents' && (
            <BrokersAgentsView
              onReload={stats.reload}
              onInspectProperty={handleOpenProperty}
            />
          )}

          {tab === 'users' && (
            <UsersView
              onReload={stats.reload}
              onNavigate={handleNavigate}
              onInspectProperty={handleOpenProperty}
            />
          )}

          {tab === 'properties' && (
            <PropertiesView
              initialStatus={propertyStatusFilter}
              onReload={stats.reload}
              onOpenProperty={handleOpenProperty}
            />
          )}

          {tab === 'enquiries' && (
            <EnquiriesVisitsView onOpenProperty={handleOpenProperty} />
          )}

          {tab === 'notifications' && (
            <AdminNotificationsView
              onNotificationsChanged={reloadNotifications}
              onNavigate={handleNavigate}
            />
          )}

          {tab === 'support' && (
            <CustomerSupportView />
          )}

          {tab === 'cities' && (
            <OperationalCitiesView />
          )}
        </main>
      </div>

      {/* ── GLOBAL ADMIN MODALS ── */}
      {(selectedPropertyForModal || selectedPropertyId) && (
        <PropertyDetailModal
          property={selectedPropertyForModal}
          propertyId={selectedPropertyId}
          onClose={handleClosePropertyModal}
          onStatusUpdated={() => {
            stats.reload();
            reloadNotifications();
          }}
          onInspectPartner={(partnerUser) => {
            setSelectedPartnerForModal(partnerUser);
          }}
        />
      )}

      {selectedPartnerForModal && (
        <AgentPartnerDetailModal
          user={selectedPartnerForModal}
          onClose={() => setSelectedPartnerForModal(null)}
          onToggleStatus={async (u) => {
            try {
              await api(`admin/users/${u._id}`, { method: 'PATCH', body: { active: !u.active } });
              toast(`User status updated.`);
              stats.reload();
            } catch (e) {
              toast(e.message);
            }
          }}
          onReload={stats.reload}
          onInspectProperty={handleOpenProperty}
        />
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: COMPREHENSIVE PROPERTY DOSSIER (ALL STATES)
// ─────────────────────────────────────────────────────────────
function PropertyDetailModal({ property, propertyId, onClose, onStatusUpdated, onInspectPartner }) {
  const { toast } = useApp();
  const idToFetch = propertyId || property?._id;
  const { data: fetchedProp, loading, reload } = useData(idToFetch ? `admin/properties/${idToFetch}` : null);
  const prop = fetchedProp || property;

  const [activeImg, setActiveImg] = useState(0);
  const [busyAction, setBusyAction] = useState(false);

  if (!prop && loading) {
    return (
      <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
        <div className="panel max-w-lg w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="animate-spin w-8 h-8 border-2 border-forest border-t-transparent rounded-full mx-auto mb-3" />
          <p className="muted text-sm">Loading comprehensive property dossier…</p>
        </div>
      </div>
    );
  }

  if (!prop) return null;

  const images = prop.images && prop.images.length > 0
    ? prop.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const statusColors = {
    approved: '!bg-emerald-100 !text-emerald-800 border-emerald-300',
    pending: '!bg-amber-100 !text-amber-800 border-amber-300',
    rejected: '!bg-red-100 !text-red-800 border-red-300',
    archived: '!bg-stone-200 !text-stone-700 border-stone-300',
  };

  const statusLabels = {
    approved: '✓ Approved & Live on Catalog',
    pending: '⏳ Awaiting Administrative Review',
    rejected: '✕ Rejected Submission',
    archived: 'Archived Listing',
  };

  async function updateStatus(newStatus) {
    setBusyAction(true);
    try {
      await api(`admin/properties/${prop._id}`, { method: 'PATCH', body: { status: newStatus } });
      toast(`Listing status updated to ${newStatus}.`);
      reload();
      onStatusUpdated?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyAction(false);
    }
  }

  async function toggleFeature() {
    setBusyAction(true);
    try {
      await api(`admin/properties/${prop._id}`, { method: 'PATCH', body: { featured: !prop.featured } });
      toast(prop.featured ? 'Removed from featured listings.' : 'Listing featured on public homepages!');
      reload();
      onStatusUpdated?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyAction(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm('Archive this listing? It will no longer be visible on public searches.')) return;
    setBusyAction(true);
    try {
      await api(`admin/properties/${prop._id}`, { method: 'DELETE' });
      toast('Listing archived.');
      reload();
      onStatusUpdated?.();
      onClose();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyAction(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Status Indicator */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`pill text-xs font-semibold border ${statusColors[prop.status] || ''}`}>
                {statusLabels[prop.status] || prop.status}
              </span>
              <span className="pill text-xs uppercase !bg-forest !text-white font-semibold">
                {prop.purpose === 'rent' ? 'For Rent' : prop.purpose === 'buy' ? 'For Sale' : prop.purpose === 'pg' ? 'PG / Co-Living' : 'Commercial'}
              </span>
              <span className="pill text-xs font-medium">
                {prop.type}
              </span>
              {prop.featured && (
                <span className="pill text-xs !bg-amber-400 !text-amber-950 font-bold flex items-center gap-1">
                  <Star size={11} className="fill-amber-950" /> Featured
                </span>
              )}
            </div>
            <h2 className="!text-2xl font-bold text-stone-900 mt-2">{prop.title}</h2>
            <p className="muted text-sm flex items-center gap-1.5 mt-0.5">
              <MapPin size={15} className="text-forest shrink-0" />
              <span>{prop.address || `${prop.locality}, ${prop.city}`}</span>
            </p>
          </div>

          <button onClick={onClose} className="muted hover:text-stone-900 p-1.5 rounded-md hover:bg-stone-100" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Photo Gallery with thumbnails */}
        <div className="space-y-2">
          <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={images[activeImg] || images[0]}
              alt={prop.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded backdrop-blur-sm">
                Photo {activeImg + 1} of {images.length}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImg(idx)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 transition-all ${
                    activeImg === idx ? 'border-forest ring-2 ring-forest/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4 Primary Highlight Stat Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Price / Quotation</span>
            <strong className="text-lg text-forest block mt-0.5 font-bold">
              {money(prop.price)}
              {prop.purpose === 'rent' || prop.purpose === 'pg' ? <span className="text-xs font-normal text-stone-600"> /mo</span> : ''}
            </strong>
            {prop.maintenance ? (
              <span className="text-xs text-stone-500 block">+ ₹{prop.maintenance.toLocaleString('en-IN')} maint.</span>
            ) : null}
          </div>
          <div>
            <span className="text-xs muted block">Layout & Area</span>
            <strong className="text-base text-stone-900 block mt-0.5">
              {prop.bedrooms ? `${prop.bedrooms} BHK` : prop.type}
            </strong>
            <span className="text-xs text-stone-500 block">{prop.area} sq ft super area</span>
          </div>
          <div>
            <span className="text-xs muted block">Furnishing & Baths</span>
            <strong className="text-base text-stone-900 block mt-0.5">
              {prop.furnishing || 'Unfurnished'}
            </strong>
            <span className="text-xs text-stone-500 block">{prop.bathrooms || 1} Bathrooms</span>
          </div>
          <div>
            <span className="text-xs muted block">Security Deposit</span>
            <strong className="text-base text-stone-900 block mt-0.5">
              {prop.deposit ? money(prop.deposit) : 'None / Not stated'}
            </strong>
            <span className="text-xs text-stone-500 block">{prop.propertyAge || 'Newly built'}</span>
          </div>
        </div>

        {/* Lister & Ownership Credentials Card */}
        <div className="p-4 bg-white border border-stone-200 rounded-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs text-forest font-bold uppercase tracking-wider block">
                Listed By • {prop.ownership || prop.owner?.role || 'Direct Owner'}
              </span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">
                {prop.owner?.name || 'Verified Individual Lister'}
              </h4>
              {prop.owner?.company && (
                <p className="text-xs muted">
                  Agency / Firm: <strong className="text-stone-800">{prop.owner.company}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {prop.owner?.phone && (
                <a
                  href={`tel:${prop.owner.phone}`}
                  className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs flex items-center gap-1"
                >
                  <Phone size={13} /> Call {prop.owner.phone}
                </a>
              )}
              {prop.owner?.email && (
                <a
                  href={`mailto:${prop.owner.email}`}
                  className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs flex items-center gap-1"
                >
                  <Mail size={13} /> Email
                </a>
              )}
              {onInspectPartner && prop.owner && (prop.owner.role === 'channel_partner' || prop.owner.role === 'broker') && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInspectPartner(prop.owner);
                  }}
                  className="btn !min-h-0 !py-1.5 !px-3 !text-xs"
                >
                  View Partner Dossier
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="muted block">RERA Number</span>
              <span className="font-mono font-semibold">{prop.owner?.reraId || 'PRM/KA/RERA/DIRECT'}</span>
            </div>
            <div>
              <span className="muted block">Preferred Tenant</span>
              <span className="font-semibold">{prop.preferredTenant || 'Anyone'}</span>
            </div>
            <div>
              <span className="muted block">Reserved Parking</span>
              <span className="font-semibold">{prop.parking ? 'Yes (Reserved)' : 'No Reserved Bay'}</span>
            </div>
            <div>
              <span className="muted block">Available From</span>
              <span className="font-semibold">{date(prop.availableFrom)}</span>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        {prop.amenities && prop.amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-2">Features &amp; Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {prop.amenities.map((item) => (
                <span
                  key={item}
                  className="pill !bg-stone-100 !text-stone-800 text-xs flex items-center gap-1.5"
                >
                  <Check size={12} className="text-forest stroke-[2.5]" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description Section */}
        {prop.description && (
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-1.5">Property Description</h4>
            <p className="text-sm muted whitespace-pre-line leading-relaxed bg-[#fdfdfb] p-3 rounded border border-stone-200">
              {prop.description}
            </p>
          </div>
        )}

        {/* Moderation Actions Footer */}
        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {prop.status !== 'approved' && (
              <button
                type="button"
                disabled={busyAction}
                onClick={() => updateStatus('approved')}
                className="btn !min-h-0 !py-2 !px-4 !text-xs !bg-emerald-700 hover:!bg-emerald-800 flex items-center gap-1.5"
              >
                <Check size={14} /> Approve &amp; Publish Listing
              </button>
            )}

            {prop.status !== 'rejected' && (
              <button
                type="button"
                disabled={busyAction}
                onClick={() => updateStatus('rejected')}
                className="btn-outline !min-h-0 !py-2 !px-3.5 !text-xs !text-red-700 hover:!bg-red-50 flex items-center gap-1.5"
              >
                <X size={14} /> Reject Listing
              </button>
            )}

            {prop.status === 'approved' && (
              <button
                type="button"
                disabled={busyAction}
                onClick={toggleFeature}
                className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1.5"
              >
                <Star size={13} className={prop.featured ? 'text-amber-500 fill-amber-500' : ''} />
                {prop.featured ? 'Remove Featured' : 'Feature Listing'}
              </button>
            )}

            <button
              type="button"
              disabled={busyAction}
              onClick={handleArchive}
              className="text-xs muted hover:text-red-700 px-2 font-semibold"
            >
              Archive
            </button>
          </div>

          <div className="flex items-center gap-2">
            {prop.status === 'approved' && (
              <Link
                href={`/properties/${prop._id}`}
                target="_blank"
                className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1"
              >
                Public Page <ExternalLink size={12} />
              </Link>
            )}
            <Link
              href={`/properties/${prop._id}/edit`}
              target="_blank"
              className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1"
            >
              Edit Form <ArrowUpRight size={12} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline !min-h-0 !py-2 !px-4 !text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: SERVICE PROVIDER DOSSIER
// ─────────────────────────────────────────────────────────────
function ServiceProviderDetailModal({ provider, onClose, onToggleVerify, onToggleFeature }) {
  if (!provider) return null;
  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-semibold">
                {provider.category}
              </span>
              {provider.verified && (
                <span className="pill text-xs !bg-emerald-100 !text-emerald-800 flex items-center gap-1 font-semibold">
                  <Check size={12} /> Verified
                </span>
              )}
              {provider.featured && (
                <span className="pill text-xs !bg-amber-100 !text-amber-900 flex items-center gap-1 font-semibold">
                  <Star size={12} /> Featured
                </span>
              )}
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{provider.name}</h3>
            <p className="text-xs muted flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-forest" />
              {provider.locality}, {provider.city}
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Specialization</span>
            <strong className="text-sm text-stone-800 block mt-0.5">{provider.specialist}</strong>
          </div>
          <div>
            <span className="text-xs muted block">Starting Rate</span>
            <strong className="text-sm text-forest block mt-0.5">{provider.startingPrice || 'On Inspection'}</strong>
          </div>
          <div>
            <span className="text-xs muted block">Customer Rating</span>
            <strong className="text-sm block mt-0.5 flex items-center gap-1">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              {provider.rating} <span className="muted font-normal text-xs">({provider.reviews} reviews)</span>
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Operating City</span>
            <strong className="text-sm block mt-0.5">{provider.city}</strong>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-1">About &amp; Credentials</h4>
          <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded border border-stone-200">
            {provider.bio || `Specialized ${provider.category} partner operating in ${provider.city}. Certified for residential installations, property upgrades, and maintenance contracts.`}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Direct Contact Channels</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href={`tel:${provider.phone}`}
              className="p-3 border border-stone-200 rounded flex items-center gap-3 hover:border-forest transition-colors"
            >
              <Phone size={18} className="text-forest" />
              <div>
                <span className="text-xs muted block">Telephone / Helpline</span>
                <strong>{provider.phone}</strong>
              </div>
            </a>
            <a
              href={`mailto:${provider.email || 'hello@urbanfindr.demo'}`}
              className="p-3 border border-stone-200 rounded flex items-center gap-3 hover:border-forest transition-colors"
            >
              <Mail size={18} className="text-forest" />
              <div>
                <span className="text-xs muted block">Email Address</span>
                <strong>{provider.email || 'hello@' + provider.categorySlug + '.demo'}</strong>
              </div>
            </a>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleVerify(provider._id)}
              className={`btn !min-h-0 !py-2 !px-3 !text-xs ${provider.verified ? '!bg-amber-700' : ''}`}
            >
              <ShieldCheck size={14} />
              {provider.verified ? 'Revoke Verification' : 'Verify Provider'}
            </button>
            <button
              type="button"
              onClick={() => onToggleFeature(provider._id)}
              className="btn-outline !min-h-0 !py-2 !px-3 !text-xs"
            >
              <Star size={14} />
              {provider.featured ? 'Unfeature' : 'Feature on Marketplace'}
            </button>
          </div>
          <button type="button" onClick={onClose} className="btn-outline !min-h-0 !py-2 !px-4 !text-xs">
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: BUILDER PROJECT DOSSIER
// ─────────────────────────────────────────────────────────────
function BuilderProjectDetailModal({ project, onClose, onArchive }) {
  if (!project) return null;
  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-semibold">
                Builder: {project.builder}
              </span>
              <span className="pill text-xs !bg-amber-100 !text-amber-800">
                {project.stage || 'Ongoing Construction'}
              </span>
              <span className="pill text-xs">
                {project.city}
              </span>
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{project.title}</h3>
            <p className="text-xs muted flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-forest" />
              {project.address || project.locality}, {project.city}
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Price Range</span>
            <strong className="text-sm text-forest block mt-0.5">
              {money(project.price)} - {money(project.maxPrice)}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Configurations</span>
            <strong className="text-sm block mt-0.5">
              {project.configurations?.map((c) => c.name).join(', ') || '2, 3 BHK'}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Masterplan Scale</span>
            <strong className="text-sm block mt-0.5">
              {project.units ? `${project.units} Units` : '450+ Units'} • {project.towers ? `${project.towers} Towers` : 'Gated Masterplan'}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Possession</span>
            <strong className="text-sm block mt-0.5">{project.possession || 'Ready / Dec 2026'}</strong>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Unit Inventory &amp; Layout Types</h4>
          <div className="border border-stone-200 rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-100">
                <tr>
                  <th className="p-2 text-left">Unit Type</th>
                  <th className="p-2 text-left">Carpet / Super Area</th>
                  <th className="p-2 text-right">Starting Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {(project.configurations && project.configurations.length > 0
                  ? project.configurations
                  : [
                      { name: '2 BHK Luxury Apartment', area: 1250, price: project.price || 9500000 },
                      { name: '3 BHK Premium Residence', area: 1850, price: Math.round((project.price || 9500000) * 1.45) },
                      { name: '4 BHK Sky Villa', area: 2600, price: project.maxPrice || 24000000 },
                    ]
                ).map((c, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="p-2 font-semibold text-stone-900">{c.name}</td>
                    <td className="p-2 muted">{c.area ? `${c.area} sq.ft` : '1,350 sq.ft'}</td>
                    <td className="p-2 text-right font-bold text-forest">{money(c.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Township Amenities &amp; Masterplan Facilities</h4>
          <div className="flex flex-wrap gap-1.5">
            {(project.amenities && project.amenities.length > 0
              ? project.amenities
              : [
                  'Grand Clubhouse',
                  'Infinity Swimming Pool',
                  'Equipped Gymnasium',
                  'Children Play Park',
                  'EV Charging Bay',
                  '24/7 Security & CCTV',
                  'Jogging Track',
                  'Landscaped Gardens',
                  'Badminton Court',
                  'Multi-tier Covered Parking',
                ]
            ).map((a) => (
              <span key={a} className="pill text-xs py-0.5 px-2 bg-stone-100 border border-stone-200">
                • {a}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-1">Developer &amp; Project Summary</h4>
          <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded border border-stone-200">
            {project.summary || project.description || `${project.title} by ${project.builder} is a flagship residential community in ${project.locality}, ${project.city}. Built with seismic-resistant engineering, high green cover, and premier resident amenities.`}
          </p>
        </div>

        <div className="text-xs muted flex items-center justify-between border-t border-stone-200 pt-3">
          <span>RERA Registration: <strong className="font-mono text-stone-800">{project.reraId || 'PRM/KA/RERA/1251/310/PR/200123/003201'}</strong></span>
          <span>Status: <strong className="text-emerald-700">Approved Developer Project</strong></span>
        </div>

        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <Link
            href={`/projects/${project._id}`}
            target="_blank"
            className="btn !min-h-0 !py-2 !px-4 !text-xs flex items-center gap-1.5"
          >
            Open Public Page <ExternalLink size={13} />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onArchive(project._id);
                onClose();
              }}
              className="muted hover:text-red-700 text-xs font-semibold px-2 py-1"
            >
              Archive Project
            </button>
            <button type="button" onClick={onClose} className="btn-outline !min-h-0 !py-2 !px-4 !text-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: AGENT / CHANNEL PARTNER DOSSIER & LISTED INVENTORY
// ─────────────────────────────────────────────────────────────
function AgentPartnerDetailModal({ user: agentUser, onClose, onToggleStatus, onReload, onInspectProperty }) {
  const { toast } = useApp();
  const { data: propsData, loading: propsLoading, reload: reloadProps } = useData(`admin/properties?owner=${agentUser._id}`);
  const isChannelPartner = agentUser?.role === 'channel_partner';
  const { data: partnerData, reload: reloadPartner } = useData(isChannelPartner ? `admin/channel-partners/${agentUser._id}` : null);
  const [busyPropId, setBusyPropId] = useState(null);
  const [busyAction, setBusyAction] = useState(false);

  const [currentTier, setCurrentTier] = useState(agentUser?.tier || 'Gold');
  const [isVerified, setIsVerified] = useState(agentUser?.verified !== undefined ? agentUser.verified : true);

  useEffect(() => {
    if (partnerData) {
      if (partnerData.tier) setCurrentTier(partnerData.tier);
      if (partnerData.verified !== undefined) setIsVerified(partnerData.verified);
    } else if (agentUser) {
      if (agentUser.tier) setCurrentTier(agentUser.tier);
      if (agentUser.verified !== undefined) setIsVerified(agentUser.verified);
    }
  }, [partnerData, agentUser]);

  if (!agentUser) return null;

  async function handleApproveProperty(id) {
    setBusyPropId(id);
    try {
      await api(`admin/properties/${id}`, { method: 'PATCH', body: { status: 'approved' } });
      toast('Property approved and published to public catalog!');
      reloadProps();
      onReload?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyPropId(null);
    }
  }

  async function handleTierChange(newTier) {
    if (newTier === currentTier || busyAction) return;
    setBusyAction(true);
    try {
      await api(`admin/channel-partners/${agentUser._id}`, { method: 'PATCH', body: { tier: newTier } });
      setCurrentTier(newTier);
      toast(`Channel Partner tier updated to ${newTier}!`);
      reloadPartner?.();
      onReload?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyAction(false);
    }
  }

  async function handleToggleVerification() {
    if (busyAction) return;
    const nextVal = !isVerified;
    setBusyAction(true);
    try {
      await api(`admin/channel-partners/${agentUser._id}`, { method: 'PATCH', body: { verified: nextVal } });
      setIsVerified(nextVal);
      toast(`Channel Partner RERA verification set to ${nextVal ? 'Verified' : 'Unverified'}.`);
      reloadPartner?.();
      onReload?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyAction(false);
    }
  }

  const roleName = isChannelPartner ? 'Channel Partner' : agentUser.role === 'broker' ? 'Authorized Broker' : 'Property Owner';
  const listedCount = propsData?.total ?? partnerData?.propertiesCount ?? agentUser.propertiesCount ?? 0;
  const teamMembers = partnerData?.team || agentUser.team || [];
  const leadsCount = partnerData?.leadsCount ?? agentUser.leadsCount ?? 0;

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-semibold">
                {roleName}
              </span>
              {isChannelPartner && (
                <>
                  <span className={`pill text-xs font-bold border ${
                    currentTier === 'Platinum' ? '!bg-purple-100 !text-purple-800 !border-purple-300' :
                    currentTier === 'Silver' ? '!bg-slate-100 !text-slate-800 !border-slate-300' :
                    '!bg-amber-100 !text-amber-800 !border-amber-300'
                  }`}>
                    ★ {currentTier} Tier
                  </span>
                  <span className={`pill text-xs font-semibold ${
                    isVerified ? '!bg-emerald-100 !text-emerald-800' : '!bg-amber-100 !text-amber-800'
                  }`}>
                    {isVerified ? '✓ RERA Verified' : '⚠ Unverified'}
                  </span>
                </>
              )}
              <span className={`pill text-xs ${agentUser.active ? '!bg-emerald-100 !text-emerald-800' : '!bg-red-100 !text-red-800'}`}>
                {agentUser.active ? 'Active Account' : 'Suspended Account'}
              </span>
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{agentUser.name}</h3>
            <p className="text-sm font-semibold muted mt-0.5">
              Firm: <strong className="text-stone-800">{agentUser.company || 'Direct Agency Practice'}</strong>
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Channel Partner Governance & Tier Controls */}
        {isChannelPartner && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs text-emerald-950 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  Channel Partner Governance &amp; Compliance
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Configure institutional partnership tier and verify RERA accreditation.
                </p>
              </div>

              <button
                type="button"
                disabled={busyAction}
                onClick={handleToggleVerification}
                className={`btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
                  isVerified ? '!bg-white hover:!bg-amber-50 !border-amber-300 !text-amber-800' : '!bg-emerald-700 !text-white hover:!bg-emerald-800'
                }`}
              >
                {isVerified ? (
                  <>
                    <ShieldAlert size={13} className="text-amber-600" />
                    Revoke Verification
                  </>
                ) : (
                  <>
                    <ShieldCheck size={13} />
                    Verify RERA License
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60 flex-wrap">
              <span className="text-xs font-bold text-emerald-950 mr-1">Institutional Tier:</span>
              {['Silver', 'Gold', 'Platinum'].map((tierOption) => (
                <button
                  key={tierOption}
                  type="button"
                  disabled={busyAction || currentTier === tierOption}
                  onClick={() => handleTierChange(tierOption)}
                  className={`pill text-xs font-semibold cursor-pointer transition-all ${
                    currentTier === tierOption
                      ? tierOption === 'Platinum'
                        ? '!bg-purple-700 !text-white !ring-2 !ring-purple-300'
                        : tierOption === 'Gold'
                        ? '!bg-amber-600 !text-white !ring-2 !ring-amber-300'
                        : '!bg-slate-700 !text-white !ring-2 !ring-slate-300'
                      : '!bg-white !text-stone-700 hover:!bg-stone-100 !border !border-stone-300'
                  }`}
                >
                  {tierOption === currentTier && '✓ '}
                  {tierOption} Tier
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Total Listings</span>
            <strong className="text-base text-forest block mt-0.5">
              {listedCount} {listedCount === 1 ? 'Property' : 'Properties'}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">{isChannelPartner ? 'Inbound CP Leads' : 'RERA Registration'}</span>
            <strong className="text-base text-forest block mt-0.5">
              {isChannelPartner ? `${leadsCount} Inquiries` : (agentUser.reraId || 'PRM/KA/RERA/PENDING')}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Contact Phone</span>
            <strong className="text-xs font-mono block mt-0.5">
              {agentUser.phone || 'Not provided'}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Account Email</span>
            <strong className="text-xs block mt-0.5 truncate" title={agentUser.email}>
              {agentUser.email}
            </strong>
          </div>
        </div>

        {/* Sales Team Roster for Channel Partners */}
        {isChannelPartner && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  Sales Team Roster
                  <span className="pill text-xs font-semibold !bg-stone-100">
                    {teamMembers.length} Advisors
                  </span>
                </h4>
                <p className="text-xs muted">
                  Assigned property advisors and client relationship specialists under this firm.
                </p>
              </div>
            </div>

            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className="p-3 bg-white border border-stone-200 rounded-lg hover:border-emerald-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm text-stone-900 block flex items-center gap-1.5">
                          <UserCheck size={14} className="text-forest shrink-0" />
                          {m.name}
                        </strong>
                        <span className="text-xs muted block mt-0.5">{m.role || 'Property Specialist'}</span>
                      </div>
                      <span className={`pill text-[10px] capitalize font-semibold ${
                        m.status === 'active' ? '!bg-emerald-100 !text-emerald-800' :
                        m.status === 'on_leave' ? '!bg-amber-100 !text-amber-800' :
                        '!bg-stone-100 !text-stone-600'
                      }`}>
                        {m.status ? m.status.replace('_', ' ') : 'active'}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-100 text-xs space-y-1">
                      {m.email && (
                        <div className="truncate">
                          <a href={`mailto:${m.email}`} className="muted hover:text-stone-900 flex items-center gap-1">
                            <Mail size={11} className="shrink-0" /> {m.email}
                          </a>
                        </div>
                      )}
                      {m.phone && (
                        <div>
                          <a href={`tel:${m.phone}`} className="font-mono text-stone-700 hover:text-stone-900 flex items-center gap-1">
                            <Phone size={11} className="shrink-0" /> {m.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] muted font-medium">Assigned Leads:</span>
                      <span className="pill text-xs font-bold !bg-emerald-50 !text-emerald-800 !border !border-emerald-200">
                        {m.assignedLeadsCount || 0} Leads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel text-center py-6 bg-[#fdfdfb]">
                <Users className="mx-auto mb-2 text-stone-400" size={24} />
                <h5 className="text-xs font-semibold text-stone-800">No team members registered yet</h5>
                <p className="text-xs muted mt-0.5">
                  When this partner registers sales advisors, their roster and assigned lead pipeline will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Listed Properties ({listedCount})
              </h4>
              <p className="text-xs muted">
                Click any listing to inspect the full dossier and approve or review.
              </p>
            </div>
          </div>

          <State loading={propsLoading} empty={listedCount === 0} />

          {propsData?.items && propsData.items.length > 0 ? (
            <div className="space-y-3">
              {propsData.items.map((prop) => (
                <div
                  key={prop._id}
                  className="p-3 rounded border border-stone-200 hover:border-forest bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                      alt={prop.title}
                      className="w-14 h-14 rounded object-cover border border-stone-200 shrink-0 cursor-pointer"
                      onClick={() => onInspectProperty?.(prop)}
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onInspectProperty?.(prop)}
                        className="font-semibold text-sm text-stone-900 hover:text-forest flex items-center gap-1 truncate text-left"
                      >
                        <span className="truncate">{prop.title}</span>
                        <ArrowUpRight size={13} className="text-forest shrink-0" />
                      </button>
                      <div className="text-xs muted flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="capitalize">{prop.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
                        <span>•</span>
                        <span>{prop.locality}, {prop.city}</span>
                        <span>•</span>
                        <strong className="text-forest font-semibold">{money(prop.price)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className={`pill text-xs capitalize ${
                      prop.status === 'approved' ? '!bg-emerald-100 !text-emerald-800' : prop.status === 'pending' ? '!bg-amber-100 !text-amber-800' : ''
                    }`}>
                      {prop.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => onInspectProperty?.(prop)}
                      className="btn-outline !min-h-0 !py-1 !px-2.5 !text-xs font-semibold"
                    >
                      Inspect
                    </button>
                    {prop.status === 'pending' && (
                      <button
                        type="button"
                        disabled={busyPropId === prop._id}
                        onClick={() => handleApproveProperty(prop._id)}
                        className="btn !min-h-0 !py-1 !px-2.5 !text-xs"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !propsLoading && (
              <div className="panel text-center py-8 bg-[#fdfdfb]">
                <Home className="mx-auto mb-2 text-stone-400" size={28} />
                <h4 className="text-sm font-semibold">No properties listed yet</h4>
                <p className="text-xs muted mt-1">
                  When this partner submits homes or commercial spaces, they will show up here.
                </p>
              </div>
            )
          )}
        </div>

        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(agentUser)}
              className={`btn !min-h-0 !py-2 !px-3 !text-xs ${agentUser.active ? '!bg-red-700' : ''}`}
            >
              {agentUser.active ? 'Suspend Account' : 'Activate Account'}
            </button>
            {agentUser.phone && (
              <a
                href={`tel:${agentUser.phone}`}
                className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1"
              >
                <Phone size={13} /> Call {agentUser.phone}
              </a>
            )}
            <a
              href={`mailto:${agentUser.email}`}
              className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1"
            >
              <Mail size={13} /> Email
            </a>
          </div>
          <button type="button" onClick={onClose} className="btn-outline !min-h-0 !py-2 !px-4 !text-xs">
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: DIRECT ENQUIRY / LEAD DETAILS
// ─────────────────────────────────────────────────────────────
function EnquiryDetailModal({ lead, onClose, onUpdateStatus, onInspectProperty }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(lead?.status || 'new');

  if (!lead) return null;

  async function handleStatusChange(newStatus) {
    setBusy(true);
    try {
      await api(`leads/${lead._id}`, { method: 'PATCH', body: { status: newStatus } });
      setCurrentStatus(newStatus);
      toast(`Enquiry status updated to ${newStatus}.`);
      onUpdateStatus?.(lead._id, newStatus);
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  const isInterior = lead.kind === 'interior';

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-semibold">
                {isInterior ? 'Home Interior Consultation' : 'Builder Community Enquiry'}
              </span>
              {lead.source === 'phone' ? (
                <span className="pill text-xs !bg-blue-100 !text-blue-800 font-semibold inline-flex items-center gap-1">
                  <Phone size={11} /> Phone Callback
                </span>
              ) : lead.source === 'message' ? (
                <span className="pill text-xs !bg-indigo-100 !text-indigo-800 font-semibold inline-flex items-center gap-1">
                  <Mail size={11} /> Direct Chat
                </span>
              ) : (
                <span className="pill text-xs !bg-emerald-100 !text-emerald-800 font-semibold inline-flex items-center gap-1">
                  <Home size={11} /> Property Form
                </span>
              )}
              {lead.assignedTeamMember && (
                <span className="pill text-xs !bg-emerald-100 !text-emerald-800 font-semibold inline-flex items-center gap-1">
                  <UserCheck size={11} /> Advisor: {lead.assignedTeamMember}
                </span>
              )}
              {(lead.manager?.company || lead.property?.owner?.company) && (
                <span className="pill text-xs !bg-stone-100 !text-stone-800 font-semibold inline-flex items-center gap-1">
                  <Handshake size={11} /> {lead.manager?.company || lead.property?.owner?.company}
                </span>
              )}
              <span className="pill text-xs !bg-amber-100 !text-amber-800 capitalize font-semibold">
                Status: {currentStatus}
              </span>
              <span className="pill text-xs">
                City: {lead.city}
              </span>
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{lead.name}</h3>
            <p className="text-xs muted flex items-center gap-1 mt-1 font-mono">
              Inquiry Reference: {lead._id}
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* 4-Stat Metric Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Declared Budget</span>
            <strong className="text-base text-forest block mt-0.5">
              {money(lead.budget)}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Home Layout</span>
            <strong className="text-sm block mt-0.5">{lead.homeSize || '2 BHK'}</strong>
          </div>
          <div>
            <span className="text-xs muted block">Package Finish</span>
            <strong className="text-sm block mt-0.5">{lead.finish || 'Essential'}</strong>
          </div>
          <div>
            <span className="text-xs muted block">Preferred Datetime</span>
            <strong className="text-xs font-mono block mt-0.5">
              {lead.preferredAt ? date(lead.preferredAt) : 'Immediate Contact'}
            </strong>
          </div>
        </div>

        {/* Customer & Target Details Card */}
        <div className="p-4 bg-white border border-stone-200 rounded-lg space-y-3">
          <h4 className="text-xs text-forest font-bold uppercase tracking-wider">
            Customer Information &amp; Direct Channels
          </h4>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs muted block">Phone Number</span>
              <a href={`tel:${lead.phone}`} className="font-semibold text-stone-900 hover:text-forest flex items-center gap-1.5 mt-0.5">
                <Phone size={14} className="text-forest" /> {lead.phone}
              </a>
            </div>
            <div>
              <span className="text-xs muted block">Email Address</span>
              <a href={`mailto:${lead.email}`} className="font-semibold text-stone-900 hover:text-forest flex items-center gap-1.5 mt-0.5">
                <Mail size={14} className="text-forest" /> {lead.email}
              </a>
            </div>
          </div>

          {(lead.assignedTeamMember || lead.manager?.company || lead.property?.owner?.company) && (
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-stone-700">
                <Handshake size={13} className="text-forest" />
                <span>Channel Partner: <strong>{lead.manager?.company || lead.property?.owner?.company || 'Channel Partner Network'}</strong></span>
              </div>
              {lead.assignedTeamMember && (
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <UserCheck size={13} className="text-emerald-700" />
                  <span>Assigned Advisor: {lead.assignedTeamMember}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Target Project or Scope Details */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 mb-2">Inquiry Focus</h4>
          <div className="p-3 bg-stone-50 rounded border border-stone-200 flex items-center justify-between gap-3">
            <div>
              <strong className="text-sm block text-stone-900">
                {lead.project?.title || lead.design?.title || `${lead.service || 'Full home'} Design Consultation`}
              </strong>
              <span className="text-xs muted">
                Scope: {lead.service || 'Full interior planning & modular cabinetry'}
              </span>
            </div>
            {lead.project && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onInspectProperty?.(lead.project);
                }}
                className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold shrink-0 flex items-center gap-1"
              >
                Inspect Community <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Customer Note */}
        {lead.note && (
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-1.5">Customer Remarks &amp; Special Requests</h4>
            <p className="text-sm muted whitespace-pre-line leading-relaxed bg-[#fdfdfb] p-3 rounded border border-stone-200">
              {lead.note}
            </p>
          </div>
        )}

        {/* Status Pipeline Actions Footer */}
        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-700 mr-1">Update Pipeline:</span>
            {['new', 'contacted', 'consultation', 'completed', 'closed'].map((st) => (
              <button
                key={st}
                type="button"
                disabled={busy || currentStatus === st}
                onClick={() => handleStatusChange(st)}
                className={`btn-outline !min-h-0 !py-1 !px-2.5 !text-xs capitalize ${
                  currentStatus === st ? '!bg-forest !text-white' : ''
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href={`tel:${lead.phone}`} className="btn !min-h-0 !py-1.5 !px-3 !text-xs flex items-center gap-1">
              <Phone size={13} /> Call
            </a>
            <a href={`mailto:${lead.email}`} className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs flex items-center gap-1">
              <Mail size={13} /> Email
            </a>
            <button type="button" onClick={onClose} className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: SCHEDULED SITE VISIT DETAILS
// ─────────────────────────────────────────────────────────────
function VisitDetailModal({ visit, onClose, onUpdateStatus, onInspectProperty }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(visit?.status || 'requested');

  if (!visit) return null;

  async function handleStatusChange(newStatus) {
    setBusy(true);
    try {
      await api(`visits/${visit._id}`, { method: 'PATCH', body: { status: newStatus } });
      setCurrentStatus(newStatus);
      toast(`Site visit status set to ${newStatus}.`);
      onUpdateStatus?.(visit._id, newStatus);
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  const targetTitle = visit.property?.title || visit.project?.title || 'Selected Listing';
  const targetId = visit.property?._id || visit.property;

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-semibold">
                Scheduled Site Visit
              </span>
              <span className={`pill text-xs capitalize font-semibold ${
                currentStatus === 'confirmed' ? '!bg-emerald-100 !text-emerald-800' :
                currentStatus === 'completed' ? '!bg-blue-100 !text-blue-800' :
                currentStatus === 'cancelled' ? '!bg-red-100 !text-red-800' : '!bg-amber-100 !text-amber-800'
              }`}>
                {currentStatus}
              </span>
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{visit.user?.name || 'Visitor'}</h3>
            <p className="text-xs muted mt-1 font-mono">
              Visit ID: {visit._id}
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Scheduled Date &amp; Time</span>
            <strong className="text-sm text-forest block mt-0.5">
              {new Date(visit.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Host / Assigned Owner</span>
            <strong className="text-sm block mt-0.5">{visit.owner?.name || 'Private Owner'}</strong>
          </div>
          <div>
            <span className="text-xs muted block">Status</span>
            <strong className="text-sm capitalize block mt-0.5">{currentStatus}</strong>
          </div>
        </div>

        {/* Target Property Box */}
        <div className="p-4 bg-white border border-stone-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-forest font-bold uppercase tracking-wider block">Target Property</span>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">{targetTitle}</h4>
            </div>
            {targetId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onInspectProperty?.(targetId);
                }}
                className="btn !min-h-0 !py-1.5 !px-3 !text-xs font-semibold flex items-center gap-1"
              >
                Inspect Property <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Visitor Remarks */}
        {visit.note && (
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-1.5">Visitor Notes &amp; Special Requests</h4>
            <p className="text-sm muted whitespace-pre-line leading-relaxed bg-[#fdfdfb] p-3 rounded border border-stone-200">
              {visit.note}
            </p>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-700 mr-1">Update Status:</span>
            {['confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                disabled={busy || currentStatus === st}
                onClick={() => handleStatusChange(st)}
                className={`btn-outline !min-h-0 !py-1 !px-2.5 !text-xs capitalize ${
                  currentStatus === st ? '!bg-forest !text-white' : ''
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button type="button" onClick={onClose} className="btn-outline !min-h-0 !py-1.5 !px-4 !text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: CUSTOMER SUPPORT TICKET WITH LIVE THREAD & REPLIES
// ─────────────────────────────────────────────────────────────
function SupportTicketModal({ ticket, onClose, onUpdated }) {
  const { toast } = useApp();
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!currentTicket) return null;

  const currentStatus = currentTicket.status || 'open';
  const requester = currentTicket.user || {};
  const requesterRole =
    requester.role === 'channel_partner'
      ? 'Channel Partner'
      : requester.role === 'owner'
      ? 'Property Owner'
      : requester.role === 'broker'
      ? 'Broker'
      : 'Platform User';

  const priorityColor =
    currentTicket.priority === 'urgent'
      ? '!bg-red-100 !text-red-800 !border-red-300'
      : currentTicket.priority === 'high'
      ? '!bg-amber-100 !text-amber-800 !border-amber-300'
      : currentTicket.priority === 'medium'
      ? '!bg-sky-100 !text-sky-800 !border-sky-300'
      : '!bg-stone-100 !text-stone-700 !border-stone-300';

  const statusColor =
    currentStatus === 'open'
      ? '!bg-red-100 !text-red-800'
      : currentStatus === 'in_progress'
      ? '!bg-amber-100 !text-amber-800'
      : currentStatus === 'resolved'
      ? '!bg-emerald-100 !text-emerald-800'
      : '!bg-stone-100 !text-stone-700';

  async function handleStatusChange(newStatus) {
    setIsUpdatingStatus(true);
    try {
      await api(`support-tickets/${currentTicket._id}`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      setCurrentTicket((prev) => ({ ...prev, status: newStatus }));
      toast(`Ticket status updated to ${newStatus.replace('_', ' ')}.`);
      onUpdated?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await api(`support-tickets/${currentTicket._id}/reply`, {
        method: 'POST',
        body: { message: replyText.trim() }
      });
      setCurrentTicket(updated);
      setReplyText('');
      toast('Official response dispatched to user.');
      onUpdated?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-mono font-bold">
                {currentTicket.ticketNumber || `TICK-${currentTicket._id?.slice(-6)}`}
              </span>
              <span className="pill text-xs font-semibold">{currentTicket.category}</span>
              <span className={`pill text-xs font-bold capitalize ${priorityColor}`}>
                {currentTicket.priority} Priority
              </span>
              <span className={`pill text-xs font-bold capitalize ${statusColor}`}>
                {currentStatus.replace('_', ' ')}
              </span>
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{currentTicket.subject}</h3>
            <p className="text-xs muted mt-1 font-mono">
              Requester: <strong className="text-stone-800">{requester.name || 'Anonymous User'}</strong> ({requesterRole})
              {requester.company ? ` • ${requester.company}` : ''} • {requester.email || currentTicket.email || 'No email'}
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Linked Property Reference if any */}
        {currentTicket.property && (
          <div className="p-3 bg-[#f7f8f3] border border-stone-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#163e35]" />
              <div>
                <span className="text-stone-500">Linked Property: </span>
                <strong className="text-stone-900">{currentTicket.property.title}</strong>
                <span className="text-stone-500"> ({currentTicket.property.locality}, {currentTicket.property.city})</span>
              </div>
            </div>
          </div>
        )}

        {/* Original Ticket Description */}
        <div>
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Original Inquiry</h4>
          <div className="p-4 bg-[#fdfdfb] border border-stone-200 rounded-xl text-sm text-stone-800 leading-relaxed whitespace-pre-line">
            {currentTicket.message}
          </div>
          <div className="text-[11px] muted mt-1 text-right">
            Logged on {date(currentTicket.createdAt)}
          </div>
        </div>

        {/* Conversation Thread / Replies History */}
        {currentTicket.responses && currentTicket.responses.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Desk Conversation Thread ({currentTicket.responses.length})
            </h4>
            <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
              {currentTicket.responses.map((resp, idx) => {
                const isAdmin = resp.role === 'admin';
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isAdmin
                        ? 'bg-emerald-50/70 border-emerald-200 ml-4'
                        : 'bg-stone-50 border-stone-200 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span className="flex items-center gap-1.5">
                        {isAdmin && <ShieldCheck size={14} className="text-[#163e35]" />}
                        <span>{isAdmin ? 'UrbanFindr Support Desk' : (resp.senderName || 'Requester')}</span>
                        {isAdmin && (
                          <span className="text-[10px] bg-[#163e35] text-white px-1.5 py-0.2 rounded font-semibold">
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono font-normal">
                        {date(resp.createdAt)}
                      </span>
                    </div>
                    <p className="text-stone-800 text-xs leading-relaxed whitespace-pre-line">
                      {resp.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin Reply Input Composer */}
        <form onSubmit={handleSendReply} className="space-y-3 pt-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Post Official Desk Reply
          </label>
          <textarea
            rows={3}
            placeholder="Write a clear resolution or follow-up note for the ticket requester..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="input !text-xs !p-3 resize-none w-full"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="btn !min-h-0 !py-2 !px-4 !text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Mail size={13} />
              <span>{isSubmitting ? 'Dispatching...' : 'Send Official Response'}</span>
            </button>
          </div>
        </form>

        {/* Quick Status Management Action Panel */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Ticket Resolution Status
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUpdatingStatus || currentStatus === 'in_progress'}
              onClick={() => handleStatusChange('in_progress')}
              className={`btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold ${
                currentStatus === 'in_progress' ? '!bg-amber-600 !text-white !border-amber-600' : ''
              }`}
            >
              Mark In Progress
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus || currentStatus === 'resolved'}
              onClick={() => handleStatusChange('resolved')}
              className={`btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold ${
                currentStatus === 'resolved' ? '!bg-emerald-700 !text-white !border-emerald-700' : ''
              }`}
            >
              Mark Resolved
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus || currentStatus === 'closed'}
              onClick={() => handleStatusChange('closed')}
              className={`btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold ${
                currentStatus === 'closed' ? '!bg-stone-700 !text-white !border-stone-700' : ''
              }`}
            >
              Close Ticket
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus || currentStatus === 'open'}
              onClick={() => handleStatusChange('open')}
              className={`btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold ${
                currentStatus === 'open' ? '!bg-red-600 !text-white !border-red-600' : ''
              }`}
            >
              Reopen
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-xs">
          <span className="text-stone-400 font-mono">ID: {currentTicket._id}</span>
          <button onClick={onClose} className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL: PROPERTY OWNER DOSSIER & LISTED INVENTORY
// ─────────────────────────────────────────────────────────────
function OwnerDetailModal({ user: ownerUser, onClose, onToggleStatus, onReload, onInspectProperty }) {
  const { toast } = useApp();
  const { data: propsData, loading: propsLoading, reload: reloadProps } = useData(`admin/properties?owner=${ownerUser._id}`);
  const [busyPropId, setBusyPropId] = useState(null);

  if (!ownerUser) return null;

  async function handleApproveProperty(id) {
    setBusyPropId(id);
    try {
      await api(`admin/properties/${id}`, { method: 'PATCH', body: { status: 'approved' } });
      toast('Property approved and published to public catalog!');
      reloadProps();
      onReload?.();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyPropId(null);
    }
  }

  const listedCount = propsData?.total ?? ownerUser.propertiesCount ?? 0;

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div
        className="panel max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="pill text-xs !bg-forest !text-white font-semibold">
                Direct Property Owner
              </span>
              <span className={`pill text-xs ${ownerUser.active ? '!bg-emerald-100 !text-emerald-800' : '!bg-red-100 !text-red-800'}`}>
                {ownerUser.active ? 'Active Account' : 'Suspended Account'}
              </span>
            </div>
            <h3 className="!text-2xl font-bold text-stone-900">{ownerUser.name}</h3>
            <p className="text-sm font-semibold muted mt-0.5">
              Account Role: <strong className="text-stone-800 capitalize">{ownerUser.role}</strong>
            </p>
          </div>
          <button onClick={onClose} className="muted hover:text-stone-900 p-1" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f8f3] p-4 rounded-lg">
          <div>
            <span className="text-xs muted block">Listed Properties</span>
            <strong className="text-base text-forest block mt-0.5 font-bold">
              {listedCount} {listedCount === 1 ? 'Home' : 'Homes'}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Account Role</span>
            <strong className="text-xs font-mono block mt-0.5 capitalize">
              {ownerUser.role}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Contact Phone</span>
            <strong className="text-xs font-mono block mt-0.5">
              {ownerUser.phone || 'Not provided'}
            </strong>
          </div>
          <div>
            <span className="text-xs muted block">Registered Email</span>
            <strong className="text-xs block mt-0.5 truncate" title={ownerUser.email}>
              {ownerUser.email}
            </strong>
          </div>
        </div>

        {/* Listed Properties */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Owner's Listed Properties ({listedCount})
              </h4>
              <p className="text-xs muted">
                Click any property card to view the complete listing dossier or moderate status.
              </p>
            </div>
          </div>

          <State loading={propsLoading} empty={listedCount === 0} />

          {propsData?.items && propsData.items.length > 0 ? (
            <div className="space-y-3">
              {propsData.items.map((prop) => (
                <div
                  key={prop._id}
                  className="p-3 rounded border border-stone-200 hover:border-forest bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                      alt={prop.title}
                      className="w-14 h-14 rounded object-cover border border-stone-200 shrink-0 cursor-pointer"
                      onClick={() => onInspectProperty?.(prop)}
                    />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onInspectProperty?.(prop)}
                        className="font-semibold text-sm text-stone-900 hover:text-forest flex items-center gap-1 truncate text-left"
                      >
                        <span className="truncate">{prop.title}</span>
                        <ArrowUpRight size={13} className="text-forest shrink-0" />
                      </button>
                      <div className="text-xs muted flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="capitalize">{prop.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
                        <span>•</span>
                        <span>{prop.locality}, {prop.city}</span>
                        <span>•</span>
                        <strong className="text-forest font-semibold">{money(prop.price)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className={`pill text-xs capitalize ${
                      prop.status === 'approved' ? '!bg-emerald-100 !text-emerald-800' : prop.status === 'pending' ? '!bg-amber-100 !text-amber-800' : ''
                    }`}>
                      {prop.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => onInspectProperty?.(prop)}
                      className="btn-outline !min-h-0 !py-1 !px-2.5 !text-xs font-semibold"
                    >
                      Inspect
                    </button>
                    {prop.status === 'pending' && (
                      <button
                        type="button"
                        disabled={busyPropId === prop._id}
                        onClick={() => handleApproveProperty(prop._id)}
                        className="btn !min-h-0 !py-1 !px-2.5 !text-xs"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !propsLoading && (
              <div className="panel text-center py-8 bg-[#fdfdfb]">
                <Home className="mx-auto mb-2 text-stone-400" size={28} />
                <h4 className="text-sm font-semibold">No properties listed yet</h4>
                <p className="text-xs muted mt-1">
                  When this owner posts a property, it will show up here.
                </p>
              </div>
            )
          )}
        </div>

        {/* Account Actions Footer */}
        <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(ownerUser)}
              className={`btn !min-h-0 !py-2 !px-3 !text-xs ${ownerUser.active ? '!bg-red-700' : ''}`}
            >
              {ownerUser.active ? 'Suspend Account' : 'Activate Account'}
            </button>
            {ownerUser.phone && (
              <a
                href={`tel:${ownerUser.phone}`}
                className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1"
              >
                <Phone size={13} /> Call {ownerUser.phone}
              </a>
            )}
            <a
              href={`mailto:${ownerUser.email}`}
              className="btn-outline !min-h-0 !py-2 !px-3 !text-xs flex items-center gap-1"
            >
              <Mail size={13} /> Email
            </a>
          </div>
          <button type="button" onClick={onClose} className="btn-outline !min-h-0 !py-2 !px-4 !text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


// 1. NOTIFICATIONS VIEW (Deep linking to Review Queue & Modals)
// ─────────────────────────────────────────────────────────────
function AdminNotificationsView({ onNotificationsChanged, onNavigate }) {
  const { toast } = useApp();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useData(`notifications?page=${page}&limit=10`);

  async function read(id) {
    try {
      await api(`notifications${id ? '/' + id : ''}`, { method: 'PATCH' });
      reload();
      onNotificationsChanged?.();
    } catch (e) {
      toast(e.message);
    }
  }

  function handleNotificationClick(v) {
    read(v._id);

    // Deep link extraction
    let propertyId = v.propertyId || v.targetId || v.entityId || (v.property && (typeof v.property === 'string' ? v.property : v.property._id)) || null;
    if (!propertyId && v.link) {
      const match = v.link.match(/propertyId=([a-f0-9]{24})/i) || v.link.match(/\/properties\/([a-f0-9]{24})/i);
      if (match) propertyId = match[1];
    }

    const text = (v.title + ' ' + (v.body || '')).toLowerCase();
    const isPropertyReview = text.includes('review') || text.includes('listing') || text.includes('property');

    if (propertyId) {
      onNavigate?.('properties', { propertyId, status: isPropertyReview ? 'pending' : '' });
    } else if (isPropertyReview) {
      onNavigate?.('properties', { status: 'pending' });
    } else if (v.link?.includes('leads') || v.link?.includes('enquir') || text.includes('enquiry') || text.includes('consultation')) {
      onNavigate?.('enquiries');
    } else if (v.link?.includes('visits') || text.includes('visit')) {
      onNavigate?.('enquiries');
    } else if (v.link?.includes('partners') || text.includes('partner')) {
      onNavigate?.('channel-partners');
    } else if (v.link?.includes('brokers') || text.includes('broker')) {
      onNavigate?.('agents');
    } else {
      onNavigate?.('properties');
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h2>Notifications {data?.unread ? `(${data.unread})` : ''}</h2>
        </div>
        <button type="button" className="text-link" onClick={() => read()}>
          Mark all read
        </button>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="space-y-3">
        {data?.items?.map((v) => (
          <article
            key={v._id}
            className={`panel ${!v.read ? '!bg-cream' : ''} cursor-pointer hover:border-forest transition-colors`}
            onClick={() => handleNotificationClick(v)}
          >
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-stone-900 hover:text-forest flex items-center gap-1.5">
                {!v.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                {v.title}
              </span>
              <span className="muted text-xs whitespace-nowrap">{date(v.createdAt)}</span>
            </div>
            <p className="muted text-sm mt-2">{v.body}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-forest font-semibold flex items-center gap-1">
                Open in review queue <ArrowUpRight size={13} />
              </span>
              {!v.read && (
                <button
                  type="button"
                  className="text-link !text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    read(v._id);
                  }}
                >
                  Mark read
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {data && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs muted font-medium">
            Showing {data.items?.length ? (page - 1) * (data.limit || 10) + 1 : 0} to{' '}
            {Math.min(page * (data.limit || 10), data.total || 0)} of {data.total || 0} notifications
          </div>
          <Pagination data={data} onChange={setPage} />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. DASHBOARD OVERVIEW VIEW
// ─────────────────────────────────────────────────────────────
function OverviewView({ stats, loading, error, onNavigate, onOpenProperty }) {
  const { data: recentProps, reload: reloadProps } = useData('admin/properties?limit=5');
  const { data: recentLeads } = useData('leads?limit=5');
  const { toast } = useApp();
  const [busyId, setBusyId] = useState(null);

  async function handleApprove(e, id) {
    e.stopPropagation();
    setBusyId(id);
    try {
      await api(`admin/properties/${id}`, { method: 'PATCH', body: { status: 'approved' } });
      toast('Property approved and published to public catalog!');
      reloadProps();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(e, id) {
    e.stopPropagation();
    setBusyId(id);
    try {
      await api(`admin/properties/${id}`, { method: 'PATCH', body: { status: 'rejected' } });
      toast('Property marked as rejected.');
      reloadProps();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">URBANFINDER ADMINISTRATION</p>
          <h1 className="!text-4xl">Platform command center.</h1>
          <p className="muted mt-4 mb-7">Review listings, verify partners, and monitor incoming enquiries.</p>
        </div>
        <Link className="btn" href="/post-property">
          <Plus size={16} /> Post property
        </Link>
      </div>

      <State loading={loading} error={error} />

      {/* Summary Grid with Direct Tab Routing */}
      <div className="summary-grid">
        <div className="stat cursor-pointer hover:border-forest transition-colors" onClick={() => onNavigate('properties')}>
          <div className="flex justify-between">
            <Home size={20} className="text-forest" />
            <ArrowUpRight size={15} />
          </div>
          <strong className="!text-3xl">{stats?.properties || 81}</strong>
          <span className="text-xs muted">
            Total listings ({stats?.pending || 0} pending)
          </span>
        </div>

        <div className="stat cursor-pointer hover:border-forest transition-colors" onClick={() => onNavigate('channel-partners')}>
          <div className="flex justify-between">
            <Handshake size={20} className="text-forest" />
            <ArrowUpRight size={15} />
          </div>
          <strong className="!text-3xl">{(stats?.channelPartners || 0) + (stats?.brokers || 0)}</strong>
          <span className="text-xs muted">Channel partners &amp; brokers</span>
        </div>

        <div className="stat cursor-pointer hover:border-forest transition-colors" onClick={() => onNavigate('service-providers')}>
          <div className="flex justify-between">
            <Wrench size={20} className="text-forest" />
            <ArrowUpRight size={15} />
          </div>
          <strong className="!text-3xl">{initialServiceProviders.length}</strong>
          <span className="text-xs muted">Service providers (12 categories)</span>
        </div>

        <div className="stat cursor-pointer hover:border-forest transition-colors" onClick={() => onNavigate('enquiries')}>
          <div className="flex justify-between">
            <Mail size={20} className="text-forest" />
            <ArrowUpRight size={15} />
          </div>
          <strong className="!text-3xl">{stats?.leads || 18}</strong>
          <span className="text-xs muted">Enquiries &amp; site visits</span>
        </div>
      </div>

      {/* Channel Partner Network Performance KPIs */}
      <div className="panel bg-[#fbfcf8] border border-stone-200 !p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="pill text-xs !bg-emerald-100 !text-emerald-800 font-semibold inline-flex items-center gap-1">
                <Handshake size={12} /> Strategic Alliances
              </span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Institutional Overview</span>
            </div>
            <h3 className="!text-lg font-bold text-stone-900 mt-1">Channel partner network performance</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('channel-partners')}
            className="btn-outline !min-h-0 !py-1.5 !px-3 !text-xs font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            Manage partners <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="p-4 bg-white rounded-lg border border-stone-200 cursor-pointer hover:border-emerald-600 transition-colors"
            onClick={() => onNavigate('channel-partners')}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs muted font-semibold uppercase tracking-wider">Registered Channel Partners</span>
              <Users size={16} className="text-emerald-700" />
            </div>
            <strong className="text-3xl font-bold text-stone-900 block mt-2">{stats?.channelPartners || 0}</strong>
            <p className="text-xs text-emerald-800 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Enterprise Network
            </p>
          </div>

          <div
            className="p-4 bg-white rounded-lg border border-stone-200 cursor-pointer hover:border-emerald-600 transition-colors"
            onClick={() => onNavigate('properties')}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs muted font-semibold uppercase tracking-wider">Active CP Inventory</span>
              <Home size={16} className="text-emerald-700" />
            </div>
            <strong className="text-3xl font-bold text-stone-900 block mt-2">{stats?.channelPartnerProperties ?? (stats?.channelPartnerInventory ?? 0)}</strong>
            <p className="text-xs muted mt-1">
              Live listings marketed by channel partners
            </p>
          </div>

          <div
            className="p-4 bg-white rounded-lg border border-stone-200 cursor-pointer hover:border-emerald-600 transition-colors"
            onClick={() => onNavigate('enquiries')}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs muted font-semibold uppercase tracking-wider">Inbound CP Leads</span>
              <Mail size={16} className="text-emerald-700" />
            </div>
            <strong className="text-3xl font-bold text-stone-900 block mt-2">{stats?.channelPartnerLeads || 0}</strong>
            <p className="text-xs text-forest font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Leads assigned to partner advisors
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Notice: One-Click Jump to Pending Review */}
      {Number(stats?.pending) > 0 && (
        <div className="panel bg-[#fef9ee] border-amber-300 !p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-amber-700 shrink-0" />
            <div>
              <h3 className="!text-base font-semibold text-amber-900">
                {stats.pending} {stats.pending === 1 ? 'property is' : 'properties are'} awaiting review
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Moderation required before public listing discovery.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('properties', { status: 'pending' })}
            className="btn !min-h-0 !py-2 !px-4 !text-sm"
          >
            Review listings →
          </button>
        </div>
      )}

      {/* Grid Panels: Recent Listings & Recent Enquiries */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div className="panel">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="!text-lg font-bold text-stone-900">Recent submissions</h3>
              <p className="text-xs muted">Click any listing to inspect details &amp; moderate</p>
            </div>
            <button onClick={() => onNavigate('properties')} className="text-link !text-sm flex items-center gap-1">
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="space-y-4">
            {recentProps?.items?.slice(0, 5).map((p) => (
              <div
                key={p._id}
                onClick={() => onOpenProperty(p)}
                className="flex items-center justify-between gap-4 pb-3 border-b border-stone-100 last:border-0 last:pb-0 cursor-pointer hover:bg-stone-50 p-2 rounded transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="pill text-xs uppercase">{p.purpose}</span>
                    <strong className="text-sm font-semibold truncate block text-stone-900 hover:text-forest">
                      {p.title}
                    </strong>
                  </div>
                  <p className="text-xs muted mt-1">
                    {p.locality}, {p.city} • <strong className="text-stone-800">{money(p.price)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === p._id}
                        onClick={(e) => handleApprove(e, p._id)}
                        className="btn !min-h-0 !py-1.5 !px-3 !text-xs !bg-emerald-700 hover:!bg-emerald-800"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === p._id}
                        onClick={(e) => handleReject(e, p._id)}
                        className="btn-outline !min-h-0 !py-1.5 !px-2.5 !text-xs !text-red-700"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`pill text-xs capitalize ${p.status === 'approved' ? '!bg-emerald-100 !text-emerald-800' : ''}`}>
                      {p.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="panel">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="!text-lg font-bold text-stone-900">Incoming enquiries</h3>
              <p className="text-xs muted">Direct buyers and consultation bookings</p>
            </div>
            <button onClick={() => onNavigate('enquiries')} className="text-link !text-sm flex items-center gap-1">
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="space-y-4">
            {recentLeads?.items?.slice(0, 5).map((l) => (
              <div
                key={l._id}
                onClick={() => onNavigate('enquiries')}
                className="flex items-center justify-between gap-4 pb-3 border-b border-stone-100 last:border-0 last:pb-0 cursor-pointer hover:bg-stone-50 p-2 rounded transition-colors"
              >
                <div>
                  <strong className="text-sm font-semibold block text-stone-900">{l.name}</strong>
                  <p className="text-xs muted mt-1">
                    {l.city} • Budget: <strong className="text-stone-800">{money(l.budget)}</strong>
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5 truncate max-w-xs">{l.project?.title || l.design?.title || 'General Enquiry'}</p>
                </div>
                <span className="pill text-xs capitalize">{l.status || 'New Lead'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. SERVICE PROVIDERS VIEW (With Full Interactive Pagination)
// ─────────────────────────────────────────────────────────────
function ServiceProvidersView() {
  const { toast } = useApp();
  const [providers, setProviders] = useState(initialServiceProviders);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const categoryFilters = [
    ['all', 'All Categories'],
    ['home-interior', 'Interior Design'],
    ['solar-rooftop', 'Solar Rooftop'],
    ['home-automation', 'Home Automation'],
    ['security-cctv', 'Security & CCTV'],
    ['water-purifier', 'Water Treatment'],
    ['landscaping-garden', 'Landscaping'],
    ['pest-control', 'Pest Control'],
    ['deep-cleaning', 'Deep Cleaning'],
    ['packers-movers', 'Packers & Movers'],
    ['painting-waterproofing', 'Painting'],
    ['facility-management', 'Facility Mgmt'],
    ['office-supply', 'Office Supplies'],
  ];

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
      if (cityFilter && p.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.specialist.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [providers, selectedCategory, cityFilter, search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, cityFilter, search]);

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const pagedProviders = filtered.slice((page - 1) * limit, page * limit);

  function toggleVerification(id) {
    setProviders((prev) =>
      prev.map((p) => {
        if (p._id === id) {
          const next = !p.verified;
          toast(`${p.name} verification set to ${next ? 'Verified' : 'Unverified'}`);
          return { ...p, verified: next };
        }
        return p;
      })
    );
  }

  function toggleFeatured(id) {
    setProviders((prev) =>
      prev.map((p) => {
        if (p._id === id) {
          const next = !p.featured;
          toast(`${p.name} featured state toggled.`);
          return { ...p, featured: next };
        }
        return p;
      })
    );
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">VERIFIED INDUSTRY PROFESSIONALS</p>
          <h1 className="!text-4xl">Service providers.</h1>
          <p className="muted mt-4 mb-7">
            Manage certified trade specialists, interior designers, and maintenance experts across all 12 categories.
          </p>
        </div>
        <button className="btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add service provider
        </button>
      </div>

      {/* Category Tabs */}
      <div className="tab-row mb-6 overflow-x-auto pb-1">
        {categoryFilters.map(([slug, label]) => (
          <button
            key={slug}
            className={selectedCategory === slug ? 'active' : ''}
            onClick={() => setSelectedCategory(slug)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="panel !p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by specialist, company name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !h-10 !text-sm"
          />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="input !h-10 !text-sm !w-auto"
        >
          <option value="">All Metro Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table of Providers */}
      <div className="panel !p-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Provider &amp; Specialist</th>
              <th>Category</th>
              <th>Operating City</th>
              <th>Starting Price</th>
              <th>Rating &amp; Reviews</th>
              <th>Badges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedProviders.map((p) => (
              <tr key={p._id} onClick={() => setSelectedProvider(p)} className="cursor-pointer hover:bg-stone-50 transition-colors">
                <td>
                  <strong>{p.name}</strong>
                  <div className="text-xs muted">{p.specialist}</div>
                </td>
                <td>
                  <span className="pill text-xs">{p.category}</span>
                </td>
                <td>{p.city}</td>
                <td>
                  <strong className="text-stone-900">{p.startingPrice || 'Quote'}</strong>
                </td>
                <td>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span>{p.rating}</span>
                    <span className="muted text-xs font-normal">({p.reviews})</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1.5 flex-wrap">
                    {p.verified && (
                      <span className="pill !bg-emerald-100 !text-emerald-800 text-xs">Verified</span>
                    )}
                    {p.featured && (
                      <span className="pill !bg-amber-100 !text-amber-900 text-xs">Featured</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleVerification(p._id)}
                      className={`text-xs font-semibold ${p.verified ? 'text-amber-800' : 'text-emerald-700'}`}
                    >
                      {p.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(p._id)}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                    >
                      {p.featured ? 'Unfeature' : 'Feature'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs muted font-medium">
          Showing {filtered.length ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, filtered.length)} of {filtered.length} service providers
        </div>
        <Pagination
          data={{ page, pages: totalPages, total: filtered.length, limit }}
          onChange={setPage}
        />
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <ServiceProviderDetailModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onToggleVerify={toggleVerification}
          onToggleFeature={toggleFeatured}
        />
      )}

      {/* Add Provider Modal */}
      {showAddModal && (
        <AddServiceProviderModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newP) => {
            setProviders((prev) => [newP, ...prev]);
            setShowAddModal(false);
            toast(`${newP.name} added successfully.`);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 3B. ADD SERVICE PROVIDER MODAL
// ─────────────────────────────────────────────────────────────
function AddServiceProviderModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(serviceCategories[0]?.name || 'Home Interiors');
  const [categorySlug, setCategorySlug] = useState(serviceCategories[0]?.slug || 'home-interior');
  const [specialist, setSpecialist] = useState('');
  const [city, setCity] = useState(cities[0]);
  const [locality, setLocality] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const newP = {
      _id: 'sp-' + Date.now(),
      name,
      category,
      categorySlug,
      specialist,
      city,
      locality,
      startingPrice,
      phone,
      bio,
      rating: 4.8,
      reviews: 1,
      verified: true,
      featured: false,
    };
    onAdded(newP);
  }

  return (
    <div role="dialog" aria-modal="true" className="modal" onClick={onClose}>
      <div className="panel max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5 pb-3 border-b">
          <h3>Register New Service Provider</h3>
          <button onClick={onClose} className="muted"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Business / Provider Name" required>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Apex Solar Engineering" className="input" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Service Category" required>
              <select
                value={categorySlug}
                onChange={(e) => {
                  const sel = serviceCategories.find((c) => c.slug === e.target.value);
                  setCategorySlug(e.target.value);
                  setCategory(sel?.name || e.target.value);
                }}
                className="input"
              >
                {serviceCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Specialist Title" required>
              <input required value={specialist} onChange={(e) => setSpecialist(e.target.value)} placeholder="e.g. MNRE Certified Rooftop Installer" className="input" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Operating City" required>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Locality" required>
              <input required value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Indiranagar" className="input" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Starting Price">
              <input value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="e.g. ₹2,999 onwards" className="input" />
            </Field>
            <Field label="Contact Phone" required>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Bio &amp; Specializations">
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Certifications, service scope, and background." className="input" />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn">Register provider</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. CHANNEL PARTNERS VIEW (With Full Pagination Controls)
// ─────────────────────────────────────────────────────────────
function ChannelPartnersView({ onReload, onInspectProperty }) {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useData(`admin/users?role=channel_partner&page=${page}&limit=10${search ? `&q=${encodeURIComponent(search)}` : ''}`);
  const [busyId, setBusyId] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Reset page when searching
  useEffect(() => {
    setPage(1);
  }, [search]);

  async function toggleStatus(u) {
    setBusyId(u._id);
    try {
      await api(`admin/users/${u._id}`, { method: 'PATCH', body: { active: !u.active } });
      toast(`Channel Partner ${u.name} set to ${!u.active ? 'Active' : 'Disabled'}.`);
      reload();
      onReload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">STRATEGIC ALLIANCES</p>
          <h1 className="!text-4xl">Channel partners.</h1>
          <p className="muted mt-4 mb-7">
            Verified corporate agencies, enterprise channel partners, and direct project marketing desks.
          </p>
        </div>
        <span className="pill text-sm font-semibold !p-2 px-3">
          {data?.total || 0} Registered Partners
        </span>
      </div>

      <div className="panel !p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by company firm, partner name, or RERA ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !h-10 !text-sm"
          />
        </div>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="panel !p-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Partner Firm &amp; Tier</th>
              <th>RERA Registration</th>
              <th>Contact Details</th>
              <th>Inventory &amp; Pipeline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((cp) => (
              <tr key={cp._id} onClick={() => setSelectedPartner(cp)} className="cursor-pointer hover:bg-stone-50 transition-colors">
                <td>
                  <strong>{cp.company || 'Enterprise Agency'}</strong>
                  <div className="text-xs muted">Lead: {cp.name}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`pill text-[10px] font-bold ${
                      cp.tier === 'Platinum' ? '!bg-purple-100 !text-purple-800' :
                      cp.tier === 'Silver' ? '!bg-slate-100 !text-slate-800' :
                      '!bg-amber-100 !text-amber-800'
                    }`}>
                      ★ {cp.tier || 'Gold'} Tier
                    </span>
                    {cp.verified ? (
                      <span className="pill text-[10px] !bg-emerald-100 !text-emerald-800 font-semibold inline-flex items-center gap-0.5">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    ) : (
                      <span className="pill text-[10px] !bg-amber-100 !text-amber-800 font-semibold">
                        Unverified
                      </span>
                    )}
                  </div>
                </td>
                <td className="font-mono text-xs font-semibold text-stone-800">
                  {cp.reraId || 'PRM/KA/RERA/PENDING'}
                  <div className="text-xs muted font-sans mt-0.5 flex items-center gap-1">
                    <UserCheck size={11} className="text-forest" />
                    {cp.teamCount || cp.team?.length || 0} Team Advisors
                  </div>
                </td>
                <td>
                  <div>{cp.email}</div>
                  <div className="text-xs muted font-mono">{cp.phone || 'No phone'}</div>
                </td>
                <td>
                  <div className="space-y-1">
                    <span className="pill text-xs font-semibold block w-fit">
                      {cp.propertiesCount || 0} Listings
                    </span>
                    {cp.leadsCount !== undefined && (
                      <span className="pill text-[10px] !bg-emerald-50 !text-emerald-800 !border !border-emerald-200 block w-fit">
                        {cp.leadsCount} Inbound Leads
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`pill text-xs capitalize ${
                    cp.active ? '!bg-emerald-100 !text-emerald-800' : '!bg-red-100 !text-red-800'
                  }`}>
                    {cp.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedPartner(cp)}
                      className="text-link !text-xs font-semibold flex items-center gap-0.5"
                    >
                      Inspect <ArrowUpRight size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={busyId === cp._id}
                      onClick={() => toggleStatus(cp)}
                      className="text-xs muted hover:text-stone-900 font-semibold"
                    >
                      {cp.active ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs muted font-medium">
            Showing {data.items?.length ? (page - 1) * (data.limit || 10) + 1 : 0} to{' '}
            {Math.min(page * (data.limit || 10), data.total || 0)} of {data.total || 0} partners
          </div>
          <Pagination data={data} onChange={setPage} />
        </div>
      )}

      {selectedPartner && (
        <AgentPartnerDetailModal
          user={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onToggleStatus={toggleStatus}
          onReload={reload}
          onInspectProperty={onInspectProperty}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. BUILDERS & PROJECTS VIEW (With Full Pagination Controls)
// ─────────────────────────────────────────────────────────────
function BuildersProjectsView({ onReload }) {
  const { toast } = useApp();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useData(`admin/projects?page=${page}&limit=10`);
  const [busyId, setBusyId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  async function handleArchive(id) {
    if (!window.confirm('Archive this project and remove it from public discovery?')) return;
    setBusyId(id);
    try {
      await api(`admin/projects/${id}`, { method: 'DELETE' });
      toast('Project archived.');
      reload();
      onReload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">DEVELOPER MASTERPLANS</p>
          <h1 className="!text-4xl">Builders &amp; projects.</h1>
          <p className="muted mt-4 mb-7">
            Promoted township communities, gated villa enclaves, and premium high-rise developments.
          </p>
        </div>
        <span className="pill text-sm font-semibold !p-2 px-3">
          {data?.total || 0} Township Developments
        </span>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="panel !p-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Community &amp; Builder</th>
              <th>Location</th>
              <th>Configurations</th>
              <th>Price Spectrum</th>
              <th>RERA Compliance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((p) => (
              <tr key={p._id} onClick={() => setSelectedProject(p)} className="cursor-pointer hover:bg-stone-50 transition-colors">
                <td>
                  <strong>{p.title}</strong>
                  <div className="text-xs muted">Developer: {p.builder}</div>
                </td>
                <td>
                  <div>{p.locality}, {p.city}</div>
                </td>
                <td>
                  <span className="text-xs font-semibold">
                    {p.configurations?.map((c) => c.name).join(', ') || '2, 3 BHK Luxury Residences'}
                  </span>
                </td>
                <td>
                  <strong className="text-forest">
                    {money(p.price)} - {money(p.maxPrice)}
                  </strong>
                </td>
                <td className="font-mono text-xs">
                  {p.reraId || 'PRM/KA/RERA/VERIFIED'}
                </td>
                <td>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(p)}
                      className="text-link !text-xs font-semibold"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p._id}
                      onClick={() => handleArchive(p._id)}
                      className="text-xs muted hover:text-red-700 font-semibold"
                    >
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs muted font-medium">
            Showing {data.items?.length ? (page - 1) * (data.limit || 10) + 1 : 0} to{' '}
            {Math.min(page * (data.limit || 10), data.total || 0)} of {data.total || 0} projects
          </div>
          <Pagination data={data} onChange={setPage} />
        </div>
      )}

      {selectedProject && (
        <BuilderProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onArchive={handleArchive}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. BROKERS & AGENTS VIEW (With Full Pagination Controls)
// ─────────────────────────────────────────────────────────────
function BrokersAgentsView({ onReload, onInspectProperty }) {
  const { toast } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useData(`admin/users?role=broker&page=${page}&limit=10${search ? `&q=${encodeURIComponent(search)}` : ''}`);
  const [busyId, setBusyId] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function toggleStatus(u) {
    setBusyId(u._id);
    try {
      await api(`admin/users/${u._id}`, { method: 'PATCH', body: { active: !u.active } });
      toast(`Broker ${u.name} status updated.`);
      reload();
      onReload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">REAL ESTATE BROKERAGE</p>
          <h1 className="!text-4xl">Authorized brokers.</h1>
          <p className="muted mt-4 mb-7">
            Certified real estate agents and advisory teams managing property listings.
          </p>
        </div>
        <span className="pill text-sm font-semibold !p-2 px-3">
          {data?.total || 0} Registered Brokers
        </span>
      </div>

      <div className="panel !p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by broker name, advisory firm, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !h-10 !text-sm"
          />
        </div>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="panel !p-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Broker Name</th>
              <th>Agency / Firm</th>
              <th>Contact Details</th>
              <th>Listings</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((b) => (
              <tr key={b._id} onClick={() => setSelectedBroker(b)} className="cursor-pointer hover:bg-stone-50 transition-colors">
                <td>
                  <strong>{b.name}</strong>
                  <div className="text-xs font-mono muted">{b.reraId || 'RERA Verified'}</div>
                </td>
                <td>{b.company || 'Independent Broker'}</td>
                <td>
                  <div>{b.email}</div>
                  <div className="text-xs muted font-mono">{b.phone || 'No phone'}</div>
                </td>
                <td>
                  <span className="pill text-xs font-semibold">
                    {b.propertiesCount || 0} Properties
                  </span>
                </td>
                <td>
                  <span className={`pill text-xs capitalize ${
                    b.active ? '!bg-emerald-100 !text-emerald-800' : '!bg-red-100 !text-red-800'
                  }`}>
                    {b.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedBroker(b)}
                      className="text-link !text-xs font-semibold"
                    >
                      Dossier
                    </button>
                    <button
                      type="button"
                      disabled={busyId === b._id}
                      onClick={() => toggleStatus(b)}
                      className="text-xs muted hover:text-stone-900 font-semibold"
                    >
                      {b.active ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs muted font-medium">
            Showing {data.items?.length ? (page - 1) * (data.limit || 10) + 1 : 0} to{' '}
            {Math.min(page * (data.limit || 10), data.total || 0)} of {data.total || 0} brokers
          </div>
          <Pagination data={data} onChange={setPage} />
        </div>
      )}

      {selectedBroker && (
        <AgentPartnerDetailModal
          user={selectedBroker}
          onClose={() => setSelectedBroker(null)}
          onToggleStatus={toggleStatus}
          onReload={reload}
          onInspectProperty={onInspectProperty}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. USERS & PROPERTY OWNERS VIEW (With Full Pagination Controls)
// ─────────────────────────────────────────────────────────────
function UsersView({ onReload, onNavigate, onInspectProperty }) {
  const { toast } = useApp();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const { data, loading, error, reload } = useData(
    `admin/users?page=${page}&limit=10${roleFilter ? `&role=${roleFilter}&` : ''}${search ? `q=${encodeURIComponent(search)}` : ''}`
  );
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  async function handleRoleChange(userId, newRole) {
    setBusyId(userId);
    try {
      await api(`admin/users/${userId}`, { method: 'PATCH', body: { role: newRole } });
      toast('User role updated successfully.');
      reload();
      onReload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(u) {
    setBusyId(u._id);
    try {
      await api(`admin/users/${u._id}`, { method: 'PATCH', body: { active: !u.active } });
      toast(`User ${u.name} set to ${!u.active ? 'Active' : 'Disabled'}.`);
      reload();
      onReload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">USER MANAGEMENT</p>
          <h1 className="!text-4xl">Registered people.</h1>
          <p className="muted mt-4 mb-7">
            Manage user roles, direct owner privileges, and platform accessibility.
          </p>
        </div>
        <span className="pill text-sm font-semibold !p-2 px-3">
          {data?.total || 0} Total Users
        </span>
      </div>

      <div className="panel !p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !h-10 !text-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input !h-10 !text-sm !w-auto"
        >
          <option value="">All Roles</option>
          <option value="user">Standard User</option>
          <option value="owner">Direct Owner</option>
          <option value="channel_partner">Channel Partner</option>
          <option value="broker">Broker</option>
          <option value="builder">Builder</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="panel !p-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Contact Details</th>
              <th>Platform Role</th>
              <th>Listings</th>
              <th>Account State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((u) => (
              <tr
                key={u._id}
                onClick={() => {
                  if (u.role === 'owner' || u.propertiesCount > 0) {
                    setSelectedOwner(u);
                  }
                }}
                className={u.role === 'owner' || u.propertiesCount > 0 ? 'cursor-pointer hover:bg-stone-50 transition-colors' : ''}
              >
                <td>
                  <strong className="text-stone-900">{u.name}</strong>
                  {u.company && <div className="text-xs muted">{u.company}</div>}
                </td>
                <td>
                  <div>{u.email}</div>
                  <div className="text-xs muted font-mono">{u.phone || 'No phone'}</div>
                </td>
                <td>
                  <select
                    value={u.role}
                    disabled={busyId === u._id}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="input !h-8 !py-0 !text-xs !w-auto"
                  >
                    <option value="user">User</option>
                    <option value="owner">Owner</option>
                    <option value="channel_partner">Channel Partner</option>
                    <option value="broker">Broker</option>
                    <option value="builder">Builder</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  {u.propertiesCount > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOwner(u);
                      }}
                      className="pill text-xs font-semibold !bg-forest !text-white flex items-center gap-1 hover:!bg-[#205347]"
                      title="Inspect owner listings"
                    >
                      <Home size={11} /> {u.propertiesCount} Listed
                    </button>
                  ) : (
                    <span className="text-xs muted">None</span>
                  )}
                </td>
                <td>
                  <span className={`pill text-xs capitalize ${
                    u.active ? '!bg-emerald-100 !text-emerald-800' : '!bg-red-100 !text-red-800'
                  }`}>
                    {u.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {(u.role === 'owner' || u.propertiesCount > 0) && (
                      <button
                        type="button"
                        onClick={() => setSelectedOwner(u)}
                        className="text-link !text-xs font-semibold"
                      >
                        Dossier
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === u._id}
                      onClick={() => toggleActive(u)}
                      className="text-xs font-semibold muted hover:text-stone-900"
                    >
                      {u.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs muted font-medium">
            Showing {data.items?.length ? (page - 1) * (data.limit || 10) + 1 : 0} to{' '}
            {Math.min(page * (data.limit || 10), data.total || 0)} of {data.total || 0} users
          </div>
          <Pagination data={data} onChange={setPage} />
        </div>
      )}

      {selectedOwner && (
        <OwnerDetailModal
          user={selectedOwner}
          onClose={() => setSelectedOwner(null)}
          onToggleStatus={toggleActive}
          onReload={reload}
          onInspectProperty={onInspectProperty}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. PROPERTIES & LISTINGS VIEW (Full Controls + Modal Inspection)
// ─────────────────────────────────────────────────────────────
function PropertiesView({ initialStatus = '', onReload, onOpenProperty }) {
  const { toast } = useApp();
  const [status, setStatus] = useState(initialStatus);
  const [purpose, setPurpose] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  // Sync when initialStatus changes (e.g. from notification click or overview banner)
  useEffect(() => {
    if (initialStatus !== undefined) {
      setStatus(initialStatus);
      setPage(1);
    }
  }, [initialStatus]);

  useEffect(() => {
    setPage(1);
  }, [status, purpose, search]);

  const queryUrl = `admin/properties?page=${page}&limit=10${status ? `&status=${status}` : ''}${purpose ? `&purpose=${purpose}` : ''}${search ? `&q=${encodeURIComponent(search)}` : ''}`;
  const { data, loading, error, reload } = useData(queryUrl);

  async function updateStatus(e, id, newStatus) {
    e?.stopPropagation();
    setBusyId(id);
    try {
      await api(`admin/properties/${id}`, { method: 'PATCH', body: { status: newStatus } });
      toast(`Listing status updated to ${newStatus}.`);
      reload();
      onReload();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">LISTINGS MODERATION</p>
          <h1 className="!text-4xl">Properties review queue.</h1>
          <p className="muted mt-4 mb-7">
            Approve, reject, or inspect property submissions across every state. Click any listing to view the comprehensive dossier.
          </p>
        </div>
        <Link className="btn" href="/post-property">
          <Plus size={16} /> Post property
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel !p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search listings by title, locality, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !h-10 !text-sm"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !h-10 !text-sm !w-auto">
            <option value="">All Statuses</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="approved">✓ Approved / Live</option>
            <option value="rejected">✕ Rejected</option>
            <option value="archived">Archived</option>
          </select>

          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="input !h-10 !text-sm !w-auto">
            <option value="">All Purposes</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
            <option value="pg">PG / Co-living</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="panel !p-0 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Location &amp; Specs</th>
              <th>Price / Rent</th>
              <th>Listed By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((p) => (
              <tr
                key={p._id}
                onClick={() => onOpenProperty(p)}
                className="cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <td>
                  <strong className="text-stone-900 hover:text-forest flex items-center gap-1">
                    {p.title}
                    <ArrowUpRight size={13} className="text-forest shrink-0" />
                  </strong>
                  <div className="flex gap-1.5 mt-1">
                    <span className="pill uppercase text-xs">{p.purpose}</span>
                    <span className="pill text-xs">{p.type}</span>
                    {p.featured && (
                      <span className="pill !bg-amber-100 !text-amber-900 text-xs font-semibold">Featured</span>
                    )}
                  </div>
                </td>
                <td>
                  <div>{p.locality}, {p.city}</div>
                  <div className="text-xs muted">{p.bedrooms ? `${p.bedrooms} BHK • ` : ''}{p.area} sq ft</div>
                </td>
                <td>
                  <strong className="text-stone-900">{money(p.price)}</strong>
                  {p.purpose === 'rent' || p.purpose === 'pg' ? <span className="text-xs muted block">/ month</span> : null}
                </td>
                <td>
                  <span className="font-semibold block capitalize">{p.ownership || 'owner'}</span>
                  <span className="text-xs muted">{p.owner?.name || 'User'}</span>
                </td>
                <td>
                  <span className={`pill capitalize ${
                    p.status === 'approved' ? '!bg-emerald-100 !text-emerald-800' : p.status === 'pending' ? '!bg-amber-100 !text-amber-800' : p.status === 'rejected' ? '!bg-red-100 !text-red-800' : ''
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onOpenProperty(p)}
                      className="btn-outline !min-h-0 !py-1 !px-2.5 !text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye size={12} /> Inspect
                    </button>
                    {p.status !== 'approved' && (
                      <button
                        type="button"
                        disabled={busyId === p._id}
                        onClick={(e) => updateStatus(e, p._id, 'approved')}
                        className="btn !min-h-0 !py-1 !px-2.5 !text-xs !bg-emerald-700 hover:!bg-emerald-800"
                      >
                        Approve
                      </button>
                    )}
                    {p.status !== 'rejected' && (
                      <button
                        type="button"
                        disabled={busyId === p._id}
                        onClick={(e) => updateStatus(e, p._id, 'rejected')}
                        className="btn-outline !min-h-0 !py-1 !px-2 !text-xs !text-red-700"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs muted font-medium">
            Showing {data.items?.length ? (page - 1) * (data.limit || 10) + 1 : 0} to{' '}
            {Math.min(page * (data.limit || 10), data.total || 0)} of {data.total || 0} listings
          </div>
          <Pagination data={data} onChange={setPage} />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. ENQUIRIES & SITE VISITS VIEW (With Full Pagination Controls)
// ─────────────────────────────────────────────────────────────
function EnquiriesVisitsView({ onOpenProperty }) {
  const [subTab, setSubTab] = useState('leads');
  const [leadsPage, setLeadsPage] = useState(1);
  const [visitsPage, setVisitsPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [cpFilter, setCpFilter] = useState('all'); // 'all' | 'cp' | 'direct'

  const leadQuery = `leads?page=${leadsPage}&limit=10${cpFilter === 'cp' ? '&channelPartner=true' : ''}`;
  const { data: leads, reload: reloadLeads } = useData(leadQuery);
  const { data: visits, reload: reloadVisits } = useData(`visits?page=${visitsPage}&limit=10`);

  function renderTouchpointBadge(source) {
    if (source === 'phone') {
      return (
        <span className="pill text-xs !bg-blue-50 !text-blue-800 !border !border-blue-200 font-semibold inline-flex items-center gap-1">
          <Phone size={11} className="text-blue-600" /> Phone Callback
        </span>
      );
    }
    if (source === 'message') {
      return (
        <span className="pill text-xs !bg-indigo-50 !text-indigo-800 !border !border-indigo-200 font-semibold inline-flex items-center gap-1">
          <Mail size={11} className="text-indigo-600" /> Direct Chat
        </span>
      );
    }
    return (
      <span className="pill text-xs !bg-emerald-50 !text-emerald-800 !border !border-emerald-200 font-semibold inline-flex items-center gap-1">
        <Home size={11} className="text-emerald-600" /> Property Form
      </span>
    );
  }

  const displayedLeads = useMemo(() => {
    if (!leads?.items) return [];
    if (cpFilter === 'cp') {
      return leads.items.filter((l) =>
        Boolean(
          l.assignedTeamMember ||
          l.manager?.role === 'channel_partner' ||
          l.property?.owner?.role === 'channel_partner' ||
          l.manager?.company ||
          l.property?.owner?.company
        )
      );
    }
    if (cpFilter === 'direct') {
      return leads.items.filter((l) =>
        !l.assignedTeamMember &&
        l.manager?.role !== 'channel_partner' &&
        l.property?.owner?.role !== 'channel_partner' &&
        !l.manager?.company &&
        !l.property?.owner?.company
      );
    }
    return leads.items;
  }, [leads?.items, cpFilter]);

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">INCOMING INTEREST</p>
          <h1 className="!text-4xl">Enquiries and visits.</h1>
          <p className="muted mt-4 mb-7">
            Direct buyer contacts, scheduled property visits, and consultation bookings.
          </p>
        </div>
      </div>

      <div className="tab-row mb-6">
        <button className={subTab === 'leads' ? 'active' : ''} onClick={() => setSubTab('leads')}>
          Direct Leads ({leads?.total || 0})
        </button>
        <button className={subTab === 'visits' ? 'active' : ''} onClick={() => setSubTab('visits')}>
          Site Visits ({visits?.total || 0})
        </button>
      </div>

      {subTab === 'leads' ? (
        <>
          {/* Channel Partner & Attribution Filter Strip */}
          <div className="panel !p-3 mb-5 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70 border border-stone-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Filter size={13} className="text-forest" /> Attribution:
              </span>
              <button
                type="button"
                onClick={() => { setCpFilter('all'); setLeadsPage(1); }}
                className={`pill text-xs font-semibold cursor-pointer transition-colors ${
                  cpFilter === 'all' ? '!bg-forest !text-white' : '!bg-white hover:!bg-stone-100 !border !border-stone-200'
                }`}
              >
                All Enquiries
              </button>
              <button
                type="button"
                onClick={() => { setCpFilter('cp'); setLeadsPage(1); }}
                className={`pill text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors ${
                  cpFilter === 'cp' ? '!bg-emerald-800 !text-white' : '!bg-emerald-50 !text-emerald-800 hover:!bg-emerald-100 !border !border-emerald-200'
                }`}
              >
                <Handshake size={12} /> Channel Partner Leads
              </button>
              <button
                type="button"
                onClick={() => { setCpFilter('direct'); setLeadsPage(1); }}
                className={`pill text-xs font-semibold cursor-pointer transition-colors ${
                  cpFilter === 'direct' ? '!bg-forest !text-white' : '!bg-white hover:!bg-stone-100 !border !border-stone-200'
                }`}
              >
                Direct Platform Leads
              </button>
            </div>
            <span className="text-xs muted font-medium">
              Showing {displayedLeads.length} leads
            </span>
          </div>

          <div className="panel !p-0 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Touchpoint</th>
                  <th>Attribution &amp; Advisor</th>
                  <th>Target Inquiry</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedLeads.map((l) => {
                  const isCp = Boolean(
                    l.assignedTeamMember ||
                    l.manager?.role === 'channel_partner' ||
                    l.property?.owner?.role === 'channel_partner' ||
                    l.manager?.company ||
                    l.property?.owner?.company
                  );
                  return (
                    <tr
                      key={l._id}
                      onClick={() => setSelectedLead(l)}
                      className="cursor-pointer hover:bg-stone-50 transition-colors"
                    >
                      <td>
                        <strong className="text-stone-900 hover:text-forest flex items-center gap-1">
                          {l.name}
                          <ArrowUpRight size={12} className="text-forest" />
                        </strong>
                        <div className="text-xs muted font-mono mt-0.5">{l.phone}</div>
                      </td>
                      <td>
                        {renderTouchpointBadge(l.source)}
                      </td>
                      <td>
                        {isCp ? (
                          <div>
                            {l.assignedTeamMember ? (
                              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                                <UserCheck size={13} className="text-emerald-700 shrink-0" />
                                <span>{l.assignedTeamMember}</span>
                              </div>
                            ) : null}
                            <div className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                              <Handshake size={12} className="text-forest shrink-0" />
                              <span>{l.manager?.company || l.property?.owner?.company || 'Channel Partner Network'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs muted">
                            Direct Platform Lead
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="font-semibold text-stone-900 text-xs truncate max-w-xs">
                          {l.property?.title || l.project?.title || l.design?.title || 'General Property Inquiry'}
                        </div>
                        <div className="text-[11px] muted">{l.city}</div>
                      </td>
                      <td><strong className="text-stone-900">{money(l.budget)}</strong></td>
                      <td><span className="pill capitalize">{l.status || 'New Lead'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leads && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs muted font-medium">
                Showing {displayedLeads.length ? (leadsPage - 1) * (leads.limit || 10) + 1 : 0} to{' '}
                {Math.min(leadsPage * (leads.limit || 10), leads.total || 0)} of {leads.total || 0} direct leads
              </div>
              <Pagination data={leads} onChange={setLeadsPage} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="panel !p-0 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Listing</th>
                  <th>Scheduled Date</th>
                  <th>Host</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visits?.items?.map((v) => (
                  <tr
                    key={v._id}
                    onClick={() => setSelectedVisit(v)}
                    className="cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <td>
                      <strong className="text-stone-900 hover:text-forest flex items-center gap-1">
                        {v.user?.name || 'Visitor'}
                        <ArrowUpRight size={12} className="text-forest" />
                      </strong>
                    </td>
                    <td>
                      {v.property ? (
                        <button
                          type="button"
                          onClick={() => onOpenProperty?.(v.property)}
                          className="font-semibold text-stone-900 hover:text-forest flex items-center gap-1 text-left"
                        >
                          <span>{v.property?.title || 'Listing'}</span>
                          <ArrowUpRight size={13} className="text-forest shrink-0" />
                        </button>
                      ) : (
                        <span>{v.project?.title || 'Project'}</span>
                      )}
                    </td>
                    <td className="font-mono text-xs">
                      {new Date(v.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td>{v.owner?.name || 'Host'}</td>
                    <td><span className="pill capitalize">{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visits && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs muted font-medium">
                Showing {visits.items?.length ? (visitsPage - 1) * (visits.limit || 10) + 1 : 0} to{' '}
                {Math.min(visitsPage * (visits.limit || 10), visits.total || 0)} of {visits.total || 0} visits
              </div>
              <Pagination data={visits} onChange={setVisitsPage} />
            </div>
          )}
        </>
      )}

      {selectedLead && (
        <EnquiryDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={() => reloadLeads()}
          onInspectProperty={onOpenProperty}
        />
      )}

      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onUpdateStatus={() => reloadVisits()}
          onInspectProperty={onOpenProperty}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. CUSTOMER SUPPORT VIEW (LIVE TICKETS & CHANNEL PARTNER HELPDESK)
// ─────────────────────────────────────────────────────────────
function CustomerSupportView() {
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const queryParams = new URLSearchParams();
  queryParams.set('limit', '50');
  if (statusFilter) queryParams.set('status', statusFilter);

  const { data, loading, error, reload } = useData(`support-tickets?${queryParams.toString()}`);

  const tickets = data?.items || [];

  // Filter in-memory for category, priority, and search
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const num = (t.ticketNumber || '').toLowerCase();
        const sub = (t.subject || '').toLowerCase();
        const msg = (t.message || '').toLowerCase();
        const usr = (t.user?.name || '').toLowerCase();
        const cmp = (t.user?.company || '').toLowerCase();
        if (!num.includes(q) && !sub.includes(q) && !msg.includes(q) && !usr.includes(q) && !cmp.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, categoryFilter, priorityFilter, search]);

  // KPI counts
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  const categories = [
    'Listing Review',
    'Lead Inquiry',
    'Billing & RERA',
    'Technical Support',
    'Account Verification',
    'Other'
  ];

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">COMMUNICATION DESK</p>
          <h1 className="!text-4xl">Customer support.</h1>
          <p className="muted mt-4 mb-7">
            Direct ticket desk handling inquiries from Channel Partners, property owners, and platform seekers.
          </p>
        </div>
        <span className="pill text-sm font-semibold !p-2 px-3">
          {totalCount} Total Desk Tickets
        </span>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setStatusFilter('')}
          className={`panel !p-4 cursor-pointer transition-all ${
            statusFilter === '' ? 'border-[#163e35] shadow-xs' : 'hover:border-stone-300'
          }`}
        >
          <span className="text-xs muted block">Total Tickets</span>
          <strong className="text-2xl font-bold text-stone-900 block mt-1">{totalCount}</strong>
        </div>
        <div
          onClick={() => setStatusFilter('open')}
          className={`panel !p-4 cursor-pointer transition-all ${
            statusFilter === 'open' ? 'border-red-600 bg-red-50/20 shadow-xs' : 'hover:border-stone-300'
          }`}
        >
          <span className="text-xs text-red-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Open (Urgent)
          </span>
          <strong className="text-2xl font-bold text-red-700 block mt-1">{openCount}</strong>
        </div>
        <div
          onClick={() => setStatusFilter('in_progress')}
          className={`panel !p-4 cursor-pointer transition-all ${
            statusFilter === 'in_progress' ? 'border-amber-600 bg-amber-50/20 shadow-xs' : 'hover:border-stone-300'
          }`}
        >
          <span className="text-xs text-amber-700 font-semibold block">In Progress</span>
          <strong className="text-2xl font-bold text-amber-700 block mt-1">{inProgressCount}</strong>
        </div>
        <div
          onClick={() => setStatusFilter('resolved')}
          className={`panel !p-4 cursor-pointer transition-all ${
            statusFilter === 'resolved' ? 'border-emerald-600 bg-emerald-50/20 shadow-xs' : 'hover:border-stone-300'
          }`}
        >
          <span className="text-xs text-emerald-800 font-semibold block">Resolved / Closed</span>
          <strong className="text-2xl font-bold text-emerald-800 block mt-1">{resolvedCount}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="panel !p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <Search size={16} className="text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by ticket # (e.g. CP-159964), subject, user name, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input !h-10 !text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input !h-10 !text-xs font-semibold cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input !h-10 !text-xs font-semibold cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/60">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: '', label: 'All Statuses' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'closed', label: 'Closed' }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`pill text-xs font-semibold cursor-pointer transition-all ${
                statusFilter === st.id ? '!bg-[#163e35] !text-white' : 'hover:bg-stone-200'
              }`}
            >
              {st.label}
            </button>
          ))}
          {(statusFilter || categoryFilter || priorityFilter || search) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setCategoryFilter('');
                setPriorityFilter('');
                setSearch('');
              }}
              className="text-xs font-bold text-stone-500 hover:text-red-700 ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <State loading={loading} error={error} empty={filteredTickets.length === 0} />

      {/* Tickets List */}
      <div className="space-y-3.5">
        {filteredTickets.map((t) => {
          const userObj = t.user || {};
          const isCP = userObj.role === 'channel_partner';
          const priorityStyle =
            t.priority === 'urgent'
              ? 'bg-red-100 text-red-800 border-red-300'
              : t.priority === 'high'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : t.priority === 'medium'
              ? 'bg-sky-100 text-sky-800 border-sky-300'
              : 'bg-stone-100 text-stone-700 border-stone-200';

          const statusStyle =
            t.status === 'open'
              ? 'bg-red-50 text-red-800 border-red-200'
              : t.status === 'in_progress'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : t.status === 'resolved'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-stone-100 text-stone-600 border-stone-200';

          return (
            <div
              key={t._id}
              onClick={() => setSelectedTicket(t)}
              className="panel !p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-[#163e35] transition-all duration-150 hover:shadow-xs group"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-[#163e35] text-[#d8edb3] px-2 py-0.5 rounded">
                    {t.ticketNumber || `TICK-${t._id?.slice(-6)}`}
                  </span>
                  <strong className="text-stone-900 group-hover:text-[#163e35] transition-colors">
                    {t.subject}
                  </strong>
                  <span className="pill text-xs">{t.category}</span>
                  <span className={`pill text-[11px] font-bold border capitalize ${priorityStyle}`}>
                    {t.priority}
                  </span>
                  <span className={`pill text-[11px] font-bold border capitalize ${statusStyle}`}>
                    {t.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="muted text-xs line-clamp-2 max-w-3xl leading-relaxed">
                  {t.message}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 flex-wrap">
                  <span className="font-semibold text-stone-800">
                    {userObj.name || 'Anonymous User'}
                  </span>
                  {userObj.company && (
                    <span>• <strong className="text-stone-700">{userObj.company}</strong></span>
                  )}
                  {isCP && (
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      Channel Partner
                    </span>
                  )}
                  <span>• {userObj.email || t.email || 'No email'}</span>
                  <span>• {date(t.createdAt)}</span>
                  {t.responses?.length > 0 && (
                    <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                      <Mail size={10} />
                      {t.responses.length} {t.responses.length === 1 ? 'Reply' : 'Replies'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTicket(t);
                }}
                className="btn-outline !min-h-0 !py-2 !px-4 !text-xs font-bold shrink-0 group-hover:bg-[#163e35] group-hover:text-white transition-all"
              >
                Manage Ticket
              </button>
            </div>
          );
        })}
      </div>

      {selectedTicket && (
        <SupportTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => {
            reload();
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. OPERATIONAL CITIES VIEW
// ─────────────────────────────────────────────────────────────
function OperationalCitiesView() {
  const { toast } = useApp();
  const [cityList, setCityList] = useState(cityGuides);
  const [adding, setAdding] = useState(false);

  function addCity(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name').trim();
    const slug = form.get('slug').trim().toLowerCase();
    const tagline = form.get('tagline').trim();
    const localities = form.get('localities').split(',').map((s) => s.trim()).filter(Boolean);
    const image = form.get('image').trim() || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85';

    if (!name || !slug) return;
    setCityList((prev) => [...prev, { name, slug, tagline, localities, image }]);
    setAdding(false);
    toast(`City "${name}" added to operational zones.`);
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">METROPOLITAN COVERAGE</p>
          <h1 className="!text-4xl">Operational cities.</h1>
          <p className="muted mt-4 mb-7">
            Configured metropolitan markets and active prime localities.
          </p>
        </div>
        <button className="btn" onClick={() => setAdding(!adding)}>
          <Plus size={16} /> {adding ? 'Cancel' : 'Add city'}
        </button>
      </div>

      {adding && (
        <form onSubmit={addCity} className="panel space-y-4 mb-8">
          <h3>Add new operational city</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City Name" required>
              <input name="name" required placeholder="e.g. Kolkata, Kochi" className="input" />
            </Field>
            <Field label="URL Slug" required>
              <input name="slug" required placeholder="e.g. kolkata" className="input" />
            </Field>
          </div>
          <Field label="Tagline">
            <input name="tagline" placeholder="Tagline description" className="input" />
          </Field>
          <Field label="Localities (comma separated)" required>
            <input name="localities" required placeholder="e.g. Salt Lake, Park Street" className="input" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAdding(false)} className="btn-outline">Cancel</button>
            <button type="submit" className="btn">Save city</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cityList.map((c) => (
          <div key={c.slug} className="panel space-y-3">
            <div className="flex justify-between items-center">
              <h3>{c.name}</h3>
              <span className="pill text-xs">Active Zone</span>
            </div>
            <p className="text-sm muted">{c.tagline}</p>
            <div className="border-t border-stone-200 pt-3">
              <span className="text-xs muted block mb-2 font-bold uppercase">Prime Localities</span>
              <div className="flex flex-wrap gap-1.5">
                {c.localities?.slice(0, 6).map((loc) => (
                  <span key={loc} className="pill text-xs">{loc}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
