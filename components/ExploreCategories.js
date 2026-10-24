'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

export default function ExploreCategories() {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // On small mobile screens, initially show top 6 (matching the phone screenshot), with 1-click expand
  const displayedMobileCategories = mobileExpanded
    ? serviceCategories
    : serviceCategories.slice(0, 6);

  return (
    <section className="wrap !pt-28 pb-6" aria-label="Explore by Category">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
        <div>
          <h2 className="!text-2xl sm:!text-3xl font-bold tracking-tight text-stone-900">
            Explore by Category
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Properties, home services, business essentials and more.
          </p>
        </div>

        <Link
          href="/categories"
          className="text-xs sm:text-sm font-semibold text-forest hover:text-emerald-800 inline-flex items-center gap-1 group whitespace-nowrap"
        >
          <span>View All Categories</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Desktop / Tablet Grid (All 13 categories visible in 1 seamless row on xl, 6-7 cols on md) */}
      <div className="hidden sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-[repeat(13,minmax(0,1fr))] gap-2 sm:gap-2.5 xl:gap-2">
        {serviceCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border border-stone-200/80 bg-white hover:bg-[#fbfcf9] hover:border-forest/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center w-full"
          >
            {/* Icon Box */}
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 shadow-sm"
              style={{
                backgroundColor: cat.bgTint,
                borderColor: cat.borderTint,
                borderWidth: '1px',
                color: cat.accentColor,
              }}
            >
              <CategoryIcon name={cat.iconName} size={21} />
            </div>

            {/* Label */}
            <span className="text-[11px] sm:text-xs font-semibold text-stone-700 group-hover:text-forest line-clamp-2 leading-tight min-h-[26px] flex items-center justify-center">
              {cat.label}
            </span>

            {/* Live / Status Pill */}
            {cat.isLive ? (
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                Live
              </span>
            ) : (
              <span className="mt-1 text-[9px] text-stone-400 group-hover:text-stone-600 transition-colors">
                Soon
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Mobile-Optimized 3-Column Grid (Matches the smartphone in user photo) */}
      <div className="sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          {displayedMobileCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group flex flex-col items-center justify-between p-2.5 rounded-xl border border-stone-200/80 bg-white active:scale-95 transition-all text-center"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 shadow-sm"
                style={{
                  backgroundColor: cat.bgTint,
                  borderColor: cat.borderTint,
                  borderWidth: '1px',
                  color: cat.accentColor,
                }}
              >
                <CategoryIcon name={cat.iconName} size={20} />
              </div>

              <span className="text-[11px] font-semibold text-stone-800 line-clamp-2 leading-tight min-h-[26px] flex items-center justify-center">
                {cat.label}
              </span>

              {cat.isLive ? (
                <span className="mt-1 text-[8.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  Live
                </span>
              ) : (
                <span className="mt-1 text-[8.5px] text-stone-400">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full mt-3 py-2 px-3 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-1.5 transition"
        >
          {mobileExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>View all {serviceCategories.length} categories</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
