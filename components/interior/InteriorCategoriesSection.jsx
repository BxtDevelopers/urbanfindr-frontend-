'use client';

import {  useState  } from 'react';
import { Check, ArrowRight, Sparkles, Clock, Layers, Ruler } from 'lucide-react';
import { interiorCategories } from '@/lib/interiorData';

export default function InteriorCategoriesSection({ onSelectCategory }) {
  const [activeCategoryId, setActiveCategoryId] = useState('modular-kitchens');
  const activeCategory = interiorCategories.find(c => c.id === activeCategoryId) || interiorCategories[0];

  return (
    <section className="py-12 bg-stone-50 border-y border-stone-200 scroll-mt-24 sm:scroll-mt-28" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Layers size={13} /> FEATURE 2: INTERIOR DESIGN CATEGORIES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Specialized Interior Design Categories
          </h2>
          <p className="text-stone-600 text-sm mt-1.5">
            Bespoke engineering and factory precision tailored room by room for modern apartments and villas.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-8 no-scrollbar justify-start sm:justify-center">
          {interiorCategories.map((cat) => {
            const active = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                  active
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-600/30'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                <span>{cat.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  active ? 'bg-emerald-700 text-emerald-100' : 'bg-stone-100 text-stone-500'
                }`}>
                  {cat.startingPrice}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Showcase Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden grid lg:grid-cols-2 gap-8 items-center p-6 sm:p-8">
          {/* Image & Badges */}
          <div className="relative rounded-xl overflow-hidden border border-stone-200 aspect-[4/3] group shadow-inner">
            <img
              src={activeCategory.heroImage}
              alt={activeCategory.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                Starting {activeCategory.startingPrice}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white backdrop-blur-md flex items-center gap-1">
                <Clock size={12} /> {activeCategory.turnaround}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-xl text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Layout Configurations:</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {activeCategory.layouts?.map((layout, lIdx) => (
                  <span key={lIdx} className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                    {layout}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Details & Inclusions */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {activeCategory.tagline}
              </span>
              <h3 className="text-2xl font-bold text-stone-900 mt-2">
                {activeCategory.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2">
                {activeCategory.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                Key Inclusions &amp; Material Standards:
              </h4>
              <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
                {activeCategory.features?.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} />
                    </span>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(activeCategory)}
                className="btn btn-primary text-xs px-6 py-2.5 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                <Sparkles size={14} /> Get Quote for {activeCategory.title} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
