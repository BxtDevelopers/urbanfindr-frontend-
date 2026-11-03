'use client';

import {  useState  } from 'react';
import { Check, Sparkles, ShieldCheck, Clock, Layers, Star, ArrowRight } from 'lucide-react';
import { money } from '@/lib/format';
import { interiorPackages } from '@/lib/interiorData';

export default function InteriorPackagesSection({ onSelectPackage }) {
  const [selectedBhkId, setSelectedBhkId] = useState('pkg-2bhk');
  const [selectedTier, setSelectedTier] = useState('premium'); // essential | premium | luxe

  const activePackage = interiorPackages.find(p => p.id === selectedBhkId) || interiorPackages[1];

  return (
    <section className="py-14 bg-white scroll-mt-24 sm:scroll-mt-28" id="packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Sparkles size={13} /> FEATURE 3: ALL-INCLUSIVE DESIGN PACKAGES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Transparent Home Interior Packages
          </h2>
          <p className="text-stone-600 text-sm mt-1.5">
            Zero hidden charges. Factory assembled modular woodwork backed by our 45-Day Move-In Guarantee.
          </p>
        </div>

        {/* 1. BHK Configuration Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto max-w-full">
            {interiorPackages.map((pkg) => {
              const active = selectedBhkId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedBhkId(pkg.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-900 text-white shadow-md'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {pkg.bhk}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Tier Comparison Cards (Essential vs Premium vs Luxe) */}
        <div className="grid md:grid-cols-3 gap-6">
          {['essential', 'premium', 'luxe'].map((tierKey) => {
            const tier = activePackage.tiers[tierKey];
            const isSelected = selectedTier === tierKey;
            const isPopular = tierKey === 'premium';

            return (
              <div
                key={tierKey}
                onClick={() => setSelectedTier(tierKey)}
                className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer p-6 sm:p-7 ${
                  isSelected
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/30 shadow-2xl scale-[1.02]'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 shadow-sm'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    ★ Most Selected Tier
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {tier.tag}
                      </span>
                      <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                        {tier.label} Tier
                      </h3>
                    </div>
                    <input
                      type="radio"
                      name="tier_selector"
                      checked={isSelected}
                      onChange={() => setSelectedTier(tierKey)}
                      className="accent-emerald-600 w-4 h-4 mt-1"
                    />
                  </div>

                  {/* Price */}
                  <div className="pb-4 border-b border-stone-200">
                    <p className="text-3xl font-black text-stone-900 font-mono tracking-tight">
                      {money(tier.price)}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Turnkey all-inclusive · For {activePackage.bhk} ({activePackage.carpetArea})
                    </p>
                  </div>

                  {/* Material Core Spec */}
                  <div className="bg-stone-100/70 p-3 rounded-xl border border-stone-200 text-xs text-stone-700">
                    <p className="font-bold text-stone-900 text-[11px] uppercase tracking-wider mb-0.5">
                      Material Specification:
                    </p>
                    <p className="leading-snug">{tier.materials}</p>
                  </div>

                  {/* Inclusions Checklist */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Scope &amp; Inclusions:
                    </p>
                    <div className="space-y-2 text-xs text-stone-600">
                      {tier.inclusions.map((inc, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-6 mt-6 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectPackage) {
                        onSelectPackage({
                          package: activePackage,
                          tierKey,
                          tier
                        });
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <Sparkles size={13} /> Book {tier.label} Package ({money(tier.price)})
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" /> 45-Day Handover · 10-Yr Warranty
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
