'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  BellRing,
  ShieldCheck,
  Clock,
  ArrowRight,
  House,
  Palette,
  Briefcase,
} from 'lucide-react';
import { getCategoryBySlug, serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

export default function CategoryComingSoon({ slug }) {
  const category = getCategoryBySlug(slug) || {
    slug,
    label: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Service Category',
    tagline: 'Professional verified services for your property needs',
    description: 'We are curating top-rated, background-verified professionals in your locality.',
    iconName: 'Sparkles',
    accentColor: '#16a34a',
    bgTint: '#f0fdf4',
    borderTint: '#bbf7d0',
    expectedServices: [
      'Verified background checks & certifications',
      'Transparent upfront pricing',
      'Doorstep service scheduling',
      'UrbanFindr quality guarantee',
    ],
  };

  const [contact, setContact] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [notified, setNotified] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setNotified(true);
  };

  return (
    <div className="wrap section max-w-4xl pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </Link>

        <Link
          href="/categories"
          className="text-xs font-semibold text-stone-500 hover:text-forest flex items-center gap-1"
        >
          <span>All categories</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Hero Header */}
      <div className="panel text-center py-12 px-6 sm:px-12 relative overflow-hidden bg-gradient-to-b from-[#fafcf7] to-white border border-stone-200/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-forest bg-lime/40 border border-forest/10 mb-6">
          <Sparkles size={13} className="text-forest" />
          <span>Coming Soon • UrbanFindr Services</span>
        </div>

        {/* Large Category Icon Box */}
        <div
          className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-sm"
          style={{
            backgroundColor: category.bgTint,
            borderColor: category.borderTint,
            borderWidth: '1.5px',
            color: category.accentColor,
          }}
        >
          <CategoryIcon name={category.iconName} size={38} />
        </div>

        <h1 className="!text-3xl sm:!text-4xl lg:!text-5xl font-bold tracking-tight text-stone-900 mb-3">
          {category.label}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
          {category.tagline || category.description}
        </p>

        {/* Status Pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-forest" />
            100% Background Verified
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-forest" />
            Launching Soon in Your City
          </span>
        </div>
      </div>

      {/* Two Column Section: Expected Services & Notification Form */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 items-start">
        {/* Left: What will be offered */}
        <div className="panel space-y-4">
          <h2 className="!text-xl font-bold text-stone-900">
            What to expect from {category.label}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            {category.description}
          </p>

          <div className="space-y-2.5 pt-2">
            {(category.expectedServices || [
              'Vetted professionals with verified credentials',
              'Upfront pricing with zero hidden commission',
              'Fast booking & instant confirmation',
              'Direct communication without middlemen',
            ]).map((service, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Notification Box */}
        <div className="panel bg-[#fbfcfa] border border-[#e4e9dc]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <BellRing size={16} />
            </div>
            <h3 className="!text-lg font-bold text-stone-900">
              Get notified when we launch
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 mb-5 leading-relaxed">
            Be the first to access verified {category.label.toLowerCase()} in your locality. We’ll notify you as soon as bookings open.
          </p>

          {notified ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-700" />
                You’re on the priority notification list!
              </p>
              <p className="text-emerald-700">
                We will alert you when {category.label} launch in {selectedCity}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select your city
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-forest"
                >
                  {['Hyderabad', 'Bengaluru', 'Mumbai', 'Pune', 'Chennai', 'Delhi NCR', 'Other'].map(
                    (city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email or phone number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. name@example.com or 9876543210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-forest"
                />
              </div>

              <button
                type="submit"
                className="btn w-full !py-2.5 !text-sm flex items-center justify-center gap-2"
              >
                <BellRing size={15} />
                <span>Notify me at launch</span>
              </button>

              <p className="text-[11px] text-stone-400 text-center">
                No spam ever. We only contact you when this service goes live.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Explore other active categories */}
      <div className="mt-14 pt-10 border-t border-stone-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="!text-lg font-bold text-stone-900">
            Active services available today
          </h3>
          <Link href="/categories" className="text-xs font-semibold text-forest hover:underline">
            View all 13 categories →
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/properties"
            className="panel p-4 hover:border-forest/50 transition flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <House size={20} />
            </div>
            <div>
              <strong className="text-sm font-semibold text-stone-900 group-hover:text-forest">
                Properties
              </strong>
              <p className="text-xs text-stone-500 mt-0.5">
                Verified apartments, villas & homes
              </p>
            </div>
          </Link>

          <Link
            href="/interiors"
            className="panel p-4 hover:border-forest/50 transition flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Palette size={20} />
            </div>
            <div>
              <strong className="text-sm font-semibold text-stone-900 group-hover:text-forest">
                Interior Designers
              </strong>
              <p className="text-xs text-stone-500 mt-0.5">
                Full-home & modular interiors
              </p>
            </div>
          </Link>

          <Link
            href="/post-property"
            className="panel p-4 hover:border-forest/50 transition flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase size={20} />
            </div>
            <div>
              <strong className="text-sm font-semibold text-stone-900 group-hover:text-forest">
                Post a Property
              </strong>
              <p className="text-xs text-stone-500 mt-0.5">
                List your space for free
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

