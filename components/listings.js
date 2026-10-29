'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  SlidersHorizontal,
  Search,
  ArrowUpRight,
  Check,
  Bell,
  Map as MapIcon,
  LayoutGrid,
  MapPin,
  KeyRound,
  ChevronDown,
  Building2,
  House,
} from 'lucide-react';

import { useData, useApp, api } from './providers';
import {
  Field,
  Pagination,
  PropertyCard,
  ProjectCard,
  State,
  Image,
} from './ui';

import { amenities, cities } from '@/lib/format';
import {
  categories,
  categoryFor,
  listingQuery,
  cityGuides,
} from '@/lib/catalog';

import CitySpotlight from './CitySpotlight';
import MultiLocationInput from './MultiLocationInput';
import PropertyMapView from './PropertyMapView';

// Shows regular properties underneath the builder projects and Spotlight.
function CityPropertiesSection({ cityName }) {
  const [page, setPage] = useState(1);

  const query = new URLSearchParams({
    city: cityName,
    page: String(page),
    limit: '10',
  });

  const { data, error, loading } = useData(
    `properties?${query.toString()}`
  );

  if (!cityName) return null;

  return (
    <div className="mt-14 pt-10 border-t border-[#e6e8e1]">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">ALL PROPERTIES</p>

          <h2 className="!text-3xl">
            Properties in {cityName}
          </h2>

          <p className="muted mt-2 text-sm">
            Browse homes, PGs and commercial spaces available in{' '}
            {cityName}.
          </p>
        </div>

        <Link
          href={`/cities/${cityName
            .toLowerCase()
            .replace(/\s+/g, '-')}`}
          className="text-link !text-sm flex items-center gap-1 shrink-0"
        >
          Explore {cityName} city page{' '}
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <State
        loading={loading}
        error={error}
        empty={data?.total === 0}
      />

      {!loading && data?.items?.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map(item => (
              <PropertyCard key={item._id} item={item} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex justify-center items-center gap-5 mt-8">
              <button
                className="btn-outline"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>

              <span className="text-sm muted">
                {page} / {data.pages}
              </span>

              <button
                className="btn-outline"
                disabled={page >= data.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href={`/properties?city=${encodeURIComponent(
                cityName
              )}`}
              className="btn-outline"
            >
              View all {data.total} properties in {cityName}{' '}
              <ArrowUpRight size={15} className="inline ml-1" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function Listings({
  projects = false,
  favorites = false,
  purpose,
  city,
  hideHeader = false,
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, toast } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [savingSearch, setSavingSearch] = useState(false);
  const [currentCity, setCurrentCity] = useState(params.get('city') || city || '');

  const activeCityParam = params.get('city') || city || currentCity || 'Bengaluru';
  const activeCityGuide = cityGuides?.find(
    item =>
      item.name?.toLowerCase() === activeCityParam.toLowerCase() ||
      item.slug === activeCityParam.toLowerCase().replace(/\s+/g, '-')
  );
  const displayCityName = activeCityGuide?.name || activeCityParam || 'Bengaluru';
  const cityLocalities = activeCityGuide?.localities || [];

  const category = categoryFor(purpose);

  const basePath = favorites
    ? '/dashboard/favorites'
    : projects
      ? '/projects'
      : category?.path || '/properties';

  const query = listingQuery(params, {
    purpose,
    city,
    favorites,
  });

  const { data, error, loading, reload } = useData(
    `${projects ? 'projects' : 'properties'}?${query}`
  );

  const fields = [
    'minPrice',
    'bedrooms',
    'type',
    'furnishing',
    'minArea',
    'maxArea',
    'preferredTenant',
    'parking',
    'amenities',
    'ownership',
    'propertyAge',
    'availability',
    'verified',
    'sort',
  ];

  async function saveSearch() {
    if (!user) {
      toast('Log in to save search criteria and activate property alerts.');
      return;
    }
    setSavingSearch(true);
    try {
      const cityVal = params.get('city') || city || currentCity || '';
      const purposeVal = params.get('purpose') || purpose || '';
      const qVal = params.get('q') || params.get('localities') || '';
      const titleParts = [
        cityVal,
        purposeVal ? purposeVal.toUpperCase() : '',
        qVal ? `(${qVal})` : ''
      ].filter(Boolean);
      const title = titleParts.join(' ') || 'Custom Property Search';

      const filterObj = {};
      for (const [k, v] of params) {
        if (v) filterObj[k] = v;
      }

      await api('saved-searches', {
        method: 'POST',
        body: JSON.stringify({
          title,
          city: cityVal,
          purpose: purposeVal,
          query: qVal,
          filters: filterObj
        })
      });
      toast(`Search saved as "${title}". In-app alerts activated!`);
    } catch (err) {
      toast(err.message || 'Could not save search.');
    } finally {
      setSavingSearch(false);
    }
  }

  // Resolve the selected city to its full guide object for Spotlight.
  const selectedCityName = projects
    ? params.get('city') || city || displayCityName || ''
    : '';

  const spotlightCity = selectedCityName
    ? cityGuides?.find(item =>
        item.name?.toLowerCase() === selectedCityName.toLowerCase() ||
        item.slug === selectedCityName.toLowerCase().replace(/\s+/g, '-')
      )
    : null;

  function search(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();

    for (const [key, value] of form) {
      if (value && key !== 'amenities') {
        next.set(key, value);
      }
    }

    const selected = form
      .getAll('amenities')
      .flatMap(value => value.split(','))
      .filter(Boolean);

    if (selected.length) {
      next.set('amenities', [...new Set(selected)].join(','));
    }

    if (purpose && !form.get('purpose')) {
      next.set('purpose', purpose);
    }

    if (form.get('city')) {
      next.set('city', form.get('city'));
    }

    if (projects && form.get('locality') && !form.get('q')) {
      next.set('q', form.get('locality'));
    }

    router.push(
      `${basePath}${next.size ? `?${next.toString()}` : ''}`
    );
  }

  function page(number) {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(number));
    router.push(`?${next.toString()}`);
  }

  function clear() {
    const next = new URLSearchParams();

    if (city) {
      next.set('city', city);
    }

    router.push(
      `${basePath}${next.size ? `?${next.toString()}` : ''}`
    );
  }

  return (
    <div className={`${hideHeader ? '' : 'wrap'} pb-20`}>
      {/* Builder Projects Hero Banner (Dark Green Theme with Architectural Skyline & Floating Card) */}
      {projects && !hideHeader ? (
        <section className="relative bg-[#163e35] text-white rounded-3xl pt-8 pb-20 sm:pb-24 px-5 sm:px-8 lg:px-12 overflow-visible mb-20 sm:mb-24 shadow-xl">
          {/* Subtle Architectural Grid & Skyscraper Wireframe SVG watermark */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.09] rounded-3xl" aria-hidden="true">
            <svg className="w-full h-full" viewBox="0 0 1200 480" fill="none" stroke="currentColor" strokeWidth="1.2">
              <line x1="60" y1="480" x2="60" y2="120" />
              <line x1="140" y1="480" x2="140" y2="80" />
              <line x1="60" y1="120" x2="140" y2="80" />
              <line x1="140" y1="80" x2="210" y2="150" />
              <line x1="210" y1="480" x2="210" y2="150" />
              <line x1="280" y1="480" x2="280" y2="200" />
              <line x1="360" y1="480" x2="360" y2="60" />
              <line x1="280" y1="200" x2="360" y2="60" />
              <line x1="360" y1="60" x2="430" y2="110" />
              <line x1="430" y1="480" x2="430" y2="110" />
              <line x1="510" y1="480" x2="510" y2="180" />
              <line x1="580" y1="480" x2="580" y2="40" />
              <line x1="510" y1="180" x2="580" y2="40" />
              <line x1="580" y1="40" x2="650" y2="130" />
              <line x1="650" y1="480" x2="650" y2="130" />
              <line x1="720" y1="480" x2="720" y2="90" />
              <line x1="800" y1="480" x2="800" y2="160" />
              <line x1="720" y1="90" x2="800" y2="160" />
              <line x1="870" y1="480" x2="870" y2="70" />
              <line x1="800" y1="160" x2="870" y2="70" />
              <line x1="940" y1="480" x2="940" y2="140" />
              <line x1="870" y1="70" x2="940" y2="140" />
              <line x1="1020" y1="480" x2="1020" y2="50" />
              <line x1="1090" y1="480" x2="1090" y2="150" />
              <line x1="1020" y1="50" x2="1090" y2="150" />
              <line x1="1160" y1="480" x2="1160" y2="110" />
              <line x1="0" y1="420" x2="1200" y2="420" strokeDasharray="4 4" />
              <line x1="0" y1="340" x2="1200" y2="340" strokeDasharray="4 4" />
              <line x1="0" y1="260" x2="1200" y2="260" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="1200" y2="180" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Top Row: Logo & City Dropdown Pill */}
          <div className="relative z-10 flex items-center justify-between pb-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group cursor-pointer">
              <span className="w-9 h-9 rounded-xl bg-white/10 text-[#d8edb3] flex items-center justify-center shrink-0 border border-white/15 shadow-sm group-hover:bg-white/20 transition">
                <House size={20} />
              </span>
              <div className="flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                  urban<span className="brand-finder text-[#749546]">findr</span><span className="brand-dot text-[#749546]">.</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium tracking-normal text-white/70 leading-none mt-1">
                  Find. Connect. Build Your Life.
                </span>
              </div>
            </Link>

            {/* City Selector Pill with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(v => !v)}
                className="bg-white text-stone-800 font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-sm hover:bg-stone-50 transition flex items-center gap-1.5 cursor-pointer"
                aria-label="Select City"
              >
                <span>{displayCityName}</span>
                <ChevronDown size={14} className={`text-stone-500 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 text-stone-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Select City
                  </div>
                  {cityGuides.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setCityDropdownOpen(false);
                        setCurrentCity(c.name);
                        const next = new URLSearchParams(params.toString());
                        next.set('city', c.name);
                        next.delete('locality');
                        next.delete('q');
                        router.push(`${basePath}?${next.toString()}`);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm hover:bg-[#163e35]/10 hover:text-[#163e35] font-medium transition flex items-center justify-between cursor-pointer ${
                        displayCityName.toLowerCase() === c.name.toLowerCase()
                          ? 'text-[#163e35] font-bold bg-[#163e35]/5'
                          : 'text-stone-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      {displayCityName.toLowerCase() === c.name.toLowerCase() && (
                        <Check size={14} className="text-[#163e35]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Centered Bold Hero Title */}
          <div className="relative z-10 text-center my-4 sm:my-6">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Properties For Investment in {displayCityName}
            </h1>
            {activeCityGuide?.tagline && (
              <p className="text-[#d8edb3] text-xs sm:text-sm font-medium mt-2 opacity-90">
                {activeCityGuide.tagline}
              </p>
            )}
          </div>

          {/* Centered Tab: "Search by locality" only (no "Search by project name", no stats pill) */}
          <div className="relative z-10 flex justify-center mt-5 mb-1">
            <div className="bg-white text-[#163e35] px-5 py-2 rounded-full font-bold text-xs sm:text-sm shadow-sm">
              Search by locality
            </div>
          </div>

          {/* Overlapping Search Bar Card: Half inside the hero section, half outside extending downwards */}
          <div className="relative z-30 max-w-4xl mx-auto -mb-28 sm:-mb-32 pt-4">
            <form
              key={`projects:${displayCityName}:${params}`}
              onSubmit={search}
              className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border border-stone-100 text-stone-900"
            >
              <input type="hidden" name="city" value={displayCityName} />

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* Box 1: LOCATION */}
                <div className="sm:col-span-6 bg-stone-50 hover:bg-stone-100/70 border border-stone-200/90 rounded-xl px-3.5 py-2.5 transition focus-within:border-[#163e35] focus-within:ring-2 focus-within:ring-[#163e35]/15 focus-within:bg-white">
                  <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">
                    <MapPin size={13} className="text-[#163e35]" />
                    <span>LOCATION</span>
                  </div>
                  <input
                    name="locality"
                    list="project-localities-datalist"
                    defaultValue={params.get('locality') || params.get('q') || ''}
                    placeholder="Select Locality"
                    className="w-full bg-transparent font-medium text-stone-800 text-sm focus:outline-none placeholder:text-stone-400"
                  />
                  <datalist id="project-localities-datalist">
                    {cityLocalities.map(loc => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>

                {/* Box 2: POSSESSION */}
                <div className="sm:col-span-4 bg-stone-50 hover:bg-stone-100/70 border border-stone-200/90 rounded-xl px-3.5 py-2.5 transition focus-within:border-[#163e35] focus-within:ring-2 focus-within:ring-[#163e35]/15 focus-within:bg-white">
                  <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">
                    <KeyRound size={13} className="text-[#163e35]" />
                    <span>POSSESSION</span>
                  </div>
                  <select
                    name="stage"
                    defaultValue={params.get('stage') || ''}
                    className="w-full bg-transparent font-medium text-stone-800 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Time</option>
                    <option value="Ready to move">Ready to move</option>
                    <option value="Under construction">Under construction</option>
                    <option value="New launch">New launch</option>
                  </select>
                </div>

                {/* Box 3: SEARCH BUTTON */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[50px] bg-[#1c2420] hover:bg-[#163e35] text-white font-bold text-sm sm:text-base rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Expandable filters for Configuration (BHK), Maximum Budget, and Project or Builder Name */}
              {projectsExpanded && (
                <div className="mt-4 pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Configuration">
                    <select name="bedrooms" defaultValue={params.get('bedrooms') || ''}>
                      <option value="">All BHKs</option>
                      {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Maximum budget (₹)">
                    <input
                      type="number"
                      min="0"
                      name="maxPrice"
                      placeholder="Any budget"
                      defaultValue={params.get('maxPrice') || ''}
                    />
                  </Field>

                  <Field label="Search project or builder">
                    <input
                      name="q"
                      placeholder="e.g. Prestige, Godrej, Green Acres"
                      defaultValue={params.get('q') || ''}
                    />
                  </Field>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between mt-3 pt-2 text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => setProjectsExpanded(v => !v)}
                  className="text-[#163e35] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal size={13} />
                  <span>{projectsExpanded ? 'Fewer filters' : '+ More filters (BHK, Budget, Project name)'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <select
                    className="input !w-auto text-xs py-1 px-2.5 h-8"
                    name="sort"
                    aria-label="Sort results"
                    defaultValue={params.get('sort') || ''}
                  >
                    <option value="">Newest first</option>
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: low to high</option>
                  </select>

                  <button
                    type="button"
                    className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    onClick={clear}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {/* Regular Properties Hero (Only shown when not on Builder Projects) */}
      {!projects && !hideHeader &&
        (category ? (
          <section className={`category-hero category-${purpose}`}>
            <div>
              <p className="eyebrow">{category.eyebrow}</p>

              <h1>{category.title}</h1>

              <p className="muted mt-5 leading-7 max-w-xl">
                {category.description}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="chip">
                  <Check size={13} />
                  Direct owners
                </span>

                <span className="chip">
                  <Check size={13} />
                  Verified listings
                </span>

                <span className="chip">
                  <Check size={13} />
                  Book a site visit
                </span>
              </div>
            </div>

            <Image
              src={category.image}
              alt={`${category.label} property discovery`}
            />
          </section>
        ) : (
          <div className="page-heading">
            <p className="eyebrow">
              {favorites ? 'A LITTLE CLOSER TO HOME' : 'YOUR SPACE IS OUT THERE'}
            </p>

            <h1>
              {favorites
                ? 'Your saved homes.'
                : params.get('featured') === 'true'
                  ? 'Featured properties.'
                  : 'Explore all properties.'}
            </h1>

            <p className="muted mt-4">
              Find the right place. Connect directly with the owner.
            </p>
          </div>
        ))}

      {!projects && !favorites && (
        <nav
          className="tab-row category-links mb-6"
          aria-label="Property categories"
        >
          <Link
            href="/properties"
            className={!purpose ? 'active' : ''}
          >
            All properties
          </Link>

          {categories.map(item => (
            <Link
              key={item.purpose}
              className={purpose === item.purpose ? 'active' : ''}
              href={`${item.path}${
                city ? `?city=${encodeURIComponent(city)}` : ''
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link href="/post-property" className="!ml-auto">
            Post property <ArrowUpRight size={13} className="inline" />
          </Link>
        </nav>
      )}

      {!projects && (
        <form
          key={`${purpose || ''}:${city || ''}:${params}`}
          onSubmit={search}
          className="panel mb-8"
        >
        <div className="filter-grid">
          {projects ? (
            <Field label="Search">
              <input
                name="q"
                defaultValue={params.get('q') || ''}
                placeholder="Project, builder or locality"
              />
            </Field>
          ) : (
            <Field label="Locations (up to 5)">
              <MultiLocationInput
                selectedCity={currentCity}
                initialValue={params.get('localities') || params.get('q') || ''}
              />
            </Field>
          )}

          <Field label="City">
            <select
              name="city"
              value={currentCity}
              onChange={e => setCurrentCity(e.target.value)}
            >
              <option value="">All cities</option>
              {cities.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          {projects ? (
            <Field label="Project status">
              <select
                name="stage"
                defaultValue={params.get('stage') || ''}
              >
                <option value="">All stages</option>
                {[
                  'New launch',
                  'Under construction',
                  'Ready to move',
                ].map(value => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Looking to">
              <select
                name="purpose"
                defaultValue={purpose || params.get('purpose') || ''}
                disabled={!!purpose}
              >
                <option value="">
                  Buy, rent, PG & commercial
                </option>
                {categories.map(item => (
                  <option key={item.purpose} value={item.purpose}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label={`Maximum budget (₹${
              purpose === 'rent' || purpose === 'pg'
                ? ' / month'
                : ''
            })`}
          >
            <input
              type="number"
              min="0"
              name="maxPrice"
              placeholder="Any budget"
              defaultValue={params.get('maxPrice') || ''}
            />
          </Field>
        </div>

        {purpose === 'pg' && (
          <div className="pg-filter-row">
            <Field label="Room sharing">
              <select
                name="sharing"
                defaultValue={params.get('sharing') || ''}
              >
                <option value="">All room types</option>
                {[
                  'Private room',
                  '2 sharing',
                  '3 sharing',
                  '4+ sharing',
                ].map(value => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>

            <label className="check-label">
              <input
                type="checkbox"
                name="mealsIncluded"
                value="true"
                defaultChecked={params.get('mealsIncluded') === 'true'}
              />
              Meals included
            </label>

            <label className="check-label">
              <input
                type="checkbox"
                name="availableBeds"
                value="true"
                defaultChecked={params.get('availableBeds') === 'true'}
              />
              Available beds only
            </label>
          </div>
        )}

        {purpose === 'commercial' && (
          <div className="pg-filter-row">
            <Field label="Transaction">
              <select
                name="transaction"
                defaultValue={params.get('transaction') || ''}
              >
                <option value="">Sale & lease</option>
                <option value="lease">For lease / rent</option>
                <option value="sale">For sale</option>
              </select>
            </Field>

            <Field label="Business space">
              <select
                name="type"
                defaultValue={params.get('type') || ''}
              >
                <option value="">All commercial types</option>
                {['Office', 'Shop', 'Warehouse'].map(value => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {expanded && !projects && (
          <div className="mt-5">
            <div className="filter-grid">
              <Field label="Minimum price (₹)">
                <input
                  type="number"
                  min="0"
                  name="minPrice"
                  defaultValue={params.get('minPrice') || ''}
                />
              </Field>

              {purpose !== 'commercial' && purpose !== 'pg' && (
                <Field label="Bedrooms">
                  <select
                    name="bedrooms"
                    defaultValue={params.get('bedrooms') || ''}
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map(value => (
                      <option key={value} value={value}>
                        {value} BHK
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {purpose !== 'commercial' && (
                <Field label="Property type">
                  <select
                    name="type"
                    defaultValue={params.get('type') || ''}
                  >
                    <option value="">Any type</option>
                    {(
                      category?.types || [
                        'Apartment',
                        'Villa',
                        'Independent house',
                        'Plot',
                        'PG',
                        'Office',
                        'Shop',
                        'Warehouse',
                      ]
                    ).map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Furnishing">
                <select
                  name="furnishing"
                  defaultValue={params.get('furnishing') || ''}
                >
                  <option value="">Any</option>
                  {[
                    'Unfurnished',
                    'Semi-furnished',
                    'Fully furnished',
                  ].map(value => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>

              <Field label="Min. area (sq ft)">
                <input
                  type="number"
                  min="0"
                  name="minArea"
                  defaultValue={params.get('minArea') || ''}
                />
              </Field>

              <Field label="Max. area (sq ft)">
                <input
                  type="number"
                  min="0"
                  name="maxArea"
                  defaultValue={params.get('maxArea') || ''}
                />
              </Field>

              {purpose !== 'commercial' && (
                <Field label="Preferred occupants">
                  <select
                    name="preferredTenant"
                    defaultValue={params.get('preferredTenant') || ''}
                  >
                    <option value="">Any</option>
                    {[
                      'Anyone',
                      'Family',
                      'Bachelors',
                      'Women',
                      'Men',
                    ].map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Listed by">
                <select
                  name="ownership"
                  defaultValue={params.get('ownership') || ''}
                >
                  <option value="">All (Owner, Broker, Builder)</option>
                  <option value="owner">Direct Owner</option>
                  <option value="broker">Certified Broker</option>
                  <option value="builder">Reputed Builder</option>
                </select>
              </Field>

              <Field label="Property age">
                <select
                  name="propertyAge"
                  defaultValue={params.get('propertyAge') || ''}
                >
                  <option value="">Any age</option>
                  <option value="Newly built">Newly built</option>
                  <option value="Resale">Resale</option>
                  <option value="Older property">Older property</option>
                </select>
              </Field>

              <Field label="Availability">
                <select
                  name="availability"
                  defaultValue={params.get('availability') || ''}
                >
                  <option value="">Any availability</option>
                  <option value="Ready to move">Ready to move</option>
                  <option value="Under construction">Under construction</option>
                </select>
              </Field>

              <label className="check-label pt-5">
                <input
                  type="checkbox"
                  name="parking"
                  value="true"
                  defaultChecked={params.get('parking') === 'true'}
                />
                Parking available
              </label>

              <label className="check-label pt-5">
                <input
                  type="checkbox"
                  name="verified"
                  value="true"
                  defaultChecked={params.get('verified') === 'true'}
                />
                Verified listings only
              </label>
            </div>

            <div className="flex flex-wrap gap-4 mt-5">
              {amenities.map(value => (
                <label className="check-label" key={value}>
                  <input
                    type="checkbox"
                    name="amenities"
                    value={value}
                    defaultChecked={params
                      .get('amenities')
                      ?.split(',')
                      .includes(value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        )}

        {!expanded &&
          !projects &&
          fields
            .filter(
              key => !(purpose === 'commercial' && key === 'type')
            )
            .map(key =>
              params.get(key) ? (
                <input
                  type="hidden"
                  key={key}
                  name={key}
                  value={params.get(key)}
                />
              ) : null
            )}

        {params.get('featured') === 'true' && (
          <input type="hidden" name="featured" value="true" />
        )}

        <div className={`flex flex-wrap gap-4 justify-between items-center mt-5 ${projects ? 'projects-search-actions' : ''}`}>
          <div className="flex gap-4 items-center">
            {!projects && (
              <button
                type="button"
                className="text-link"
                onClick={() => setExpanded(value => !value)}
              >
                <SlidersHorizontal size={16} />
                {expanded ? 'Fewer filters' : 'More filters'}
              </button>
            )}

            <button
              type="button"
              className={projects ? 'projects-clear-btn' : 'text-xs muted'}
              onClick={clear}
            >
              Clear filters
            </button>
          </div>

          <div className="flex gap-3">
            <select
              className="input !w-auto"
              name="sort"
              aria-label="Sort results"
              defaultValue={params.get('sort') || ''}
            >
              <option value="">Newest first</option>
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>

              {!projects && (
                <>
                  <option value="price-desc">Price: high to low</option>
                  <option value="area-desc">Largest first</option>
                </>
              )}
            </select>

            <button className="btn" type="submit">
              <Search size={16} />
              Search
            </button>
          </div>
        </div>
      </form>
      )}

      <div className={projects ? 'pt-16 sm:pt-20' : ''}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {data
              ? `${data.total} ${
                  projects
                    ? 'projects'
                    : purpose === 'commercial'
                      ? 'commercial spaces'
                      : purpose === 'pg'
                        ? 'PG / co-living spaces'
                        : 'properties'
                } found`
              : 'Finding places…'}
          </span>

          {!projects && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-stone-300 hover:border-forest text-stone-700 hover:text-forest bg-white transition shadow-sm"
              onClick={saveSearch}
              disabled={savingSearch}
              title="Save search criteria & receive alerts for new matching listings"
            >
              <Bell size={13} className="text-forest" />
              {savingSearch ? 'Saving...' : 'Save search & alerts'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!projects && (
            <div className="inline-flex items-center p-0.5 rounded-lg border border-stone-200 bg-stone-100 text-xs">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-forest shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={13} />
                Grid
              </button>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-white text-forest shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon size={13} />
                Map View
              </button>
            </div>
          )}

          <span className="text-xs muted hidden sm:inline">
            {projects
              ? 'Verified builder projects'
              : 'Direct owner connections.'}
          </span>
        </div>
      </div>

      <State
        loading={loading}
        error={error}
        empty={data?.total === 0}
      />

      {!loading && (
        viewMode === 'map' && !projects ? (
          <div className="mb-10">
            <PropertyMapView
              properties={data?.items || []}
              city={currentCity || 'Hyderabad'}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map(item =>
              projects ? (
                <ProjectCard key={item._id} item={item} />
              ) : (
                <PropertyCard
                  key={item._id}
                  item={item}
                  onFavorite={favorites ? reload : undefined}
                />
              )
            )}
          </div>
        )
      )}

      {viewMode !== 'map' && <Pagination data={data} onChange={page} />}

      {/* Spotlight belongs to Builder Projects, not city discovery pages. */}
      {projects && spotlightCity && (
        <div className="mt-14">
          <CitySpotlight
            key={spotlightCity.slug}
            city={spotlightCity}
          />
        </div>
      )}

      {/* Regular properties appear below the Spotlight. */}
      {projects && selectedCityName && (
        <CityPropertiesSection cityName={selectedCityName} />
      )}
      </div>
    </div>
  );
}
