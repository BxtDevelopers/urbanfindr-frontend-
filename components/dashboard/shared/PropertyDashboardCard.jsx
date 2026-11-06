'use client';

import Link from 'next/link';
import { money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import StatusBadge from './StatusBadge';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Eye,
  Edit,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';

export default function PropertyDashboardCard({ property, busy, onClose, onReopen }) {
  if (!property) return null;

  const images = propertyImages(property);
  const isRent = property.purpose === 'rent';
  const isBuy = property.purpose === 'buy';
  const isPg = property.purpose === 'pg';
  const isClosed = property.status === 'closed' || property.status === 'archived';

  const bedrooms = property.bedrooms || (property.type?.toLowerCase().includes('bhk') ? property.type : null);
  const bathrooms = property.bathrooms;
  const area = property.area || property.builtUpArea || property.carpetArea;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-xs hover:shadow-md ${
        isClosed ? 'border-stone-300 bg-stone-50/50' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Property Media Banner */}
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden group">
        <img
          src={images[0] || '/placeholder.jpg'}
          alt={property.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isClosed ? 'grayscale-[40%]' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
              isRent
                ? 'bg-amber-600 text-white'
                : isBuy
                ? 'bg-[#163e35] text-[#d8edb3]'
                : isPg
                ? 'bg-purple-700 text-white'
                : 'bg-stone-800 text-white'
            }`}
          >
            For {property.purpose}
          </span>
          <StatusBadge status={property.status} />
        </div>

        {/* Bottom Media Overlay: Price & Property Type */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10 flex items-end justify-between gap-2">
          <div>
            <div className="text-xl font-black drop-shadow-sm flex items-baseline gap-1">
              <span>{money(property.price)}</span>
              {(isRent || isPg) && <span className="text-xs font-normal text-stone-200">/ mo</span>}
            </div>
            <div className="text-xs text-stone-200 flex items-center gap-1 mt-0.5 drop-shadow-sm">
              <MapPin size={12} className="text-[#d8edb3] shrink-0" />
              <span className="truncate max-w-[200px]">
                {property.locality ? `${property.locality}, ` : ''}{property.city}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md text-stone-100 border border-white/10 shrink-0">
            {property.type || 'Residential'}
          </span>
        </div>
      </div>

      {/* Card Body with Detailed Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Title & Live Status */}
          <div>
            <Link
              href={`/properties/${property._id}`}
              className="font-bold text-stone-900 hover:text-[#163e35] transition-colors text-base line-clamp-1"
              title={property.title}
            >
              {property.title}
            </Link>

            {isClosed ? (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <XCircle size={12} className="shrink-0" />
                <span>Closed • Hidden from public website</span>
              </div>
            ) : (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 size={12} className="shrink-0" />
                <span>Live on website • Visible to customers</span>
              </div>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <BedDouble size={14} className="text-stone-500 shrink-0" />
              <span className="font-semibold truncate">
                {bedrooms ? `${bedrooms} Beds` : property.type || '1 Unit'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Bath size={14} className="text-stone-500 shrink-0" />
              <span className="font-semibold truncate">
                {bathrooms ? `${bathrooms} Baths` : '1 Bath'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Maximize size={14} className="text-stone-500 shrink-0" />
              <span className="font-semibold truncate">
                {area ? `${area} sq.ft` : 'Spacious'}
              </span>
            </div>
          </div>

          {/* Details / Amenities Tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {property.furnishing && (
              <span className="text-[10px] font-bold bg-[#ecf2e4] text-[#163e35] px-2 py-0.5 rounded-md">
                {property.furnishing}
              </span>
            )}
            {property.facing && (
              <span className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                Facing: {property.facing}
              </span>
            )}
            {property.floor !== undefined && property.totalFloors && (
              <span className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                Floor {property.floor}/{property.totalFloors}
              </span>
            )}
            {property.amenities?.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                {amenity}
              </span>
            ))}
            {property.amenities?.length > 3 && (
              <span className="text-[10px] font-medium text-stone-400">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Card Actions Footer: View, Edit, Close / Re-open */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/properties/${property._id}`}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Preview public property page"
            >
              <Eye size={13} />
              <span>View</span>
            </Link>

            <Link
              href={`/properties/${property._id}/edit`}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
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
                onClick={() => onClose(property._id)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200 flex items-center gap-1"
                title="Close listing and remove from public website"
              >
                <XCircle size={13} />
                <span>{busy === property._id ? 'Closing…' : 'Close'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={busy === property._id}
                onClick={() => onReopen(property._id)}
                className="px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Re-open listing to make visible on website again"
              >
                <RotateCcw size={13} />
                <span>{busy === property._id ? 'Opening…' : 'Re-open'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

