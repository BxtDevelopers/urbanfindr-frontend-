'use client';

import React from 'react';

const FEATURES = [
  {
    title: '10 Years Warranty',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Transparent Pricing',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="15" cy="8" r="5" />
        <path d="M13.5 6h3M13.5 7.5h3M13.5 6c1 0 1.8.8 1.8 1.8 0 1-.8 1.8-1.8 1.8l2 2" strokeWidth="1.4" />
        <path d="M2 13h4l3 3h5l4-4h2" />
        <path d="M2 17h4l4 4h5" />
      </svg>
    ),
  },
  {
    title: 'Unmatched Quality & Finish',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="9" r="6" />
        <polygon points="12,6.5 13,8.5 15,8.8 13.5,10.2 14,12.2 12,11.2 10,12.2 10.5,10.2 9,8.8 11,8.5" fill="currentColor" fillOpacity="0.2" strokeWidth="1.2" />
        <path d="M8.5 14.5L7 21l5-2.5 5 2.5-1.5-6.5" />
      </svg>
    ),
  },
  {
    title: 'Dedicated RM',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="7" r="3.5" />
        <path d="M4 18c0-3.5 3.1-6 7-6 1.8 0 3.4.5 4.6 1.5" />
        <path d="M15.5 15.5c.5-.5 1.5-.5 2 0l1 1c.5.5.5 1.5 0 2-1 1-3.5 0-5.5-2s-3-4.5-2-5.5c.5-.5 1.5-.5 2 0l1 1c.5.5.5 1.5 0 2" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: 'Stringent quality checks',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 3l5 2v4c0 3.5-2.5 6-5 7.5-2.5-1.5-5-4-5-7.5V5l5-2z" />
        <path d="m11 9 1.5 1.5 3-3" />
        <path d="M3 14h4l3 3h5l3-3" />
        <path d="M3 18h4l3 3h3" />
      </svg>
    ),
  },
  {
    title: 'Real-time Cost Estimates',
    customBadge: (
      <span className="font-black text-lg tracking-tight text-forest">
        UIQE
      </span>
    ),
  },
];

export default function InteriorRatingsStrip() {
  return (
    <div className="wrap relative z-20 -mt-8 sm:-mt-10 md:-mt-12 mb-6 sm:mb-8" aria-label="UrbanInteriors Quality Highlights">
      <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(22,62,53,0.08)] border border-stone-200/90 py-6 sm:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 lg:gap-2">
          {FEATURES.map((item) => (
            <div 
              key={item.title} 
              className="flex flex-col items-center text-center px-2 group"
            >
              {/* Rounded Square Icon Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-[#d6e2cd] flex items-center justify-center text-forest bg-[#f7f9f3] shadow-xs group-hover:border-forest group-hover:bg-forest group-hover:text-lime transition-all duration-200 mb-3">
                {item.customBadge || item.icon}
              </div>

              {/* Title / Label */}
              <span className="text-xs sm:text-sm font-semibold text-stone-800 text-center leading-snug max-w-[130px]">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
