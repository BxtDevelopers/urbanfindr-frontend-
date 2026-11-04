'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  Check,
  DollarSign,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  LogOut,
  Settings,
  Search,
  Sparkles,
  TrendingUp,
  BarChart3,
  LayoutDashboard,
  ChevronRight,
  Printer,
  X,
  ExternalLink,
  Star,
  Zap,
  Radio
} from 'lucide-react';
import { useApp, useData, api } from './providers';
import { serviceCategories } from '@/lib/serviceCategories';
import { date, money } from '@/lib/format';
import BookingsTracker, { InvoiceAndDetailsModal } from './bookings-tracker';

export default function ServiceProviderDashboard({ initialSection = '' }) {
  const { user, setUser, logout, toast } = useApp();
  const router = useRouter();

  // Active section: 'overview', 'leads', 'invoices', 'profile'
  const [activeSection, setActiveSection] = useState(
    initialSection === 'leads' || initialSection === 'bookings'
      ? 'leads'
      : initialSection === 'invoices'
      ? 'invoices'
      : initialSection === 'profile'
      ? 'profile'
      : 'overview'
  );

  const [leadStatusOnline, setLeadStatusOnline] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch Service Requests for this provider - strictly isolated to their category
  const categoryParam = user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data: requestData, loading, reload } = useData(`service-requests?limit=100${categoryParam}`);

  // Re-sync when user returns or focuses the window
  useEffect(() => {
    const handleFocus = () => reload();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reload]);

  // Sync active section when initialSection changes (e.g. from navbar navigation)
  useEffect(() => {
    if (initialSection === 'leads' || initialSection === 'bookings') {
      setActiveSection('leads');
    } else if (initialSection === 'profile') {
      setActiveSection('profile');
    } else if (initialSection === 'overview') {
      setActiveSection('overview');
    }
  }, [initialSection]);

  const matchesCategory = (item, providerCategory) => {
    if (!providerCategory) return false;
    const pCat = String(providerCategory).toLowerCase().trim().replace(/[-_ ]/g, '').replace(/s$/, '');
    const itemSlug = String(item.categorySlug || '').toLowerCase().trim().replace(/[-_ ]/g, '').replace(/s$/, '');
    const itemCat = String(item.category || '').toLowerCase().trim().replace(/[-_ ]/g, '').replace(/s$/, '');
    const itemService = String(item.serviceType || '').toLowerCase().trim().replace(/[-_ ]/g, '').replace(/s$/, '');
    return (
      itemSlug === pCat ||
      itemCat === pCat ||
      itemSlug.includes(pCat) ||
      pCat.includes(itemSlug) ||
      itemCat.includes(pCat) ||
      pCat.includes(itemCat) ||
      itemService.includes(pCat)
    );
  };

  const items = useMemo(() => {
    const raw = requestData?.items || [];
    if (!user?.serviceCategory) return [];
    return raw.filter((item) => matchesCategory(item, user.serviceCategory));
  }, [requestData?.items, user?.serviceCategory]);

  // Real-time KPI Counts
  const metrics = useMemo(() => {
    const newLeads = items.filter((i) =>
      ['submitted', 'requested', 'pending', 'new'].includes(i.status)
    );
    const connectedLeads = items.filter((i) =>
      ['contacted', 'quotation', 'quoted', 'accepted', 'scheduled', 'in_progress'].includes(i.status)
    );
    const completed = items.filter((i) => i.status === 'completed');
    const closed = items.filter((i) => i.status === 'closed');

    const totalRevenue = completed
      .concat(closed)
      .reduce((sum, item) => {
        const amt = Number(item.invoice?.total || item.invoice?.subtotal || item.quotation?.amount || item.predefinedPrice || 0);
        return sum + amt;
      }, 0);

    const reviewedJobs = items.filter((i) => i.review?.rating);
    const avgRating = reviewedJobs.length > 0
      ? (reviewedJobs.reduce((sum, i) => sum + Number(i.review.rating), 0) / reviewedJobs.length).toFixed(1)
      : '5.0';

    return {
      newCount: newLeads.length,
      connectedCount: connectedLeads.length,
      completedCount: completed.length,
      closedCount: closed.length,
      totalCount: items.length,
      totalRevenue,
      newLeads: newLeads.slice(0, 5),
      reviewedJobs,
      avgRating,
      reviewCount: reviewedJobs.length
    };
  }, [items]);

  // Category details
  const categoryMeta = useMemo(() => {
    const slug = user?.serviceCategory || '';
    return (
      serviceCategories.find(
        (c) => c.slug === slug || slug.includes(c.slug) || c.label.toLowerCase().includes(slug)
      ) || {
        label: user?.serviceCategory ? user.serviceCategory.replace(/-/g, ' ') : 'Verified Service Professional',
        iconName: 'Wrench',
        accentColor: '#163e35'
      }
    );
  }, [user?.serviceCategory]);

  return (
    <div className="min-h-screen bg-stone-50/70 pb-20">
      {/* Top Professional Portal Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#163e35] text-[#d8edb3] flex items-center justify-center font-bold text-lg shadow-xs">
                <Wrench size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight leading-none">
                    {user?.name || 'Service Partner'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck size={12} className="text-emerald-700" /> Verified Specialist
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                  <span className="font-semibold text-stone-700">Specialty Category:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-[#163e35] font-extrabold border border-stone-200">
                    {categoryMeta.label}
                  </span>
                  <span>•</span>
                  <span>Partner Portal</span>
                </div>
              </div>
            </div>

            {/* Right Header Action: Availability Switch & Logout */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => setLeadStatusOnline(!leadStatusOnline)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  leadStatusOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
                title="Toggle real-time lead reception"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    leadStatusOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                  }`}
                />
                <span>{leadStatusOnline ? 'Online (Accepting Leads)' : 'Offline (Paused)'}</span>
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={13} /> Log out
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'overview'
                  ? 'bg-[#163e35] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <button
              onClick={() => setActiveSection('leads')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'leads'
                  ? 'bg-[#163e35] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Wrench size={14} /> Service Leads &amp; Work Orders
              {metrics.newCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
                  {metrics.newCount} New
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'profile'
                  ? 'bg-[#163e35] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Settings size={14} /> Provider Profile &amp; Settings
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div
            onClick={() => setActiveSection('leads')}
            className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#163e35] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
              <span>New Leads</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {metrics.newCount}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Pending contact / dispatch</div>
          </div>

          <div
            onClick={() => setActiveSection('leads')}
            className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#163e35] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-teal-800 text-xs font-bold mb-1">
              <span>Connected Leads</span>
              <Phone size={14} className="text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {metrics.connectedCount}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">In communication via Call / WhatsApp</div>
          </div>

          <div
            onClick={() => setActiveSection('leads')}
            className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#163e35] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1">
              <span>Completed Leads</span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {metrics.completedCount}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Ready to close &amp; archive</div>
          </div>

          <div
            onClick={() => setActiveSection('leads')}
            className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-[#163e35] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-stone-700 text-xs font-bold mb-1">
              <span>Closed Leads</span>
              <Check size={14} className="text-stone-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {metrics.closedCount}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Finalized &amp; archived</div>
          </div>
        </section>

        {/* SECTION 1: OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Urgent Inbound Leads Queue */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    New Leads Queue
                  </h2>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Recent customer service requests. Reach out via their preferred contact method.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('leads')}
                  className="text-xs font-semibold text-[#163e35] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Leads ({metrics.totalCount}) <ChevronRight size={13} />
                </button>
              </div>

              {metrics.newLeads.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={22} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-semibold text-stone-800">Your incoming queue is clear!</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    New customer service bookings will appear here instantly in real time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {metrics.newLeads.map((lead) => {
                    const pref = lead.contactPreference || 'call';
                    return (
                      <div
                        key={lead._id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 -mx-2 px-2 rounded-xl transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">
                              {lead.serviceType}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                              {lead.requestId}
                            </span>
                          </div>
                          <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1 font-medium text-stone-800">
                              <User size={12} className="text-[#163e35]" /> {lead.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-stone-400" /> {lead.city}
                            </span>
                            <span className="flex items-center gap-1 text-stone-400">
                              <Calendar size={12} /> {lead.preferredDate || 'As soon as possible'}
                            </span>
                          </div>

                          {/* Customer Contact Preference Badge */}
                          <div className="pt-1 flex items-center gap-2">
                            {pref === 'call' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                <Phone size={11} className="text-emerald-700" /> Wants Phone Call
                              </span>
                            )}
                            {pref === 'message' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold">
                                <MessageCircle size={11} className="text-teal-700" /> Wants WhatsApp / Message
                              </span>
                            )}
                            {(pref === 'quote' || pref === 'direct_quotation') && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
                                <FileText size={11} className="text-sky-700" /> Wants Direct Quotation
                              </span>
                            )}
                            {lead.customerMessage && (
                              <span className="text-stone-500 text-[11px] italic truncate max-w-xs">
                                "{lead.customerMessage}"
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {lead.phone && (
                            <>
                              <a
                                href={`tel:${lead.phone}`}
                                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Phone size={12} /> Call
                              </a>
                              <a
                                href={`https://wa.me/${String(lead.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, I am reaching out from UrbanFinder regarding your ${lead.serviceType} booking.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <MessageCircle size={12} /> WhatsApp
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => setActiveSection('leads')}
                            className="px-3 py-1.5 rounded-lg bg-[#163e35] hover:bg-[#204e43] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Manage Lead
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Workflow Guidance & Standards for Service Professionals */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Respond Promptly</h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Call or text the customer according to their chosen preference (Call, WhatsApp, or Direct Quote) within 30 minutes of receiving the lead.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Call or Chat Directly</h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Discuss the job requirements, pricing, and timing directly with the customer via phone call or WhatsApp, and complete the service.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Close and Archive Leads</h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  After payment collection and client confirmation, click "Close Lead" to finalize the job and archive the lead cleanly.
                </p>
              </div>
            </div>

            {/* Customer Reviews & Ratings on Completed Work (Overview) */}
            {metrics.reviewedJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <Star size={16} className="text-amber-500" fill="currentColor" />
                      Customer Ratings &amp; Reviews on Completed Work
                    </h2>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Ratings left by clients on your completed jobs.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-600 font-extrabold text-sm">
                      <Star size={14} fill="currentColor" /> {metrics.avgRating} / 5
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {metrics.reviewCount} {metrics.reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {metrics.reviewedJobs.slice(0, 4).map((job) => (
                    <div
                      key={job._id}
                      className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/90 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-stone-900">{job.name}</div>
                          <div className="text-stone-500 text-[11px]">
                            {job.serviceType} • {job.city} • {date(job.review?.reviewedAt || job.updatedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              size={12}
                              fill={idx < job.review.rating ? 'currentColor' : 'none'}
                              className={idx < job.review.rating ? 'text-amber-500' : 'text-stone-300'}
                            />
                          ))}
                          <span className="ml-1 font-bold text-stone-800 text-[11px]">
                            {job.review.rating}/5
                          </span>
                        </div>
                      </div>

                      {job.review.comment && (
                        <p className="text-stone-700 italic bg-white p-2.5 rounded-lg border border-stone-200/60 text-[11px]">
                          "{job.review.comment}"
                        </p>
                      )}

                      {job.completion?.workSummary && (
                        <div className="text-[11px] text-stone-500">
                          <span className="font-medium text-stone-700">Completed Work:</span> {job.completion.workSummary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: SERVICE LEADS & WORK ORDERS (Full Interactive Tracker) */}
        {activeSection === 'leads' && (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
            <BookingsTracker />
          </div>
        )}

        {/* SECTION 4: PROVIDER PROFILE & SETTINGS */}
        {activeSection === 'profile' && (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-900">Service Professional Profile</h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Verify and manage your service category and contact credentials.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Business / Provider Name</label>
                <input
                  type="text"
                  disabled
                  defaultValue={user?.name || ''}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  defaultValue={user?.email || ''}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Contact Phone</label>
                <input
                  type="text"
                  disabled
                  defaultValue={user?.phone || ''}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Assigned Specialty Category</label>
                <div className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-900 font-bold flex items-center justify-between">
                  <span>{categoryMeta.label}</span>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    Verified Specialty
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Your dashboard is permanently dedicated to <strong>{categoryMeta.label}</strong>. You only receive leads and work orders relevant to your assigned specialty.
                </p>
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-stone-800 mb-1">Lead Dispatch Status</label>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-900">
                      {leadStatusOnline ? 'Accepting Incoming Service Requests' : 'Temporarily Paused'}
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {leadStatusOnline
                        ? 'Customers in your category and service cities can submit bookings to your queue.'
                        : 'Your queue is temporarily paused from receiving new leads.'}
                    </div>
                  </div>
                  <button
                    onClick={() => setLeadStatusOnline(!leadStatusOnline)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      leadStatusOnline
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                    }`}
                  >
                    {leadStatusOnline ? 'Online' : 'Paused'}
                  </button>
                </div>
              </div>
              {/* Customer Reviews & Ratings on Completed Work */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Star size={16} className="text-amber-500" fill="currentColor" />
                      Customer Ratings &amp; Reviews on Completed Work
                    </h3>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Verified customer ratings and feedback for completed jobs.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-600 font-extrabold text-sm">
                      <Star size={14} fill="currentColor" /> {metrics.avgRating} / 5
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {metrics.reviewCount} {metrics.reviewCount === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>

                {metrics.reviewedJobs.length === 0 ? (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-stone-500 text-xs">
                    No customer ratings recorded yet. When customers rate your completed work, their ratings and reviews will appear here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.reviewedJobs.map((job) => (
                      <div
                        key={job._id}
                        className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/90 text-xs space-y-2 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-stone-900">{job.name}</div>
                            <div className="text-stone-500 text-[11px]">
                              {job.serviceType} • {job.city} • {date(job.review?.reviewedAt || job.updatedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={12}
                                fill={idx < job.review.rating ? 'currentColor' : 'none'}
                                className={idx < job.review.rating ? 'text-amber-500' : 'text-stone-300'}
                              />
                            ))}
                            <span className="ml-1 font-bold text-stone-800 text-[11px]">
                              {job.review.rating}/5
                            </span>
                          </div>
                        </div>

                        {job.review.comment && (
                          <p className="text-stone-700 italic bg-white p-2.5 rounded-lg border border-stone-200/60 text-[11px]">
                            "{job.review.comment}"
                          </p>
                        )}

                        {job.completion?.workSummary && (
                          <div className="text-[11px] text-stone-500 flex items-center gap-1">
                            <span className="font-medium text-stone-700">Completed Work:</span> {job.completion.workSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

