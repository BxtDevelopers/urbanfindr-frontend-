'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

export default function ExploreCategories() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Arrow Navigation Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-forest transition shadow-sm"
              aria-label="Previous categories"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-forest transition shadow-sm"
              aria-label="Next categories"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Link
            href="/categories"
            className="text-xs sm:text-sm font-semibold text-forest hover:text-emerald-800 inline-flex items-center gap-1 group whitespace-nowrap ml-1 sm:ml-2"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Increased Card Size: Clean Single-Line Text for All Categories */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {serviceCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group relative flex flex-col items-center justify-center shrink-0 w-[134px] sm:w-[144px] h-[82px] sm:h-[86px] px-3 py-2 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50/80 hover:border-forest/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Live Indicator Dot for active categories */}
            {cat.isLive && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Active now"
              />
            )}

            {/* Vibrant Colored Icon */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0 mb-1.5 group-hover:scale-110 transition-transform duration-200">
              <CategoryIcon name={cat.iconName} size={25} />
            </div>

            {/* Category Name - Guaranteed Proper Single Line with No Awkward Breaking */}
            <span className="text-xs font-semibold text-stone-700 group-hover:text-forest whitespace-nowrap text-center tracking-tight">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
