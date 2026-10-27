'use client';

import React from 'react';
import { 
  Headset, 
  Users, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

export default function InteriorHeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-white min-h-[460px] sm:min-h-[500px] flex items-center border-b border-stone-200/70" aria-label="UrbanInteriors Hero">
      
      {/* Full Photographic Living Room Background - Rich & Elegant */}
      <div 
        className="absolute inset-0 bg-cover bg-center md:bg-right-bottom brightness-[0.88] contrast-[1.08] saturate-[1.05]"
        style={{ backgroundImage: `url('/photos/interior-hero-bg.jpg')` }}
      />

      {/* Subtle Right-Side Depth Overlay */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-[55%] bg-gradient-to-l from-black/20 via-black/10 to-transparent pointer-events-none" />

      {/* Solid White behind text, smoothly transitioning into soft shade over the image */}
      <div 
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #ffffff 0%, #ffffff 40%, rgba(255, 255, 255, 0.94) 45%, rgba(255, 255, 255, 0.72) 53%, rgba(255, 255, 255, 0.36) 63%, rgba(255, 255, 255, 0.12) 71%, transparent 78%)'
        }}
      />

      {/* Mobile Vertical Fade Mask for stacked layout */}
      <div 
        className="md:hidden absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 58%, rgba(255, 255, 255, 0.85) 72%, transparent 95%)'
        }}
      />

      {/* Main Container */}
      <div className="wrap relative z-10 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-xl flex flex-col items-start">
          
          {/* Brand Badge: Small card with cream background and light green text on 'interiors' & 'finder' */}
          <div className="inline-flex items-center gap-2.5 bg-[#f0e2cd] backdrop-blur-md px-4 py-2 rounded-xl shadow-xs border border-[#dec5a2] mb-6">
            <span className="font-extrabold text-lg text-forest tracking-tight">
              urban<span className="text-[#55822e]">interiors</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-stone-400" />
            <span className="text-xs text-stone-600 font-medium">
              by <strong className="text-forest font-bold">urban<span className="text-[#55822e]">finder</span></strong>
            </span>
          </div>

          {/* Main Headline - In Website Theme Forest Green */}
          <h1 className="!text-3xl sm:!text-4xl lg:!text-5xl font-medium text-forest tracking-tight leading-[1.18] mb-6">
            Find the right <span className="font-black text-forest">Interior</span>
            <br />
            <span className="font-black text-forest">Designer</span> for your home
          </h1>

          {/* 3 Value Propositions - In Website Theme Forest Green */}
          <div className="space-y-3.5 mb-7 text-sm sm:text-base text-forest">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#edf2e2] border border-[#d6e2cd] flex items-center justify-center shrink-0 text-forest shadow-xs">
                <Headset size={16} strokeWidth={2.2} />
              </span>
              <span className="text-forest leading-snug">
                1:1 Consultation with <strong className="font-black text-forest">Design Expert</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#edf2e2] border border-[#d6e2cd] flex items-center justify-center shrink-0 text-forest shadow-xs">
                <Users size={16} strokeWidth={2.2} />
              </span>
              <span className="text-forest leading-snug">
                Meet <strong className="font-black text-forest">Verified Designers</strong> shortlisted for you
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#edf2e2] border border-[#d6e2cd] flex items-center justify-center shrink-0 text-forest shadow-xs">
                <FileText size={16} strokeWidth={2.2} />
              </span>
              <span className="text-forest leading-snug">
                Compare <strong className="font-black text-forest">quotes, materials &amp; specs</strong> with expert help
              </span>
            </div>
          </div>

          {/* Trust Badge - In Theme Forest Green */}
          <div className="inline-flex items-center gap-2 bg-[#edf2e2] px-4 py-2 rounded-full border border-[#d6e2cd] text-forest font-bold text-xs sm:text-sm shadow-xs">
            <ShieldCheck size={16} className="text-forest shrink-0 stroke-[2.4]" />
            <span className="text-forest">+50,000 Smiles Delivered</span>
          </div>

        </div>
      </div>
    </section>
  );
}
