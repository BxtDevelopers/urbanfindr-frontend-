'use client';

import Link from 'next/link';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  CheckCircle2,
  Award,
  Lock
} from 'lucide-react';

export default function BuilderProjectsBanner() {
  const topBadges = [
    { label: 'High ROI', icon: TrendingUp },
    { label: 'Prime Investment', icon: Compass },
    { label: 'Exclusive Opportunities', icon: Sparkles },
  ];

  const bottomBadges = [
    { label: 'RERA Approved', icon: ShieldCheck },
    { label: 'Secure Future', icon: Lock },
    { label: 'High Appreciation', icon: Award },
  ];

  return (
    <section 
      className="wrap !pt-20 sm:!pt-24 !pb-10 overflow-visible relative" 
      aria-label="Builder Projects High-Yield Investments"
    >
      {/* Banner Container: Rich Forest Green Theme with generous size */}
      <div className="relative overflow-visible rounded-3xl bg-gradient-to-r from-[#11352c] via-[#164338] to-[#0f2e27] border border-[#2b6858]/60 shadow-[0_20px_60px_rgba(15,46,39,0.35)] p-7 sm:p-10 lg:p-14 min-h-[360px] lg:min-h-[400px] flex items-center">
        
        {/* Concentric Ambient Light Rings (matching reference image) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {/* Soft ambient radial glow */}
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-radial from-[#d8edb3]/15 via-emerald-950/20 to-transparent blur-3xl" />
          
          {/* Subtle concentric ripple circles */}
          <div className="absolute right-[5%] lg:right-[14%] top-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/10" />
          <div className="absolute right-[5%] lg:right-[14%] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/5" />
          <div className="absolute right-[5%] lg:right-[14%] top-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-white/[0.03]" />
          <div className="absolute right-[5%] lg:right-[14%] top-1/2 -translate-y-1/2 w-[740px] h-[740px] rounded-full border border-white/[0.02]" />
        </div>

        {/* 2-Column Content Grid */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* ── LEFT SIDE: Project Details & Information (7 Columns) ── */}
          <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-4">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#d8edb3] text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3.5 shadow-sm">
              <Building2 size={14} className="text-[#d8edb3]" />
              <span>Direct Developer Projects</span>
            </div>

            {/* Main Headline */}
            <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl xl:!text-[40px] font-extrabold text-white tracking-tight leading-[1.18] m-0">
              Discover High-Yield <br />
              <span className="text-[#d8edb3]">Builder Projects</span> & Communities
            </h2>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed mt-3.5 max-w-xl">
              Unlock exclusive investment opportunities, verified RERA-approved gated communities, and properties with high returns directly from reputable builders.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 my-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/95 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-[#d8edb3]" />
                Zero Brokerage
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/95 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-[#d8edb3]" />
                Direct Developer Pricing
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/95 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-[#d8edb3]" />
                100% RERA Verified
              </span>
            </div>

            {/* CTA Button: Know More */}
            <div className="pt-1">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#d8edb3] text-forest font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Know More</span>
                <ChevronRight size={17} strokeWidth={2.75} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT SIDE: Floating Badges & 3D Builder Project Image (5 Columns) ── */}
          <div className="lg:col-span-5 relative w-full flex flex-col justify-between items-center lg:items-end min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
            
            {/* Floating Badges (Top Area - matching reference image arrangement) */}
            <div className="relative z-20 w-full flex flex-col gap-2 items-center lg:items-end mb-3">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {topBadges.map(({ label, icon: Icon }) => (
                  <div 
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold shadow-md hover:bg-white/25 transition select-none"
                  >
                    <Icon size={12} className="text-[#d8edb3]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {bottomBadges.map(({ label, icon: Icon }) => (
                  <div 
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold shadow-md hover:bg-white/25 transition select-none"
                  >
                    <Icon size={12} className="text-[#d8edb3]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 
              Builder Project 3D Image:
              "the image should be 75% in the section and 25% outside from the top"
              Using -translate-y-[25%] so exactly 25% of the image extends above the top border of the card!
            */}
            <div className="relative z-10 w-full flex justify-center lg:justify-end overflow-visible">
              <div className="w-[85%] sm:w-[75%] lg:w-[125%] xl:w-[130%] max-w-[500px] lg:max-w-none lg:-mr-6 lg:-translate-y-[25%] transition-transform duration-300 pointer-events-none">
                <img
                  src="/photos/builder-project-3d.png"
                  alt="Modern luxury builder project and gated community"
                  className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
