'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BRAND_LIST = [
  {
    id: 'wove',
    name: 'Wove Projects',
    logo: (
      <div className="flex flex-col items-center justify-center">
        <span className="text-[#a01a1e] font-black text-2xl tracking-widest leading-none font-sans">
          WOVE
        </span>
        <span className="text-[#a01a1e] text-[8.5px] font-bold tracking-widest mt-1 uppercase">
          Projects &amp; Interiors
        </span>
      </div>
    ),
  },
  {
    id: 'hcd',
    name: 'HCD',
    logo: (
      <div className="flex items-stretch bg-black rounded p-1 shadow-xs border border-stone-800">
        <div className="flex items-center px-1.5 py-0.5">
          <span className="text-white font-black text-sm tracking-tight">HC</span>
          <span className="w-5 h-5 rounded-full bg-[#e65c00] text-white flex items-center justify-center text-xs font-black mx-0.5">
            D
          </span>
          <span className="text-white font-bold text-xs tracking-tight">REAM</span>
        </div>
        <div className="border-l border-stone-700 pl-1.5 pr-1 flex flex-col justify-center text-[7px] text-[#f59e0b] font-bold leading-tight uppercase">
          <span>Interior</span>
          <span>Design</span>
          <span>Solutions</span>
        </div>
      </div>
    ),
  },
  {
    id: 'designcafe',
    name: 'DesignCafe',
    logo: (
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 3L3 14h6v14h14V14h6L16 3z" fill="#008891" />
          <path d="M12 28V16h8v12H12z" fill="#fff" />
        </svg>
        <div className="flex flex-col text-left">
          <span className="text-[#a0522d] font-black text-sm tracking-tight leading-tight">
            DESIGN<span className="text-[#008891]">CAFE</span>
          </span>
          <span className="text-stone-400 text-[7.5px] font-semibold tracking-wider uppercase">
            More room for joy
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'decotales',
    name: 'Decotales',
    logo: (
      <div className="flex items-center bg-black text-white px-3 py-1.5 rounded-full shadow-xs">
        <span className="w-5 h-5 rounded-full border border-white flex items-center justify-center font-serif text-xs font-bold mr-1.5">
          D
        </span>
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-[11px] tracking-wider">DECOTALES</span>
          <span className="text-[6.5px] text-stone-300 tracking-tight uppercase">
            Spinning Your Dream Home
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'homzinterio',
    name: 'Homzinterio',
    logo: (
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className="text-[#f59e0b] font-black text-lg">H</span>
          <span className="text-[#1a2e3b] font-black text-base tracking-tight">OMZINTERIO</span>
        </div>
        <span className="text-stone-400 text-[8px] font-medium tracking-tight mt-0.5">
          Smart Interiors, Beautiful Homes
        </span>
      </div>
    ),
  },
  {
    id: 'asian-paints',
    name: 'Asian Paints',
    logo: (
      <div className="flex flex-col items-center justify-center">
        <span className="text-[#d90429] font-black text-lg tracking-tighter">
          asianpaints
        </span>
        <span className="text-forest text-[8.5px] font-bold tracking-wider uppercase bg-[#edf2e2] px-2 py-0.5 rounded-full mt-0.5">
          Beautiful Homes
        </span>
      </div>
    ),
  },
  {
    id: 'livspace',
    name: 'Livspace',
    logo: (
      <div className="flex items-center gap-1.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#e63946" aria-hidden="true">
          <path d="M12 2L2 12h4v8h12v-8h4L12 2z" />
        </svg>
        <span className="text-[#e63946] font-black text-lg tracking-tight">livspace</span>
      </div>
    ),
  },
  {
    id: 'homelane',
    name: 'HomeLane',
    logo: (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 bg-[#f77f00] rounded-sm flex items-center justify-center text-white font-bold text-xs">
          H
        </div>
        <span className="text-[#2b2d42] font-black text-base tracking-tight">
          Home<span className="text-[#f77f00]">Lane</span>
        </span>
      </div>
    ),
  },
  {
    id: 'bonito-designs',
    name: 'Bonito Designs',
    logo: (
      <div className="flex flex-col items-center justify-center">
        <span className="font-serif text-forest font-black text-base tracking-widest uppercase">
          BONITO
        </span>
        <span className="text-[#C19A6B] text-[7.5px] font-bold tracking-[0.25em] uppercase">
          DESIGNS
        </span>
      </div>
    ),
  },
  {
    id: 'arrivae',
    name: 'Arrivae',
    logo: (
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded bg-[#8d5b4c] text-white flex items-center justify-center font-bold text-xs">
          A
        </span>
        <span className="text-[#8d5b4c] font-black text-base tracking-wider uppercase">
          ARRIVAE
        </span>
      </div>
    ),
  },
  {
    id: 'spacemaker',
    name: 'Spacemaker',
    logo: (
      <div className="flex flex-col items-center justify-center">
        <span className="text-stone-900 font-extrabold text-sm tracking-[0.2em] uppercase">
          SPACE MAKER
        </span>
        <span className="text-stone-400 text-[8px] font-medium tracking-wider">
          Interiors &amp; Living
        </span>
      </div>
    ),
  },
  {
    id: 'qarpentri',
    name: 'Qarpentri',
    logo: (
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full border-2 border-forest flex items-center justify-center font-black text-[11px] text-forest">
          Q
        </span>
        <span className="text-forest font-black text-base tracking-tight">Qarpentri</span>
      </div>
    ),
  },
];

export default function InteriorBrandCollective() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 260 * 2;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Duplicate list to create a seamless infinite loop
  const extendedBrands = [...BRAND_LIST, ...BRAND_LIST];

  return (
    <section className="w-full bg-[#fbfbf9] py-14 sm:py-18 lg:py-20 border-t border-stone-200/80 overflow-hidden" aria-label="Our Signature Brand Collective">
      <div className="wrap">
        
        {/* Section Heading & Subtitle - Exact reference copy & layout */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-extrabold text-[#1f2723] tracking-tight leading-tight mb-2.5">
            Our Signature Brand Collective
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            A curated selection of premium interior partners, chosen for their timeless design, impeccable quality, and enduring craftsmanship.
          </p>
        </div>

      </div>

      {/* Moving Carousel Container with manual navigation arrows */}
      <div className="relative w-full group/carousel">
        
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-stone-200 shadow-lg text-stone-700 hover:text-forest hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-stone-200 shadow-lg text-stone-700 hover:text-forest hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>

        {/* Fade gradient masks on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#fbfbf9] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#fbfbf9] to-transparent z-10 pointer-events-none" />

        {/* Continuous Smooth Auto-Scrolling Marquee Track */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-3 px-4"
        >
          <div className="flex gap-4 sm:gap-5 shrink-0 animate-brand-scroll hover:[animation-play-state:paused]">
            {extendedBrands.map((brand, idx) => (
              <div
                key={`${brand.id}-${idx}`}
                className="w-[210px] sm:w-[230px] h-[130px] sm:h-[140px] bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md hover:border-forest/40 hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col items-center justify-between shrink-0 select-none cursor-pointer group"
              >
                {/* Brand Logo / Emblem - Centered */}
                <div className="flex-1 flex items-center justify-center w-full px-2 group-hover:scale-105 transition-transform duration-200">
                  {brand.logo}
                </div>

                {/* Brand Name Label - Bottom */}
                <span className="text-xs sm:text-[13px] font-medium text-stone-600 text-center tracking-tight truncate w-full pt-1 border-t border-stone-100">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Inline styles for continuous smooth 60fps marquee */}
      <style jsx>{`
        @keyframes brandScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-brand-scroll {
          animation: brandScroll 32s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

