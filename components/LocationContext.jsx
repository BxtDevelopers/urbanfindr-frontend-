'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { findNearestCity } from '@/lib/geo';
import LocationPermissionModal from './LocationPermissionModal';

const LocationContext = createContext(null);

const STORAGE_KEY_DENIED = 'urbanfindr_location_denied';
const STORAGE_KEY_PROMPT_DISMISSED = 'urbanfindr_location_prompt_dismissed';
const CACHE_KEY_COORDS = 'urbanfindr_user_coords';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour coordinate cache

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const isRequestingRef = useRef(false);

  // Apply coordinates and derive nearest city
  const applyCoordinates = useCallback((lat, lng, accuracy = null, persistPermanent = false) => {
    const nearest = findNearestCity(lat, lng);
    const coordsObj = {
      lat: Number(lat),
      lng: Number(lng),
      accuracy: accuracy != null ? Number(accuracy) : null,
      nearestCity: nearest?.name || null,
    };
    setLocation(coordsObj);
    setPermissionStatus('granted');
    setError(null);
    setPromptOpen(false);

    // Cache in sessionStorage for current session
    try {
      const payload = JSON.stringify({ ...coordsObj, timestamp: Date.now() });
      sessionStorage.setItem(CACHE_KEY_COORDS, payload);
      if (persistPermanent) {
        localStorage.setItem(CACHE_KEY_COORDS, payload);
      }
      localStorage.removeItem(STORAGE_KEY_DENIED);
      sessionStorage.removeItem(STORAGE_KEY_PROMPT_DISMISSED);
    } catch {}
  }, []);

  // Dismiss popup prompt
  const dismissPrompt = useCallback((permanent = false) => {
    setPromptOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY_PROMPT_DISMISSED, 'true');
      if (permanent) {
        localStorage.setItem(STORAGE_KEY_DENIED, 'true');
        setPermissionStatus('denied');
      }
    } catch {}
  }, []);

  // Open popup prompt explicitly
  const openLocationPrompt = useCallback(() => {
    setPromptOpen(true);
  }, []);

  // Request browser geolocation with robust fallback
  const requestLocation = useCallback(
    (forceUserAction = false, persistPermanent = false) => {
      // Check cached coordinates first if within TTL and not forced
      if (!forceUserAction) {
        try {
          const raw = sessionStorage.getItem(CACHE_KEY_COORDS) || localStorage.getItem(CACHE_KEY_COORDS);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.lat && parsed?.lng && Date.now() - (parsed.timestamp || 0) < CACHE_TTL_MS) {
              applyCoordinates(parsed.lat, parsed.lng, parsed.accuracy, false);
              return;
            }
          }
        } catch {}
      }

      if (isRequestingRef.current) return;
      isRequestingRef.current = true;
      setLoading(true);

      const handleFallback = async () => {
        try {
          const res = await fetch('/api/location/detect');
          const data = await res.json();
          if (data?.lat && data?.lng) {
            isRequestingRef.current = false;
            setLoading(false);
            applyCoordinates(data.lat, data.lng, 2000, persistPermanent);
            return;
          }
        } catch {}
        isRequestingRef.current = false;
        setLoading(false);
        applyCoordinates(17.3840501, 78.4563624, 2000, persistPermanent);
      };

      if (typeof window === 'undefined' || !navigator.geolocation) {
        handleFallback();
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000,
      };

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            isRequestingRef.current = false;
            setLoading(false);
            if (position?.coords) {
              applyCoordinates(
                position.coords.latitude,
                position.coords.longitude,
                position.coords.accuracy,
                persistPermanent
              );
            } else {
              handleFallback();
            }
          },
          (err) => {
            handleFallback();
          },
          options
        );
      } catch {
        handleFallback();
      }
    },
    [applyCoordinates]
  );

  // Manual enable triggered by user clicking "Allow while visiting the site" or "Allow this time"
  const enableLocation = useCallback(
    (persistPermanent = false) => {
      try {
        localStorage.removeItem(STORAGE_KEY_DENIED);
        sessionStorage.removeItem(STORAGE_KEY_PROMPT_DISMISSED);
      } catch {}
      requestLocation(true, persistPermanent);
    },
    [requestLocation]
  );

  // Initial mount: always open the location permission popup prompt on website open
  // Do not pre-select or auto-apply location before permission is given by the user
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    // Clear any previous cached coordinates on fresh page open so location is not pre-selected before user grants permission
    try {
      localStorage.removeItem(CACHE_KEY_COORDS);
      sessionStorage.removeItem(CACHE_KEY_COORDS);
      localStorage.removeItem(STORAGE_KEY_DENIED);
      sessionStorage.removeItem(STORAGE_KEY_PROMPT_DISMISSED);
    } catch {}

    // Ensure state starts clean and permission prompt pops up immediately
    setLocation(null);
    setPermissionStatus('prompt');
    setPromptOpen(true);
  }, []);

  const isLocationActive = isMounted && Boolean(location?.lat && location?.lng);

  return (
    <LocationContext.Provider
      value={{
        location,
        permissionStatus,
        loading,
        error,
        isLocationActive,
        isMounted,
        requestLocation,
        enableLocation,
        nearestCity: location?.nearestCity || null,
        promptOpen,
        openLocationPrompt,
        dismissPrompt,
      }}
    >
      {children}
      <LocationPermissionModal />
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return {
      location: null,
      permissionStatus: 'unavailable',
      loading: false,
      error: null,
      isLocationActive: false,
      isMounted: false,
      requestLocation: () => {},
      enableLocation: () => {},
      nearestCity: null,
      promptOpen: false,
      openLocationPrompt: () => {},
      dismissPrompt: () => {},
    };
  }
  return ctx;
}
