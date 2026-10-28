'use client';
import { propertyImages } from '@/lib/media';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Heart,
  MessageCircle,
  House,
  ClipboardList,
  Plus,
  Bell,
  Search,
  ExternalLink,
  Trash2,
  Briefcase,
  Building2,
  Wrench,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { api, useApp, useData, getRoleMeta } from './providers';
import { Image, Field, Pagination, State, Submit } from './ui';
import { money, date } from '@/lib/format';
import { serviceCategories } from '@/lib/serviceCategories';
import Listings from './listings';

export default function Dashboard({ section = '' }) {
  const { user, setUser, toast, roleMeta, logout } = useApp(),
    router = useRouter();
  const searchParams = useSearchParams();
  const isUserView = searchParams?.get('view') === 'user';

  // Smart Admin Routing: If an administrator accesses root /dashboard without ?view=user,
  // route them directly to their primary admin command center
  useEffect(() => {
    if (user && user.role === 'admin' && !section && !isUserView) {
      router.replace('/admin');
    }
  }, [user, section, isUserView, router]);

  const isCustomer = !user || user.role === 'customer' || user.role === 'user';
  const isOwner = user?.role === 'owner';
  const isBroker = user?.role === 'broker';
  const isBuilder = user?.role === 'builder';
  const isServiceProvider = user?.role === 'service_provider' || user?.role === 'service-provider';
  const isAdmin = user?.role === 'admin';

  const nav = [
    ['Overview', ''],
    ...(isCustomer
      ? [
          ['Saved homes', 'favorites'],
          ['Saved searches & alerts', 'saved-searches'],
          ['Site visits', 'visits'],
          ['Consultations & enquiries', 'leads'],
        ]
      : []),
    ...(isOwner
      ? [
          ['My properties', 'properties'],
          ['Tenant enquiries', 'leads'],
          ['Site visits', 'visits'],
          ['Saved homes', 'favorites'],
        ]
      : []),
    ...(isBroker
      ? [
          ['Client properties', 'properties'],
          ['Buyer leads & enquiries', 'leads'],
          ['Client visits', 'visits'],
          ['Saved homes', 'favorites'],
        ]
      : []),
    ...(isBuilder
      ? [
          ['Projects & towers', 'properties'],
          ['Project enquiries', 'leads'],
          ['Site visits', 'visits'],
        ]
      : []),
    ...(isServiceProvider
      ? [
          ['Service leads & quotes', 'leads'],
          ['Consultations', 'visits'],
        ]
      : []),
    ['Messages', 'messages'],
    ['Notifications', 'notifications'],
    ['Account profile', 'profile'],
    ...(isAdmin ? [['Administration', 'admin']] : []),
  ];

  return (
    <div className="wrap py-10 pb-20">
      <div className="dashboard-grid">
        <aside className="dashboard-nav">
          <div className="px-4 pb-3 border-b border-line mb-2 hidden sm:block">
            <p className="eyebrow mb-1">YOUR ACCOUNT</p>
            <div className="font-semibold text-forest text-sm truncate">{user?.name}</div>
            {roleMeta && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: roleMeta.bgColor,
                  color: roleMeta.color,
                  border: `1px solid ${roleMeta.borderColor}`,
                  marginTop: '4px',
                }}
              >
                {roleMeta.label}
              </span>
            )}
          </div>

          {nav.map(([label, value]) => (
            <Link
              className={section === value ? 'active' : ''}
              key={value}
              href={value === 'admin' ? '/admin' : `/dashboard${value ? '/' + value : ''}`}
            >
              {label}
            </Link>
          ))}
          <button className="muted hover:text-red-700 text-left" onClick={logout}>
            Log out
          </button>
        </aside>
        <main className="min-w-0">
          {user && user.role === 'admin' && (
            <div className="panel bg-[#f7f8f3] border-stone-300 !p-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-forest" />
                Viewing User Portal as Administrator
              </span>
              <Link href="/admin" className="text-link !text-xs font-semibold">
                Return to Admin Command Center →
              </Link>
            </div>
          )}
          {section === 'favorites' ? (
            <Listings favorites />
          ) : section === 'saved-searches' ? (
            <SavedSearches />
          ) : section === 'properties' ? (
            <MyProperties />
          ) : section === 'messages' ? (
            <Messages />
          ) : section === 'visits' ? (
            <Visits />
          ) : section === 'leads' ? (
            <Leads />
          ) : section === 'notifications' ? (
            <Notifications />
          ) : section === 'profile' ? (
            <Profile />
          ) : (
            <Overview />
          )}
        </main>
      </div>
    </div>
  );
}

function Overview() {
  const { user, roleMeta } = useApp();
  const { data, error, loading } = useData('dashboard');

  const role = user?.role || 'customer';
  const isCustomer = role === 'customer' || role === 'user';
  const isOwner = role === 'owner';
  const isBroker = role === 'broker';
  const isBuilder = role === 'builder';
  const isServiceProvider = role === 'service_provider' || role === 'service-provider';
  const isAdmin = role === 'admin';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <p className="eyebrow !mb-0">GOOD TO HAVE YOU HERE</p>
        {roleMeta && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '6px',
              background: roleMeta.bgColor,
              color: roleMeta.color,
              border: `1px solid ${roleMeta.borderColor}`,
            }}
          >
            {roleMeta.label}
          </span>
        )}
      </div>

      <h1 className="!text-4xl">Hello, {user?.name ? user.name.split(' ')[0] : 'there'}.</h1>
      <p className="muted mt-2 mb-7">
        {isCustomer && 'Find your next home, book property inspections, and request interior services.'}
        {isOwner && 'Manage your direct property listings, review prospective tenants, and schedule visits.'}
        {isBroker && 'Manage your client property portfolio, track buyer inquiries, and coordinate inspections.'}
        {isBuilder && 'Showcase your real estate projects, track unit inquiries, and share verified brochures.'}
        {isServiceProvider && 'Receive service consultation requests, showcase your craft, and grow your client base.'}
        {isAdmin && 'Oversee listings, review submissions, and manage platform verifications.'}
      </p>

      <State loading={loading} error={error} />

      {data && (
        <div className="summary-grid">
          {/* Customer stats */}
          {isCustomer && (
            <>
              <Link className="stat" href="/dashboard/favorites">
                <div className="flex justify-between">
                  <Heart size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.favorites ?? 0}</strong>
                <span className="text-xs muted">Saved homes</span>
              </Link>
              <Link className="stat" href="/dashboard/saved-searches">
                <div className="flex justify-between">
                  <Bell size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.savedSearches ?? 0}</strong>
                <span className="text-xs muted">Saved searches &amp; alerts</span>
              </Link>
              <Link className="stat" href="/dashboard/visits">
                <div className="flex justify-between">
                  <CalendarDays size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.visits ?? 0}</strong>
                <span className="text-xs muted">Upcoming site visits</span>
              </Link>
              <Link className="stat" href="/dashboard/leads">
                <div className="flex justify-between">
                  <ClipboardList size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.enquiries ?? 0}</strong>
                <span className="text-xs muted">Consultation requests</span>
              </Link>
              <Link className="stat" href="/dashboard/messages">
                <div className="flex justify-between">
                  <MessageCircle size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.messages ?? 0}</strong>
                <span className="text-xs muted">Active conversations</span>
              </Link>
            </>
          )}

          {/* Owner stats */}
          {isOwner && (
            <>
              <Link className="stat" href="/dashboard/properties">
                <div className="flex justify-between">
                  <House size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.properties ?? 0}</strong>
                <span className="text-xs muted">Your properties</span>
              </Link>
              <Link className="stat" href="/dashboard/properties">
                <div className="flex justify-between">
                  <Bell size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.pending ?? 0}</strong>
                <span className="text-xs muted">Awaiting review</span>
              </Link>
              <Link className="stat" href="/dashboard/leads">
                <div className="flex justify-between">
                  <ClipboardList size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.enquiries ?? 0}</strong>
                <span className="text-xs muted">Tenant enquiries</span>
              </Link>
              <Link className="stat" href="/dashboard/visits">
                <div className="flex justify-between">
                  <CalendarDays size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.visits ?? 0}</strong>
                <span className="text-xs muted">Scheduled visits</span>
              </Link>
              <Link className="stat" href="/dashboard/messages">
                <div className="flex justify-between">
                  <MessageCircle size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.messages ?? 0}</strong>
                <span className="text-xs muted">Messages</span>
              </Link>
            </>
          )}

          {/* Broker stats */}
          {isBroker && (
            <>
              <Link className="stat" href="/dashboard/properties">
                <div className="flex justify-between">
                  <Briefcase size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.properties ?? 0}</strong>
                <span className="text-xs muted">Managed properties</span>
              </Link>
              <Link className="stat" href="/dashboard/leads">
                <div className="flex justify-between">
                  <ClipboardList size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.enquiries ?? 0}</strong>
                <span className="text-xs muted">Buyer enquiries</span>
              </Link>
              <Link className="stat" href="/dashboard/visits">
                <div className="flex justify-between">
                  <CalendarDays size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.visits ?? 0}</strong>
                <span className="text-xs muted">Client visits</span>
              </Link>
              <Link className="stat" href="/dashboard/messages">
                <div className="flex justify-between">
                  <MessageCircle size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.messages ?? 0}</strong>
                <span className="text-xs muted">Client messages</span>
              </Link>
            </>
          )}

          {/* Builder stats */}
          {isBuilder && (
            <>
              <Link className="stat" href="/dashboard/properties">
                <div className="flex justify-between">
                  <Building2 size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.properties ?? 0}</strong>
                <span className="text-xs muted">Projects &amp; towers</span>
              </Link>
              <Link className="stat" href="/dashboard/leads">
                <div className="flex justify-between">
                  <ClipboardList size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.enquiries ?? 0}</strong>
                <span className="text-xs muted">Project inquiries</span>
              </Link>
              <Link className="stat" href="/dashboard/visits">
                <div className="flex justify-between">
                  <CalendarDays size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.visits ?? 0}</strong>
                <span className="text-xs muted">Site visits</span>
              </Link>
              <Link className="stat" href="/dashboard/messages">
                <div className="flex justify-between">
                  <MessageCircle size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.messages ?? 0}</strong>
                <span className="text-xs muted">Conversations</span>
              </Link>
            </>
          )}

          {/* Service Provider stats */}
          {isServiceProvider && (
            <>
              <Link className="stat" href="/dashboard/leads">
                <div className="flex justify-between">
                  <ClipboardList size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.enquiries ?? 0}</strong>
                <span className="text-xs muted">Service requests</span>
              </Link>
              <Link className="stat" href="/dashboard/visits">
                <div className="flex justify-between">
                  <CalendarDays size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.visits ?? 0}</strong>
                <span className="text-xs muted">Consultations</span>
              </Link>
              <Link className="stat" href="/dashboard/messages">
                <div className="flex justify-between">
                  <MessageCircle size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.messages ?? 0}</strong>
                <span className="text-xs muted">Client messages</span>
              </Link>
            </>
          )}

          {/* Admin stats */}
          {isAdmin && (
            <>
              <Link className="stat" href="/dashboard/properties">
                <div className="flex justify-between">
                  <House size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.properties ?? 0}</strong>
                <span className="text-xs muted">Total properties</span>
              </Link>
              <Link className="stat" href="/admin">
                <div className="flex justify-between">
                  <Bell size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.pending ?? 0}</strong>
                <span className="text-xs muted">Pending reviews</span>
              </Link>
              <Link className="stat" href="/dashboard/leads">
                <div className="flex justify-between">
                  <ClipboardList size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.enquiries ?? 0}</strong>
                <span className="text-xs muted">Total leads</span>
              </Link>
              <Link className="stat" href="/dashboard/messages">
                <div className="flex justify-between">
                  <MessageCircle size={20} />
                  <ArrowUpRight size={15} />
                </div>
                <strong>{data.messages ?? 0}</strong>
                <span className="text-xs muted">Messages</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Role-specific action banners */}
      {isCustomer && (
        <div className="owner-banner mt-8 !p-7">
          <div>
            <h3>Own a home or want to offer services?</h3>
            <p className="muted text-sm mt-2">
              Upgrade your account anytime to list rental properties or register as a certified service professional.
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="btn" href="/post-property">
              Post property
            </Link>
            <Link className="btn-outline" href="/dashboard/profile">
              Upgrade account
            </Link>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="owner-banner mt-8 !p-7">
          <div>
            <h3>Reach verified tenants with zero middleman fees.</h3>
            <p className="muted text-sm mt-2">
              Add photos, set rental or sale prices, and connect directly with tenants looking in your locality.
            </p>
          </div>
          <Link className="btn" href="/post-property">
            Post new property
          </Link>
        </div>
      )}

      {isBroker && (
        <div className="owner-banner mt-8 !p-7">
          <div>
            <h3>Manage your client listings and RERA accreditation.</h3>
            <p className="muted text-sm mt-2">
              Keep your agency license active to display verified badges across all your client property listings.
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="btn" href="/post-property">
              Add client property
            </Link>
            <Link className="btn-outline" href="/dashboard/profile">
              Agency profile
            </Link>
          </div>
        </div>
      )}

      {isBuilder && (
        <div className="owner-banner mt-8 !p-7">
          <div>
            <h3>Showcase upcoming towers and luxury developments.</h3>
            <p className="muted text-sm mt-2">
              Upload architectural plans, manage configurations, and track prospective buyer leads across cities.
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="btn" href="/post-property">
              Publish project
            </Link>
            <Link className="btn-outline" href="/dashboard/profile">
              Developer details
            </Link>
          </div>
        </div>
      )}

      {isServiceProvider && (
        <div className="owner-banner mt-8 !p-7">
          <div>
            <h3>Grow your interior &amp; home services business.</h3>
            <p className="muted text-sm mt-2">
              Receive verified consultation requests from homeowners in your service cities.
            </p>
          </div>
          <Link className="btn" href="/dashboard/profile">
            Update service profile
          </Link>
        </div>
      )}
    </>
  );
}

function SavedSearches() {
  const { toast } = useApp();
  const [busy, setBusy] = useState('');
  const { data, error, loading, reload } = useData('saved-searches');

  async function toggleAlert(id) {
    setBusy(id);
    try {
      const res = await api(`saved-searches/${id}/alert`, { method: 'PATCH' });
      toast(res.alertEnabled ? 'Property alerts activated for this search.' : 'Alerts paused for this search.');
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
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">YOUR SEARCH PREFERENCES</p>
          <h2>Saved searches &amp; alerts</h2>
          <p className="muted text-sm mt-1">
            Get in-app alerts when new properties match your saved criteria.
          </p>
        </div>
        <Link className="btn" href="/properties">
          <Search size={16} /> Explore properties
        </Link>
      </div>

      <State loading={loading} error={error} empty={data?.total === 0} />

      <div className="space-y-4">
        {data?.items?.map(item => {
          const filterParams = new URLSearchParams();
          if (item.filters && typeof item.filters === 'object') {
            for (const [k, v] of Object.entries(item.filters)) {
              if (v) filterParams.set(k, v);
            }
          }
          if (item.city && !filterParams.get('city')) filterParams.set('city', item.city);
          if (item.purpose && !filterParams.get('purpose')) filterParams.set('purpose', item.purpose);
          if (item.query && !filterParams.get('q')) filterParams.set('q', item.query);
          const searchUrl = `/properties?${filterParams.toString()}`;

          return (
            <article
              className="panel flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              key={item._id}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="!text-lg font-semibold">{item.title}</h3>
                  {item.purpose && (
                    <span className="pill uppercase text-[10px] tracking-wider">
                      {item.purpose}
                    </span>
                  )}
                  {item.city && (
                    <span className="pill text-[10px] bg-stone-100">
                      {item.city}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                  {item.query && (
                    <span>
                      Localities: <strong>{item.query}</strong>
                    </span>
                  )}
                  {item.filters?.maxPrice && (
                    <span>
                      Max budget: <strong>₹{Number(item.filters.maxPrice).toLocaleString('en-IN')}</strong>
                    </span>
                  )}
                  {item.filters?.bedrooms && (
                    <span>
                      BHK: <strong>{item.filters.bedrooms}</strong>
                    </span>
                  )}
                  {item.filters?.type && (
                    <span>
                      Type: <strong>{item.filters.type}</strong>
                    </span>
                  )}
                  <span className="muted">Saved on {date(item.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                <button
                  type="button"
                  className={`btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 ${
                    item.alertEnabled ? '!border-forest !text-forest bg-forest/5' : 'text-stone-500'
                  }`}
                  disabled={busy === item._id}
                  onClick={() => toggleAlert(item._id)}
                  title="Toggle property notifications for this search"
                >
                  <Bell size={13} />
                  {item.alertEnabled ? 'Alerts Active' : 'Alerts Paused'}
                </button>

                <Link
                  href={searchUrl}
                  className="btn !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  View Results
                </Link>

                <button
                  type="button"
                  className="p-2 text-stone-400 hover:text-red-600 transition"
                  disabled={busy === item._id}
                  onClick={() => deleteSearch(item._id)}
                  title="Delete this saved search"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function MyProperties() {
  const { toast } = useApp();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useData(`properties?mine=true&page=${page}`);

  async function archive(id) {
    if (!window.confirm('Archive this listing? It will no longer appear in public searches.'))
      return;
    try {
      await api(`properties/${id}`, { method: 'DELETE' });
      reload();
      toast('Listing archived.');
    } catch (e) {
      toast(e.message);
    }
  }

  async function promote(id) {
    try {
      const res = await api(`properties/${id}/promote`, { method: 'POST' });
      reload();
      toast(
        res.featured ? 'Listing promoted to featured properties!' : 'Listing unpromoted.'
      );
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">OPEN DOORS, YOUR WAY</p>
          <h2>Your properties</h2>
        </div>
        <Link className="btn" href="/post-property">
          <Plus size={16} />
          Add listing
        </Link>
      </div>
      <State loading={loading} error={error} empty={data?.total === 0} />
      <div className="space-y-4">
        {data?.items?.map(item => (
          <article className="panel flex flex-col sm:flex-row gap-5" key={item._id}>
            <Image
              src={propertyImages(item)[0]}
              alt={item.title}
              className="sm:w-36 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 justify-between">
                <h3 className="!text-lg">{item.title}</h3>
                <span className="pill">{item.status}</span>
              </div>
              <p className="muted text-sm mt-2">
                {item.locality}, {item.city} · {money(item.price)}
              </p>
              <div className="flex flex-wrap gap-5 mt-5">
                <Link className="text-link" href={`/properties/${item._id}`}>
                  View
                </Link>
                <Link className="text-link" href={`/properties/${item._id}/edit`}>
                  Edit listing
                </Link>
                {item.status === 'approved' && (
                  <button
                    className={`text-xs font-semibold ${
                      item.featured ? 'text-amber-700' : 'text-forest'
                    }`}
                    onClick={() => promote(item._id)}
                  >
                    {item.featured ? '★ Featured' : '★ Promote listing'}
                  </button>
                )}
                {item.status !== 'archived' && (
                  <button className="text-xs text-red-700" onClick={() => archive(item._id)}>
                    Archive
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <Pagination data={data} onChange={setPage} />
    </>
  );
}

function Messages() {
  const { user, toast } = useApp(),
    params = useSearchParams(),
    router = useRouter();
  const threadId = params.get('thread');
  const [page, setPage] = useState(1),
    [msgPage, setMsgPage] = useState(1),
    [busy, setBusy] = useState(false);
  const threads = useData(`threads?page=${page}&limit=15`),
    messages = useData(
      threadId ? `threads/${threadId}/messages?page=${msgPage}&limit=30` : null
    );
  const bottom = useRef(null);

  useEffect(() => {
    setMsgPage(1);
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    const timer = setInterval(() => messages.reload(), 10000);
    return () => clearInterval(timer);
  }, [threadId]);

  useEffect(() => {
    if (msgPage === 1) bottom.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.data]);

  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await api(`threads/${threadId}/messages`, {
        method: 'POST',
        body: { text: new FormData(form).get('text') },
      });
      form.reset();
      setMsgPage(1);
      messages.reload();
      threads.reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="eyebrow">GOOD CONVERSATIONS START HERE</p>
      <h2 className="mb-6">Your conversations</h2>
      <State
        loading={threads.loading && !threads.data}
        error={threads.error}
        empty={threads.data?.total === 0}
      />
      <div className="conversation">
        <div className="space-y-3">
          {threads.data?.items?.map(v => (
            <button
              className={`panel !p-4 text-left w-full ${
                threadId === v._id ? '!bg-cream !border-forest' : ''
              }`}
              key={v._id}
              onClick={() => router.push(`/dashboard/messages?thread=${v._id}`)}
            >
              <span className="font-semibold text-xs block">
                {v.participants
                  .filter(p => p._id !== user._id)
                  .map(p => p.name)
                  .join(', ')}
              </span>
              <span className="text-xs muted block mt-2">{v.subject}</span>
            </button>
          ))}
          <Pagination data={threads.data} onChange={setPage} />
        </div>
        <div className="panel">
          {!threadId ? (
            <p className="muted text-center py-14">
              Choose a conversation, or start one from a property or project.
            </p>
          ) : (
            <>
              <State loading={messages.loading && !messages.data} error={messages.error} />
              <div className="messages" aria-live="polite">
                {messages.data?.items
                  ?.slice()
                  .reverse()
                  .map(v => (
                    <div
                      key={v._id}
                      className={`message ${v.sender?._id === user._id ? 'mine' : ''}`}
                    >
                      <span className="text-xs opacity-60 block mb-1">
                        {v.sender?.name} · {date(v.createdAt)}
                      </span>
                      {v.text}
                    </div>
                  ))}
                {messages.data?.total === 0 && (
                  <p className="muted text-sm">
                    Say hello. Ask about the home or arrange your next steps.
                  </p>
                )}
                <div ref={bottom} />
              </div>
              <Pagination data={messages.data} onChange={setMsgPage} />
              <form className="flex gap-3 mt-4" onSubmit={send}>
                <input
                  className="input"
                  required
                  name="text"
                  maxLength={3000}
                  aria-label="Your message"
                  placeholder="Write a message…"
                />
                <Submit busy={busy}>Send</Submit>
              </form>
              <p className="text-xs muted mt-3">Messages refresh every 10 seconds.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Visits() {
  const { user, toast } = useApp();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useData(`visits?page=${page}`);
  const [busy, setBusy] = useState('');

  async function update(id, status) {
    setBusy(id);
    try {
      await api(`visits/${id}`, { method: 'PATCH', body: { status } });
      toast(`Visit ${status}.`);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <p className="eyebrow">COME SEE FOR YOURSELF</p>
      <h2 className="mb-6">Your site visits</h2>
      <State loading={loading} error={error} empty={data?.total === 0} />
      <div className="space-y-4">
        {data?.items?.map(v => {
          const manager = user.role === 'admin' || v.owner?._id === user._id;
          const active = ['requested', 'confirmed'].includes(v.status);
          return (
            <article className="panel" key={v._id}>
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="!text-lg">
                    {v.property?.title || v.project?.title || 'Listing no longer available'}
                  </h3>
                  <p className="muted text-sm mt-2">{date(v.scheduledAt)}</p>
                </div>
                <span className="pill self-start">{v.status}</span>
              </div>
              <p className="text-xs muted mt-4">
                Guest: {v.user?.name} · Host: {v.owner?.name}
              </p>
              {v.note && <p className="text-sm mt-3">{v.note}</p>}
              {active && (
                <div className="flex flex-wrap gap-3 mt-5">
                  {manager && v.status === 'requested' && (
                    <button
                      disabled={busy === v._id}
                      className="btn"
                      onClick={() => update(v._id, 'confirmed')}
                    >
                      Confirm visit
                    </button>
                  )}
                  {manager && v.status === 'confirmed' && (
                    <button
                      disabled={busy === v._id}
                      className="btn-outline"
                      onClick={() => update(v._id, 'completed')}
                    >
                      Mark completed
                    </button>
                  )}
                  <button
                    disabled={busy === v._id}
                    className="btn-outline"
                    onClick={() => update(v._id, 'cancelled')}
                  >
                    Cancel visit
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <Pagination data={data} onChange={setPage} />
    </>
  );
}

export function Leads() {
  const { user, toast } = useApp();
  const [page, setPage] = useState(1),
    [busy, setBusy] = useState('');
  const { data, error, loading, reload } = useData(`leads?page=${page}`);

  async function update(e, id) {
    e.preventDefault();
    setBusy(id);
    try {
      await api(`leads/${id}`, {
        method: 'PATCH',
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      reload();
      toast('Enquiry progress updated.');
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <p className="eyebrow">FROM AN IDEA TO YOUR NEXT STEP</p>
      <h2 className="mb-6">Enquiries &amp; interior progress</h2>
      <State loading={loading} error={error} empty={data?.total === 0} />
      <div className="space-y-5">
        {data?.items?.map(v => (
          <article className="panel" key={v._id}>
            <div className="flex justify-between gap-4">
              <div>
                <span className="eyebrow">
                  {v.kind === 'project' ? 'BUILDER PROJECT' : 'HOME INTERIORS'}
                </span>
                <h3 className="mt-2 !text-xl">
                  {v.project?.title || v.design?.title || `${v.homeSize} ${v.service}`}
                </h3>
              </div>
              <span className="pill self-start">{v.status}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
              <p>
                {v.name} · {v.phone}
              </p>
              <p className="muted">
                {v.city} · Budget {money(v.budget)}
              </p>
              {v.estimate && (
                <p>
                  Indicative estimate {money(v.estimate)} · {v.finish || 'Essential'}
                </p>
              )}
              {v.preferredAt && <p className="muted">Preferred: {date(v.preferredAt)}</p>}
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                'new',
                'contacted',
                'consultation',
                ...(v.kind === 'interior' ? ['design', 'execution'] : []),
                'completed',
              ].map((s, i) => (
                <span
                  key={s}
                  className={`chip ${v.status === s ? '!bg-forest !text-white' : ''}`}
                >
                  {i + 1}. {s}
                </span>
              ))}
            </div>
            {v.note && <p className="text-sm muted mt-5 whitespace-pre-wrap">{v.note}</p>}
            {(user.role === 'admin' || String(v.manager) === user._id) && (
              <form
                className="mt-5 border-t pt-5 space-y-4"
                onSubmit={e => update(e, v._id)}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Progress">
                    <select name="status" defaultValue={v.status}>
                      {[
                        'new',
                        'contacted',
                        'consultation',
                        'design',
                        'execution',
                        'completed',
                        'closed',
                      ].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Client-visible update">
                    <input name="note" maxLength={2000} defaultValue={v.note} />
                  </Field>
                </div>
                <Submit busy={busy === v._id}>Update progress</Submit>
              </form>
            )}
          </article>
        ))}
      </div>
      <Pagination data={data} onChange={setPage} />
    </>
  );
}

function Notifications() {
  const { toast } = useApp();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useData(`notifications?page=${page}`);

  async function read(id) {
    try {
      await api(`notifications${id ? '/' + id : ''}`, { method: 'PATCH' });
      reload();
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h2>Notifications {data?.unread ? `(${data.unread})` : ''}</h2>
        </div>
        <button className="text-link" onClick={() => read()}>
          Mark all read
        </button>
      </div>
      <State loading={loading} error={error} empty={data?.total === 0} />
      <div className="space-y-3">
        {data?.items?.map(v => (
          <article
            key={v._id}
            className={`panel ${!v.read ? '!bg-cream' : ''}`}
          >
            <div className="flex justify-between gap-4">
              <Link
                onClick={() => read(v._id)}
                className="font-semibold"
                href={v.link || '/dashboard'}
              >
                {v.title}
              </Link>
              <span className="muted text-xs">{date(v.createdAt)}</span>
            </div>
            <p className="muted text-sm mt-2">{v.body}</p>
            {!v.read && (
              <button
                className="text-link mt-3 !text-xs"
                onClick={() => read(v._id)}
              >
                Mark read
              </button>
            )}
          </article>
        ))}
      </div>
      <Pagination data={data} onChange={setPage} />
    </>
  );
}

function Profile() {
  const { user, setUser, toast, roleMeta } = useApp();
  const [busy, setBusy] = useState(false);
  const [upgradeBusy, setUpgradeBusy] = useState('');

  const role = user?.role || 'customer';
  const isCustomer = role === 'customer' || role === 'user';
  const isOwner = role === 'owner';
  const isBroker = role === 'broker';
  const isBuilder = role === 'builder';
  const isServiceProvider = role === 'service_provider' || role === 'service-provider';

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const res = await api('auth/profile', { method: 'PATCH', body: data });
      setUser(res.user);
      toast('Profile details updated successfully.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleUpgrade(targetRole) {
    setUpgradeBusy(targetRole);
    try {
      // Allow switching or upgrading account role
      const res = await api('auth/profile', {
        method: 'PATCH',
        body: { role: targetRole },
      });
      setUser(res.user);
      toast(`Congratulations! Your account role has been updated to ${targetRole}.`);
    } catch (err) {
      toast(err.message);
    } finally {
      setUpgradeBusy('');
    }
  }

  const providerServices = serviceCategories.filter((c) => c.slug !== 'properties');

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">YOUR SHARED IDENTITY</p>
          <h2>Account &amp; profile settings</h2>
        </div>
      </div>

      {/* Identity Summary Card */}
      <div className="panel p-6 mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-forest">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-forest text-lime flex items-center justify-center font-bold text-xl uppercase">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="!text-xl font-semibold">{user?.name}</h3>
              {roleMeta && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: roleMeta.bgColor,
                    color: roleMeta.color,
                    border: `1px solid ${roleMeta.borderColor}`,
                  }}
                >
                  {roleMeta.label}
                </span>
              )}
            </div>
            <p className="text-sm muted mt-1 flex items-center gap-2">
              <span>{user?.email}</span>
              <span>•</span>
              <span>{user?.phone || 'No phone set'}</span>
            </p>
          </div>
        </div>

        <div className="text-right text-xs muted">
          <p>Role permissions: <strong className="text-forest capitalize">{user?.role}</strong></p>
          <p className="mt-0.5">{roleMeta?.description}</p>
        </div>
      </div>

      {/* Customer Upgrade Prompt */}
      {isCustomer && (
        <div className="panel mb-6 p-6 bg-lime/10 border-forest/20">
          <div className="flex items-center gap-2 text-forest font-bold text-sm uppercase tracking-wider mb-2">
            <Sparkles size={16} /> Upgrade or Switch Account Role
          </div>
          <p className="text-sm muted mb-4">
            Need to list properties, manage client portfolios, or offer professional home services? Upgrade your account in one click:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white rounded-lg border border-line flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm text-forest mb-1">
                  <House size={16} /> Property Owner
                </div>
                <p className="text-xs muted leading-relaxed">
                  Post and manage your direct residential or commercial listings with zero brokerage.
                </p>
              </div>
              <button
                type="button"
                className="btn text-xs !py-1.5 mt-3 w-full"
                disabled={upgradeBusy === 'owner'}
                onClick={() => handleRoleUpgrade('owner')}
              >
                {upgradeBusy === 'owner' ? 'Updating…' : 'Switch to Owner'}
              </button>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-line flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm text-sky-800 mb-1">
                  <Briefcase size={16} /> Licensed Broker
                </div>
                <p className="text-xs muted leading-relaxed">
                  Manage multiple client properties and inquiries with broker badge.
                </p>
              </div>
              <button
                type="button"
                className="btn-outline text-xs !py-1.5 mt-3 w-full"
                disabled={upgradeBusy === 'broker'}
                onClick={() => handleRoleUpgrade('broker')}
              >
                {upgradeBusy === 'broker' ? 'Updating…' : 'Switch to Broker'}
              </button>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-line flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm text-purple-800 mb-1">
                  <Wrench size={16} /> Service Pro
                </div>
                <p className="text-xs muted leading-relaxed">
                  Offer interior designing, painting, cleaning, or home renovation.
                </p>
              </div>
              <button
                type="button"
                className="btn-outline text-xs !py-1.5 mt-3 w-full"
                disabled={upgradeBusy === 'service_provider'}
                onClick={() => handleRoleUpgrade('service_provider')}
              >
                {upgradeBusy === 'service_provider' ? 'Updating…' : 'Switch to Service Pro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={saveProfile} className="panel space-y-5 max-w-2xl">
        <h3 className="font-semibold text-base border-b border-line pb-2">
          Personal Information
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input name="name" defaultValue={user?.name || ''} required />
          </Field>
          <Field label="Phone number">
            <input
              name="phone"
              defaultValue={user?.phone || ''}
              required
              pattern="\+?[0-9\s-]{10,16}"
              placeholder="10-digit mobile number"
            />
          </Field>
        </div>

        <Field label="Email address" hint="Email cannot be changed directly for security">
          <input
            name="email"
            defaultValue={user?.email || ''}
            disabled
            className="bg-stone-50 cursor-not-allowed"
          />
        </Field>

        {/* Broker Specific Fields */}
        {isBroker && (
          <>
            <h3 className="font-semibold text-base border-b border-line pb-2 pt-2 text-sky-900">
              Brokerage &amp; Accreditation
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Agency / Company name">
                <input
                  name="company"
                  defaultValue={user?.company || ''}
                  placeholder="e.g. Skyline Realty, Apex Homes"
                />
              </Field>
              <Field label="RERA Agent License ID">
                <input
                  name="reraId"
                  defaultValue={user?.reraId || ''}
                  placeholder="e.g. PRM/KA/RERA/..."
                />
              </Field>
            </div>
            <Field label="Years in real estate">
              <input
                name="experience"
                defaultValue={user?.experience || ''}
                placeholder="e.g. 8+ years"
              />
            </Field>
          </>
        )}

        {/* Builder Specific Fields */}
        {isBuilder && (
          <>
            <h3 className="font-semibold text-base border-b border-line pb-2 pt-2 text-amber-900">
              Developer &amp; Enterprise Info
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Developer / Firm name">
                <input
                  name="company"
                  defaultValue={user?.company || ''}
                  placeholder="e.g. Prestige Urban Developers"
                />
              </Field>
              <Field label="Corporate RERA Registration">
                <input
                  name="reraId"
                  defaultValue={user?.reraId || ''}
                  placeholder="e.g. PRM/KA/RERA/DEV-1002"
                />
              </Field>
            </div>
            <Field label="Experience / Industry presence">
              <input
                name="experience"
                defaultValue={user?.experience || ''}
                placeholder="e.g. 15+ years in residential construction"
              />
            </Field>
          </>
        )}

        {/* Service Provider Specific Fields */}
        {isServiceProvider && (
          <>
            <h3 className="font-semibold text-base border-b border-line pb-2 pt-2 text-purple-900">
              Service Offering &amp; Rates
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Primary service category">
                <select
                  name="serviceCategory"
                  defaultValue={user?.serviceCategory || 'interior-designers'}
                >
                  {providerServices.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Specialist title">
                <input
                  name="specialist"
                  defaultValue={user?.specialist || ''}
                  placeholder="e.g. Turnkey Modular Interior Designer"
                />
              </Field>
            </div>
            <Field label="Years of experience">
              <input
                name="experience"
                defaultValue={user?.experience || ''}
                placeholder="e.g. 6+ years"
              />
            </Field>
          </>
        )}

        {/* Owner Specific Fields */}
        {isOwner && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Preferred contact hours">
              <input
                name="experience"
                defaultValue={user?.experience || ''}
                placeholder="e.g. 10 AM – 7 PM"
              />
            </Field>
            <Field label="Property localities">
              <input
                name="company"
                defaultValue={user?.company || ''}
                placeholder="e.g. Whitefield, Koramangala"
              />
            </Field>
          </div>
        )}

        {/* Bio / Description for all */}
        <Field
          label="Professional bio / About yourself"
          hint="Visible to prospective clients, tenants, and visitors"
        >
          <textarea
            name="bio"
            rows={4}
            defaultValue={user?.bio || ''}
            maxLength={1000}
            placeholder={
              isServiceProvider
                ? 'Describe your expertise, past projects, warranties, and scope of service…'
                : isBuilder
                ? 'Describe your developer portfolio, ongoing projects, and architectural highlights…'
                : isBroker
                ? 'Tell prospective buyers about your property portfolio and localities of expertise…'
                : 'Share details about your listings or what you are looking for in a home…'
            }
          />
        </Field>

        <Submit busy={busy}>Save profile changes</Submit>
      </form>
    </>
  );
}
