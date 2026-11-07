'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import StatusBadge from './StatusBadge';
import PropertyRequestsModal from './PropertyRequestsModal';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Edit,
  Check,
  Clock,
  Calendar
} from 'lucide-react';

export default function PropertyDashboardCard({
  property,
  busy,
  requests = [],
  onOpenRequests,
  onAcceptRequest,
  onClose,
  onReopen
}) {
  if (!property) return null;

  const [showModal, setShowModal] = useState(false);
  const images = propertyImages(property);
  const isRent = property.purpose === 'rent';
  const isPg = property.purpose === 'pg';
  const isClosed = property.status === 'closed' || property.status === 'archived';

  const bedrooms = property.bedrooms || (property.type?.toLowerCase().includes('bhk') ? property.type : null);
  const bathrooms = property.bathrooms;
  const area = property.area || property.builtUpArea || property.carpetArea;

  // Track seen request IDs in local state and localStorage so viewed requests clear the number badge
  const [seenIds, setSeenIds] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(`seen_requests_${property._id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Calculate unseen / new requests
  const unseenRequests = useMemo(() => {
    return requests.filter((r) => {
      if (seenIds.has(String(r._id))) return false;
      if (r.status === 'accepted' || r.status === 'confirmed' || r.status === 'completed' || r.status === 'cancelled') {
        return false;
      }
      return true;
    });
  }, [requests, seenIds]);

  const hasNewRequests = unseenRequests.length > 0;

  function handleOpen(e) {
    e.preventDefault();
    e.stopPropagation();

    // Mark current requests as seen so the number badge clears
    const updatedSeen = new Set(seenIds);
    requests.forEach((r) => updatedSeen.add(String(r._id)));
    setSeenIds(updatedSeen);
    try {
      localStorage.setItem(`seen_requests_${property._id}`, JSON.stringify([...updatedSeen]));
    } catch {}

    if (onOpenRequests) {
      onOpenRequests(property, requests);
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <div
        className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col group ${
          isClosed
            ? 'border-stone-300 bg-stone-50/60 opacity-90'
            : 'border-stone-200 hover:border-stone-400 hover:shadow-md'
        }`}
      >
        {/* Clickable Card Link: opens property details */}
        <Link
          href={`/properties/${property._id}`}
          className="flex-1 flex flex-col cursor-pointer"
          title="Click to view property details"
        >
          {/* Simple, clean image */}
          <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
            <img
              src={images[0] || '/placeholder.jpg'}
              alt={property.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 ${
                isClosed ? 'grayscale-[30%]' : ''
              }`}
            />
            {/* Subtle top badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-900/80 text-white backdrop-blur-xs">
                For {property.purpose}
              </span>
              <StatusBadge status={property.status} />
            </div>
          </div>

          {/* Clean, simple card body */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              {/* Price */}
              <div className="text-lg font-extrabold text-stone-900">
                {money(property.price)}
                {(isRent || isPg) && <span className="text-xs font-normal text-stone-500"> / month</span>}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-stone-800 text-sm line-clamp-1 group-hover:text-[#163e35] transition-colors">
                {property.title}
              </h3>

              {/* Location */}
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin size={12} className="text-stone-400 shrink-0" />
                <span className="truncate">
                  {property.locality ? `${property.locality}, ` : ''}{property.city}
                </span>
              </p>
            </div>

            {/* Simple specs line */}
            <div className="flex items-center gap-2.5 text-xs text-stone-600 pt-2.5 border-t border-stone-100">
              <span className="flex items-center gap-1">
                <BedDouble size={13} className="text-stone-400 shrink-0" />
                <span>{bedrooms ? `${bedrooms} Beds` : property.type || '1 Unit'}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1">
                <Bath size={13} className="text-stone-400 shrink-0" />
                <span>{bathrooms ? `${bathrooms} Baths` : '1 Bath'}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1">
                <Maximize size={13} className="text-stone-400 shrink-0" />
                <span>{area ? `${area} sq.ft` : 'Standard'}</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Customer Visit Request Button on Property Card - cleanly placed outside Link */}
        <div className="px-4 pb-3">
          {!isClosed ? (
            <button
              type="button"
              onClick={handleOpen}
              className="w-full p-2.5 bg-[#ecf2e4] hover:bg-[#d8edb3] rounded-xl border border-[#d6dcd3] flex items-center justify-between gap-2 transition-all cursor-pointer shadow-xs group/btn"
              title="Click to view visit requests"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-white/80 text-[#163e35] shrink-0 border border-[#d6dcd3]">
                  <Calendar size={14} />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-[#163e35] whitespace-nowrap">
                    Visit Request
                  </span>
                  {/* Pulsing live dotted notification indicator when new request has arrived */}
                  {hasNewRequests && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      <span>{unseenRequests.length} New</span>
                    </span>
                  )}
                </div>
              </div>

              <span className="px-2.5 py-1 bg-white hover:bg-stone-50 text-[#163e35] rounded-lg text-xs font-bold border border-[#d6dcd3] shrink-0 shadow-2xs group-hover/btn:border-[#163e35]/40 transition-colors">
                View Details
              </span>
            </button>
          ) : (
            <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 text-center">
              Closed • Hidden from website
            </div>
          )}
        </div>

        {/* Card Actions Footer: Edit, Close / Re-open */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/properties/${property._id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Edit property details"
            >
              <Edit size={13} />
              <span>Edit</span>
            </Link>
          </div>

          <div>
            {!isClosed ? (
              <button
                type="button"
                disabled={busy === property._id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose(property._id);
                }}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg text-xs font-semibold border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer"
                title="Close listing and remove from public website"
              >
                {busy === property._id ? 'Closing…' : 'Close'}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy === property._id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReopen(property._id);
                }}
                className="px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title="Re-open listing to make visible on website again"
              >
                {busy === property._id ? 'Opening…' : 'Re-open'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Visit Requests Modal with Accept action if opened standalone */}
      {!onOpenRequests && (
        <PropertyRequestsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          property={property}
          requests={requests}
          onAcceptRequest={onAcceptRequest}
          busyId={busy}
        />
      )}
    </>
  );
}
