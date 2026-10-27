'use client';

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: (
      <>
        Book<br />Consultation
      </>
    ),
    illustration: (
      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="22" y="16" width="36" height="30" rx="3" fill="#f7f8f3" stroke="#163e35" strokeWidth="1.8" />
        <line x1="28" y1="24" x2="44" y2="24" stroke="#163e35" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="28" y1="30" x2="38" y2="30" stroke="#749546" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="36" x2="52" y2="36" stroke="#b2c4ad" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="46" x2="18" y2="60" stroke="#163e35" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="56" y1="46" x2="62" y2="60" stroke="#163e35" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="16" cy="38" r="4.5" fill="#749546" />
        <path d="M10 52c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#163e35" />
        <circle cx="64" cy="36" r="4.5" fill="#163e35" />
        <path d="M58 50c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#749546" />
        <circle cx="40" cy="42" r="4.5" fill="#163e35" />
        <path d="M34 56c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#163e35" />
      </svg>
    ),
  },
  {
    step: '2',
    title: (
      <>
        Meet<br />Designer
      </>
    ),
    illustration: (
      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="26" y="44" width="28" height="4" rx="2" fill="#163e35" />
        <line x1="32" y1="48" x2="32" y2="60" stroke="#163e35" strokeWidth="2.2" />
        <line x1="48" y1="48" x2="48" y2="60" stroke="#163e35" strokeWidth="2.2" />
        <rect x="36" y="41" width="8" height="3" rx="1" fill="#f7f8f3" stroke="#749546" strokeWidth="1.2" />
        <circle cx="33" cy="42" r="1.5" fill="#749546" />
        <circle cx="47" cy="42" r="1.5" fill="#163e35" />
        <circle cx="20" cy="32" r="5" fill="#749546" />
        <path d="M12 48c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#163e35" />
        <line x1="16" y1="48" x2="16" y2="60" stroke="#163e35" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="48" x2="22" y2="60" stroke="#163e35" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="32" r="5" fill="#163e35" />
        <path d="M52 48c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#749546" />
        <line x1="56" y1="48" x2="56" y2="60" stroke="#749546" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="62" y1="48" x2="62" y2="60" stroke="#749546" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '3',
    title: (
      <>
        Share your<br />requirements
      </>
    ),
    illustration: (
      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="30" y="16" width="36" height="46" rx="4" fill="#f7f8f3" stroke="#163e35" strokeWidth="1.8" />
        <rect x="42" y="12" width="12" height="6" rx="2" fill="#163e35" />
        <path d="M36 28l2 2 4-4" stroke="#749546" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="46" y1="28" x2="58" y2="28" stroke="#163e35" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 38l2 2 4-4" stroke="#749546" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="46" y1="38" x2="58" y2="38" stroke="#163e35" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 48l2 2 4-4" stroke="#749546" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="46" y1="48" x2="54" y2="48" stroke="#163e35" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="36" r="5" fill="#749546" />
        <path d="M12 56c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#163e35" />
        <line x1="24" y1="44" x2="34" y2="34" stroke="#749546" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '4',
    title: (
      <>
        Compare &<br />Finalise
      </>
    ),
    illustration: (
      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="28" r="5" fill="#163e35" />
        <path d="M35 27c0-3 2.2-5 5-5s5 2 5 5v3c0 2-2 3-5 3s-5-1-5-3v-3z" fill="#749546" />
        <path d="M32 50c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#163e35" />
        <path d="M33 44L22 38" stroke="#163e35" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M47 44L58 38" stroke="#163e35" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="14" y="24" width="12" height="15" rx="2" fill="#f7f8f3" stroke="#163e35" strokeWidth="1.6" />
        <line x1="17" y1="28" x2="23" y2="28" stroke="#163e35" strokeWidth="1.6" />
        <line x1="17" y1="32" x2="21" y2="32" stroke="#749546" strokeWidth="1.6" />
        <rect x="54" y="24" width="12" height="15" rx="2" fill="#f7f8f3" stroke="#749546" strokeWidth="1.6" />
        <line x1="57" y1="28" x2="63" y2="28" stroke="#749546" strokeWidth="1.6" />
        <line x1="57" y1="32" x2="61" y2="32" stroke="#163e35" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    step: '5',
    title: (
      <>
        Get quality<br />checked
      </>
    ),
    illustration: (
      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M22 36l18-14 18 14v22H22V36z" fill="#f7f8f3" stroke="#163e35" strokeWidth="1.8" />
        <rect x="35" y="44" width="10" height="14" fill="#749546" />
        <circle cx="24" cy="46" r="4.5" fill="#163e35" />
        <path d="M19 44a5 5 0 0 1 10 0z" fill="#749546" />
        <line x1="18" y1="44" x2="30" y2="44" stroke="#163e35" strokeWidth="1.5" />
        <path d="M16 60c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#163e35" />
        <circle cx="52" cy="40" r="9" stroke="#163e35" strokeWidth="2.5" fill="#fff" />
        <path d="M48 40l3 3 5-5" stroke="#749546" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="58" y1="47" x2="65" y2="54" stroke="#163e35" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '6',
    title: (
      <>
        Move-In Made<br />Beautiful
      </>
    ),
    illustration: (
      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M26 58V28a14 14 0 0 1 28 0v30" stroke="#163e35" strokeWidth="1.8" fill="#f7f8f3" />
        <line x1="20" y1="58" x2="60" y2="58" stroke="#163e35" strokeWidth="2" />
        <rect x="22" y="44" width="14" height="14" rx="2" fill="#eaf1e4" stroke="#163e35" strokeWidth="1.6" />
        <line x1="22" y1="49" x2="36" y2="49" stroke="#749546" strokeWidth="1.2" />
        <line x1="29" y1="44" x2="29" y2="58" stroke="#749546" strokeWidth="1.2" />
        <circle cx="48" cy="38" r="3.5" fill="#749546" />
        <path d="M42 54c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#163e35" />
        <circle cx="56" cy="42" r="3.5" stroke="#749546" strokeWidth="1.6" />
        <line x1="59" y1="42" x2="65" y2="42" stroke="#749546" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="62" y1="42" x2="62" y2="45" stroke="#749546" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export default function InteriorStepsProcess() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="wrap my-16 sm:my-20 lg:my-24" aria-label="Step-by-Step Interior Process">
      {/* Outer Container in authentic website theme soft sage with curved top-right arc - Full prominence */}
      <div className="bg-[#edf2e2] border border-[#d6e2cd] rounded-3xl sm:rounded-[44px] rounded-tr-[75px] sm:rounded-tr-[110px] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
        
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <p className="eyebrow !mb-2">SEAMLESS INTERIOR PROCESS</p>
          <h2 className="!text-2xl sm:!text-3xl lg:!text-4xl font-extrabold text-forest tracking-tight leading-tight mb-3">
            Turn Your Vision into Reality - In Just a Few Simple Steps
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Experience expert-designed interiors tailored to your style, budget, and lifestyle - effortlessly.
          </p>
        </div>

        {/* 2-Column Grid: 6 Step Cards on Left + Video Card on Right */}
        <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* =========================================
              LEFT: 6 Step Cards (3 cols x 2 rows) - Compact & Centered
             ========================================= */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 lg:gap-4">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-3.5 sm:p-4 lg:p-5 shadow-[0_2px_12px_rgba(22,62,53,0.04)] border border-[#d6e2cd] flex flex-col items-center justify-center text-center h-[125px] sm:h-[135px] lg:h-[145px] transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-forest/50 group"
              >
                {/* Centered Illustration Icon */}
                <div className="w-12 h-12 sm:w-13 sm:h-13 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                  {item.illustration}
                </div>

                {/* Centered Bold Title */}
                <h3 className="text-xs sm:text-[13px] lg:text-sm font-bold text-forest leading-snug tracking-tight text-center max-w-[130px]">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>

          {/* =========================================
              RIGHT: Video Testimonial Card (Harmonized with cards height)
             ========================================= */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(22,62,53,0.04)] border border-[#d6e2cd] flex flex-col justify-between h-full min-h-[270px] sm:min-h-[290px] lg:min-h-[305px]">
              
              {/* Video Thumbnail with Play Button */}
              <div 
                onClick={() => setShowVideoModal(true)}
                className="relative w-full h-[145px] sm:h-[155px] lg:h-[165px] rounded-xl overflow-hidden cursor-pointer group shadow-xs bg-stone-900"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Kavita home transformation video"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />

                {/* Top Corner Badges in UrbanFinder theme */}
                <div className="absolute top-2.5 left-2.5 bg-forest text-lime px-2 py-0.5 rounded text-[11px] font-extrabold tracking-tight shadow-xs">
                  urbaninteriors
                </div>
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold text-forest shadow-xs">
                  urbanfinder<span className="text-forest">.</span>
                </div>

                {/* Centered Play Button in Brand Forest Green */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-forest text-lime hover:bg-[#205246] flex items-center justify-center shadow-xl group-hover:scale-115 transition-all duration-300">
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>

                {/* Brand Logo Watermark */}
                <div className="absolute bottom-2 left-2.5 text-white font-extrabold text-sm sm:text-base tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Urban<span className="text-lime">Interiors.</span>
                </div>
              </div>

              {/* Story Description & Customer Details */}
              <div className="pt-2.5 text-center flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs text-stone-600 leading-tight font-medium mb-1 line-clamp-1">
                    They transformed their house into a dream home with UrbanInteriors
                  </p>
                  <h4 className="text-base sm:text-lg font-black text-forest tracking-tight">
                    Kavita
                  </h4>
                </div>

                {/* Specs: Budget, Home, City */}
                <div className="grid grid-cols-3 gap-2 pt-2 mt-1.5 border-t border-[#d8e3d0] text-center">
                  <div>
                    <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">Budget</span>
                    <strong className="text-xs sm:text-[13px] font-bold text-forest">₹4.5 lacs</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">Home</span>
                    <strong className="text-xs sm:text-[13px] font-bold text-forest">3BHK</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">City</span>
                    <strong className="text-xs sm:text-[13px] font-bold text-forest">Delhi</strong>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* =========================================
          VIDEO PLAYER MODAL
         ========================================= */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition"
              aria-label="Close video modal"
            >
              <X size={20} />
            </button>

            {/* High-quality Home Interior Makeover Tour Video Embed */}
            <iframe
              src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&rel=0"
              title="UrbanInteriors Customer Home Makeover Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </section>
  );
}
