'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Crosshair,
  Compass,
  ShieldCheck,
  Check,
  Loader2,
  AlertCircle,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { CITY_CENTERS, getCityCenter, getTileSources } from '@/lib/geo';

/**
 * Free geocoding suggestion fetcher using Photon (OpenStreetMap data)
 * Optimized for high-speed autocomplete without API keys.
 */
async function fetchSuggestions(query, centerCoords) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6`;
  if (centerCoords?.lat && centerCoords?.lng) {
    url += `&lat=${centerCoords.lat}&lon=${centerCoords.lng}`;
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Photon geocode failed');
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      return data.features.map((f) => {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const parts = [p.name, p.street, p.district, p.city, p.state, p.country].filter(Boolean);
        return {
          id: `${coords[0]}-${coords[1]}-${p.osm_id || Math.random()}`,
          name: p.name || parts[0] || 'Unknown place',
          displayName: parts.join(', '),
          locality: p.name || p.district || p.city || '',
          city: p.city || p.county || '',
          state: p.state || '',
          lat: coords[1],
          lng: coords[0],
          type: p.osm_value || 'locality',
        };
      });
    }
  } catch (err) {
    // Fallback to OSM Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&limit=5&q=${encodeURIComponent(
        cleanQuery
      )}`;
      const res2 = await fetch(nomUrl, {
        headers: { 'User-Agent': 'UrbanFindr-PropertyLocationPicker/1.0' },
        signal: AbortSignal.timeout(4000),
      });
      if (res2.ok) {
        const nomData = await res2.json();
        return nomData.map((item) => ({
          id: item.place_id,
          name: item.name || item.display_name.split(',')[0],
          displayName: item.display_name,
          locality:
            item.address?.suburb ||
            item.address?.neighbourhood ||
            item.address?.residential ||
            item.name ||
            '',
          city: item.address?.city || item.address?.town || item.address?.state_district || '',
          state: item.address?.state || '',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'place',
        }));
      }
    } catch (_) {}
  }
  return [];
}

/**
 * Reverse geocode {lat, lng} to human readable locality and address
 */
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'UrbanFindr-PropertyLocationPicker/1.0' },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    return {
      displayName: data.display_name || '',
      locality:
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.commercial ||
        addr.road ||
        '',
      city: addr.city || addr.town || addr.municipality || addr.state_district || '',
      state: addr.state || '',
      road: addr.road || '',
      postcode: addr.postcode || '',
    };
  } catch (_) {
    return null;
  }
}

export default function PropertyLocationPicker({
  city = 'Bengaluru',
  locality = '',
  address = '',
  coordinates = null,
  locationPrecision = 'exact',
  radiusMeters = 500,
  hideExactAddress = false,
  onCityChange,
  onLocalityChange,
  onAddressChange,
  onCoordinatesChange,
  onPrecisionChange,
  onRadiusChange,
  onHideExactAddressChange,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [mapTileStyle, setMapTileStyle] = useState('osm'); // 'osm' | 'streets'
  const [isMapReady, setIsMapReady] = useState(false);

  // Fallback coords if none specified
  const cityCenter = getCityCenter(city);
  const activeLat = Number(coordinates?.lat) || cityCenter.lat;
  const activeLng = Number(coordinates?.lng) || cityCenter.lng;

  // Debounced search-as-you-type autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await fetchSuggestions(searchQuery, { lat: activeLat, lng: activeLng });
      setSuggestions(results);
      setIsSearching(false);
      setShowSuggestions(true);
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery, activeLat, activeLng]);

  // Update map marker and circle when coords or precision changes
  const updateMapVisuals = useCallback(
    (L, map, lat, lng, precision, radius) => {
      if (!map || !L) return;

      // 1. Remove previous marker and circle
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }

      // 2. Custom Pin Icon
      const pinIcon = L.divIcon({
        className: 'uf-picker-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            background: #163e35;
            color: #d4e844;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid white;
            cursor: grab;
          ">
            <span style="transform: rotate(45deg); font-size: 16px; font-weight: bold; line-height: 1;">📍</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      // 3. Render Marker
      const marker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
        title: 'Drag to adjust exact location',
      }).addTo(map);

      marker.on('dragend', async (e) => {
        const newPos = e.target.getLatLng();
        onCoordinatesChange?.({ lat: newPos.lat, lng: newPos.lng });

        // Update circle if in approximate mode
        if (circleRef.current) {
          circleRef.current.setLatLng(newPos);
        }

        // Reverse geocode new position to suggest locality
        setLocationStatus('Resolving dropped pin address...');
        const geoInfo = await reverseGeocode(newPos.lat, newPos.lng);
        if (geoInfo) {
          if (geoInfo.locality && !locality) onLocalityChange?.(geoInfo.locality);
          if (geoInfo.city && geoInfo.city !== city && onCityChange) onCityChange(geoInfo.city);
          setLocationStatus(`Pinned near ${geoInfo.locality || geoInfo.displayName}`);
        } else {
          setLocationStatus('Coordinates updated.');
        }
      });

      markerRef.current = marker;

      // 4. Render Approximate Circle if precision is 'approximate'
      if (precision === 'approximate') {
        const circle = L.circle([lat, lng], {
          radius: radius || 500,
          color: '#d97706',
          fillColor: '#d97706',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '6, 6',
        }).addTo(map);

        circle.bindTooltip(`Approximate Area (~${radius || 500}m radius)`, {
          permanent: false,
          direction: 'top',
        });

        circleRef.current = circle;
      }
    },
    [city, locality, onCityChange, onCoordinatesChange, onLocalityChange]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: 14,
        zoomControl: false,
      });

      // Free default tile sources
      const tileUrl =
        mapTileStyle === 'streets'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Click on map to place pin
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        onCoordinatesChange?.({ lat, lng });
        updateMapVisuals(L, map, lat, lng, locationPrecision, radiusMeters);

        setLocationStatus('Resolving selected point...');
        const geoInfo = await reverseGeocode(lat, lng);
        if (geoInfo) {
          if (geoInfo.locality && !locality) onLocalityChange?.(geoInfo.locality);
          setLocationStatus(`Pinned at ${geoInfo.locality || 'selected point'}`);
        } else {
          setLocationStatus('Point selected on map.');
        }
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
      updateMapVisuals(L, map, activeLat, activeLng, locationPrecision, radiusMeters);
    }

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapTileStyle]); // Re-mount when style changes

  // Update visuals when activeLat, activeLng, locationPrecision, or radiusMeters changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import('leaflet').then((L) => {
      updateMapVisuals(
        L,
        mapInstanceRef.current,
        activeLat,
        activeLng,
        locationPrecision,
        radiusMeters
      );
    });
  }, [activeLat, activeLng, locationPrecision, radiusMeters, isMapReady, updateMapVisuals]);

  // Handle Current Location via Browser GPS
  async function handleGetCurrentLocation() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Getting your live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        onCoordinatesChange?.({ lat, lng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }

        setLocationStatus('Reverse geocoding address...');
        const geoInfo = await reverseGeocode(lat, lng);
        if (geoInfo) {
          if (geoInfo.locality) onLocalityChange?.(geoInfo.locality);
          if (geoInfo.city && onCityChange) onCityChange(geoInfo.city);
          if (geoInfo.road && !address) {
            onAddressChange?.(
              `${geoInfo.road}, ${geoInfo.locality || ''} ${geoInfo.postcode || ''}`.trim()
            );
          }
          setLocationStatus(`Location detected: ${geoInfo.locality || geoInfo.displayName}`);
        } else {
          setLocationStatus('GPS coordinates captured.');
        }

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('');
        let msg = 'Could not access location.';
        if (err.code === 1) msg = 'Location permission denied. Please search or pick on map.';
        if (err.code === 2) msg = 'Location unavailable. Please search for your locality.';
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Handle selecting a search suggestion
  function handleSelectSuggestion(sug) {
    setShowSuggestions(false);
    setSearchQuery('');

    const lat = Number(sug.lat);
    const lng = Number(sug.lng);

    onCoordinatesChange?.({ lat, lng });
    if (sug.locality) onLocalityChange?.(sug.locality);
    if (sug.city && onCityChange) onCityChange(sug.city);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    }

    setLocationStatus(`Centered on: ${sug.name} (${sug.locality || sug.city})`);
  }

  return (
    <div className="space-y-4">
      {/* Search Bar + Use Current Location Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            {isSearching ? <Loader2 size={16} className="animate-spin text-forest" /> : <Search size={16} />}
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search address, landmark, society or locality on map..."
            className="input pl-10 pr-4 text-xs sm:text-sm py-2.5 w-full bg-white border border-stone-300 rounded-xl shadow-2xs focus:ring-2 focus:ring-forest focus:border-forest"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              Clear
            </button>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden divide-y divide-stone-100 max-h-64 overflow-y-auto no-scrollbar">
              <div className="px-3 py-1.5 bg-stone-50 text-[10px] uppercase font-bold tracking-wider text-stone-500 flex items-center justify-between">
                <span>Free Autocomplete (OpenStreetMap)</span>
                <span>Select to fly on map</span>
              </div>
              {suggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-forest/5 flex items-start gap-2.5 transition text-xs"
                >
                  <MapPin size={15} className="text-forest shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{sug.name}</p>
                    <p className="text-stone-500 text-[11px] truncate">{sug.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use Current Location Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest font-semibold text-xs transition border border-forest/20 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 size={15} className="animate-spin text-forest" />
          ) : (
            <Crosshair size={15} className="text-forest" />
          )}
          <span>{isLocating ? 'Detecting GPS...' : 'Use Current Location'}</span>
        </button>
      </div>

      {/* Location Status Notice */}
      {locationStatus && (
        <div className="flex items-center gap-2 text-xs text-forest bg-forest/5 border border-forest/15 px-3 py-1.5 rounded-lg animate-in fade-in duration-200">
          <Sparkles size={13} className="text-forest shrink-0" />
          <span className="font-medium">{locationStatus}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Preview Container */}
      <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-sm bg-stone-100 h-64 sm:h-72 w-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Header Overlay with Controls */}
        <div className="absolute top-2.5 left-2.5 z-400 flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[11px] font-semibold text-stone-800 border border-stone-200/90 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Click or drag pin to adjust</span>
          </div>
        </div>

        {/* Map Tile Switcher (Bottom Right) */}
        <div className="absolute bottom-2.5 right-2.5 z-400 flex items-center gap-1 bg-white/95 backdrop-blur p-1 rounded-lg border border-stone-200 shadow-md">
          <button
            type="button"
            onClick={() => setMapTileStyle('osm')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition ${
              mapTileStyle === 'osm' ? 'bg-forest text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            OSM
          </button>
          <button
            type="button"
            onClick={() => setMapTileStyle('streets')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition ${
              mapTileStyle === 'streets' ? 'bg-forest text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Streets
          </button>
        </div>

        {/* Zoom In / Out Controls (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-400 flex flex-col gap-1 bg-white/95 backdrop-blur p-1 rounded-lg border border-stone-200 shadow-md">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded text-xs font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded text-xs font-bold"
            title="Zoom Out"
          >
            &minus;
          </button>
        </div>
      </div>

      {/* ── Precision Selector Cards ── */}
      <div className="mt-4 pt-3 border-t border-stone-200">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
          Public Map Display & Privacy Setting
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Exact Pinpoint */}
          <div
            onClick={() => {
              onPrecisionChange?.('exact');
              onHideExactAddressChange?.(false);
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
              locationPrecision === 'exact'
                ? 'border-forest bg-forest/5 shadow-xs'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  locationPrecision === 'exact'
                    ? 'bg-forest text-white'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Exact Pinpoint (GPS)</h4>
                  {locationPrecision === 'exact' && (
                    <Check size={16} className="text-forest font-bold" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  Show precise building / gate location marker to home seekers.
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Approximate Area Circle */}
          <div
            onClick={() => {
              onPrecisionChange?.('approximate');
              onHideExactAddressChange?.(true);
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
              locationPrecision === 'approximate'
                ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  locationPrecision === 'approximate'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                <Compass size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    Approximate Area (~{radiusMeters}m Circle)
                  </h4>
                  {locationPrecision === 'approximate' && (
                    <Check size={16} className="text-amber-700 font-bold" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  Recommended for privacy. Renders a soft neighborhood circle; exact address shared only on visit booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Approximate Area Radius Options (if approximate is active) */}
        {locationPrecision === 'approximate' && (
          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-amber-900 font-medium flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-amber-700" />
              Circle Area Radius:
            </span>
            <div className="flex items-center gap-1.5">
              {[300, 500, 1000].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRadiusChange?.(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    radiusMeters === r
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-400'
                  }`}
                >
                  {r === 1000 ? '1 km' : `${r}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates readout */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1">
          <span>
            Selected Coordinates: <strong>{activeLat.toFixed(5)}°N, {activeLng.toFixed(5)}°E</strong>
          </span>
          <span className="capitalize font-semibold text-stone-500">
            Precision: {locationPrecision}
          </span>
        </div>
      </div>
    </div>
  );
}

