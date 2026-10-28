'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Building,
  Home,
  X,
  Compass,
  Info,
} from 'lucide-react';
import { money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import {
  getCoordinatesForProperty,
  getCityCenter,
  getTileSources,
  groupPropertiesByLocality,
} from '@/lib/geo';

export default function PropertyMapView({ properties = [], city = 'Bengaluru' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const tileLayerRef = useRef(null);

  const [selectedPropId, setSelectedPropId] = useState(properties[0]?._id || null);
  const [mapStyle, setMapStyle] = useState('osm'); // 'osm' | 'streets' | 'satellite' | 'mapbox_streets' | 'maptiler'
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [localityFilter, setLocalityFilter] = useState('all');
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeCluster, setActiveCluster] = useState(null);
  const [clusterPurposeFilter, setClusterPurposeFilter] = useState('all');

  // Tile sources (supports optional Mapbox / MapTiler keys from .env.local while defaulting to free Carto/OSM)
  const tileSources = useMemo(() => getTileSources(), []);

  // Filter properties according to local purpose & locality filters
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchPurpose = purposeFilter === 'all' || p.purpose === purposeFilter;
      const matchLocality = localityFilter === 'all' || p.locality === localityFilter;
      return matchPurpose && matchLocality;
    });
  }, [properties, purposeFilter, localityFilter]);

  // Group properties into locality clusters so multiple properties in same locality don't overlap
  const clusters = useMemo(() => {
    return groupPropertiesByLocality(filteredProperties, city);
  }, [filteredProperties, city]);

  // Unique localities present in current properties list
  const availableLocalities = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => {
      if (p.locality) set.add(p.locality);
    });
    return Array.from(set).sort();
  }, [properties]);

  // Selected property object
  const selectedProp = useMemo(() => {
    return (
      filteredProperties.find((p) => p._id === selectedPropId) ||
      properties.find((p) => p._id === selectedPropId) ||
      filteredProperties[0] ||
      null
    );
  }, [selectedPropId, filteredProperties, properties]);

  // Close active cluster modal on ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setActiveCluster(null);
      }
    }
    if (activeCluster) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeCluster]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Dynamically import Leaflet so SSR does not fail
      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const cityCenter = getCityCenter(city);
      const initialCenter = [cityCenter.lat, cityCenter.lng];
      const initialZoom = cityCenter.zoom || 12;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false, // Custom styled zoom controls
        attributionControl: false,
      });

      // Add Attribution in bottom-right
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('OpenStreetMap &bull; UrbanFindr')
        .addTo(map);

      // Add Base Tile Layer
      const baseSource = tileSources[mapStyle] || tileSources.osm;
      const tileLayer = L.tileLayer(baseSource.url, {
        attribution: baseSource.attrib,
        maxZoom: baseSource.maxZoom,
        subdomains: baseSource.subdomains,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city]);

  // 2. Switch Tile Layer when style changes
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

  // 3. Render Markers on Map whenever clusters or selectedPropId change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      if (!clusters.length) return;

      const bounds = L.latLngBounds([]);

      clusters.forEach((item) => {
        const latLng = [item.lat, item.lng];
        bounds.extend(latLng);

        if (item.type === 'single') {
          // Single property in this locality: render direct price pill
          const prop = item.property;
          const isSelected = selectedProp?._id === prop._id;
          const purposeClass =
            prop.purpose === 'rent'
              ? 'rent'
              : prop.purpose === 'pg'
              ? 'pg'
              : prop.purpose === 'commercial'
              ? 'commercial'
              : 'buy';

          const priceLabel = money(prop.price);
          const markerHtml = `
            <div class="uf-marker-pill ${purposeClass} ${isSelected ? 'selected' : ''}" title="${prop.title}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${priceLabel}</span>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'uf-marker-container',
            html: markerHtml,
            iconSize: [85, 30],
            iconAnchor: [42, 15],
            popupAnchor: [0, -18],
          });

          const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

          marker.on('click', () => {
            setSelectedPropId(prop._id);
            map.panTo(latLng, { animate: true, duration: 0.5 });
          });

          markersRef.current.push(marker);
        } else {
          // Clustered 2 or more properties in the same locality
          const minPriceLabel = money(item.minPrice);
          const dotsHtml = item.purposes?.length
            ? `<div class="uf-cluster-dots">${item.purposes.map((p) => `<span class="uf-cluster-dot ${p}"></span>`).join('')}</div>`
            : '';
          const clusterHtml = `
            <div class="uf-cluster-pill" title="Click to inspect all ${item.count} properties in ${item.locality}">
              <span class="uf-cluster-count">${item.count}</span>
              <div class="uf-cluster-body">
                <span class="uf-cluster-locality">${item.locality}</span>
                <span class="uf-cluster-price">from ${minPriceLabel}</span>
                ${dotsHtml}
              </div>
            </div>
          `;

          const clusterIcon = L.divIcon({
            className: 'uf-cluster-container',
            html: clusterHtml,
            iconSize: [120, 38],
            iconAnchor: [60, 19],
            popupAnchor: [0, -20],
          });

          const marker = L.marker(latLng, { icon: clusterIcon }).addTo(map);

          marker.bindTooltip(
            `<strong>${item.count} Properties</strong> in ${item.locality}<br/><span style="color:#163e35;font-weight:600">Click to view all</span>`,
            { direction: 'top', offset: [0, -18], opacity: 0.95 }
          );

          marker.on('click', () => {
            setActiveCluster(item);
            setClusterPurposeFilter('all');
            map.panTo(latLng, { animate: true, duration: 0.5 });
          });

          markersRef.current.push(marker);
        }
      });

      // Fit bounds if we have valid coordinates
      if (bounds.isValid() && clusters.length > 0) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
        });
      }
    });
  }, [clusters, selectedProp?._id, isMapReady, city]);

  // Recenter / Fit All
  function handleFitAll() {
    if (!mapInstanceRef.current || !clusters.length) return;
    import('leaflet').then((L) => {
      const bounds = L.latLngBounds([]);
      clusters.forEach((item) => {
        bounds.extend([item.lat, item.lng]);
      });
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    });
  }

  // Pan to selected property
  function handlePanToSelected(prop) {
    if (!mapInstanceRef.current || !prop) return;
    const coords = getCoordinatesForProperty(prop, city);
    mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 0.5 });
    setSelectedPropId(prop._id);
  }

  // Next / Previous navigation in preview panel
  function handleNextProperty(direction) {
    if (!filteredProperties.length) return;
    const currentIndex = filteredProperties.findIndex((p) => p._id === selectedProp?._id);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = filteredProperties.length - 1;
    if (nextIndex >= filteredProperties.length) nextIndex = 0;
    const target = filteredProperties[nextIndex];
    if (target) {
      handlePanToSelected(target);
    }
  }

  const imgList = selectedProp ? propertyImages(selectedProp) : [];

  return (
    <div className="my-6 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      {/* ── TOP MAP CONTROLS & LOCALITY STRIP ── */}
      <div className="p-3.5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Region Info & Purpose Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-lg shadow-2xs text-xs font-semibold text-stone-800">
            <Navigation size={13} className="text-forest" />
            <span>{city} Metro Region</span>
            <span className="text-forest font-bold">({filteredProperties.length} mapped)</span>
          </div>

          {/* Quick Purpose Filter Chips */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-lg text-xs font-medium">
            {[
              { id: 'all', label: 'All' },
              { id: 'buy', label: 'Buy' },
              { id: 'rent', label: 'Rent' },
              { id: 'pg', label: 'PG / Co-living' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPurposeFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  purposeFilter === tab.id
                    ? 'bg-white text-forest shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Map Style Switcher & Fit View */}
        <div className="flex items-center gap-2">
          {/* Layer Switcher */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setMapStyle('osm')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mapStyle === 'osm'
                  ? 'bg-white text-forest shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Standard OpenStreetMap (100% Free, No Watermark, No Key Required)"
            >
              OSM
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mapStyle === 'streets'
                  ? 'bg-white text-forest shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Streets (Esri World Street Map - Free, Clean, No Watermark)"
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                mapStyle === 'satellite'
                  ? 'bg-white text-forest shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Satellite (Esri World Imagery - High Resolution)"
            >
              Satellite
            </button>
            {tileSources.mapbox_streets && (
              <button
                type="button"
                onClick={() => setMapStyle('mapbox_streets')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  mapStyle === 'mapbox_streets'
                    ? 'bg-white text-forest shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Mapbox Streets (Using NEXT_PUBLIC_MAPBOX_TOKEN)"
              >
                Mapbox
              </button>
            )}
            {tileSources.maptiler && (
              <button
                type="button"
                onClick={() => setMapStyle('maptiler')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  mapStyle === 'maptiler'
                    ? 'bg-white text-forest shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="MapTiler Streets (Using NEXT_PUBLIC_MAPTILER_KEY)"
              >
                MapTiler
              </button>
            )}
            {process.env.NEXT_PUBLIC_CARTO_KEY && (
              <button
                type="button"
                onClick={() => setMapStyle('voyager')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  mapStyle === 'voyager'
                    ? 'bg-white text-forest shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="CARTO Voyager (Using NEXT_PUBLIC_CARTO_KEY)"
              >
                CARTO
              </button>
            )}
          </div>

          {/* Reset / Fit Bounds Button */}
          <button
            type="button"
            onClick={handleFitAll}
            className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-700 hover:text-forest hover:bg-stone-50 transition shadow-2xs cursor-pointer"
            title="Fit all properties into view"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ── LOCALITY QUICK JUMP CHIPS (if available) ── */}
      {availableLocalities.length > 1 && (
        <div className="px-3.5 py-2 bg-[#fdfdfc] border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            Localities:
          </span>
          <button
            type="button"
            onClick={() => setLocalityFilter('all')}
            className={`px-2.5 py-0.5 rounded-full text-xs shrink-0 transition cursor-pointer ${
              localityFilter === 'all'
                ? 'bg-forest text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Localities
          </button>
          {availableLocalities.map((loc) => {
            const count = properties.filter((p) => p.locality === loc).length;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocalityFilter(loc);
                  const firstInLoc = properties.find((p) => p.locality === loc);
                  if (firstInLoc) handlePanToSelected(firstInLoc);
                }}
                className={`px-2.5 py-0.5 rounded-full text-xs shrink-0 flex items-center gap-1 transition cursor-pointer ${
                  localityFilter === loc
                    ? 'bg-forest text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{loc}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── MAP CANVAS & SIDE PREVIEW ── */}
      <div className="grid lg:grid-cols-12 min-h-[580px] relative">
        {/* MAP CONTAINER (8 cols on desktop, full on mobile) */}
        <div className="lg:col-span-8 relative min-h-[460px] lg:min-h-[580px] bg-[#eef1eb]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[580px]" />

          {/* Floating Map Zoom Controls (Top Left) */}
          <div className="absolute top-4 left-4 z-400 flex flex-col gap-1 bg-white/95 backdrop-blur rounded-lg shadow-md border border-stone-200/80 p-1">
            <button
              type="button"
              className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
          </div>

          {/* Floating Map Legend & Cluster Hint (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-400 flex flex-wrap items-center gap-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200/80 shadow-md">
            <span className="flex items-center gap-1.5" title="Dark Green pin = For Buy / Sale">
              <span className="w-2.5 h-2.5 rounded-full bg-[#163e35] inline-block shadow-2xs" /> Green: Buy
            </span>
            <span className="flex items-center gap-1.5" title="Orange pin = For Rent">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] inline-block shadow-2xs" /> Orange: Rent
            </span>
            <span className="flex items-center gap-1.5" title="Purple pin = PG / Co-living">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7e22ce] inline-block shadow-2xs" /> Purple: PG
            </span>
            <span className="flex items-center gap-1.5" title="Teal pin = Commercial space">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e] inline-block shadow-2xs" /> Teal: Commercial
            </span>
            <span className="flex items-center gap-1.5 border-l border-stone-200 pl-2.5 text-stone-600 font-normal">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#d4e844] text-[#0d2620] text-[10px] font-bold">2+</span>
              <span>Cluster (Click to view)</span>
            </span>
          </div>
        </div>

        {/* ── SELECTED PROPERTY PREVIEW PANEL (4 cols on desktop) ── */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-stone-200">
          {selectedProp ? (
            <div className="space-y-4">
              {/* Header with Purpose Badge & Navigation Buttons */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedProp.purpose === 'rent'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : selectedProp.purpose === 'buy'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : selectedProp.purpose === 'pg'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-teal-100 text-teal-900 border border-teal-200'
                  }`}
                >
                  {selectedProp.purpose === 'rent'
                    ? 'For Rent'
                    : selectedProp.purpose === 'buy'
                    ? 'For Buy'
                    : selectedProp.purpose === 'pg'
                    ? 'PG / Co-living'
                    : 'Commercial Space'}
                </span>

                {/* Prev / Next controls */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-400 font-mono mr-1">
                    {filteredProperties.findIndex((p) => p._id === selectedProp._id) + 1} of{' '}
                    {filteredProperties.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNextProperty(-1)}
                    className="p-1 rounded hover:bg-stone-100 text-stone-600 transition cursor-pointer"
                    title="Previous home on map"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNextProperty(1)}
                    className="p-1 rounded hover:bg-stone-100 text-stone-600 transition cursor-pointer"
                    title="Next home on map"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Photo Showcase */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 border border-stone-200 group">
                <img
                  src={imgList[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                  alt={selectedProp.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {selectedProp.verified && (
                  <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur text-forest text-[11px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border border-stone-200">
                    <Check size={12} className="text-emerald-700" /> Direct Verified
                  </span>
                )}
                <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  {imgList.length} photos
                </span>
              </div>

              {/* Title & Locality */}
              <div>
                <h3 className="font-bold text-base line-clamp-2 text-stone-900 leading-snug">
                  {selectedProp.title}
                </h3>
                <p className="text-stone-500 text-xs flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={13} className="text-forest shrink-0" />
                  <span>
                    {selectedProp.locality}, {selectedProp.city}
                  </span>
                </p>
              </div>

              {/* Specs Metric Strip */}
              <div className="py-2.5 px-3 bg-[#f8faf6] rounded-lg border border-stone-200/80 grid grid-cols-3 gap-2 text-center text-xs text-stone-700">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Layout</span>
                  <strong className="text-stone-900 block mt-0.5">
                    {selectedProp.bedrooms ? `${selectedProp.bedrooms} BHK` : selectedProp.type || '1 Unit'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Area</span>
                  <strong className="text-stone-900 block mt-0.5">
                    {selectedProp.area ? `${selectedProp.area.toLocaleString()} sq ft` : 'Spacious'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Furnishing</span>
                  <strong className="text-stone-900 block mt-0.5 capitalize truncate">
                    {selectedProp.furnishing?.replace('furnished', 'furn.') || 'Standard'}
                  </strong>
                </div>
              </div>

              {/* Price & Primary CTA */}
              <div className="pt-1">
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-extrabold text-forest tracking-tight">
                    {money(selectedProp.price)}
                  </span>
                  {selectedProp.purpose === 'rent' || selectedProp.purpose === 'pg' ? (
                    <span className="text-xs text-stone-500 font-medium">/ month</span>
                  ) : null}
                </div>

                <Link
                  href={`/properties/${selectedProp._id}`}
                  className="btn w-full text-center py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  View Full Details
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400 space-y-2">
              <MapPin size={32} className="mx-auto text-stone-300" />
              <p className="text-sm font-semibold text-stone-600">No properties mapped</p>
              <p className="text-xs text-stone-400">Try adjusting your locality or purpose filter.</p>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span>Powered by OpenStreetMap &amp; CARTO</span>
            <span className="flex items-center gap-1 text-forest font-semibold">
              <Sparkles size={11} /> Real GPS Coordinates
            </span>
          </div>
        </div>
      </div>

      {/* ── LOCALITY PROPERTIES MODAL (When 2+ properties in same locality are clicked) ── */}
      {activeCluster && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveCluster(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Properties in ${activeCluster.locality}`}
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[100vh] flex flex-col gap-y-6 overflow-hidden no-scrollbar animate-in zoom-in-95 duration-200"
          >
            {/* 1. Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#163e35] via-[#1b4a40] to-[#205347] text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-[#d4e844] shadow-xs">
                  <Building size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {activeCluster.locality}
                    </h2>
                    <span className="bg-[#d4e844] text-[#0d2620] text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                      {activeCluster.count} Properties Mapped
                    </span>
                  </div>
                  <p className="text-xs text-stone-200 flex items-center gap-2 mt-1">
                    <span>{activeCluster.city} Metro Region</span>
                    <span>&bull;</span>
                    <span>
                      Starting from <strong>{money(activeCluster.minPrice)}</strong>
                      {activeCluster.maxPrice > activeCluster.minPrice
                        ? ` up to ${money(activeCluster.maxPrice)}`
                        : ''}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCluster(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
                aria-label="Close cluster dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. Map Color Distinction Guide Banner */}
            <div className="px-5 sm:px-6 py-3 bg-[#f8faf6] border-b border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Info size={14} className="text-forest" />
                  Map Color Key:
                </span>
                <span className="text-stone-500 hidden md:inline">Why pins are different colors on map:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shadow-2xs" />
                  <span>Orange Pin = Rent</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold text-[11px] shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#163e35] shadow-2xs" />
                  <span>Green Pin = Buy / Sale</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-300 font-bold text-[11px] shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7e22ce] shadow-2xs" />
                  <span>Purple Pin = PG</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-300 font-bold text-[11px] shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e] shadow-2xs" />
                  <span>Teal Pin = Commercial</span>
                </span>
              </div>
            </div>

            {/* 3. Purpose Filter Tabs with Color Dots */}
            {activeCluster.purposes?.length > 1 && (
              <div className="px-5 sm:px-6 py-2.5 bg-white border-b border-stone-200/70 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar">
                <span className="text-stone-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
                  Filter by Type:
                </span>
                <button
                  type="button"
                  onClick={() => setClusterPurposeFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    clusterPurposeFilter === 'all'
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Properties ({activeCluster.count})
                </button>
                {activeCluster.purposes.map((pId) => {
                  const pCount = activeCluster.properties.filter((p) => p.purpose === pId).length;
                  const dotColor =
                    pId === 'rent'
                      ? 'bg-[#d97706]'
                      : pId === 'buy'
                      ? 'bg-[#163e35]'
                      : pId === 'pg'
                      ? 'bg-[#7e22ce]'
                      : 'bg-[#0f766e]';
                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => setClusterPurposeFilter(pId)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer flex items-center gap-1.5 ${
                        clusterPurposeFilter === pId
                          ? 'bg-forest text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span>{pId === 'rent' ? 'For Rent' : pId === 'buy' ? 'For Sale' : pId}</span>
                      <span className="opacity-75">({pCount})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. Spacious, Uncluttered Property Cards List */}
            <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-5 bg-[#fbfcf9]">
              {activeCluster.properties
                .filter(
                  (p) => clusterPurposeFilter === 'all' || p.purpose === clusterPurposeFilter
                )
                .map((prop) => {
                  const pImages = propertyImages(prop);
                  const isSelected = selectedPropId === prop._id;
                  const isRent = prop.purpose === 'rent';
                  const isBuy = prop.purpose === 'buy';
                  const isPg = prop.purpose === 'pg';

                  return (
                    <div
                      key={prop._id}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                        isSelected
                          ? 'ring-2 ring-forest border-transparent'
                          : 'border-stone-200/90 hover:border-stone-300'
                      } ${
                        isRent
                          ? 'border-l-[6px] border-l-[#d97706]'
                          : isBuy
                          ? 'border-l-[6px] border-l-[#163e35]'
                          : isPg
                          ? 'border-l-[6px] border-l-[#7e22ce]'
                          : 'border-l-[6px] border-l-[#0f766e]'
                      }`}
                    >
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
                        {/* Photo Column */}
                        <div className="md:w-60 h-48 md:h-auto md:min-h-[170px] rounded-xl overflow-hidden relative shrink-0 bg-stone-100 border border-stone-200/80 group">
                          <img
                            src={
                              pImages[0] ||
                              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80'
                            }
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Map Pin Color Badge directly on image */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 text-white ${
                                isRent
                                  ? 'bg-[#d97706]'
                                  : isBuy
                                  ? 'bg-[#163e35]'
                                  : isPg
                                  ? 'bg-[#7e22ce]'
                                  : 'bg-[#0f766e]'
                              }`}
                            >
                              <MapPin size={11} className="shrink-0" />
                              <span>
                                {isRent
                                  ? 'Orange Pin • For Rent'
                                  : isBuy
                                  ? 'Green Pin • For Sale'
                                  : isPg
                                  ? 'Purple Pin • PG'
                                  : 'Teal Pin • Commercial'}
                              </span>
                            </span>

                            {prop.verified && (
                              <span className="bg-white/95 backdrop-blur text-forest text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 border border-stone-200 w-fit">
                                <Check size={11} className="text-emerald-600" /> Direct Verified
                              </span>
                            )}
                          </div>

                          <span className="absolute bottom-2.5 right-2.5 bg-black/65 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                            {pImages.length} photos
                          </span>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Title & Price Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <h3 className="font-bold text-stone-900 text-base sm:text-lg leading-snug line-clamp-2">
                                  {prop.title}
                                </h3>
                                <p className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                                  <MapPin size={13} className="text-forest shrink-0" />
                                  <span>
                                    {prop.locality}, {prop.city}
                                  </span>
                                </p>
                              </div>

                              {/* Price Display */}
                              <div className="sm:text-right shrink-0">
                                <div className="flex sm:flex-col items-baseline sm:items-end gap-1">
                                  <span
                                    className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                                      isRent
                                        ? 'text-[#d97706]'
                                        : isBuy
                                        ? 'text-[#163e35]'
                                        : isPg
                                        ? 'text-[#7e22ce]'
                                        : 'text-[#0f766e]'
                                    }`}
                                  >
                                    {money(prop.price)}
                                  </span>
                                  {(isRent || isPg) && (
                                    <span className="text-xs text-stone-500 font-medium">/ month</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Specifications Row (Clean metric boxes) */}
                            <div className="grid grid-cols-3 gap-3 pt-3.5 mt-3 border-t border-stone-100 text-center">
                              <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                                <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                                  Layout
                                </span>
                                <strong className="text-stone-800 text-xs sm:text-sm block mt-0.5">
                                  {prop.bedrooms ? `${prop.bedrooms} BHK` : prop.type || 'Standard'}
                                </strong>
                              </div>
                              <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                                <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                                  Built Area
                                </span>
                                <strong className="text-stone-800 text-xs sm:text-sm block mt-0.5">
                                  {prop.area ? `${prop.area.toLocaleString()} sq ft` : 'Spacious'}
                                </strong>
                              </div>
                              <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                                <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                                  Furnishing
                                </span>
                                <strong className="text-stone-800 text-xs sm:text-sm block mt-0.5 capitalize truncate">
                                  {prop.furnishing?.replace('furnished', 'furn.') || 'Standard'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPropId(prop._id);
                                if (mapInstanceRef.current) {
                                  const coords = getCoordinatesForProperty(prop, city);
                                  mapInstanceRef.current.panTo([coords.lat, coords.lng], {
                                    animate: true,
                                    duration: 0.5,
                                  });
                                  mapInstanceRef.current.setZoom(16);
                                }
                                setActiveCluster(null);
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border shadow-2xs ${
                                isRent
                                  ? 'border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100'
                                  : isBuy
                                  ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100'
                                  : isPg
                                  ? 'border-purple-200 bg-purple-50/80 text-purple-900 hover:bg-purple-100'
                                  : 'border-teal-200 bg-teal-50/80 text-teal-900 hover:bg-teal-100'
                              }`}
                            >
                              <MapPin size={13} className="shrink-0" />
                              <span>Focus on Map Pin</span>
                            </button>

                            <Link
                              href={`/properties/${prop._id}`}
                              className="btn !py-2 !px-4 !text-xs !font-semibold flex items-center gap-1.5 shadow-sm"
                            >
                              <span>View Listing Details</span>
                              <ExternalLink size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 5. Modal Footer */}
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-forest" />
                <span>
                  Click <strong>Focus on Map Pin</strong> to zoom in directly to that home on the map.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setActiveCluster(null)}
                className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold cursor-pointer transition text-xs"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
