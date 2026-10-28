'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, ExternalLink } from 'lucide-react';
import { getCoordinatesForProperty } from '@/lib/geo';

export default function PropertyLocationMap({ item }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('voyager'); // 'voyager' | 'satellite'

  const coords = getCoordinatesForProperty(item, item?.city || 'Bengaluru');

  const tileSources = {
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attrib: 'Tiles &copy; Esri',
      maxZoom: 18,
      subdomains: '',
    },
  };

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
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('OpenStreetMap')
        .addTo(map);

      // Add Tile Layer
      const base = tileSources[mapStyle] || tileSources.voyager;
      L.tileLayer(base.url, {
        attribution: base.attrib,
        maxZoom: base.maxZoom,
        subdomains: base.subdomains,
      }).addTo(map);

      // Custom Pin Marker
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
  }, [coords.lat, coords.lng, mapStyle, item?.locality]);

  const externalMapUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`;

  return (
    <div className="panel mt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="flex items-center gap-2">
            <Navigation size={18} className="text-forest" />
            Neighborhood &amp; Locality Map
          </h3>
          <p className="text-xs muted mt-1">
            Exact geographical location in {item?.locality}, {item?.city}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Style toggle */}
          <div className="inline-flex items-center p-0.5 rounded-lg border border-stone-200 bg-stone-100 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMapStyle('voyager')}
              className={`px-2.5 py-1 rounded-md transition ${
                mapStyle === 'voyager' ? 'bg-white text-forest shadow-2xs font-semibold' : 'text-stone-600'
              }`}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-md transition ${
                mapStyle === 'satellite' ? 'bg-white text-forest shadow-2xs font-semibold' : 'text-stone-600'
              }`}
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

      {/* Map Canvas */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-stone-200 bg-[#eef1eb]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Zoom Controls */}
        <div className="absolute top-3 left-3 z-400 flex flex-col gap-1 bg-white/95 backdrop-blur rounded-lg shadow-sm border border-stone-200 p-1">
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition"
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
          <span>{item?.address || `${item?.locality}, ${item?.city}`}</span>
        </div>
      </div>
    </div>
  );
}
