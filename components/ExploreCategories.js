'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

export default function ExploreCategories() {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mobile: show top 6 or all 13
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

        <div className="flex items-center gap-3">
          {/* Desktop Arrow Controls */}
          <div className="hidden lg:flex xl:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-forest transition"
              aria-label="Previous categories"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-forest transition"
              aria-label="Next categories"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <Link
            href="/categories"
            className="text-xs sm:text-sm font-semibold text-forest hover:text-emerald-800 inline-flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Desktop / Laptop Layout: Compact, Sleek Cards */}
      <div
        ref={scrollRef}
        className="hidden sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-[repeat(13,minmax(0,1fr))] gap-2 sm:gap-2.5 xl:gap-2"
      >
        {serviceCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group relative flex flex-col items-center justify-center h-[76px] sm:h-[80px] p-2 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50/70 hover:border-forest/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center w-full"
          >
            {/* Live Indicator Dot for active categories */}
            {cat.isLive && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Active now"
              />
            )}

            {/* Vibrant Colored Icon */}
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <CategoryIcon name={cat.iconName} size={25} />
            </div>

            {/* Category Name */}
            <span className="text-[11px] sm:text-[11.5px] font-semibold text-stone-700 group-hover:text-forest line-clamp-1 leading-tight mt-1 max-w-[90px]">
              {cat.shortTitle || cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile-Optimized 3-Column Compact Grid */}
      <div className="sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          {displayedMobileCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative flex flex-col items-center justify-center h-[74px] p-2 rounded-xl border border-stone-200/90 bg-white active:scale-95 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all text-center"
            >
              {/* Live Dot */}
              {cat.isLive && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white"
                />
              )}

              {/* Colorful Icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <CategoryIcon name={cat.iconName} size={24} />
              </div>

              {/* Category Name */}
              <span className="text-[11px] font-semibold text-stone-800 line-clamp-1 leading-tight mt-1 max-w-[95%]">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile View More Toggle */}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full mt-2.5 py-1.5 px-3 text-[11.5px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-1.5 transition"
        >
          {mobileExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp size={13} />
            </>
          ) : (
            <>
              <span>View all {serviceCategories.length} categories</span>
              <ChevronDown size={13} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
