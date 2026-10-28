'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Phone,
  Star,
  MapPin,
  Calendar,
  X,
  Send,
} from 'lucide-react';
import { getCategoryBySlug, serviceCategories } from '@/lib/serviceCategories';
import { initialServiceProviders } from '@/lib/serviceProviders';
import CategoryIcon from './CategoryIcon';

export default function CategoryComingSoon({ slug }) {
  const searchParams = useSearchParams();
  const urlCity = searchParams ? searchParams.get('city') : null;
  const [selectedCity, setSelectedCity] = useState(urlCity || 'Bengaluru');
  const [contact, setContact] = useState('');
  const [notified, setNotified] = useState(false);
  const [bookingModalPro, setBookingModalPro] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', address: '', note: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const cityProviders = initialServiceProviders.filter(
    (p) =>
      p.categorySlug === category.slug &&
      p.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const handleNotify = (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setNotified(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.name.trim() || !bookingForm.phone.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setBookingSuccess(true);
    }, 400);
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

      {/* Hero Header with Service-specific Background Image */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-800/10 shadow-2xl min-h-[320px] sm:min-h-[360px] flex flex-col items-center justify-center text-center p-6 sm:p-12 mb-8">
        {/* Dynamic Background Image matching the service category */}
        {category.heroImage && (
          <img
            src={category.heroImage}
            alt={category.label}
            className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          />
        )}

        {/* Gradient Overlay for rich contrast & readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/65 to-stone-900/50 backdrop-blur-[0.5px]" />

        {/* Foreground Content */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-white bg-white/20 backdrop-blur-md border border-white/25 mb-4 shadow-sm">
            <Sparkles size={13} className="text-lime" />
            <span>UrbanFindr Verified Services • {selectedCity}</span>
          </div>

          {/* Large Category Icon Box with frosted glass border */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl backdrop-blur-md bg-white/95 border-2 border-white/90"
            style={{
              color: category.accentColor || '#163e35',
            }}
          >
            <CategoryIcon name={category.iconName} size={36} />
          </div>

          <h1 className="!text-3xl sm:!text-4xl lg:!text-5xl font-bold tracking-tight text-white mb-2.5 drop-shadow-md">
            {category.label} in {selectedCity}
          </h1>

          <p className="text-sm sm:text-base text-stone-200 max-w-xl mx-auto leading-relaxed drop-shadow">
            {category.tagline || category.description}
          </p>

          {/* Status Pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 text-xs text-stone-200">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/15 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              100% Background Verified
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/15 backdrop-blur-sm">
              <Clock size={14} className="text-amber-400" />
              Doorstep Visits in {selectedCity}
            </span>
          </div>
        </div>
      </div>

      {/* Verified Providers in Selected City */}
      {cityProviders.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
            <div>
              <h2 className="!text-2xl font-bold text-stone-900">
                Verified {category.label} in {selectedCity}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {cityProviders.length} background-checked specialist{cityProviders.length > 1 ? 's' : ''} available for doorstep service.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-semibold rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 outline-none focus:border-forest"
              >
                {['Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi NCR'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityProviders.map((pro) => (
              <div
                key={pro._id || pro.name}
                className="panel p-5 bg-white border border-stone-200/90 rounded-2xl hover:border-forest/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="!text-base font-bold text-stone-900 truncate">
                          {pro.name}
                        </h3>
                        {pro.badge && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                            {pro.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        {pro.specialist} • <span className="text-stone-400">{pro.experience}</span>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-1.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <Star size={12} className="fill-amber-400 text-amber-500" />
                          {pro.rating} <span className="text-stone-400">({pro.reviewsCount})</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-stone-500 truncate">
                          <MapPin size={12} className="text-forest shrink-0" />
                          {pro.locality}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Services pills */}
                  {pro.services && pro.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-stone-100">
                      {pro.services.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Starting at
                    </span>
                    <span className="text-sm font-bold text-forest">{pro.startingPrice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${pro.phone}`}
                      className="btn-outline !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
                    >
                      <Phone size={13} />
                      <span>Call</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingModalPro(pro);
                        setBookingSuccess(false);
                      }}
                      className="btn !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
                    >
                      <Calendar size={13} />
                      <span>Book Service</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section: Expected Services & Notification/Booking Form */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 items-start">
        {/* Left: What will be offered */}
        <div className="panel space-y-4">
          <h2 className="!text-xl font-bold text-stone-900">
            What to expect from {category.label} in {selectedCity}
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

        {/* Right: Booking / Notification Box */}
        <div className="panel bg-[#fbfcfa] border border-[#e4e9dc]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <BellRing size={16} />
            </div>
            <h3 className="!text-lg font-bold text-stone-900">
              {cityProviders.length > 0 ? `Book ${category.label} in ${selectedCity}` : `Get notified in ${selectedCity}`}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 mb-5 leading-relaxed">
            {cityProviders.length > 0
              ? `Schedule a certified ${category.label.toLowerCase()} specialist for doorstep visit in ${selectedCity}.`
              : `Be the first to access verified ${category.label.toLowerCase()} in ${selectedCity}. We’ll notify you as soon as bookings open.`}
          </p>

          {notified ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-700" />
                Request received!
              </p>
              <p className="text-emerald-700">
                We will alert you and connect you with {category.label} in {selectedCity}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-forest"
                >
                  {['Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi NCR', 'Other'].map(
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
                <span>{cityProviders.length > 0 ? 'Request Doorstep Service' : 'Notify me at launch'}</span>
              </button>

              <p className="text-[11px] text-stone-400 text-center">
                No spam ever. 100% verified specialists in {selectedCity}.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalPro && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200">
            <button
              onClick={() => setBookingModalPro(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={bookingModalPro.avatar}
                alt={bookingModalPro.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h3 className="!text-lg font-bold text-stone-900">{bookingModalPro.name}</h3>
                <p className="text-xs text-stone-500">
                  {bookingModalPro.specialist} • {bookingModalPro.locality}, {selectedCity}
                </p>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-2 text-center">
                <CheckCircle2 size={32} className="text-emerald-700 mx-auto" />
                <p className="font-bold">Booking Request Sent!</p>
                <p className="text-xs text-emerald-700">
                  {bookingModalPro.name} will call you within 30 minutes to confirm your doorstep service appointment in {selectedCity}.
                </p>
                <button
                  type="button"
                  onClick={() => setBookingModalPro(null)}
                  className="btn !py-2 !px-4 !text-xs mt-3 w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2 outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2 outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Address / Locality in {selectedCity}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar 100ft road, Bengaluru"
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2 outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Service details / Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need switchboard repair & power breakdown check"
                    value={bookingForm.note}
                    onChange={(e) => setBookingForm({ ...bookingForm, note: e.target.value })}
                    className="w-full text-xs sm:text-sm rounded-lg border border-stone-200 bg-white px-3 py-2 outline-none focus:border-forest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn w-full !py-2.5 !text-sm flex items-center justify-center gap-2 mt-2"
                >
                  <Send size={15} />
                  <span>{submitting ? 'Confirming...' : 'Confirm Doorstep Visit'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
