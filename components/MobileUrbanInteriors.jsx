'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles, Armchair } from 'lucide-react';
import { BRAND_LIST } from './InteriorBrandCollective';

/**
 * Mobile-Only Urban Interiors Card (MagicBricks reference style)
 * Replaces the old interior banner exclusively on mobile (< lg).
 * - "urbanInteriors" brand heading
 * - "Why choose us?" white panel with 100+ brands
 * - "Save upto 40%" tag
 * - Moving Top Brands marquee carousel with exact laptop icons, colors & typography
 * - "Interior Designers" theme-colored button
 * - Clean UI without secondary quote link
 */
export default function MobileUrbanInteriors() {
  return (
    <section
      className="lg:hidden wrap pt-2 pb-6 px-4"
      aria-label="Urban Home Interiors"
    >
      {/* Outer Card with Website Theme Forest Green Gradient (#163e35) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#163e35] via-[#1a473d] to-[#12332c] p-4 sm:p-5 shadow-xl border border-[#26584d] text-center">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#d8edb3]/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header: Transform your Home with urbanInteriors */}
        <div className="relative z-10 pt-1 pb-3.5">
          <p className="text-[13px] sm:text-sm font-bold text-[#fbbf24] tracking-wide uppercase">
            Transform your Home with
          </p>
          <h3 className="text-2xl sm:text-[27px] font-black tracking-tight text-white flex items-center justify-center gap-1.5 mt-0.5">
            <span>urban</span>
            <span className="text-[#d8edb3]">Interiors</span>
            <Armchair size={22} className="text-[#d8edb3] ml-0.5" />
          </h3>
        </div>

        {/* 2. White Card: "Why choose us?" */}
        <div className="relative z-10 bg-white rounded-2xl p-4 sm:p-5 text-left shadow-sm border border-stone-100/90">
          <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-2.5">
            Why choose us?
          </h4>

          <div className="space-y-2.5 text-xs sm:text-[13px] text-stone-700 leading-relaxed">
            {/* Bullet 1: 100+ top verified interior brands */}
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={17} className="text-[#0d9488] shrink-0 mt-0.5" />
              <span>
                Compare &amp; choose from <strong className="font-bold text-stone-900">100+ top verified interior brands</strong>
              </span>
            </div>

            {/* Bullet 2: Instant interior cost calculator */}
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={17} className="text-[#0d9488] shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold text-stone-900">Calculate your interiors cost instantly</strong> with our advanced estimator
              </span>
            </div>
          </div>
        </div>

        {/* 3. "Save upto 40%" Badge */}
        <div className="relative z-10 flex items-center justify-start mt-3.5 mb-1 px-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#fbbf24] text-stone-950 text-[10.5px] font-black uppercase tracking-wider shadow-2xs">
            <Sparkles size={11} className="text-stone-950" />
            <span>Save upto 40%</span>
          </span>
        </div>

        {/* 4. "Top Brands" Moving Carousel (Continuous Infinite Marquee) */}
        <div className="relative z-10 flex items-center bg-white/95 backdrop-blur-xs rounded-xl py-2 px-2.5 border border-stone-200/90 shadow-2xs overflow-hidden my-2.5">
          {/* Static Left Label: Top Brands (somewhat bold / font-semibold, removed divider symbol) */}
          <div className="shrink-0 flex items-center pr-3 border-r border-stone-200 z-10 bg-white/95">
            <span className="text-[11px] font-semibold text-stone-700 leading-tight uppercase tracking-tight text-left select-none">
              Top<br />Brands
            </span>
          </div>

          {/* Marquee Track Container with exact same icons, text & colors as laptop */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-5 animate-marquee whitespace-nowrap py-1">
              {/* Render two duplicated loops for perfectly seamless infinite continuous scroll */}
              {[...BRAND_LIST, ...BRAND_LIST].map((brand, i) => (
                <div key={`${brand.id}-${i}`} className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center shrink-0 max-h-7 scale-[0.88] origin-center">
                    {brand.logo}
                  </div>
                  <span className="text-stone-300 text-xs font-light select-none">|</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Theme-Colored Primary Button: "Interior Designers" */}
        <div className="relative z-10 mt-3 pt-0.5">
          <Link
            href="/interiors"
            className="w-full flex items-center justify-center py-3.5 px-6 rounded-full bg-[#163e35] hover:bg-[#1f4a3f] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer border border-[#2b6658]"
          >
            Interior Designers
          </Link>
        </div>

        {/* CSS for Seamless 60fps Marquee Animation */}
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 24s linear infinite;
          }
          .animate-marquee:hover,
          .animate-marquee:active {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
}
