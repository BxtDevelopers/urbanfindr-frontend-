'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, History, Plus } from 'lucide-react';
import { cityGuides } from '@/lib/catalog';

export default function MultiLocationInput({
  selectedCity = '',
  initialValue = '',
  onChange,
  placeholder = 'Add localities (e.g. Gachibowli, Kondapur)...'
}) {
  const [locations, setLocations] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const containerRef = useRef(null);

  // Initialize from props or comma-separated string
  useEffect(() => {
    if (initialValue) {
      const parts = initialValue.split(',').map(s => s.trim()).filter(Boolean);
      setLocations(parts.slice(0, 5));
    }
  }, [initialValue]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('urbanfindr_recent_searches') || localStorage.getItem('urbanfinder_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 4));
      }
    } catch {}
  }, []);

  // Sync to parent & persist recent searches
  const notifyChange = (newLocations) => {
    setLocations(newLocations);
    const value = newLocations.join(', ');
    onChange?.(value);

    if (newLocations.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('urbanfindr_recent_searches') || localStorage.getItem('urbanfinder_recent_searches') || '[]');
        const updated = [newLocations[newLocations.length - 1], ...stored.filter(x => x !== newLocations[newLocations.length - 1])].slice(0, 5);
        localStorage.setItem('urbanfindr_recent_searches', JSON.stringify(updated));
        setRecentSearches(updated);
      } catch {}
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute available suggestions based on input & selected city
  useEffect(() => {
    const query = inputValue.trim().toLowerCase();
    let pool = [];

    if (selectedCity) {
      const cityData = cityGuides.find(c => c.name.toLowerCase() === selectedCity.toLowerCase());
      pool = cityData ? cityData.localities : [];
    } else {
      pool = [...new Set(cityGuides.flatMap(c => c.localities))];
    }

    if (!query) {
      // Show top localities not already selected
      setSuggestions(pool.filter(loc => !locations.some(l => l.toLowerCase() === loc.toLowerCase())).slice(0, 6));
    } else {
      setSuggestions(
        pool.filter(loc =>
          loc.toLowerCase().includes(query) &&
          !locations.some(l => l.toLowerCase() === loc.toLowerCase())
        ).slice(0, 6)
      );
    }
  }, [inputValue, selectedCity, locations]);

  const addLocation = (loc) => {
    const trimmed = loc.trim();
    if (!trimmed) return;
    if (locations.length >= 5) return;
    if (locations.some(l => l.toLowerCase() === trimmed.toLowerCase())) return;

    const next = [...locations, trimmed];
    notifyChange(next);
    setInputValue('');
    setIsOpen(false);
  };

  const removeLocation = (indexToRemove) => {
    const next = locations.filter((_, i) => i !== indexToRemove);
    notifyChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addLocation(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && locations.length > 0) {
      removeLocation(locations.length - 1);
    }
  };

  return (
    <div className="multi-location-container relative" ref={containerRef}>
      {/* Hidden input ensuring native form submissions submit comma-separated locations */}
      <input type="hidden" name="q" value={locations.join(', ')} />
      <input type="hidden" name="localities" value={locations.join(', ')} />

      <div
        className="multi-location-box flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-stone-200 bg-white min-h-[46px] focus-within:border-forest transition"
        onClick={() => setIsOpen(true)}
      >
        <MapPin size={17} className="text-forest flex-shrink-0 ml-1" />

        {/* Removable chips */}
        {locations.map((loc, idx) => (
          <span
            key={loc}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest/10 text-forest border border-forest/20 animate-fadeIn"
          >
            {loc}
            <button
              type="button"
              className="hover:text-red-600 transition flex items-center justify-center p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                removeLocation(idx);
              }}
              aria-label={`Remove ${loc}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Input for typing / suggestions */}
        {locations.length < 5 ? (
          <input
            type="text"
            className="flex-1 min-w-[140px] border-none outline-none text-sm bg-transparent px-1"
            placeholder={locations.length === 0 ? placeholder : 'Add another location...'}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="text-xs muted px-2">Maximum 5 locations reached</span>
        )}
      </div>

      {/* Autocomplete suggestions dropdown */}
      {isOpen && suggestions.length > 0 && locations.length < 5 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden text-sm">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
            <span>Suggested Localities {selectedCity ? `in ${selectedCity}` : ''}</span>
            <span className="text-[10px] lowercase text-stone-400">up to 5 locations</span>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {suggestions.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-forest/5 hover:text-forest flex items-center justify-between transition"
                  onClick={() => addLocation(item)}
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={13} className="text-stone-400" />
                    {item}
                  </span>
                  <Plus size={14} className="text-stone-300 hover:text-forest" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Searches Pills */}
      {recentSearches.length > 0 && locations.length === 0 && (
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          <span className="muted flex items-center gap-1 text-[11px]">
            <History size={12} /> Recent:
          </span>
          <div className="flex flex-wrap gap-1">
            {recentSearches.map((rec) => (
              <button
                type="button"
                key={rec}
                className="px-2 py-0.5 rounded border border-stone-200 text-stone-600 hover:border-forest hover:text-forest bg-stone-50 transition text-[11px]"
                onClick={() => addLocation(rec)}
              >
                {rec}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
