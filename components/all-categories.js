'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

export default function AllCategoriesPage() {
  const [filter, setFilter] = useState('all');

  const filteredCategories = serviceCategories.filter((cat) => {
    if (filter === 'live') return cat.isLive;
    if (filter === 'services') return !cat.isLive;
    return true;
  });

  return (
    <div className="wrap section pb-24">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="page-heading !pt-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-forest bg-lime/40 border border-forest/10 mb-4">
          <Sparkles size={13} className="text-forest" />
          <span>URBANFINDR DIRECTORY</span>
        </div>
        <h1 className="!text-3xl sm:!text-4xl lg:!text-5xl font-bold tracking-tight text-stone-900">
          Explore by Category
        </h1>
        <p className="muted mt-3 max-w-2xl leading-relaxed text-sm sm:text-base">
          From verified properties and turnkey interiors to licensed legal and home maintenance specialists — all in one place for a better living experience.
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-row my-8">
        <button
          type="button"
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Categories ({serviceCategories.length})
        </button>
        <button
          type="button"
          className={filter === 'live' ? 'active' : ''}
          onClick={() => setFilter('live')}
        >
          Active Now (2)
        </button>
        <button
          type="button"
          className={filter === 'services' ? 'active' : ''}
          onClick={() => setFilter('services')}
        >
          Coming Soon (11)
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="panel p-5 hover:border-forest/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between group bg-white"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: cat.bgTint,
                    borderColor: cat.borderTint,
                    borderWidth: '1px',
                    color: cat.accentColor,
                  }}
                >
                  <CategoryIcon name={cat.iconName} size={24} />
                </div>

                {/* Badge */}
                {cat.isLive ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>

              <h2 className="!text-lg font-bold text-stone-900 group-hover:text-forest transition-colors">
                {cat.label}
              </h2>

              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                {cat.tagline || cat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-forest">
              <span>{cat.isLive ? 'Explore listings' : 'View service details'}</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

