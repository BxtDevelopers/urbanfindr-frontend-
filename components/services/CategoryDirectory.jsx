'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Check,
  ChevronDown,
  X,
  Phone,
  Mail,
  User,
  Loader2,
  CheckCircle2,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '@/components/providers';

const CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Chennai',
  'Delhi NCR',
  'Gurugram',
  'Kolkata'
];

const RATING_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '4.8+ ★', value: 4.8 },
  { label: '4.5+ ★', value: 4.5 },
  { label: '4.0+ ★', value: 4.0 }
];

const EXP_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '5+ Yrs', value: 5 },
  { label: '10+ Yrs', value: 10 },
  { label: '15+ Yrs', value: 15 }
];

export default function CategoryDirectory({
  category,
  initialCity = 'Hyderabad',
  initialLocality = ''
}) {
  const [city, setCity] = useState(initialCity || 'Hyderabad');
  const [locality, setLocality] = useState(initialLocality || 'all');
  const [minRating, setMinRating] = useState(0);
  const [minExp, setMinExp] = useState(0);
  const [selectedService, setSelectedService] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'reviews' | 'experience' | 'price'

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

  // Booking Modal State
  const [bookingModalPro, setBookingModalPro] = useState(null);
  const [modalService, setModalService] = useState('');
  const [modalFirstName, setModalFirstName] = useState('');
  const [modalLastName, setModalLastName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [modalError, setModalError] = useState('');

  // Fetch providers whenever category or city changes
  useEffect(() => {
    let active = true;
    const fetchList = async () => {
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
    fetchList();
    return () => {
      active = false;
    };
  }, [category?.slug, city]);

  useEffect(() => {
    if (initialCity) setCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    if (initialLocality) setLocality(initialLocality);
  }, [initialLocality]);

  // Unique localities available in current dataset
  const availableLocalities = useMemo(() => {
    const set = new Set();
    providers.forEach((p) => {
      if (p.locality) set.add(p.locality);
    });
    return Array.from(set);
  }, [providers]);

  // Service specialties options
  const serviceSpecialties = useMemo(() => {
    return category?.serviceOptions && category.serviceOptions.length > 0
      ? category.serviceOptions
      : ['General Inspection', 'Standard Repair', 'Maintenance Service'];
  }, [category]);

  // Filter and sort providers dynamically
  const filteredProviders = useMemo(() => {
    let list = [...providers];

    // Locality Filter
    if (locality && locality !== 'all') {
      list = list.filter((p) =>
        (p.locality || '').toLowerCase().includes(locality.toLowerCase())
      );
    }

    // Rating Filter
    if (minRating > 0) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    // Experience Filter
    if (minExp > 0) {
      const getExpNum = (str) => parseInt(str || '0', 10) || 0;
      list = list.filter((p) => getExpNum(p.experience) >= minExp);
    }

    // Verified Only Filter
    if (verifiedOnly) {
      list = list.filter((p) => p.verified === true);
    }

    // Specific Service Specialty Filter
    if (selectedService && selectedService !== 'all') {
      list = list.filter((p) => {
        if (!p.services || p.services.length === 0) return true;
        return p.services.some((s) => {
          const sName = typeof s === 'string' ? s : s?.name || '';
          return sName.toLowerCase().includes(selectedService.toLowerCase());
        });
      });
    }

    // Sorting
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'experience') {
      const getExpNum = (str) => parseInt(str || '0', 10) || 0;
      list.sort((a, b) => getExpNum(b.experience) - getExpNum(a.experience));
    }

    return list;
  }, [providers, locality, minRating, minExp, verifiedOnly, selectedService, sortBy]);

  const handleResetFilters = () => {
    setLocality('all');
    setMinRating(0);
    setMinExp(0);
    setSelectedService('all');
    setVerifiedOnly(false);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openBookingModal = (pro) => {
    setBookingModalPro(pro);
    setModalService(serviceSpecialties[0] || 'General Inspection');
    setModalError('');
    setModalSuccess(null);
  };

  const closeBookingModal = () => {
    setBookingModalPro(null);
    setModalSuccess(null);
    setModalError('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!modalFirstName.trim()) {
      setModalError('Please enter your first name.');
      return;
    }
    if (!modalLastName.trim()) {
      setModalError('Please enter your last name.');
      return;
    }
    const cleanPhone = modalPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setModalError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setModalSubmitting(true);
    try {
      const fullName = `${modalFirstName.trim()} ${modalLastName.trim()}`;
      const payload = {
        category: category?.label || 'General Service',
        categorySlug: category?.slug || 'general',
        serviceType: modalService,
        description: modalNotes.trim() || `Booking request for ${bookingModalPro?.specialist || bookingModalPro?.name}`,
        city: bookingModalPro?.city || city,
        locality: bookingModalPro?.locality || (locality !== 'all' ? locality : undefined),
        firstName: modalFirstName.trim(),
        lastName: modalLastName.trim(),
        name: fullName,
        phone: cleanPhone,
        email: modalEmail.trim() || undefined,
        assignedSpecialist: bookingModalPro?.specialist || bookingModalPro?.name,
        assignedSpecialistId: bookingModalPro?._id,
        assignedSpecialistRating: bookingModalPro?.rating
      };

      const res = await api('service-requests', {
        method: 'POST',
        body: payload
      });

      setModalSuccess({
        requestId: res.requestId || 'SR-' + Date.now().toString().slice(-6),
        name: fullName,
        specialist: bookingModalPro?.specialist || bookingModalPro?.name,
        service: modalService
      });
    } catch (err) {
      setModalError(err.message || 'Unable to submit booking. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <section className="py-10 bg-[#f8f9fa] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: FILTERS FORM (MATCHING THE SCREENSHOT)       */}
          {/* ======================================================== */}
          <div className="lg:col-span-3.5 xl:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 sticky top-20">
            {/* Header: FILTERS title + Clear button */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm tracking-wide uppercase">
                <SlidersHorizontal size={16} className="text-forest" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-stone-400 hover:text-forest transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4 text-left">
              {/* Verified Badge Checkbox Card (Like New Builder Projects in image) */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="mt-0.5 rounded text-forest focus:ring-forest border-emerald-300"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Verified Specialists Only</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 leading-tight mt-0.5">
                    Background-checked & certified pros
                  </p>
                </div>
              </label>

              {/* City Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-9 px-2.5 pl-8 rounded-xl border border-stone-200 bg-stone-50/60 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest appearance-none cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <MapPin size={13} className="absolute left-2.5 top-2.5 text-forest pointer-events-none" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
                    <ChevronDown size={13} />
                  </div>
                </div>
              </div>

              {/* Locality Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Locality in {city}
                </label>
                <div className="relative">
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full h-9 px-2.5 pl-8 rounded-xl border border-stone-200 bg-stone-50/60 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-forest appearance-none cursor-pointer"
                  >
                    <option value="all">All {city} Localities</option>
                    {availableLocalities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <MapPin size={13} className="absolute left-2.5 top-2.5 text-stone-400 pointer-events-none" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
                    <ChevronDown size={13} />
                  </div>
                </div>
              </div>

              {/* RATING FILTER (MATCHING BHK TYPE PILL SELECTOR) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    Rating
                  </label>
                  {minRating > 0 && (
                    <span className="text-[10px] font-bold text-forest">
                      {minRating}+ Stars
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMinRating(opt.value)}
                      className={`h-8 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                        minRating === opt.value
                          ? 'bg-[#16503e] text-white border-[#16503e] shadow-sm'
                          : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      {opt.value > 0 && <Star size={11} className={minRating === opt.value ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-500'} />}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* EXPERIENCE FILTER (MATCHING PROPERTY TYPE PILLS) */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Experience
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {EXP_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMinExp(opt.value)}
                      className={`h-8 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center border ${
                        minExp === opt.value
                          ? 'bg-[#16503e] text-white border-[#16503e] shadow-sm'
                          : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SERVICE SPECIALTY FILTER */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Specialty
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedService('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      selectedService === 'all'
                        ? 'bg-forest/10 text-forest font-bold'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>All Specialties</span>
                    {selectedService === 'all' && <Check size={12} className="text-forest" />}
                  </button>
                  {serviceSpecialties.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedService(spec)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between truncate ${
                        selectedService === spec
                          ? 'bg-forest/10 text-forest font-bold'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="truncate">{spec}</span>
                      {selectedService === spec && <Check size={12} className="text-forest shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SIDE: QUICK PILLS + HEADER + CARDS GRID             */}
          {/* ======================================================== */}
          <div className="lg:col-span-8.5 xl:col-span-9 space-y-4 text-left">
            
            {/* Quick Filter Pills (Like in the screenshot) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={handleResetFilters}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  locality === 'all' && minRating === 0 && minExp === 0 && !verifiedOnly
                    ? 'bg-[#16503e] text-white border-[#16503e] shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                All {category?.label || 'Specialists'}
              </button>

              <button
                type="button"
                onClick={() => setMinRating(4.8)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1 ${
                  minRating === 4.8
                    ? 'bg-[#16503e] text-white border-[#16503e] shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Star size={11} className={minRating === 4.8 ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-500'} />
                <span>Highest Rated (4.8+ ★)</span>
              </button>

              {availableLocalities.slice(0, 3).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocality(loc)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1 ${
                    locality === loc
                      ? 'bg-[#16503e] text-white border-[#16503e] shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <MapPin size={11} />
                  <span>{loc}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setMinExp(10)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1 ${
                  minExp === 10
                    ? 'bg-[#16503e] text-white border-[#16503e] shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Clock size={11} />
                <span>10+ Years Exp</span>
              </button>
            </div>

            {/* Results Header: Title, Count & Sort Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-b border-stone-200/80 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {category?.label || 'Specialists'} in {city}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified direct {category?.label?.toLowerCase() || 'specialist'} listings in {city}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-600">
                  <span className="text-forest font-extrabold">{filteredProviders.length}</span> {filteredProviders.length === 1 ? 'professional' : 'professionals'} found
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 px-2.5 text-xs font-medium rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer shadow-xs"
                >
                  <option value="rating">Highest Rated First</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {filteredProviders.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <SlidersHorizontal size={22} />
                </div>
                <h3 className="text-base font-bold text-stone-800">
                  No specialists match this filter
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try lowering your rating or locality filter to see all available professionals in {city}.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-[#114032] transition-colors cursor-pointer shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* CARDS GRID: 3 COLUMNS (MATCHING SCREENSHOT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProviders.map((pro, idx) => (
                <div
                  key={pro._id || idx}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* Card Image Banner with Badges */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={pro.avatar}
                      alt={pro.specialist || pro.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Left: Category Badge (Like COMMERCIAL SALE in image) */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/90 text-white font-extrabold text-[10px] tracking-wider uppercase backdrop-blur-xs">
                        {category?.label || pro.category || 'Specialist'}
                      </span>
                      {pro.verified && (
                        <span className="px-2 py-0.5 rounded-md bg-white/95 text-stone-900 font-bold text-[10px] flex items-center gap-1 backdrop-blur-xs shadow-xs">
                          <Check size={11} className="text-emerald-600 stroke-[3]" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Top Right: Favorite Button (Like heart in image) */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(pro._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer"
                      aria-label="Save professional"
                    >
                      <Heart
                        size={15}
                        className={favorites[pro._id] ? 'fill-rose-500 text-rose-500' : 'text-stone-600'}
                      />
                    </button>

                    {/* Bottom overlay: Starting Price */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] text-stone-300 font-medium block leading-none">Starting from</span>
                        <span className="text-lg font-black text-white tracking-tight drop-shadow-sm">
                          {pro.startingPrice || '₹399 onwards'}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-amber-300 font-extrabold text-xs shadow-xs border border-white/10">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>{pro.rating}</span>
                        <span className="text-[10px] text-stone-300 font-normal">
                          ({pro.reviewsCount || 100})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Specialist Name & Company */}
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-snug group-hover:text-forest transition-colors truncate">
                        {pro.specialist || pro.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                        {pro.name !== pro.specialist ? pro.name : category?.label || 'Certified Professional'}
                      </p>

                      {/* Locality & Experience */}
                      <div className="flex items-center gap-3 text-xs text-stone-600 mt-2.5 pb-2.5 border-b border-stone-100">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-forest shrink-0" />
                          <span className="truncate">{pro.locality ? `${pro.locality}, ` : ''}{pro.city}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate shrink-0">
                          <Clock size={12} className="text-stone-400 shrink-0" />
                          <span>{pro.experience || 'Experienced'}</span>
                        </div>
                      </div>

                      {/* Service Specialty Pills */}
                      {pro.services && pro.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {pro.services.slice(0, 3).map((s, sIdx) => {
                            const label = typeof s === 'string' ? s : s?.name || '';
                            if (!label) return null;
                            return (
                              <span
                                key={sIdx}
                                className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                              >
                                {label}
                              </span>
                            );
                          })}
                          {pro.services.length > 3 && (
                            <span className="text-[9.5px] font-semibold text-stone-400 self-center">
                              +{pro.services.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Book Specialist Button */}
                    <div className="pt-3.5 mt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => openBookingModal(pro)}
                        className="w-full h-9 px-3 rounded-xl bg-[#16503e] hover:bg-[#114032] active:bg-[#0c2e24] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow cursor-pointer"
                      >
                        <Phone size={12} />
                        <span>Book with {pro.specialist ? pro.specialist.split(' ')[0] : 'Specialist'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK BOOKING MODAL (WHEN USER CLICKS BOOK PROFESSIONAL)   */}
      {/* ======================================================== */}
      {bookingModalPro && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-5 sm:p-6 relative text-left">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={closeBookingModal}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {modalSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <span className="inline-block px-2.5 py-0.5 bg-forest/10 text-forest text-xs font-bold rounded-full uppercase tracking-wider">
                  Request Confirmed
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  Booking Confirmed with {modalSuccess.specialist}!
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  We have assigned your request directly to {modalSuccess.specialist}. They will call you shortly.
                </p>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1 text-left mt-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Ref ID:</span>
                    <span className="font-mono font-bold text-forest">{modalSuccess.requestId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Customer:</span>
                    <span className="font-medium text-stone-800">{modalSuccess.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Service:</span>
                    <span className="font-medium text-stone-800">{modalSuccess.service}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="w-full py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-[#114032] transition-colors cursor-pointer mt-3"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-3">
                {/* Header with Professional Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <img
                    src={bookingModalPro.avatar}
                    alt={bookingModalPro.specialist || bookingModalPro.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-stone-900">
                        {bookingModalPro.specialist || bookingModalPro.name}
                      </h3>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold rounded">
                        ★ {bookingModalPro.rating}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      {bookingModalPro.locality ? `${bookingModalPro.locality}, ` : ''}{bookingModalPro.city} &bull; {bookingModalPro.experience || 'Top Rated'}
                    </p>
                  </div>
                </div>

                {modalError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {modalError}
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Service Required <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={modalService}
                    onChange={(e) => setModalService(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-medium focus:ring-1 focus:ring-forest focus:outline-none"
                    required
                  >
                    {serviceSpecialties.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* First Name & Last Name (2 Columns) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={modalFirstName}
                      onChange={(e) => setModalFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full h-8 px-2.5 rounded-lg border border-stone-300 bg-stone-50 text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={modalLastName}
                      onChange={(e) => setModalLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full h-8 px-2.5 rounded-lg border border-stone-300 bg-stone-50 text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Email (2 Columns) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-1.5 rounded-l-lg border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit number"
                        className="w-full h-8 px-2 rounded-r-lg border border-stone-300 bg-stone-50 text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Email <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full h-8 px-2.5 rounded-lg border border-stone-300 bg-stone-50 text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes / Details */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Requirement Notes <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    rows={2}
                    placeholder="Briefly describe what you need done..."
                    className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 text-xs focus:ring-1 focus:ring-forest focus:outline-none resize-none"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="w-full h-9 rounded-xl bg-[#16503e] hover:bg-[#114032] active:bg-[#0c2e24] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 shadow-sm"
                  >
                    {modalSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span>Confirming Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Booking with {bookingModalPro.specialist ? bookingModalPro.specialist.split(' ')[0] : 'Specialist'}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
}

