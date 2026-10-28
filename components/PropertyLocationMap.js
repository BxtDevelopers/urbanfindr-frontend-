'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, ExternalLink } from 'lucide-react';
import { getCoordinatesForProperty, getTileSources } from '@/lib/geo';

export default function PropertyLocationMap({ item }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('osm'); // 'osm' | 'streets' | 'satellite'

  const coords = getCoordinatesForProperty(item, item?.city || 'Bengaluru');
  const tileSources = useMemo(() => getTileSources(), []);

  const isApproximate =
    item?.locationPrecision === 'approximate' ||
    item?.coordinates?.precision === 'approximate' ||
    Boolean(item?.hideExactAddress);
  const radiusMeters = item?.radiusMeters || 500;
  const locality = item?.locality || 'the locality';
  const city = item?.city || 'Bengaluru';

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: isApproximate ? 14 : 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('OpenStreetMap &bull; UrbanFindr')
        .addTo(map);

      // Add Tile Layer (Default: OpenStreetMap - 100% free, no key, no watermark)
      const base = tileSources[mapStyle] || tileSources.osm;
      const layer = L.tileLayer(base.url, {
        attribution: base.attrib,
        maxZoom: base.maxZoom,
        subdomains: base.subdomains,
      }).addTo(map);
      tileLayerRef.current = layer;

      if (isApproximate) {
        // Render an L.circle on the map instead of a misleading single exact pinpoint
        const circle = L.circle([coords.lat, coords.lng], {
          radius: radiusMeters,
          color: '#163e35',
          fillColor: '#163e35',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '6, 6',
        }).addTo(map);

        circle.bindTooltip(
          `<strong>Approximate Area</strong><br/>Located within ~${radiusMeters}m in ${locality}, ${city}`,
          { direction: 'top', opacity: 0.95 }
        );
      } else {
        // Custom Pin Marker for exact properties
        const customIcon = L.divIcon({
          className: 'uf-marker-container',
          html: `
            <div class="uf-marker-pill buy selected" style="padding: 6px 12px; font-size: 12px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${item?.locality || 'Property Location'}</span>
            </div>
          `,
          iconSize: [120, 32],
          iconAnchor: [60, 16],
        });

        L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
      }

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords.lat, coords.lng, item?.locality, isApproximate, radiusMeters, locality, city]);

  // Switch Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const nextSource = tileSources[mapStyle] || tileSources.osm;
      const newLayer = L.tileLayer(nextSource.url, {
        attribution: nextSource.attrib,
        maxZoom: nextSource.maxZoom,
        subdomains: nextSource.subdomains,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    });
  }, [mapStyle, tileSources]);

  const externalMapUrl = isApproximate
    ? `https://www.openstreetmap.org/#map=15/${coords.lat}/${coords.lng}`
    : `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`;

  return (
    <div className="panel mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="flex items-center gap-2">
            <Navigation size={18} className="text-forest" />
            Neighborhood &amp; Locality Map
          </h3>
          <p className="text-xs muted mt-1">
            {isApproximate
              ? `Approximate geographical area in ${locality}, ${city}.`
              : `Exact geographical location in ${locality}, ${city}.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Style toggle */}
          <div className="inline-flex items-center p-0.5 rounded-lg border border-stone-200 bg-stone-100 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMapStyle('osm')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mapStyle === 'osm' ? 'bg-white text-forest shadow-2xs font-semibold' : 'text-stone-600'
              }`}
              title="Standard OpenStreetMap (100% Free, No Watermark)"
            >
              OSM
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mapStyle === 'streets' ? 'bg-white text-forest shadow-2xs font-semibold' : 'text-stone-600'
              }`}
              title="Esri World Street Map (Free, Clean Streets)"
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-white text-forest shadow-2xs font-semibold' : 'text-stone-600'
              }`}
              title="Esri Satellite Imagery"
            >
              Satellite
            </button>
          </div>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-link font-semibold flex items-center gap-1 hover:underline"
          >
            Open in OSM <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Prominent Banner for Approximate Precision */}
      {isApproximate && (
        <div className="mb-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 shadow-2xs">
          <span className="text-base leading-none shrink-0 mt-0.5">📍</span>
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-950">Approximate Area</strong>
            <span className="mx-1.5 text-amber-400 font-bold">•</span>
            <span>
              Located within ~{radiusMeters}m in {locality}, {city}. Exact building and street details are shared upon booking a visit for owner privacy.
            </span>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-stone-200 bg-[#eef1eb]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Zoom Controls */}
        <div className="absolute top-3 left-3 z-400 flex flex-col gap-1 bg-white/95 backdrop-blur rounded-lg shadow-sm border border-stone-200 p-1">
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
            onClick={() => mapInstanceRef.current?.setView([coords.lat, coords.lng], 14)}
            aria-label="Recenter"
            title="Recenter on property"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Locality badge in bottom left */}
        <div className="absolute bottom-3 left-3 z-400 bg-white/95 backdrop-blur border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-800 shadow-sm flex items-center gap-1.5">
          <MapPin size={13} className="text-forest" />
          <span>
            {isApproximate
              ? `Approximate Area: ${locality}, ${city}`
              : (item?.address || `${locality}, ${city}`)}
          </span>
        </div>
      </div>
    </div>
  );
}
