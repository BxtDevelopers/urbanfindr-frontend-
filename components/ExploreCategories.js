'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

export default function ExploreCategories() {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Mobile: show top 6 (matching the smartphone in user photo) or all 13 when expanded
  const displayedMobileCategories = mobileExpanded
    ? serviceCategories
    : serviceCategories.slice(0, 6);

  return (
    <section className="wrap !pt-28 pb-4" aria-label="Explore by Category">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 mb-3 sm:mb-4">
        <div>
          <h2 className="!text-2xl sm:!text-3xl font-bold tracking-tight text-stone-900">
            Explore by Category
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Properties, home services, business essentials and more.
          </p>
        </div>

        <Link
          href="/categories"
          className="text-[11px] sm:text-xs font-medium text-forest hover:text-emerald-800 inline-flex items-center gap-1 group whitespace-nowrap"
        >
          <span className="hidden sm:inline">View All Categories</span>
          <span className="sm:hidden">View All</span>
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Desktop Layout: Exactly 13 Columns matching the laptop mockup in user photo */}
      <div className="hidden lg:grid lg:grid-cols-[repeat(13,minmax(0,1fr))] gap-2 xl:gap-2.5 items-stretch">
        {serviceCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group relative flex flex-col items-center justify-center min-h-[86px] xl:min-h-[90px] py-2.5 px-1 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50/70 hover:border-forest/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center w-full"
          >
            {/* Live Indicator Dot for active categories */}
            {cat.isLive && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Active now"
              />
            )}

            {/* Vibrant Colored Icon */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0 mb-1.5 group-hover:scale-110 transition-transform duration-200">
              <CategoryIcon name={cat.iconName} size={25} />
            </div>

            {/* Category Text Exactly Formatted as in Reference Image */}
            <div className="flex flex-col items-center justify-center min-h-[27px] leading-[1.2] text-center w-full px-0.5">
              <span className="text-[11px] xl:text-[11.5px] font-medium text-stone-700 group-hover:text-forest whitespace-nowrap">
                {cat.line1}
              </span>
              {cat.line2 && (
                <span className="text-[11px] xl:text-[11.5px] font-medium text-stone-700 group-hover:text-forest whitespace-nowrap">
                  {cat.line2}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Tablet Layout (6-7 Columns) */}
      <div className="hidden sm:grid lg:hidden sm:grid-cols-4 md:grid-cols-6 gap-2.5 items-stretch">
        {serviceCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group relative flex flex-col items-center justify-center min-h-[86px] py-2.5 px-2 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50/70 hover:border-forest/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center w-full"
          >
            {cat.isLive && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Active now"
              />
            )}

            <div className="w-8 h-8 flex items-center justify-center shrink-0 mb-1.5 group-hover:scale-110 transition-transform duration-200">
              <CategoryIcon name={cat.iconName} size={24} />
            </div>

            <div className="flex flex-col items-center justify-center min-h-[27px] leading-[1.2] text-center w-full">
              <span className="text-[11.5px] font-medium text-stone-700 group-hover:text-forest whitespace-nowrap">
                {cat.line1}
              </span>
              {cat.line2 && (
                <span className="text-[11.5px] font-medium text-stone-700 group-hover:text-forest whitespace-nowrap">
                  {cat.line2}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Layout: 3-Column Grid exactly matching the smartphone in user photo */}
      <div className="sm:hidden">
        <div className="grid grid-cols-3 gap-2 items-stretch">
          {displayedMobileCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative flex flex-col items-center justify-center min-h-[82px] py-2.5 px-1.5 rounded-xl border border-stone-200/90 bg-white active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all text-center"
            >
              {cat.isLive && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
              )}

              <div className="w-8 h-8 flex items-center justify-center shrink-0 mb-1">
                <CategoryIcon name={cat.iconName} size={23} />
              </div>

              <div className="flex flex-col items-center justify-center min-h-[26px] leading-[1.2] text-center w-full">
                <span className="text-[11px] font-medium text-stone-800 whitespace-nowrap">
                  {cat.line1}
                </span>
                {cat.line2 && (
                  <span className="text-[11px] font-medium text-stone-800 whitespace-nowrap">
                    {cat.line2}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View More / Less Toggle */}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-auto mx-auto mt-2.5 py-1 px-3 text-[10.5px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md flex items-center justify-center gap-1 transition"
        >
          {mobileExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp size={12} />
            </>
          ) : (
            <>
              <span>View all {serviceCategories.length} categories</span>
              <ChevronDown size={12} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
