'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, BadgePercent, Clock, Sparkles, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import ServiceRequestForm from './ServiceRequestForm';

const BENEFIT_ICONS = [ShieldCheck, BadgePercent, Clock, Sparkles];

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

export default function ServiceHero({
  category,
  initialCity = '',
  initialLocality = '',
  onSearch,
  selectedService = '',
  onResetPreload
}) {
  const [searchCity, setSearchCity] = useState(initialCity || '');
  const [searchLocality, setSearchLocality] = useState(initialLocality || '');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    setSearchCity(initialCity || '');
  }, [initialCity]);

  useEffect(() => {
    setSearchLocality(initialLocality || '');
  }, [initialLocality]);

  // Click outside listener for the city dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectCity = (c) => {
    setSearchCity(c);
    setCityDropdownOpen(false);
    if (onSearch) {
      onSearch({ city: c, locality: searchLocality.trim() });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCityDropdownOpen(false);
    if (onSearch) {
      onSearch({ city: searchCity, locality: searchLocality.trim() });
    }
  };

  const benefits = category?.benefits && category.benefits.length > 0
    ? category.benefits
    : [
        {
          title: 'Verified Professionals',
          desc: 'Background-checked, licensed, and trained experts.'
        },
        {
          title: 'Transparent Pricing',
          desc: 'Clear upfront rates with zero hidden charges.'
        },
        {
          title: 'Convenient Scheduling',
          desc: 'Doorstep service on your date & time slot.'
        }
      ];

  return (
    <section className="relative py-6 sm:py-8 lg:py-10 flex items-center min-h-[510px]">
      {/* 1. Complete Hero Section Background Image (Isolated overflow-hidden to allow dropdown to float over hero boundary) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {category?.heroImage && (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
            style={{
              backgroundImage: `url(${category.heroImage})`,
            }}
          />
        )}
        {/* Dark Forest & Teal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#041711]/95 via-[#062118]/90 to-[#071f17]/75 lg:from-[#041711]/95 lg:via-[#062118]/85 lg:to-[#071f17]/60" />
      </div>

      {/* 2. Hero Two-Column Content: Left Text & Large Search Bar, Right Form */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: All Text First, Large Search Bar at the End */}
          <div className="lg:col-span-7 space-y-3.5 text-left pt-1">
            {/* 1. Verified Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 shadow-sm">
              <Sparkles size={12} className="text-emerald-400" />
              <span>UrbanFindr Verified Services</span>
            </div>

            {/* 2. Category Icon & Title */}
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-md p-2">
                <CategoryIcon name={category?.iconName} size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                  {category?.label || 'Professional Services'}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-emerald-300 mt-0.5 drop-shadow-sm">
                  {category?.headline || category?.tagline || 'Safe, reliable solutions for your home and workplace.'}
                </p>
              </div>
            </div>

            {/* 3. Supporting Paragraph */}
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg drop-shadow-sm">
              {category?.supportingText ||
                category?.description ||
                'Find top-rated professionals for installations, repairs, documentation, and routine maintenance across your city.'}
            </p>

            {/* 4. 3 Trust or Service Benefits (Compact Frosted Cards) */}
            <div className="pt-0.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {benefits.slice(0, 3).map((benefit, idx) => {
                  const IconComp = BENEFIT_ICONS[idx % BENEFIT_ICONS.length];
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm text-white"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-4 h-4 rounded-md bg-emerald-500/25 text-emerald-300 flex items-center justify-center shrink-0">
                          <IconComp size={10} />
                        </div>
                        <h4 className="text-[11px] font-bold text-white leading-tight truncate">
                          {benefit.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-stone-300 leading-tight">
                        {benefit.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Slogan Quote */}
            {category?.slogan && (
              <div className="pt-0.5">
                <div className="inline-block px-3 py-1 rounded-xl bg-stone-900/60 backdrop-blur-md border border-white/15 shadow-sm">
                  <p className="font-serif italic font-semibold text-emerald-200 text-xs tracking-tight">
                    &ldquo;{category.slogan}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* 6. PROMINENT SEARCH BAR */}
            <div className="pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-2xl shadow-2xl border border-white/40 p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl w-full text-stone-800 relative z-30"
              >
                {/* Custom Cities Dropdown: Compact, sleek, and well-proportioned */}
                <div ref={cityDropdownRef} className="relative min-w-[140px] sm:min-w-[160px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setCityDropdownOpen((prev) => !prev)}
                    className="w-full h-11 sm:h-12 pl-9 pr-6 rounded-xl text-left text-xs sm:text-sm bg-stone-50 sm:bg-transparent border border-stone-200 sm:border-0 focus:outline-none flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <MapPin size={16} className="absolute left-3 text-forest pointer-events-none" />
                    <span className={`truncate ${!searchCity ? 'text-stone-400 font-normal' : 'text-stone-900 font-semibold'}`}>
                      {searchCity || 'Search City'}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-stone-400 transition-transform duration-200 pointer-events-none shrink-0 ${
                        cityDropdownOpen ? 'rotate-180 text-forest' : ''
                      }`}
                    />
                  </button>

                  {/* Compact Dropdown Menu: Clean & well-proportioned (not too long) */}
                  {cityDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-48 sm:w-52 bg-white rounded-xl shadow-xl border border-stone-200/90 p-1 z-[9999] animate-fadeIn max-h-52 overflow-y-auto">
                      {CITIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleSelectCity(c)}
                          className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between rounded-lg hover:bg-forest/10 hover:text-forest transition-colors cursor-pointer ${
                            searchCity === c ? 'bg-forest/10 text-forest font-bold' : 'text-stone-700'
                          }`}
                        >
                          <span>{c}</span>
                          {searchCity === c && <Check size={13} className="text-forest shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block h-7 w-px bg-stone-200" />

                {/* Locality Search Input */}
                <div className="relative flex-1 flex items-center">
                  <Search size={16} className="absolute left-3 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchLocality}
                    onChange={(e) => setSearchLocality(e.target.value)}
                    placeholder={searchCity ? `Search locality in ${searchCity}...` : 'Search locality, area, or landmark...'}
                    className="w-full h-11 sm:h-12 pl-9 pr-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50 sm:bg-transparent rounded-xl sm:rounded-none border border-stone-200 sm:border-0 focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Prominent Large Search Button */}
                <button
                  type="submit"
                  className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-[#16503e] hover:bg-[#114032] active:bg-[#0c2e24] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer"
                >
                  <Search size={15} />
                  <span>Search</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Positioned Up and to the Right, Fully Contained */}
          <div className="lg:col-span-5 w-full flex justify-end items-start relative z-10">
            <div id="booking-form" className="w-full max-w-[420px] ml-auto rounded-2xl transition-all duration-300">
              <ServiceRequestForm
                category={category}
                initialCity={searchCity}
                selectedServicePreload={selectedService}
                onResetPreload={onResetPreload}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
