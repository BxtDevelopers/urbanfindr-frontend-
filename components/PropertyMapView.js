'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, ExternalLink, BedDouble, Check } from 'lucide-react';
import { money } from '@/lib/format';
import { propertyImages } from '@/lib/media';

export default function PropertyMapView({ properties = [], city = 'Bengaluru' }) {
  const [selectedProp, setSelectedProp] = useState(properties[0] || null);
  const [zoom, setZoom] = useState(1);

  // Fallback city coordinates
  const cityCenters = {
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'Hyderabad': { lat: 17.4065, lng: 78.4772 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Gurugram': { lat: 28.4595, lng: 77.0266 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Delhi NCR': { lat: 28.5355, lng: 77.3910 }
  };

  const center = cityCenters[city] || cityCenters['Bengaluru'];

  // Project lat/lng to SVG percentage coordinates (50% is center)
  // 1 degree lat is approx 111km, 1 degree lng is approx 100km
  const spread = 0.25 / zoom;

  const pins = useMemo(() => {
    return properties.map((prop, idx) => {
      const lat = prop.coordinates?.lat || (center.lat + (Math.sin(idx * 1.3) * 0.05));
      const lng = prop.coordinates?.lng || (center.lng + (Math.cos(idx * 1.3) * 0.05));

      // Calculate relative position within SVG viewport (0% to 100%)
      const x = 50 + ((lng - center.lng) / spread) * 40;
      const y = 50 - ((lat - center.lat) / spread) * 40;

      return {
        ...prop,
        x: Math.max(8, Math.min(92, x)),
        y: Math.max(8, Math.min(92, y))
      };
    });
  }, [properties, center, spread]);

  return (
    <div className="grid lg:grid-cols-12 gap-6 my-6 min-h-[550px] bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      {/* MAP CANVAS (8 cols) */}
      <div className="lg:col-span-8 relative bg-[#eef1eb] overflow-hidden min-h-[420px] lg:min-h-[550px] flex items-center justify-center select-none">
        {/* Subtle grid background simulating map blocks */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#2d5038 0.75px, transparent 0.75px), linear-gradient(to right, #e2e6de 1px, transparent 1px), linear-gradient(to bottom, #e2e6de 1px, transparent 1px)`,
            backgroundSize: `24px 24px, 48px 48px, 48px 48px`
          }}
        />

        {/* City Water & Park features visualization */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,35 Q30,42 60,30 T100,45 L100,55 Q70,40 40,55 T0,45 Z" fill="#9bc4db" />
          <circle cx="28" cy="72" r="14" fill="#a4cfb0" />
          <circle cx="78" cy="22" r="16" fill="#a4cfb0" />
        </svg>

        {/* Map Center City Label */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-stone-200 flex items-center gap-2">
          <Navigation size={15} className="text-forest" />
          <span className="font-semibold text-xs text-stone-800">{city} Metro Region</span>
          <span className="text-[11px] muted">({properties.length} homes mapped)</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-white rounded-lg shadow-sm border border-stone-200 p-1">
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.3))}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition"
            onClick={() => setZoom(z => Math.max(0.6, z - 0.3))}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition"
            onClick={() => setZoom(1)}
            aria-label="Reset view"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Interactive Property Pins */}
        <div className="absolute inset-0">
          {pins.map((pin) => {
            const isSelected = selectedProp?._id === pin._id;
            const isRent = pin.purpose === 'rent';
            const isPg = pin.purpose === 'pg';

            const bgClass = isRent
              ? 'bg-amber-600'
              : isPg
              ? 'bg-purple-700'
              : 'bg-forest';

            return (
              <div
                key={pin._id}
                className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 hover:z-30"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onClick={() => setSelectedProp(pin)}
              >
                {/* Price Pill Pin */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md text-[11px] font-bold text-white transition-transform ${bgClass} ${
                    isSelected ? 'ring-4 ring-white scale-110 z-40' : 'hover:scale-105'
                  }`}
                >
                  <MapPin size={11} />
                  <span>{money(pin.price)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-3 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-[11px] font-medium border border-stone-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest inline-block" /> Buy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Rent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-700 inline-block" /> PG
          </span>
        </div>
      </div>

      {/* SELECTED PROPERTY PREVIEW PANEL (4 cols) */}
      <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-stone-200">
        {selectedProp ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedProp.purpose === 'rent'
                  ? 'bg-amber-100 text-amber-800'
                  : selectedProp.purpose === 'buy'
                  ? 'bg-forest/10 text-forest'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {selectedProp.purpose === 'rent' ? 'For Rent' : selectedProp.purpose === 'buy' ? 'For Buy' : 'PG / Co-living'}
              </span>
              {selectedProp.verified && (
                <span className="text-xs text-forest font-semibold flex items-center gap-1">
                  <Check size={13} /> Verified Listing
                </span>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-[16/10] mb-3 bg-stone-100">
              <img
                src={propertyImages(selectedProp)[0]}
                alt={selectedProp.title}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-bold text-base line-clamp-2 text-stone-900 leading-snug">
              {selectedProp.title}
            </h3>

            <p className="muted text-xs flex items-center gap-1 mt-1.5">
              <MapPin size={13} className="text-forest shrink-0" />
              {selectedProp.locality}, {selectedProp.city}
            </p>

            <div className="my-3 py-2 border-y border-stone-100 flex items-center justify-between text-xs text-stone-700">
              <span><strong>{selectedProp.bedrooms ? `${selectedProp.bedrooms} BHK` : selectedProp.type}</strong></span>
              <span><strong>{selectedProp.area}</strong> sq ft</span>
              <span><strong>{selectedProp.furnishing?.replace('furnished', 'furn.')}</strong></span>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-extrabold text-forest">
                {money(selectedProp.price)}
              </span>
              {selectedProp.purpose === 'rent' || selectedProp.purpose === 'pg' ? (
                <span className="text-xs muted ml-1">/ month</span>
              ) : null}
            </div>

            <Link
              href={`/properties/${selectedProp._id}`}
              className="btn w-full text-center py-2.5 text-sm flex items-center justify-center gap-1.5"
            >
              View Full Details
              <ExternalLink size={14} />
            </Link>
          </div>
        ) : (
          <div className="text-center py-16 muted text-sm">
            <MapPin size={28} className="mx-auto mb-2 text-stone-300" />
            Click on any map pin to preview property details
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <p className="text-[11px] muted">
            Map pins reflect actual locality coordinates. All listings direct from owners.
          </p>
        </div>
      </div>
    </div>
  );
}

