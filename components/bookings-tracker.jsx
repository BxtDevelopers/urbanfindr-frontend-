'use client';

import { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { api, useApp, useData } from './providers';
import { money, date } from '@/lib/format';

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  pending: { label: 'Requested', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  quoted: { label: 'Quotation', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  quotation: { label: 'Quotation', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  accepted: { label: 'Service Accepted', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  scheduled: { label: 'Service Accepted', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  in_progress: { label: 'Service Accepted', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-stone-100 text-stone-600 border-stone-200' },
  rejected: { label: 'Declined', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  disputed: { label: 'Disputed', color: 'bg-red-50 text-red-800 border-red-200' },
};

const STEP_ORDER = ['requested', 'quotation', 'accepted', 'completed'];

export default function BookingsTracker() {
  const { user, toast } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type, booking }
  const [busyAction, setBusyAction] = useState(false);

  // Data fetching
  const { data, loading, error, reload } = useData('service-requests?limit=50');

  const isProvider = user?.role === 'service_provider' || user?.role === 'service-provider';
  const isAdmin = user?.role === 'admin';
  const isCustomer = !isProvider && !isAdmin;

  const bookings = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => {
      // Tab filter
      if (activeTab === 'active') {
        if (['completed', 'cancelled', 'rejected'].includes(item.status)) return false;
      } else if (activeTab === 'completed') {
        if (item.status !== 'completed') return false;
      } else if (activeTab === 'issues') {
        if (!['disputed', 'cancelled', 'rejected'].includes(item.status)) return false;
      }

      // Category filter
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
  }, [data?.items, activeTab, categoryFilter, searchQuery]);

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
      toast(`Action "${actionModal.type}" applied successfully.`);
      setActionModal(null);
      reload();
    } catch (err) {
      toast(err.message || 'Action failed.');
    } finally {
      setBusyAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <p className="eyebrow !mb-0.5">SHARED BOOKING &amp; QUOTATION ENGINE</p>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isProvider ? 'Service Requests & Assigned Jobs' : 'My Service Bookings & Quotations'}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {isProvider
              ? 'Review service leads, submit quotations, assign field technicians, and record completion.'
              : 'Track doorstep visits, review price quotes, view technician details, and access invoices.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/services"
            className="px-3 py-1.5 rounded-lg bg-[#163e35] text-white text-xs font-semibold hover:bg-[#204e43] transition-colors flex items-center gap-1 shadow-xs"
          >
            <Wrench size={14} /> Book New Service
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Bookings ({data?.total || 0})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'active' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            In Progress &amp; Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'completed' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'issues' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Disputes / Cancelled
          </button>
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
function BookingCard({ booking, isProvider, isAdmin, isCustomer, onAction, onViewDetails }) {
  const canManage = isProvider || isAdmin;
  const statusInfo = STATUS_CONFIG[booking.status] || {
    label: booking.status,
    color: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  // Compute active step index for stepper
  const normalizedStatus = booking.status === 'pending'
    ? 'requested'
    : (booking.status === 'quoted' || booking.status === 'quotation')
    ? 'quotation'
    : ['scheduled', 'in_progress'].includes(booking.status)
    ? 'accepted'
    : booking.status;
  const currentStepIndex = STEP_ORDER.indexOf(normalizedStatus);

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

        {/* Status Badge & Key Cost */}
        <div className="flex items-center gap-3">
          {booking.quotation?.amount ? (
            <div className="text-right">
              <div className="text-[11px] text-stone-400 font-medium">Quotation Estimate</div>
              <div className="font-bold text-stone-900 text-sm">
                ₹{Number(booking.quotation.amount).toLocaleString('en-IN')}
              </div>
            </div>
          ) : booking.predefinedPrice ? (
            <div className="text-right">
              <div className="text-[11px] text-stone-400 font-medium">Standard Price</div>
              <div className="font-bold text-stone-900 text-sm">
                ₹{Number(booking.predefinedPrice).toLocaleString('en-IN')}
              </div>
            </div>
          ) : null}

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Status Guidance Banner */}
      <div className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {booking.status === 'requested' || booking.status === 'pending' ? (
            <span className="text-amber-800 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <strong>Step 1 (Requested):</strong> Awaiting service provider price quotation.
            </span>
          ) : (booking.status === 'quoted' || booking.status === 'quotation') ? (
            <span className="text-sky-800 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <strong>Step 2 (Quotation):</strong> {booking.quotations?.length > 1 ? `${booking.quotations.length} quotation options available` : `Quotation of ₹${Number(booking.quotation?.amount || 0).toLocaleString('en-IN')} ready`}. Review and accept the suitable quotation below to confirm service!
            </span>
          ) : booking.status === 'accepted' || booking.status === 'scheduled' || booking.status === 'in_progress' ? (
            <span className="text-emerald-800 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong>Step 3 (Service Accepted):</strong> Quotation accepted &amp; service confirmed for {booking.preferredDate} ({booking.preferredTimeSlot || 'Scheduled Time'}).
            </span>
          ) : booking.status === 'completed' ? (
            <span className="text-emerald-800 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong>Step 4 (Completed):</strong> Service completed! Invoice generated and ready for review.
            </span>
          ) : (
            <span className="text-stone-600 font-medium capitalize">
              Status: {booking.status}
            </span>
          )}
        </div>

        {/* Small role indicator pill */}
        <span className="text-[10px] text-stone-400 hidden sm:inline">
          {canManage ? 'Provider / Admin Controls Active' : 'Customer View'}
        </span>
      </div>

      {/* Visual Stepper Tracker (Steps 1 to 4) */}
      {!['cancelled', 'rejected', 'disputed'].includes(booking.status) && (
        <div className="px-4 sm:px-5 py-3 bg-stone-50/70 border-b border-stone-100 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[540px]">
            {STEP_ORDER.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isPast
                          ? 'bg-[#163e35] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#163e35] text-[#d8edb3] ring-4 ring-[#163e35]/15'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isPast ? <Check size={12} strokeWidth={3} /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs capitalize font-medium ${
                        isCurrent
                          ? 'font-bold text-[#163e35]'
                          : isPast
                          ? 'text-stone-700'
                          : 'text-stone-400'
                      }`}
                    >
                      {step === 'accepted' ? 'Service Accepted' : step === 'quotation' ? 'Quotation' : step.replace('_', ' ')}
                    </span>
                  </div>
                  {idx < STEP_ORDER.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded ${
                        isPast ? 'bg-[#163e35]' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
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
              {booking.address ? `${booking.address}, ` : ''}
              {booking.locality ? `${booking.locality}, ` : ''}
              <strong className="text-stone-800">{booking.city}</strong>
              {booking.pincode ? ` - ${booking.pincode}` : ''}
            </span>
          </div>
        </div>

        {/* Schedule & Category Fields */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Appointment Slot
          </div>
          <div className="text-stone-700 flex items-center gap-1.5">
            <Calendar size={13} className="text-[#163e35]" />
            <span>{booking.preferredDate || 'Flexible / As soon as possible'}</span>
          </div>
          <div className="text-stone-700 flex items-center gap-1.5">
            <Clock size={13} className="text-stone-400" />
            <span>{booking.preferredTimeSlot || booking.preferredTime || 'Any convenient time'}</span>
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

        {/* Assigned Technician or Description */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {booking.technician?.name ? 'Assigned Technician' : 'Requirement Notes'}
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
            <p className="text-stone-600 line-clamp-3 italic">
              "{booking.description}"
            </p>
          )}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="px-4 sm:px-5 py-3 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          {booking.invoice?.invoiceNumber && (
            <span className="font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
              Invoice {booking.invoice.invoiceNumber}
            </span>
          )}
          {booking.review?.rating && (
            <span className="font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Star size={11} fill="currentColor" /> {booking.review.rating}/5 Rated
            </span>
          )}
        </div>

        {/* Action Buttons Depending on State */}
        <div className="flex flex-wrap items-center gap-2">
          {/* STEP 1 -> STEP 2: Submit Price Quotation */}
          {(booking.status === 'requested' || booking.status === 'pending') && (
            <button
              onClick={() => onAction('quote')}
              className="px-3.5 py-1.5 rounded-lg bg-[#163e35] text-white text-xs font-semibold hover:bg-[#204e43] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <DollarSign size={14} /> Submit Price Quotation
            </button>
          )}

          {/* STEP 2 -> STEP 3: Accept or Decline Quotation */}
          {(booking.status === 'quoted' || booking.status === 'quotation') && (
            <>
              <button
                onClick={() => onAction('accept')}
                className="px-3.5 py-1.5 rounded-lg bg-[#163e35] text-white text-xs font-semibold hover:bg-[#204e43] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check size={14} /> Accept Quotation {booking.quotations?.length > 1 ? `(${booking.quotations.length} Options)` : `(₹${booking.quotation?.amount || 599})`}
              </button>
              <button
                onClick={() => onAction('reject-quote')}
                className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-300 transition-colors cursor-pointer"
              >
                Decline
              </button>
              {canManage && (
                <button
                  onClick={() => onAction('quote')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Edit Quotation
                </button>
              )}
            </>
          )}

          {/* STEP 3: Service Accepted */}
          {['accepted', 'scheduled', 'in_progress'].includes(booking.status) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                <Check size={14} /> Service Accepted
              </span>
              <button
                onClick={() => onAction('complete')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 size={14} /> {canManage ? 'Complete Service & Invoice' : 'Mark Service Completed'}
              </button>
            </div>
          )}

          {/* STEP 6: Rate & Review */}
          {booking.status === 'completed' && !booking.review?.rating && (
            <button
              onClick={() => onAction('review')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Star size={13} fill="currentColor" /> Rate &amp; Review
            </button>
          )}

          {/* View Details / Invoice Button */}
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileText size={13} /> View Invoice &amp; Timeline
          </button>
        </div>
      </div>
    </article>
  );
}

// Action Dialog Modal for Quotation, Assignment, Completion, Review, etc.
function ActionModalDialog({ action, onClose, onSubmit, busy }) {
  const { type, booking } = action;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div>
            <h3 className="font-bold text-lg text-stone-900">
              {type === 'quote' && 'Submit Service Quotation'}
              {type === 'accept' && 'Accept Quotation & Confirm Booking'}
              {type === 'reject-quote' && 'Decline Quotation'}
              {type === 'assign' && 'Assign Field Technician & Schedule'}
              {type === 'start' && 'Start Job Execution'}
              {type === 'complete' && 'Complete Work & Generate Invoice'}
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
          {/* STEP 3: PROVIDER SUBMIT QUOTATION */}
          {type === 'quote' && (
            <>
              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 mb-3 border border-stone-200">
                <strong>Customer Requirement:</strong> {booking.description}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Labor &amp; Service Fee (₹) *
                  </label>
                  <input
                    name="laborCost"
                    type="number"
                    min="0"
                    required
                    defaultValue="499"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Parts / Materials (₹)
                  </label>
                  <input
                    name="partsCost"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Inspection Fee (₹)
                  </label>
                  <input
                    name="inspectionFee"
                    type="number"
                    min="0"
                    defaultValue="150"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Total Estimated Amount (₹) *
                  </label>
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    required
                    defaultValue="649"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-bold text-[#163e35]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Scope of Work &amp; Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Details of inspection, parts warranty, and service timeline..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </>
          )}

          {/* STEP 2 -> STEP 3: CUSTOMER ACCEPT QUOTATION */}
          {type === 'accept' && (
            <div className="space-y-3">
              {Array.isArray(booking.quotations) && booking.quotations.length > 1 ? (
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Select the Most Suitable Quotation for You:
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {booking.quotations.map((q) => (
                      <label
                        key={q.id || q.title}
                        className="flex items-start gap-2.5 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-emerald-50/30 transition-all text-xs"
                      >
                        <input
                          type="radio"
                          name="selectedQuotationId"
                          value={q.id}
                          defaultChecked={q.recommended || q.id === booking.selectedQuotationId || q === booking.quotations[0]}
                          className="accent-[#163e35] mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">{q.title}</span>
                            <span className="font-extrabold text-emerald-800 font-mono">₹{Number(q.amount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          {q.warranty && (
                            <div className="text-emerald-700 font-medium text-[10px] mt-0.5">🛡️ {q.warranty}</div>
                          )}
                          {Array.isArray(q.inclusions) && (
                            <div className="text-stone-500 text-[10px] mt-1 space-y-0.5">
                              {q.inclusions.slice(0, 2).map((inc, i) => (
                                <div key={i}>✓ {inc}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="text-xs text-emerald-800 font-medium">Service Quotation Estimate</div>
                  <div className="text-2xl font-bold text-emerald-950 mt-1">
                    ₹{Number(booking.quotation?.amount || booking.predefinedPrice || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {booking.quotation?.title ? `${booking.quotation.title}. ` : ''}Includes doorstep inspection, verified technician service, and workmanship guarantee.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Select Payment Preference
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 text-xs">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_after_service"
                      defaultChecked
                      className="accent-[#163e35]"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">Pay After Service (Cash / UPI)</div>
                      <div className="text-stone-500 text-[11px]">Pay the technician directly upon successful completion.</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 text-xs">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      className="accent-[#163e35]"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">Online Payment / Invoice Card</div>
                      <div className="text-stone-500 text-[11px]">Pay securely via digital invoice after completion.</div>
                    </div>
                  </label>
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Final Billable Amount (₹) *
                  </label>
                  <input
                    name="finalAmount"
                    type="number"
                    min="1"
                    required
                    defaultValue={booking.quotation?.amount || booking.predefinedPrice || 649}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-bold text-[#163e35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Parts Replaced Note
                  </label>
                  <input
                    name="partsReplaced"
                    placeholder="e.g. Copper flare nut, drain pipe"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
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
          {(type === 'cancel' || type === 'dispute' || type === 'reject-quote') && (
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
              {busy ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Full Invoice and Comprehensive Audit Details Modal
function InvoiceAndDetailsModal({ booking, onClose, isProvider, isAdmin, onAction }) {
  const invoice = booking.invoice;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Printable Invoice Header */}
        <div className="flex items-start justify-between pb-6 border-b border-stone-200">
          <div>
            <span className="text-xl font-bold tracking-tight text-[#163e35]">
              urban<span className="text-[#749546]">findr</span>.
            </span>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Verified Real Estate &amp; Home Services Solutions
            </div>
            <div className="text-xs font-mono text-stone-600 mt-2">
              Booking Ref: <strong>{booking.requestId}</strong>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-stone-900">
              {invoice?.invoiceNumber ? 'TAX INVOICE' : 'SERVICE RECORD'}
            </div>
            {invoice?.invoiceNumber && (
              <div className="text-xs font-mono text-stone-600">
                Invoice No: {invoice.invoiceNumber}
              </div>
            )}
            <div className="text-xs text-stone-500 mt-1">
              Date: {date(invoice?.issueDate || booking.createdAt)}
            </div>
            <div className="mt-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  invoice?.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {invoice?.status === 'paid' ? 'PAID' : 'PAYMENT PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Service Info Breakdown */}
        <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-stone-200">
          <div>
            <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
              Service For (Customer)
            </div>
            <div className="font-bold text-stone-900 mt-1">{booking.name}</div>
            <div className="text-stone-600">{booking.phone}</div>
            {booking.email && <div className="text-stone-600">{booking.email}</div>}
            <div className="text-stone-600 mt-1">
              {booking.address ? `${booking.address}, ` : ''}
              {booking.locality ? `${booking.locality}, ` : ''}
              {booking.city} {booking.pincode ? `- ${booking.pincode}` : ''}
            </div>
          </div>
          <div>
            <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
              Service Category &amp; Provider
            </div>
            <div className="font-bold text-stone-900 mt-1">{booking.serviceType}</div>
            <div className="text-stone-600">{booking.category}</div>
            {booking.technician?.name && (
              <div className="mt-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                <span className="font-semibold text-stone-800">Technician:</span> {booking.technician.name} ({booking.technician.phone})
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-300 text-stone-500 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-bold">Item Description</th>
                <th className="py-2 text-right font-bold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoice?.items?.length ? (
                invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 text-stone-800">{it.description}</td>
                    <td className="py-2.5 text-right font-medium text-stone-900">
                      ₹{Number(it.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2.5 text-stone-800">
                    {booking.serviceType} ({booking.category})
                  </td>
                  <td className="py-2.5 text-right font-medium text-stone-900">
                    ₹{Number(booking.quotation?.amount || booking.predefinedPrice || 499).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-stone-200 font-semibold text-xs">
              <tr>
                <td className="pt-2 text-stone-600">Subtotal</td>
                <td className="pt-2 text-right">
                  ₹{Number(invoice?.subtotal || booking.quotation?.amount || 499).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-stone-600">Applicable GST / Tax (18%)</td>
                <td className="py-1 text-right">
                  ₹{Number(invoice?.tax || Math.round((invoice?.subtotal || 499) * 0.18)).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-t border-stone-300 text-sm font-bold text-[#163e35]">
                <td className="pt-2">Total Payable</td>
                <td className="pt-2 text-right">
                  ₹{Number(invoice?.total || Math.round((invoice?.subtotal || 499) * 1.18)).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Completion Evidence (Work summary & photographs) */}
        {booking.completion?.workSummary && (
          <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Service Completion Report
            </div>
            <div className="text-stone-700"><strong>Work Done:</strong> {booking.completion.workSummary}</div>
            {booking.completion.serviceNotes && (
              <div className="text-stone-600"><strong>Notes:</strong> {booking.completion.serviceNotes}</div>
            )}
            {booking.completion.photos?.length > 0 && (
              <div className="pt-2 flex items-center gap-2">
                {booking.completion.photos.map((ph, idx) => (
                  <img
                    key={idx}
                    src={ph}
                    alt="Work completion evidence"
                    className="w-16 h-16 rounded-lg object-cover border border-stone-300"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Timeline */}
        {booking.timeline?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider mb-2">
              Job Status Audit Trail
            </h4>
            <div className="space-y-2 text-xs">
              {booking.timeline.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2 text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#163e35] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-800">{entry.label}</span>
                    <span className="text-[11px] text-stone-400 ml-1.5">
                      ({date(entry.timestamp)})
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">{entry.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200 mt-6 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={14} /> Print Invoice
            </button>
            {invoice?.status !== 'paid' && (
              <button
                onClick={() => onAction('pay')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check size={14} /> Mark as Paid
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

