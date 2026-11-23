'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, useApp } from '../providers';
import { money } from '@/lib/format';
import {
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  Heart,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Check,
  Home,
  Building,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function AlertMatchesView({ alertId, onBack }) {
  const router = useRouter();
  const { user, toast } = useApp();

  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(user?.favorites || []);

  async function loadMatches() {
    if (!alertId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api(`property-alerts/${alertId}/matches?sort=${sort}&page=${page}&limit=9`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load matching properties.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, [alertId, sort, page]);

  async function toggleFavorite(propertyId) {
    if (!user) {
      toast('Please log in to save properties to your shortlist.');
      return;
    }
    try {
      const res = await api(`favorites/${propertyId}`, { method: 'POST' });
      if (res.saved) {
        setFavoriteIds([...favoriteIds, propertyId]);
        toast('Property saved to your favorites!');
      } else {
        setFavoriteIds(favoriteIds.filter(id => String(id) !== String(propertyId)));
        toast('Property removed from favorites.');
      }
    } catch (err) {
      toast(err.message || 'Could not update favorites.');
    }
  }

  const alert = data?.alert;
  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="space-y-6">
      {/* Back button & Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition mb-2"
          >
            <ArrowLeft size={14} />
            Back to My Property Alerts
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              {alert?.name || 'Matching Properties'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              alert?.status === 'active'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-stone-100 text-stone-600 border border-stone-200'
            }`}>
              {alert?.status === 'active' ? 'Active Alert' : 'Paused Alert'}
            </span>
          </div>
          {alert && (
            <p className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-700">Filters:</span>
              <span>{alert.filters.city || 'All Cities'}</span>
              {alert.filters.localities?.length > 0 && (
                <span>• {alert.filters.localities.join(', ')}</span>
              )}
              {alert.filters.listingType && alert.filters.listingType !== 'any' && (
                <span>• {alert.filters.listingType.toUpperCase()}</span>
              )}
              {alert.filters.bhk?.length > 0 && (
                <span>• {alert.filters.bhk.join(', ')} BHK</span>
              )}
              {(alert.filters.minPrice || alert.filters.maxPrice) && (
                <span>• Budget: {alert.filters.minPrice ? money(alert.filters.minPrice) : '₹0'} – {alert.filters.maxPrice ? money(alert.filters.maxPrice) : 'No Max'}</span>
              )}
            </p>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-stone-600 whitespace-nowrap flex items-center gap-1">
            <SlidersHorizontal size={13} /> Sort:
          </label>
          <select
            value={sort}
            onChange={e => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#163e35]"
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_desc">Built-up Area: Large to Small</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="h-44 bg-stone-100 rounded-xl w-full" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
              <div className="h-8 bg-stone-100 rounded-xl w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadMatches}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-50 transition"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">No Matches Found Yet</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Your alert is active. We haven&apos;t found any new properties matching your exact preferences yet. As soon as a matching home is published, you will receive an automatic notification!
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/properties?city=${encodeURIComponent(alert?.filters?.city || 'Hyderabad')}`}
              className="px-4 py-2 bg-[#163e35] text-white text-xs font-bold rounded-xl hover:bg-[#205246] transition"
            >
              Browse All Properties
            </Link>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition"
            >
              Manage Alert Settings
            </button>
          </div>
        </div>
      )}

      {/* Matching Properties Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
            Showing {items.length} of {total} matching {total === 1 ? 'property' : 'properties'}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(prop => {
              const isFav = favoriteIds.some(f => String(f) === String(prop._id));
              const mainImg = prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={prop._id}
                  className="bg-white rounded-2xl border border-stone-200/90 hover:border-stone-400/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={mainImg}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Verified & Type Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {prop.verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-800 text-white text-[10px] font-bold rounded-full shadow-xs">
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                        {prop.type || 'Apartment'}
                      </span>
                    </div>

                    {/* Favorite Shortcut */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(prop._id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition shadow-xs ${
                        isFav
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-white/90 text-stone-600 hover:text-rose-600'
                      }`}
                      aria-label="Save to favorites"
                    >
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-xs border border-stone-200/80">
                      <span className="text-sm font-extrabold text-[#163e35]">
                        {money(prop.price)}
                        {prop.purpose === 'rent' && <span className="text-[10px] font-normal text-stone-500"> /mo</span>}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-[#163e35] transition">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="shrink-0 text-stone-400" />
                        <span>{prop.locality}, {prop.city}</span>
                      </p>
                    </div>

                    {/* Specs Pills */}
                    <div className="flex items-center gap-2 text-xs text-stone-600 border-t border-b border-stone-100 py-2">
                      {prop.bedrooms > 0 && (
                        <span className="font-semibold">{prop.bedrooms} BHK</span>
                      )}
                      {prop.area > 0 && (
                        <>
                          <span>•</span>
                          <span>{prop.area.toLocaleString('en-IN')} sq ft</span>
                        </>
                      )}
                      {prop.furnishing && (
                        <>
                          <span>•</span>
                          <span className="truncate">{prop.furnishing}</span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/properties/${prop._id}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#205246] transition text-center"
                      >
                        <Eye size={13} /> View Home
                      </Link>
                      <Link
                        href={`/properties/${prop._id}#consultation`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-stone-200 text-stone-700 hover:border-stone-400 rounded-xl text-xs font-semibold hover:bg-stone-50 transition text-center"
                      >
                        <Calendar size={13} /> Book Visit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-stone-200 rounded-xl text-xs font-semibold disabled:opacity-40 hover:bg-stone-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-stone-600 px-3">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-stone-200 rounded-xl text-xs font-semibold disabled:opacity-40 hover:bg-stone-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
