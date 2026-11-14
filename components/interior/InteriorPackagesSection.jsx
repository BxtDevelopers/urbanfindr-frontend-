'use client';

import { useState } from 'react';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import { money } from '@/lib/format';
import { interiorPackages } from '@/lib/interiorData';

// Extracts only 3-4 concise, high-impact main points to keep cards sleek & compact
function getMainPoints(tier) {
  if (!tier || !Array.isArray(tier.inclusions)) return [];
  const list = tier.inclusions;
  if (list.length <= 4) return list;

  const points = [];
  // 1. Core Kitchen deliverable
  const kitchen = list.find(i => /kitchen/i.test(i)) || list[0];
  if (kitchen) points.push(kitchen);

  // 2. Wardrobes / Bedrooms deliverable
  const wardrobe = list.find(i => /wardrobe|bedroom/i.test(i) && i !== kitchen) || list[1];
  if (wardrobe) points.push(wardrobe);

  // 3. Living room / False ceiling / TV console
  const livingOrCeiling = list.find(i => /ceiling|tv|living/i.test(i) && i !== kitchen && i !== wardrobe) || list[2];
  if (livingOrCeiling) points.push(livingOrCeiling);

  // 4. Warranty & Guaranteed handover (always last item)
  const warranty = list.find(i => /warranty|guarantee|handover/i.test(i)) || list[list.length - 1];
  if (warranty && !points.includes(warranty)) {
    points.push(warranty);
  } else if (points.length < 4 && list[3]) {
    points.push(list[3]);
  }

  return points.slice(0, 4);
}

export default function InteriorPackagesSection({ onSelectPackage }) {
  const [selectedBhkId, setSelectedBhkId] = useState('pkg-2bhk');
  const [selectedTier, setSelectedTier] = useState('premium'); // essential | premium | luxe

  const activePackage = interiorPackages.find(p => p.id === selectedBhkId) || interiorPackages[1];

  return (
    <section className="py-10 sm:py-12 bg-white scroll-mt-24 sm:scroll-mt-28" id="packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Sparkles size={13} /> FEATURE 3: ALL-INCLUSIVE DESIGN PACKAGES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Transparent Home Interior Packages
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Zero hidden charges. Factory assembled modular woodwork backed by our 45-Day Move-In Guarantee.
          </p>
        </div>

        {/* 1. BHK Configuration Selector */}
        <div className="flex justify-center mb-6 sm:mb-7">
          <div className="inline-flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto max-w-full">
            {interiorPackages.map((pkg) => {
              const active = selectedBhkId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedBhkId(pkg.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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

        {/* 2. Tier Comparison Cards - Compact with Main Points Only */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {['essential', 'premium', 'luxe'].map((tierKey) => {
            const tier = activePackage.tiers[tierKey];
            const isSelected = selectedTier === tierKey;
            const isPopular = tierKey === 'premium';
            const mainPoints = getMainPoints(tier);

            return (
              <div
                key={tierKey}
                onClick={() => setSelectedTier(tierKey)}
                className={`relative rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer p-4 sm:p-5 ${
                  isSelected
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/30 shadow-lg scale-[1.01]'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 shadow-xs'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    ★ Most Selected
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {tier.tag}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                        {tier.label} Tier
                      </h3>
                    </div>
                    <input
                      type="radio"
                      name="tier_selector"
                      checked={isSelected}
                      onChange={() => setSelectedTier(tierKey)}
                      className="accent-emerald-600 w-4 h-4 mt-0.5"
                    />
                  </div>

                  {/* Price */}
                  <div className="pb-3 border-b border-stone-200/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono tracking-tight">
                        {money(tier.price)}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">turnkey</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      For {activePackage.bhk} ({activePackage.carpetArea})
                    </p>
                  </div>

                  {/* Material Core Spec (Compact) */}
                  <div className="bg-stone-100/80 px-2.5 py-1.5 rounded-lg border border-stone-200/70 text-[11px] text-stone-700">
                    <span className="font-bold text-stone-900">Materials: </span>
                    <span className="text-stone-600">{tier.materials}</span>
                  </div>

                  {/* Main Points Only (Compact) */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Key Main Deliverables:
                    </p>
                    <div className="space-y-1.5">
                      {mainPoints.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-1.5 text-xs text-stone-700 leading-snug">
                          <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compact Card CTA */}
                <div className="pt-3.5 mt-3.5 border-t border-stone-200/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectPackage) {
                        onSelectPackage({
                          bhk: activePackage.bhk,
                          tier: tier.label,
                          scope: `${activePackage.bhk} - ${tier.label} Package`,
                          package: activePackage,
                          tierKey,
                          tier,
                          price: tier.price
                        });
                      }
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <Sparkles size={13} /> Book {tier.label} ({money(tier.price)})
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-1.5 flex items-center justify-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" /> 45-Day Handover · 10-Yr Warranty
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
