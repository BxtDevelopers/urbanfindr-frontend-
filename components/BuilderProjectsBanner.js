'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  PhoneCall, 
  Sparkles,
  Calendar,
  Building2,
  ShieldCheck
} from 'lucide-react';

const PROPERTIES = [
  {
    id: 'prop-1',
    badge: 'Ultra Luxury Penthouse',
    title: 'The Lumina Sky Crest',
    builder: 'Prestige Group & UrbanFinder Direct',
    location: 'Banjara Hills, Hyderabad',
    price: '₹ 14.85 Cr',
    pricePerSqFt: '₹ 24,500 / sq.ft',
    beds: 4,
    baths: 5,
    sqft: '6,050 sq.ft',
    handover: 'Q4 2027',
    description:
      'Sculptural modern tower boasting private cantilevered infinity sky decks, double-height ceilings, and panoramic skyline vistas directly from verified builders.',
    cutoutImage: '/images/towers/lumina-tower-cutout.png',
    alt: 'Lumina Sky Crest High-rise',
  },
  {
    id: 'prop-2',
    badge: 'Waterfront Gated Villa',
    title: 'Aura Marina Spire',
    builder: 'Sobha Developers & UrbanFinder Verified',
    location: 'Financial District, Hyderabad',
    price: '₹ 9.40 Cr',
    pricePerSqFt: '₹ 19,800 / sq.ft',
    beds: 3,
    baths: 4,
    sqft: '4,750 sq.ft',
    handover: 'Ready to Move',
    description:
      'Curvilinear architectural masterwork featuring energy-efficient acoustic façade glass, private high-speed biometric elevators, and tranquil lakeside views.',
    cutoutImage: '/images/towers/aura-spire-cutout.png',
    alt: 'Aura Marina Spire',
  },
];

export default function BuilderProjectsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? PROPERTIES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === PROPERTIES.length - 1 ? 0 : prev + 1));
  };

  const currentProp = PROPERTIES[currentIndex];

  return (
    <section className="wrap relative w-full !pt-24 !pb-12 overflow-visible" aria-label="Builder Projects Showcase">
      {/* 
        CRITICAL: Parent section has extra vertical padding (`!pt-24`)
        so the building popping out the top never gets truncated! 
      */}

      {/* Main Single Card Per View Container */}
      <div className="relative w-full overflow-visible">
        {/* The Card Box (70% Left Details, 30% Right Building) with UrbanFinder Forest Green Theme */}
        <div className="relative w-full min-h-[480px] lg:h-[500px] bg-gradient-to-r from-[#0f2e26] via-[#153e34] to-[#0c2620] border border-[#2b6858]/60 rounded-3xl p-6 md:p-10 lg:p-12 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,46,38,0.35)] flex flex-col md:flex-row justify-between items-stretch overflow-visible group">
          
          {/* Subtle Ambient Radial Glows behind the card */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d8edb3]/15 via-emerald-700/10 to-[#d8edb3]/10 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

          {/* Concentric Ambient Light Rings (Brand motif) */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute right-[5%] lg:right-[15%] top-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-white/10" />
            <div className="absolute right-[5%] lg:right-[15%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/5" />
            <div className="absolute right-[5%] lg:right-[15%] top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full border border-white/[0.03]" />
          </div>

          {/* =========================================
              LEFT COLUMN: 70% DETAILS
             ========================================= */}
          <div className="relative z-10 w-full md:w-[68%] lg:w-[70%] flex flex-col justify-between pr-0 md:pr-8 space-y-5">
            
            {/* Top row: Badge, Builder & Slide Index */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d8edb3] bg-white/10 border border-[#d8edb3]/30 rounded-full backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#d8edb3]" />
                  {currentProp.badge}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-white/75 bg-white/5 border border-white/10 rounded-md">
                  <ShieldCheck size={12} className="text-[#d8edb3]" />
                  RERA Registered
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-white/60">
                0{currentIndex + 1} / 0{PROPERTIES.length}
              </span>
            </div>

            {/* Title & Location */}
            <div>
              <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-extrabold tracking-tight text-white mb-2">
                {currentProp.title}
              </h2>
              <div className="flex items-center text-xs sm:text-sm text-white/80 gap-1.5">
                <MapPin className="w-4 h-4 text-[#d8edb3] shrink-0" />
                <span>{currentProp.location}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/70 flex items-center gap-1">
                  <Calendar size={13} className="text-[#d8edb3]" />
                  Handover: {currentProp.handover}
                </span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-black/35 border border-white/10 rounded-2xl backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs text-white/60 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-[#d8edb3]" /> Bedrooms
                </span>
                <span className="text-sm sm:text-base font-bold text-white mt-1">
                  {currentProp.beds} BHK
                </span>
              </div>
              <div className="flex flex-col border-x border-white/10 px-3">
                <span className="text-[11px] sm:text-xs text-white/60 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-[#d8edb3]" /> Bathrooms
                </span>
                <span className="text-sm sm:text-base font-bold text-white mt-1">
                  {currentProp.baths} Ensuite
                </span>
              </div>
              <div className="flex flex-col pl-1 sm:pl-2">
                <span className="text-[11px] sm:text-xs text-white/60 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-[#d8edb3]" /> Super Area
                </span>
                <span className="text-sm sm:text-base font-bold text-white mt-1">
                  {currentProp.sqft}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 md:line-clamp-3 leading-relaxed">
              {currentProp.description}
            </p>

            {/* Bottom Row: Price & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/15">
              <div>
                <div className="text-[11px] text-white/60 font-medium">Starting Price (Direct Developer)</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#d8edb3] tracking-tight">
                  {currentProp.price}
                  <span className="text-xs font-normal text-white/70 ml-2">
                    ({currentProp.pricePerSqFt})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link 
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d8edb3] hover:bg-[#c6df9b] active:scale-95 text-forest font-bold text-xs sm:text-sm rounded-xl transition duration-200 shadow-lg shadow-[#d8edb3]/20"
                >
                  <PhoneCall className="w-4 h-4" />
                  Schedule Private Viewing
                </Link>
                <Link
                  href="/projects"
                  className="hidden sm:inline-flex items-center justify-center gap-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition"
                >
                  All Projects
                </Link>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: 30% POP-OUT BUILDING
             ========================================= */}
          {/*
            DESKTOP: Absolute positioned to break out on top (-top-24 / -top-32)
            MOBILE: Anchored on right / bottom
          */}
          <div className="w-full md:w-[32%] lg:w-[30%] relative flex justify-center items-end pointer-events-none mt-6 md:mt-0">
            <div className="relative w-full h-[280px] sm:h-[320px] md:h-full flex items-end justify-center">
              
              {/* The Pop-out Image Element (75% inside, 25% outside from the top) */}
              <div className="absolute right-0 -bottom-4 md:-bottom-6 md:-top-24 lg:-top-28 w-[240px] sm:w-[280px] md:w-[320px] lg:w-[360px] max-w-none transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative w-full h-full min-h-[340px] sm:min-h-[400px] md:min-h-[520px]">
                  <Image
                    src={currentProp.cutoutImage}
                    alt={currentProp.alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 260px, (max-width: 1200px) 340px, 400px"
                    className="object-contain object-bottom drop-shadow-[0_-16px_28px_rgba(0,0,0,0.7)] drop-shadow-[0_20px_25px_rgba(216,237,179,0.15)] filter"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center justify-between mt-5 px-2">
          {/* Dots Indicator */}
          <div className="flex gap-2 items-center">
            {PROPERTIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-[#d8edb3]'
                    : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next / Prev Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              aria-label="Previous property"
              className="p-3 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-forest hover:border-[#163e35]/50 hover:bg-stone-50 transition active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next property"
              className="p-3 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-forest hover:border-[#163e35]/50 hover:bg-stone-50 transition active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
