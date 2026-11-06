'use client';

import {
  X,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  User,
  Check,
  Building2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { money } from '@/lib/format';
import StatusBadge from './StatusBadge';

export default function PropertyRequestsModal({
  isOpen,
  onClose,
  property,
  requests = [],
  onAcceptRequest,
  busyId
}) {
  if (!isOpen || !property) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-start justify-between gap-4 bg-stone-50/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#ecf2e4] text-[#163e35]">
                <Calendar size={16} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 truncate">
                Visit Requests & Enquiries
              </h2>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 truncate">
              <span className="font-semibold text-stone-800 truncate">{property.title}</span>
              {property.city && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <MapPin size={11} className="text-stone-400" />
                    {property.locality ? `${property.locality}, ` : ''}{property.city}
                  </span>
                </>
              )}
              {property.price && (
                <>
                  <span>•</span>
                  <span className="font-bold text-[#163e35] shrink-0">{money(property.price)}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {requests.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Calendar size={22} />
              </div>
              <h3 className="font-bold text-stone-800 text-sm">No Visit Requests Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                When prospective buyers or tenants schedule a visit or enquire about this property, their contact details and preferred time will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Total Requests: <strong className="text-stone-800">{requests.length}</strong></span>
                <span className="text-[11px]">Click Accept after contacting the customer</span>
              </div>

              {requests.map((req, idx) => {
                const isAccepted = req.status === 'accepted' || req.status === 'confirmed';
                const createdDate = req.createdAt ? new Date(req.createdAt) : null;
                const scheduledDate = req.scheduledAt ? new Date(req.scheduledAt) : null;

                const formattedCreated = createdDate && !isNaN(createdDate.getTime())
                  ? `${createdDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} at ${createdDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : null;

                const formattedScheduled = scheduledDate && !isNaN(scheduledDate.getTime())
                  ? `${scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} at ${scheduledDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : null;

                return (
                  <div
                    key={req._id || idx}
                    className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs hover:border-stone-300 transition-all space-y-3"
                  >
                    {/* Top Row: Customer Info & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#ecf2e4] text-[#163e35] font-bold flex items-center justify-center text-sm shrink-0">
                          {req.customerName ? req.customerName.charAt(0).toUpperCase() : <User size={16} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-stone-900 truncate">
                            {req.customerName || 'Prospective Customer'}
                          </h4>
                          <span className="text-[11px] text-stone-400 block">
                            {req.isVisit ? 'Scheduled Site Visit Tour' : 'Property Inquiry'}
                          </span>
                        </div>
                      </div>

                      <StatusBadge status={req.status} />
                    </div>

                    {/* Request Timing Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-stone-100">
                      {/* When request was sent */}
                      {formattedCreated && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 text-stone-700">
                          <Clock size={14} className="text-stone-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                              Request Sent On
                            </span>
                            <span className="font-semibold text-xs text-stone-800 block truncate">
                              {formattedCreated}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Scheduled Tour Date & Time */}
                      {formattedScheduled && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#ecf2e4]/70 text-[#163e35]">
                          <Calendar size={14} className="text-[#163e35] shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-[#163e35]/80 block uppercase font-bold tracking-wider">
                              Requested Visit Date
                            </span>
                            <span className="font-bold text-xs text-[#163e35] block truncate">
                              {formattedScheduled}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Message / Note */}
                    {req.note && (
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
                        <span className="font-bold text-[11px] text-stone-500 block mb-0.5">Message / Note:</span>
                        <p className="italic text-stone-800">{req.note}</p>
                      </div>
                    )}

                    {/* Customer Contact & Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                      {/* Contact Options: Call & Text (Number hidden on hover tooltip) */}
                      <div className="flex items-center gap-2">
                        {req.phone && (
                          <>
                            <a
                              href={`tel:${req.phone}`}
                              title="Call Customer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#ecf2e4] text-stone-700 hover:text-[#163e35] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Phone size={13} />
                              <span>Call</span>
                            </a>
                            <a
                              href={`sms:${req.phone}`}
                              title="Message Customer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#ecf2e4] text-stone-700 hover:text-[#163e35] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <MessageSquare size={13} />
                              <span>Text</span>
                            </a>
                          </>
                        )}

                        {req.email && (
                          <a
                            href={`mailto:${req.email}`}
                            title="Email Customer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Mail size={13} />
                            <span className="hidden sm:inline">Email</span>
                          </a>
                        )}
                      </div>

                      {/* Accept Request Button */}
                      <div>
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecf2e4] text-[#163e35] text-xs font-bold border border-[#d6dcd3]">
                            <Check size={14} />
                            <span>Request Accepted</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={busyId === req._id}
                            onClick={() => onAcceptRequest?.(req)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Check size={14} />
                            <span>{busyId === req._id ? 'Accepting…' : 'Accept Request'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <Link
            href={`/properties/${property._id}`}
            className="text-xs font-semibold text-[#163e35] hover:underline flex items-center gap-1"
          >
            <span>View Public Listing</span>
            <ExternalLink size={12} />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
