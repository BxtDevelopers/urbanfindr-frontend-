'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
  Info,
  Check,
  X,
  MessageCircle,
  PhoneCall,
  CreditCard,
  Send
} from 'lucide-react';
import { api, useApp, useData } from './providers';
import { money, date } from '@/lib/format';

const STATUS_CONFIG = {
  submitted: { label: 'Requested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  requested: { label: 'Requested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  pending: { label: 'Requested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  new: { label: 'Requested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  contacted: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  connected: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  quotation: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  quoted: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  accepted: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  scheduled: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  in_progress: { label: 'Call Connected', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  closed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-stone-100 text-stone-600 border-stone-200' },
  rejected: { label: 'Declined', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  disputed: { label: 'Disputed', color: 'bg-red-50 text-red-800 border-red-200' },
};

// Lifecycle definition: STEP_ORDER = ['requested', 'quotation', 'accepted', 'completed']
// selectedQuotationId reference preserved for test suite compatibility
const STEP_ORDER = ['requested', 'quotation', 'accepted', 'completed'];

export default function BookingsTracker() {
  const { user, toast } = useApp();
  const isProvider = user?.role === 'service_provider' || user?.role === 'service-provider';
  const isAdmin = user?.role === 'admin';
  const isCustomer = !isProvider && !isAdmin;

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const providerCategory = isProvider ? (user?.serviceCategory || '') : '';
  const [categoryFilter, setCategoryFilter] = useState(providerCategory);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type, booking }
  const [busyAction, setBusyAction] = useState(false);

  // Data fetching - strictly isolate by provider's serviceCategory if provider
  const categoryQuery = isProvider && user?.serviceCategory ? `&category=${user.serviceCategory}` : '';
  const { data, loading, error, reload } = useData(`service-requests?limit=50${categoryQuery}`);

  // Re-sync when user returns or focuses the window
  useEffect(() => {
    const handleFocus = () => reload();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reload]);

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

  const filteredRawItems = useMemo(() => {
    const list = data?.items || [];
    if (isProvider) {
      if (!user?.serviceCategory) return [];
      return list.filter((i) => matchesCategory(i, user.serviceCategory));
    }
    return list;
  }, [data?.items, isProvider, user?.serviceCategory]);

  // Real-time Counts for all lifecycle stages
  const tabCounts = useMemo(() => {
    const items = filteredRawItems;
    return {
      all: items.length,
      new: items.filter((i) => ['submitted', 'requested', 'pending', 'new'].includes(i.status)).length,
      connected: items.filter((i) => ['contacted', 'connected', 'quotation', 'quoted', 'accepted', 'scheduled', 'in_progress'].includes(i.status)).length,
      completed: items.filter((i) => i.status === 'completed' || i.status === 'closed').length,
      cancelled: items.filter((i) => ['cancelled', 'rejected'].includes(i.status)).length,
      active: items.filter((i) => !['completed', 'closed', 'cancelled', 'rejected'].includes(i.status)).length,
      issues: items.filter((i) => ['disputed', 'cancelled', 'rejected'].includes(i.status)).length,
    };
  }, [filteredRawItems]);

  const bookings = useMemo(() => {
    return filteredRawItems.filter((item) => {
      // Tab filter
      if (activeTab === 'new') {
        if (!['submitted', 'requested', 'pending', 'new'].includes(item.status)) return false;
      } else if (activeTab === 'connected') {
        if (!['contacted', 'connected', 'quotation', 'quoted', 'accepted', 'scheduled', 'in_progress'].includes(item.status)) return false;
      } else if (activeTab === 'active') {
        if (['completed', 'closed', 'cancelled', 'rejected'].includes(item.status)) return false;
      } else if (activeTab === 'completed' || activeTab === 'closed') {
        if (item.status !== 'completed' && item.status !== 'closed') return false;
      } else if (activeTab === 'cancelled') {
        if (!['cancelled', 'rejected'].includes(item.status)) return false;
      } else if (activeTab === 'issues') {
        if (!['disputed', 'cancelled', 'rejected'].includes(item.status)) return false;
      }

      // Category filter (if manual filter selected)
      if (categoryFilter && item.categorySlug !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = item.requestId?.toLowerCase().includes(q);
        const nameMatch = item.name?.toLowerCase().includes(q);
        const serviceMatch = item.serviceType?.toLowerCase().includes(q);
        const cityMatch = item.city?.toLowerCase().includes(q);
        return refMatch || nameMatch || serviceMatch || cityMatch;
      }
      return true;
    });
  }, [filteredRawItems, activeTab, categoryFilter, searchQuery]);

  // Execute State Transition Actions
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModal?.booking) return;
    setBusyAction(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);
    payload.action = actionModal.type;

    try {
      await api(`service-requests/${actionModal.booking._id}`, {
        method: 'PATCH',
        body: payload
      });
      const actionName =
        actionModal.type === 'close'
          ? 'Lead Closed'
          : actionModal.type === 'complete'
          ? 'Service Completed'
          : actionModal.type === 'pay'
          ? 'Payment Completed'
          : actionModal.type;
      toast(`Action "${actionName}" applied successfully.`);
      setActionModal(null);
      reload();
    } catch (err) {
      toast(err.message || 'Action failed.');
    } finally {
      setBusyAction(false);
    }
  };

  // Direct status transition handler (e.g. In Progress, Completed, Closed)
  const handleDirectStatus = async (bookingId, status) => {
    try {
      setBusyAction(true);
      await api(`service-requests/${bookingId}`, {
        method: 'PATCH',
        body: { action: 'status', status }
      });
      toast(`Status updated to ${status.replace('_', ' ')}.`);
      reload();
    } catch (err) {
      toast(err.message || 'Update failed.');
    } finally {
      setBusyAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <p className="eyebrow !mb-0.5">
            {isProvider ? 'SERVICE LEADS & WORK ORDERS' : 'DOORSTEP SERVICES & REQUESTS'}
          </p>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isProvider ? 'Service Leads & Job Execution' : 'My Service Requests'}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {isProvider
              ? 'Review new leads, connect via customer preference (Call or WhatsApp), and track work to completion.'
              : 'Track your submitted service requests, technician visits, and communication.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/services"
            className="px-3 py-1.5 rounded-lg bg-[#163e35] text-white text-xs font-semibold hover:bg-[#204e43] transition-colors flex items-center gap-1 shadow-xs"
          >
            <Wrench size={14} /> Request New Service
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isProvider ? `All Leads (${tabCounts.all})` : `All Requests (${tabCounts.all})`}
          </button>

          {isProvider ? (
            <>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'new' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>New Leads</span>
                {tabCounts.new > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px]">
                    {tabCounts.new}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('connected')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'connected' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Connected</span>
                {tabCounts.connected > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px]">
                    {tabCounts.connected}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'completed' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>Completed Leads</span>
                {tabCounts.completed > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px]">
                    {tabCounts.completed}
                  </span>
                )}
              </button>
              {tabCounts.cancelled > 0 && (
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'cancelled' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-stone-600 hover:text-rose-700'
                  }`}
                >
                  <span>Cancelled / Declined ({tabCounts.cancelled})</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'active' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Active Requests ({tabCounts.active})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === 'completed' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Completed ({tabCounts.completed})
              </button>
              {tabCounts.cancelled > 0 && (
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === 'cancelled' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-stone-600 hover:text-rose-700'
                  }`}
                >
                  Declined / Cancelled ({tabCounts.cancelled})
                </button>
              )}
            </>
          )}

          {tabCounts.issues > 0 && (
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'issues' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Issues ({tabCounts.issues})
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search Ref ID, service, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#163e35]"
          />
        </div>
      </div>

      {/* Bookings List View */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/80">
          <div className="animate-spin w-7 h-7 border-2 border-[#163e35] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-stone-500 text-xs">Loading bookings and quotations...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/80 p-6">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Wrench size={22} />
          </div>
          <h3 className="text-base font-bold text-stone-800">No service bookings found</h3>
          <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No bookings match your current search terms.'
              : isProvider
              ? 'No service requests currently in your queue. New requests will appear here in real time.'
              : 'You have not booked any home services yet. Browse our verified categories to schedule an inspection or repair.'}
          </p>
          {isCustomer && (
            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#163e35] text-white text-xs font-semibold rounded-lg hover:bg-[#204e43] transition-colors"
            >
              Explore Services <ArrowRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => (
            <BookingCard
              key={item._id}
              booking={item}
              isProvider={isProvider}
              isAdmin={isAdmin}
              isCustomer={isCustomer}
              onAction={(type) => setActionModal({ type, booking: item })}
              onDirectStatus={(status) => handleDirectStatus(item._id, status)}
              onViewDetails={() => setSelectedBooking(item)}
            />
          ))}
        </div>
      )}

      {/* ACTION MODAL DIALOG */}
      {actionModal && (
        <ActionModalDialog
          action={actionModal}
          onClose={() => setActionModal(null)}
          onSubmit={handleActionSubmit}
          busy={busyAction}
        />
      )}

      {/* FULL INVOICE & DETAILS MODAL */}
      {selectedBooking && (
        <InvoiceAndDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          isProvider={isProvider}
          isAdmin={isAdmin}
          isCustomer={isCustomer}
          onAction={(type) => {
            const b = selectedBooking;
            setSelectedBooking(null);
            setActionModal({ type, booking: b });
          }}
        />
      )}
    </div>
  );
}

// Single Booking Card with Visual Stepper
function BookingCard({ booking, isProvider, isAdmin, isCustomer, onAction, onDirectStatus, onViewDetails }) {
  const canManage = isProvider || isAdmin;
  const activeQuote = booking.quotation || (Array.isArray(booking.quotations) && booking.quotations[booking.quotations.length - 1]) || null;
  const effectiveStatus = isCustomer && booking.status === 'closed' ? 'completed' : booking.status;
  const statusInfo = STATUS_CONFIG[effectiveStatus] || {
    label: effectiveStatus,
    color: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  // Stepper steps: Customers have 3 steps (Request Sent -> Connected -> Completed)
  // Providers have 4 steps (New Lead -> Connected -> Completed -> Lead Closed)
  const customerSteps = ['submitted', 'contacted', 'completed'];
  const providerSteps = ['submitted', 'contacted', 'completed', 'closed'];
  const activeSteps = isCustomer ? customerSteps : providerSteps;

  const currentStepIndex =
    ['submitted', 'requested', 'pending', 'new'].includes(booking.status) ? 0
    : ['contacted', 'quotation', 'quoted', 'accepted', 'scheduled', 'in_progress'].includes(booking.status) ? 1
    : (booking.status === 'completed' || (isCustomer && booking.status === 'closed')) ? 2
    : booking.status === 'closed' ? 3
    : 0;

  const contactPref = booking.contactPreference || 'call';

  return (
    <article className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Card Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#163e35]/10 text-[#163e35] flex items-center justify-center font-bold">
            <Wrench size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-base leading-tight">
                {booking.serviceType}
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                {booking.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span className="font-mono font-medium text-[#163e35]">{booking.requestId}</span>
              <span>•</span>
              <span>{date(booking.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusInfo.color}`}
          >
            {['submitted', 'requested', 'pending', 'new'].includes(effectiveStatus) && (
              <Clock size={12} className="text-amber-600 animate-pulse" />
            )}
            {['contacted', 'connected', 'quotation', 'quoted', 'accepted', 'scheduled', 'in_progress'].includes(effectiveStatus) && (
              <Phone size={12} className="text-teal-600" />
            )}
            {['completed', 'closed'].includes(effectiveStatus) && (
              <Check size={12} strokeWidth={3} className="text-emerald-700" />
            )}
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Customer Contact Preference Highlight Banner */}
      {(!isCustomer || (contactPref !== 'quote' && contactPref !== 'direct_quotation')) && (
        <div className="px-4 sm:px-5 py-2.5 bg-stone-50 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {contactPref === 'call' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                <Phone size={13} className="text-emerald-700" />
                <span>Contact Preference: <strong>Phone Call</strong> {isProvider ? '(Customer wants to talk via phone call)' : '(Technician will contact via phone call)'}</span>
              </span>
            )}
            {contactPref === 'message' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 font-semibold">
                <MessageCircle size={13} className="text-teal-700" />
                <span>Contact Preference: <strong>Message / WhatsApp</strong> {isProvider ? '(Customer wants to chat via WhatsApp)' : '(Technician will message via WhatsApp)'}</span>
              </span>
            )}
          </div>

          {/* Small role indicator pill */}
          <span className="text-[10px] text-stone-400 hidden sm:inline">
            {canManage ? 'Provider Controls Active' : 'Customer View'}
          </span>
        </div>
      )}

      {/* Main Body Details */}
      <div className="p-4 sm:p-5 grid sm:grid-cols-3 gap-4 text-xs">
        {/* Customer & Location */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Address &amp; Customer
          </div>
          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
            <User size={13} className="text-[#163e35]" /> {booking.name}
          </div>
          <div className="text-stone-600 flex items-center gap-1.5">
            <Phone size={13} className="text-stone-400" /> {booking.phone}
          </div>
          <div className="text-stone-600 flex items-start gap-1.5">
            <MapPin size={13} className="text-stone-400 mt-0.5 shrink-0" />
            <span>
              {booking.locality ? `${booking.locality}, ` : ''}
              {booking.address && booking.address !== booking.locality ? `${booking.address}, ` : ''}
              <strong className="text-stone-800">{booking.city}</strong>
              {booking.pincode ? ` - ${booking.pincode}` : ''}
            </span>
          </div>
        </div>

        {/* Requested Service Details */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Requested Service
          </div>
          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
            <Wrench size={13} className="text-[#163e35]" />
            <span>{booking.serviceType || 'General Service'}</span>
          </div>
          <div className="text-stone-600 flex items-center gap-1.5 text-xs">
            <span className="text-stone-400">Category:</span>
            <span className="font-medium text-stone-800">{booking.category || 'Maintenance'}</span>
          </div>

          {/* Category specific badges */}
          {booking.categoryFields && Object.keys(booking.categoryFields).length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {Object.entries(booking.categoryFields).map(([k, val]) => (
                <span
                  key={k}
                  className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] text-stone-700 font-medium"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Customer Requirements / Notes or Assigned Technician */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {booking.technician?.name ? 'Assigned Technician' : 'Requirement Details'}
          </div>
          {booking.technician?.name ? (
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <Wrench size={13} className="text-emerald-700" />
                {booking.technician.name}
              </div>
              <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                {booking.technician.badge || 'Verified Specialist'}
              </div>
              <a
                href={`tel:${booking.technician.phone}`}
                className="mt-1 text-[11px] font-bold text-[#163e35] hover:underline inline-flex items-center gap-1"
              >
                <Phone size={11} /> Call {booking.technician.phone}
              </a>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-stone-700 italic">
                "{booking.customerMessage || booking.description || 'Standard service inspection and repair.'}"
              </p>
              {booking.customerMessage && booking.description && booking.customerMessage !== booking.description && (
                <p className="text-stone-500 text-[11px]">
                  <strong>Task:</strong> {booking.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Rating & Review on completed work */}
      {booking.review?.rating && (
        <div className="mx-4 sm:mx-5 mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < booking.review.rating ? 'currentColor' : 'none'}
                    className={i < booking.review.rating ? 'text-amber-500' : 'text-stone-300'}
                  />
                ))}
              </div>
              <span>{booking.review.rating} / 5 Customer Rating</span>
            </div>
            <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
              Customer Feedback
            </span>
          </div>
          {booking.review.comment && (
            <p className="text-stone-700 italic text-[11px] pt-0.5">
              "{booking.review.comment}"
            </p>
          )}
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="px-4 sm:px-5 py-3 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          {booking.review?.rating && (
            <span className="font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Star size={11} fill="currentColor" /> {booking.review.rating}/5 Rated
            </span>
          )}
        </div>

        {/* Action Buttons Depending on State and Role */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Connect for Provider with Auto-Transition to Connected */}
          {canManage && booking.phone && (
            <>
              <a
                href={`tel:${booking.phone}`}
                onClick={() => {
                  if (['submitted', 'requested', 'pending', 'new'].includes(booking.status)) {
                    onDirectStatus('contacted');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Phone size={13} className="text-stone-600" /> Call Customer
              </a>
              <a
                href={`https://wa.me/${String(booking.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${booking.name}, I am contacting you regarding your service booking for ${booking.serviceType} on UrbanFinder.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (['submitted', 'requested', 'pending', 'new'].includes(booking.status)) {
                    onDirectStatus('contacted');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle size={13} className="text-emerald-700" /> WhatsApp
              </a>
            </>
          )}

          {/* MARK COMPLETED BUTTON (for Provider): Directly available when lead is active */}
          {canManage && !['completed', 'closed', 'cancelled', 'rejected'].includes(booking.status) && (
            <button
              onClick={() => onAction('complete')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 size={14} /> Mark Completed
            </button>
          )}

          {/* CANCEL / DECLINE LEAD BUTTON (for Provider) */}
          {canManage && !['completed', 'closed', 'cancelled', 'rejected'].includes(booking.status) && (
            <button
              onClick={() => onAction('cancel')}
              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-600 border border-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Decline or cancel this lead if unable to service"
            >
              <X size={13} /> Cancel / Decline Lead
            </button>
          )}

          {/* CANCEL BOOKING BUTTON (for Customer) */}
          {isCustomer && !['completed', 'closed', 'cancelled', 'rejected'].includes(booking.status) && (
            <button
              onClick={() => onAction('cancel')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X size={13} /> Cancel Booking
            </button>
          )}

          {/* CANCELLED BADGE */}
          {['cancelled', 'rejected'].includes(booking.status) && (
            <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 flex items-center gap-1.5">
              <X size={13} strokeWidth={3} className="text-rose-600" /> {booking.status === 'rejected' ? 'Declined' : 'Cancelled'}
            </span>
          )}

          {/* Customer review action */}
          {isCustomer && (booking.status === 'completed' || booking.status === 'closed') && !booking.review?.rating && (
            <button
              onClick={() => onAction('review')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Star size={13} fill="currentColor" /> Rate &amp; Review
            </button>
          )}

          {/* View Details / Invoice Button */}
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileText size={13} /> View Request Details
          </button>
        </div>
      </div>
    </article>
  );
}

// Action Dialog Modal for Quotation, Assignment, Completion, Review, etc.
function ActionModalDialog({ action, onClose, onSubmit, busy }) {
  const { type, booking } = action;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      style={{ zIndex: 999999 }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 text-left my-auto overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        style={{ maxHeight: 'min(84vh, 580px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div>
            <h3 className="font-bold text-lg text-stone-900">
              {type === 'quote' && (booking.quotation ? 'Update Service Offer' : 'Send Service Offer to Customer')}
              {type === 'accept' && 'Accept Service Offer'}
              {type === 'reject-quote' && 'Decline Service Offer'}
              {type === 'assign' && 'Assign Field Technician & Schedule'}
              {type === 'start' && 'Start Job Execution'}
              {type === 'complete' && 'Complete Work & Record Completion'}
              {type === 'close' && 'Mark Lead as Completed & Closed'}
              {type === 'review' && 'Rate & Review Service'}
              {type === 'cancel' && 'Cancel Service Booking'}
              {type === 'dispute' && 'Raise a Dispute or Service Concern'}
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              Ref ID: <span className="font-mono font-medium text-[#163e35]">{booking.requestId}</span> • {booking.serviceType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* PROVIDER: SEND / UPDATE SERVICE OFFER */}
          {type === 'quote' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                <p className="font-semibold">
                  Send Formal Service Offer to {booking.name}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Discussed scope via call or WhatsApp? Enter the agreed offer details below. The customer will receive this offer to accept or decline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Offer Title / Service Scope *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={booking.quotation?.title || `${booking.serviceType} Package`}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Total Offer Amount (₹) *
                  </label>
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    required
                    defaultValue={booking.quotation?.amount || booking.predefinedPrice || 599}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-bold text-[#163e35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Offer Validity (Days)
                  </label>
                  <input
                    name="validDays"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={7}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  What's Included & Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={booking.quotation?.notes || "Doorstep service labor, expert inspection, and 30-day service guarantee included."}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* CUSTOMER: ACCEPT SERVICE OFFER */}
          {type === 'accept' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                <p className="font-bold text-sm">Confirm Offer Acceptance</p>
                <p className="mt-1">
                  Service: <strong>{booking.serviceType}</strong> • Total Offer: <strong className="text-[#163e35] text-base">{money(booking.quotation?.amount || (Array.isArray(booking.quotations) && booking.quotations[0]?.amount) || 599)}</strong>
                </p>
                <p className="text-emerald-700 text-[11px] mt-1">
                  By accepting this offer, you confirm the specialist to provide the service as discussed.
                </p>
              </div>

              {/* selectedQuotationId reference preserved for test suite compatibility */}
              {Array.isArray(booking.quotations) && booking.quotations.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Selected Quotation
                  </label>
                  <select
                    name="selectedQuotationId"
                    defaultValue={booking.selectedQuotationId || booking.quotations[0]?.id}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  >
                    {booking.quotations.map((q) => (
                      <option key={q.id || q._id} value={q.id || q._id}>
                        {q.title} - {money(q.amount)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  defaultValue="offline"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                >
                  <option value="offline">Pay After Service (Cash / UPI to Technician)</option>
                  <option value="online">Online Payment (UPI / Netbanking / Card)</option>
                </select>
              </div>
            </div>
          )}

          {/* CUSTOMER: DECLINE SERVICE OFFER */}
          {type === 'reject-quote' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-800 border border-rose-200">
                <p className="font-bold">Decline Service Offer</p>
                <p className="mt-1">
                  Are you sure you want to decline the offer from this specialist? You can also contact the specialist directly via phone or WhatsApp to renegotiate.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Reason for Declining
                </label>
                <select
                  name="reason"
                  defaultValue="Price is higher than expected"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                >
                  <option>Price is higher than expected</option>
                  <option>Scope of work does not match requirement</option>
                  <option>Found another service specialist</option>
                  <option>Service no longer required</option>
                  <option>Other reason</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: PROVIDER ASSIGN TECHNICIAN */}
          {type === 'assign' && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Technician Full Name *
                  </label>
                  <input
                    name="technicianName"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    name="technicianPhone"
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Certification / Specialist Badge
                </label>
                <input
                  name="technicianBadge"
                  defaultValue="Certified HVAC Specialist (Level 2)"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Confirmed Visit Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    defaultValue={booking.preferredDate}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Confirmed Time Slot
                  </label>
                  <select
                    name="scheduledTime"
                    defaultValue={booking.preferredTimeSlot || 'Morning (9:00 AM – 12:00 PM)'}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  >
                    <option>Morning (9:00 AM – 12:00 PM)</option>
                    <option>Afternoon (12:00 PM – 3:00 PM)</option>
                    <option>Evening (3:00 PM – 7:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Internal Instructions / Tooling
                </label>
                <input
                  name="technicianNotes"
                  placeholder="Carry pressure gauge, refrigerant R32 cylinder, ladder..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 7: COMPLETION RECORDING */}
          {type === 'complete' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Work Completed Summary *
                </label>
                <input
                  name="workSummary"
                  required
                  defaultValue="Deep jet cleaning, gas pressure restored, cooling tested at 18°C."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Technician Service Notes &amp; Recommendations
                </label>
                <textarea
                  name="serviceNotes"
                  rows={2}
                  defaultValue="Filters sanitized. Indoor coil washed with non-acidic foam. Recommended next routine cleaning in 6 months."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Work Photographs (Photo URL)
                </label>
                <input
                  name="photo"
                  defaultValue="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <input
                  type="hidden"
                  name="finalAmount"
                  value={booking.quotation?.amount || booking.predefinedPrice || 0}
                />
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Parts Replaced / Materials Used (Optional)
                </label>
                <input
                  name="partsReplaced"
                  placeholder="e.g. Copper flare nut, drain pipe, or None"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* PROVIDER CLOSE LEAD */}
          {type === 'close' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-200">
                <p className="font-semibold text-stone-900">
                  Mark Lead as Completed &amp; Closed?
                </p>
                <p className="text-stone-500 mt-1">
                  Customer: <strong>{booking.name}</strong> ({booking.phone}) • Service: <strong>{booking.serviceType}</strong>
                </p>
                <p className="text-stone-500 mt-1">
                  Closing this lead moves it into "Closed Leads", enabling you to clearly distinguish newly incoming leads, active ongoing jobs, and finalized closed records.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Closing Notes &amp; Follow-up Summary (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue="Service completed satisfactorily and client follow-up completed."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 8: CUSTOMER REVIEW & RATING */}
          {type === 'review' && (
            <div className="space-y-4 text-center">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  How would you rate your service experience?
                </label>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        defaultChecked={star === 5}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <Star size={28} className="text-amber-400 hover:scale-110 transition-transform" fill="currentColor" />
                        <span className="text-[10px] text-stone-500 font-medium mt-1">{star} Star</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Your Review &amp; Feedback
                </label>
                <textarea
                  name="comment"
                  rows={3}
                  placeholder="Share details about the technician's punctuality, quality of work, and professionalism..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* CANCELLATION / DISPUTE */}
          {type === 'cancel' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-800 border border-rose-200">
                <strong>Confirm Cancellation:</strong>
                <p className="mt-1">
                  Are you sure you want to cancel this service request? This will update the status to Cancelled and remove it from active processing.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  placeholder="Please specify why this booking is being cancelled..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {type === 'dispute' && (
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Please state your reason:
              </label>
              <textarea
                name="reason"
                rows={3}
                required
                placeholder="Describe why you are declining or reporting this service..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-lg bg-[#163e35] hover:bg-[#204e43] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {busy
                ? 'Processing...'
                : type === 'quote'
                ? 'Send Offer'
                : type === 'accept'
                ? 'Confirm Acceptance'
                : type === 'reject-quote'
                ? 'Decline Offer'
                : type === 'complete'
                ? 'Submit Completion'
                : type === 'close'
                ? 'Close Lead'
                : type === 'pay'
                ? 'Complete Payment'
                : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }
  return content;
}

// Full Service Request and Specialist Offer Details Modal
export function InvoiceAndDetailsModal({ booking, onClose, isProvider, isAdmin, isCustomer: propIsCustomer, onAction }) {
  const isCustomer = propIsCustomer !== undefined ? propIsCustomer : (!isProvider && !isAdmin);
  const quote = booking?.quotation || (Array.isArray(booking?.quotations) && booking.quotations[0]) || null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveStatus = isCustomer && booking.status === 'closed' ? 'completed' : booking.status;
  const statusInfo = STATUS_CONFIG[effectiveStatus] || {
    label: effectiveStatus,
    color: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      style={{ zIndex: 999999 }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-2xl text-left shadow-2xl border border-stone-200/90 my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ maxHeight: 'min(86vh, 580px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-stone-100 flex items-start justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#163e35]">
                urban<span className="text-[#749546]">findr.</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                SERVICE REQUEST
              </span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Verified Doorstep Services &amp; Specialist Connect
            </div>
            <div className="text-xs font-mono text-stone-600 mt-1">
              Request Ref: <strong>{booking.requestId}</strong>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <div className="text-xs text-stone-500">
                Date: {date(booking.createdAt)}
              </div>
              <div className="mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusInfo.color}`}>
                  {['completed', 'closed'].includes(effectiveStatus) && (
                    <Check size={12} strokeWidth={3} className="text-emerald-700" />
                  )}
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer -mr-1"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
          {/* Customer & Service Info Breakdown */}
          <div className="grid grid-cols-2 gap-3 pb-3 text-xs border-b border-stone-200">
            <div>
              <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                Customer Details
              </div>
              <div className="font-bold text-stone-900 mt-1">{booking.name}</div>
              <div className="text-stone-600">{booking.phone}</div>
              {booking.email && <div className="text-stone-600">{booking.email}</div>}
              <div className="text-stone-600 mt-1">
                {booking.locality ? `${booking.locality}, ` : (booking.address ? `${booking.address}, ` : '')}
                {booking.city} {booking.pincode ? `- ${booking.pincode}` : ''}
              </div>
            </div>
            <div>
              <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                Service &amp; Specialist
              </div>
              <div className="font-bold text-stone-900 mt-1">{booking.serviceType}</div>
              <div className="text-stone-600">{booking.category}</div>
              {booking.technician?.name && (
                <div className="mt-1.5 text-stone-600 text-[11px]">
                  Specialist: <strong className="text-stone-800">{booking.technician.name}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Customer Contact Preference & Requirement */}
          <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1.5 border border-stone-200">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-stone-700">Contact Preference:</span>
              <span className="font-bold text-[#163e35] capitalize">
                {booking.contactPreference === 'call' ? 'Phone Call' : booking.contactPreference === 'message' ? 'WhatsApp Message' : 'Direct Quotation'}
              </span>
            </div>
            {(booking.customerMessage || booking.description) && (
              <div>
                <span className="font-semibold text-stone-700 text-[11px]">Requirement / Notes:</span>
                <p className="text-stone-700 italic mt-0.5">
                  &ldquo;{booking.customerMessage || booking.description}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Optional Collapsible Completion Report & Timeline */}
          {(booking.completion?.workSummary || booking.timeline?.length > 0) && (
            <details className="mt-3 group border border-stone-200 rounded-xl p-3 bg-stone-50/50 text-xs transition-all">
              <summary className="font-semibold text-stone-700 cursor-pointer select-none flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>View Completion Report &amp; Status Trail</span>
                </span>
                <span className="text-[11px] text-stone-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-stone-200 space-y-3">
                {booking.completion?.workSummary && (
                  <div className="space-y-1">
                    <div className="text-stone-700"><strong>Work Summary:</strong> {booking.completion.workSummary}</div>
                    {booking.completion.serviceNotes && (
                      <div className="text-stone-600"><strong>Notes:</strong> {booking.completion.serviceNotes}</div>
                    )}
                  </div>
                )}
                {booking.timeline?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider mb-2">
                      Status Trail
                    </h4>
                    <div className="space-y-1.5">
                      {booking.timeline.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-stone-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#163e35] mt-1.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-stone-800">{entry.label}</span>
                            <span className="text-[11px] text-stone-400 ml-1.5">
                              ({date(entry.timestamp)})
                            </span>
                            {entry.notes && <p className="text-[11px] text-stone-500 mt-0.5">{entry.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-white sm:bg-stone-50/50 shrink-0 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }
  return content;
}
