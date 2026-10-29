'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  Award,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { api } from '@/components/providers';

export default function TopRatedSpecialists({
  category,
  city = 'Hyderabad',
  locality = '',
  onBookSpecialist
}) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLocality, setActiveLocality] = useState(locality || 'all');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'reviews' | 'experience'

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (category?.slug) query.set('category', category.slug);
        if (city) query.set('city', city);
        const res = await api(`service-providers?${query.toString()}`);
        if (!active) return;
        setProviders(res?.items || []);
      } catch (err) {
        if (active) setProviders([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [category?.slug, city]);

  useEffect(() => {
    if (locality) {
      setActiveLocality(locality.toLowerCase());
    }
  }, [locality]);

  // Unique localities available in current providers
  const localities = useMemo(() => {
    const locSet = new Set();
    providers.forEach((p) => {
      if (p.locality) locSet.add(p.locality);
    });
    return Array.from(locSet);
  }, [providers]);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let list = [...providers];

    if (activeLocality && activeLocality !== 'all') {
      list = list.filter((p) =>
        (p.locality || '').toLowerCase().includes(activeLocality.toLowerCase())
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'experience') {
      const getExp = (str) => parseInt(str || '0', 10) || 0;
      list.sort((a, b) => getExp(b.experience) - getExp(a.experience));
    }

    return list;
  }, [providers, activeLocality, sortBy]);

  const handleBook = (pro) => {
    if (onBookSpecialist) {
      onBookSpecialist(pro);
    }
    const elem = document.getElementById('booking-form');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elem.classList.add('ring-4', 'ring-emerald-500/40', 'transition-all', 'duration-500');
      setTimeout(() => {
        elem.classList.remove('ring-4', 'ring-emerald-500/40');
      }, 2000);
    }
  };

  if (!loading && providers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-stone-50/70 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-100/70 mb-2">
              <Award size={13} className="text-emerald-700" />
              <span>Verified Directory &bull; Top Rated</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Top-Rated {category?.label || 'Service'} Specialists {city ? `in ${city}` : ''}
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Compare verified specialists rated 4.7+ ★ by your neighbors in {city || 'your city'}. Book directly or request priority doorstep dispatch.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
              <Filter size={13} />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer shadow-xs"
            >
              <option value="rating">Highest Rating (★ 4.9 first)</option>
              <option value="reviews">Most Reviews</option>
              <option value="experience">Years of Experience</option>
            </select>
          </div>
        </div>

        {/* Locality Quick-Filter Pills (if multiple localities found) */}
        {localities.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveLocality('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeLocality === 'all'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              All {city || 'City'}
            </button>
            {localities.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocality(loc.toLowerCase())}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  activeLocality.toLowerCase() === loc.toLowerCase()
                    ? 'bg-forest text-white shadow-xs font-bold'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <MapPin size={11} />
                <span>{loc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Specialists Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProviders.map((pro, idx) => (
            <div
              key={pro._id || idx}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Ribbon for Top 1 */}
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>#1 Highest Rated</span>
                </div>
              )}

              <div>
                {/* Header: Photo, Name, Rating & Badge */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={pro.avatar}
                      alt={pro.specialist || pro.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-stone-200 group-hover:border-forest transition-colors shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                      <ShieldCheck size={12} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900 truncate">
                        {pro.specialist || pro.name}
                      </h3>
                    </div>

                    <p className="text-xs font-medium text-stone-500 truncate">
                      {pro.name !== pro.specialist ? pro.name : category?.label || 'Specialist'}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold">
                        <Star size={12} className="fill-amber-400 text-amber-500" />
                        <span>{pro.rating}</span>
                        <span className="text-amber-700/80 font-normal text-[10.5px]">
                          ({pro.reviewsCount || 100})
                        </span>
                      </div>

                      {pro.badge && (
                        <span className="inline-block text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {pro.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta details: Experience, Locality & Pricing */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600 mb-3.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} className="text-stone-400 shrink-0" />
                    <span className="truncate">{pro.locality ? `${pro.locality}, ` : ''}{pro.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock size={13} className="text-stone-400 shrink-0" />
                    <span className="truncate">{pro.experience || 'Experienced Pro'}</span>
                  </div>
                </div>

                {/* Bio */}
                {pro.bio && (
                  <p className="text-xs text-stone-600 line-clamp-2 mb-3.5 leading-relaxed">
                    {pro.bio}
                  </p>
                )}

                {/* Specialties / Services tags */}
                {pro.services && pro.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pro.services.slice(0, 3).map((s, sIdx) => {
                      const label = typeof s === 'string' ? s : s?.name || '';
                      if (!label) return null;
                      return (
                        <span
                          key={sIdx}
                          className="text-[10.5px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                        >
                          {label}
                        </span>
                      );
                    })}
                    {pro.services.length > 3 && (
                      <span className="text-[10px] font-semibold text-stone-400 self-center">
                        +{pro.services.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Book with this specialist */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                {pro.startingPrice && (
                  <div>
                    <span className="block text-[10px] text-stone-400 font-medium">Starting from</span>
                    <span className="text-xs font-bold text-stone-900">{pro.startingPrice}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleBook(pro)}
                  className="flex-1 h-9 px-3 rounded-xl bg-forest hover:bg-[#114032] active:bg-[#0c2e24] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer ml-auto"
                >
                  <span>Book with {pro.specialist ? pro.specialist.split(' ')[0] : 'Specialist'}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

