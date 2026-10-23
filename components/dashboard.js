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
} from 'lucide-react';
import { api, useApp, useData } from './providers';
import { Image, Field, Pagination, State, Submit } from './ui';
import { money, date } from '@/lib/format';
import Listings from './listings';

export default function Dashboard({ section = '' }) {
  const { user, setUser, toast } = useApp(),
    router = useRouter();
  const nav = [
    ['Overview', ''],
    ['Saved homes', 'favorites'],
    ['Saved searches & alerts', 'saved-searches'],
    ...(user.role !== 'user' ? [['My properties', 'properties']] : []),
    ['Messages', 'messages'],
    ['Site visits', 'visits'],
    ['Enquiries & interiors', 'leads'],
    ['Notifications', 'notifications'],
    ['Professional profile', 'profile'],
    ...(user.role === 'admin' ? [['Administration', 'admin']] : []),
  ];

  async function logout() {
    try {
      await api('auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <div className="wrap py-10 pb-20">
      <div className="dashboard-grid">
        <aside className="dashboard-nav">
          <p className="eyebrow px-4 hidden sm:block">YOUR URBANFINDER</p>
          {nav.map(([label, value]) => (
            <Link
              className={section === value ? 'active' : ''}
              key={value}
              href={value === 'admin' ? '/admin' : `/dashboard${value ? '/' + value : ''}`}
            >
              {label}
            </Link>
          ))}
          <button className="muted" onClick={logout}>
            Log out
          </button>
        </aside>
        <main className="min-w-0">
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
  const { user } = useApp();
  const { data, error, loading } = useData('dashboard');
  return (
    <>
      <p className="eyebrow">GOOD TO HAVE YOU HERE</p>
      <h1 className="!text-4xl">Hello, {user.name.split(' ')[0]}.</h1>
      <p className="muted mt-4 mb-7">Your homes, conversations and next steps, all in one place.</p>
      <State loading={loading} error={error} />
      {data && (
        <div className="summary-grid">
          {[
            [Heart, data.favorites, 'Saved homes', 'favorites'],
            [Bell, data.savedSearches ?? 0, 'Saved searches', 'saved-searches'],
            [CalendarDays, data.visits, 'Upcoming visits', 'visits'],
            [MessageCircle, data.messages, 'Conversations', 'messages'],
            [ClipboardList, data.enquiries, 'Enquiries', 'leads'],
            ...(user.role !== 'user'
              ? [
                  [House, data.properties, 'Your properties', 'properties'],
                  [Bell, data.pending, 'Awaiting review', 'properties'],
                ]
              : []),
          ].map(([Icon, value, label, href]) => (
            <Link key={label} className="stat" href={`/dashboard/${href}`}>
              <div className="flex justify-between">
                <Icon size={20} />
                <ArrowUpRight size={15} />
              </div>
              <strong>{value}</strong>
              <span className="text-xs muted">{label}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="owner-banner mt-8 !p-7">
        <div>
          <h3>Every next chapter starts somewhere.</h3>
          <p className="muted text-sm mt-3">
            Explore a new neighbourhood or make your current home your own.
          </p>
        </div>
        <Link className="btn" href="/properties">
          Explore homes
        </Link>
      </div>
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
  const { user, setUser, toast } = useApp();
  const [busy, setBusy] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const res = await api('auth/profile', { method: 'PATCH', body: data });
      setUser(res.user);
      toast('Professional profile updated successfully.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">YOUR PROFESSIONAL IDENTITY</p>
          <h2>Professional profile</h2>
        </div>
      </div>
      <form onSubmit={saveProfile} className="panel space-y-5 max-w-2xl">
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
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company / Brokerage name">
            <input
              name="company"
              defaultValue={user?.company || ''}
              placeholder="e.g. Skyline Realty, Apex Homes"
            />
          </Field>
          <Field label="RERA / Agent license number">
            <input
              name="reraId"
              defaultValue={user?.reraId || ''}
              placeholder="e.g. PRM/KA/RERA/..."
            />
          </Field>
        </div>
        <Field label="Years of experience">
          <input
            name="experience"
            defaultValue={user?.experience || ''}
            placeholder="e.g. 5+ years"
          />
        </Field>
        <Field label="Professional bio / About yourself">
          <textarea
            name="bio"
            rows={4}
            defaultValue={user?.bio || ''}
            maxLength={1000}
            placeholder="Tell prospective clients about your property portfolio, localities of expertise, and services..."
          />
        </Field>
        <Submit busy={busy}>Save profile</Submit>
      </form>
    </>
  );
}
