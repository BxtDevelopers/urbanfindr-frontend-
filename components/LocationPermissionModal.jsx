'use client';

import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { useUserLocation } from './LocationContext';

export default function LocationPermissionModal() {
  const {
    promptOpen,
    dismissPrompt,
    enableLocation,
    loading,
  } = useUserLocation();

  const [mounted, setMounted] = useState(false);
  const [host, setHost] = useState('localhost:3000');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setHost(window.location.host || 'urbanfindr.in');
    }
  }, []);

  if (!mounted || !promptOpen) return null;

  function handleAllowAlways() {
    enableLocation(true);
  }

  function handleAllowOnce() {
    enableLocation(false);
  }

  function handleNeverAllow() {
    dismissPrompt(true);
  }

  return (
    <aside
      role="dialog"
      aria-labelledby="location-prompt-heading"
      aria-describedby="location-prompt-desc"
      className="fixed top-3 left-3 sm:left-10 z-[99999] animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="w-[316px] sm:w-[330px] bg-white rounded-[22px] shadow-[0_10px_35px_-5px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.08)] border border-stone-200/90 p-4 sm:p-5 select-none font-sans">
        {/* Header row: hostname + close button */}
        <div className="flex items-center justify-between gap-2">
          <span id="location-prompt-heading" className="text-[15px] font-bold text-[#1f1f1f] truncate">
            {host} wants to
          </span>
          <button
            type="button"
            onClick={dismissPrompt}
            aria-label="Close"
            className="p-1 -mr-1 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
          >
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>

        {/* Feature line: Pin icon + Know your location */}
        <div id="location-prompt-desc" className="flex items-center gap-2.5 mt-2.5 text-[#3c4043]">
          <MapPin size={17} className="shrink-0 stroke-[2]" />
          <span className="text-[14px] font-normal">Know your location</span>
        </div>

        {/* Action Buttons: Exact 3 light-blue pill buttons */}
        <div className="flex flex-col gap-2.5 mt-4">
          <button
            type="button"
            onClick={handleAllowAlways}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-[#bceefb] hover:bg-[#a7e8fa] active:bg-[#97e3f7] text-[#001d35] text-[13.5px] font-medium text-center transition cursor-pointer disabled:opacity-70 shadow-xs"
          >
            Allow while visiting the site
          </button>

          <button
            type="button"
            onClick={handleAllowOnce}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-[#bceefb] hover:bg-[#a7e8fa] active:bg-[#97e3f7] text-[#001d35] text-[13.5px] font-medium text-center transition cursor-pointer disabled:opacity-70 shadow-xs"
          >
            Allow this time
          </button>

          <button
            type="button"
            onClick={handleNeverAllow}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-[#bceefb] hover:bg-[#a7e8fa] active:bg-[#97e3f7] text-[#001d35] text-[13.5px] font-medium text-center transition cursor-pointer disabled:opacity-70 shadow-xs"
          >
            Never allow
          </button>
        </div>
      </div>
    </aside>
  );
}
