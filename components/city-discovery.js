'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowUpRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Check,
  House,
  KeyRound,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Car,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';
import PropertyMapView from './PropertyMapView';

import { useData } from './providers';
import {
  Image,
  State,
  SectionTitle,
  Field,
  Pagination,
  PropertyCard,
  ProjectCard,
} from './ui';

import {
  cityGuides,
  cityFor,
  categories,
  categoryFor,
  listingQuery,
} from '@/lib/catalog';

import { amenities, cities } from '@/lib/format';

export function CityCards({ stats }) {
  return (
    <div className="city-grid">
      {cityGuides.map((city) => {
        const summary = stats?.cities?.find(
          (item) => item.slug === city.slug
        );

        return (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="city-card"
          >
            <Image
              src={city.image}
              alt={`${city.name} city illustration`}
            />

            <div>
              <h3>{city.name}</h3>
              <p>
                {summary
                  ? `${summary.total} properties · ${summary.projects} builder projects`
                  : 'Explore properties & projects'}
              </p>
            </div>

            <ArrowUpRight size={18} />
          </Link>
        );
      })}
    </div>
  );
}

export default function CityDiscovery({ slug }) {
  const router = useRouter();
  const params = useSearchParams();

  const {
    data: discoveryData,
    error: discoveryError,
    loading: discoveryLoading,
  } = useData('discovery');

  const [showAmenities, setShowAmenities] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState(params.get('minPrice') || '');
  const [maxPriceInput, setMaxPriceInput] = useState(params.get('maxPrice') || '');
  const [viewMode, setViewMode] = useState('grid');

  const city = cityFor(slug);

  if (slug && !city) {
    return (
      <div className="wrap section">
        <h1>City not found.</h1>
        <Link className="btn mt-6" href="/cities">
          Explore all cities
        </Link>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="wrap section">
        <SectionTitle
          eyebrow="START WITH THE NEIGHBOURHOOD"
          title="Explore by city"
          description="Discover homes, co-living spaces, commercial properties and builder projects in six cities."
        />

        <State
          loading={discoveryLoading}
          error={discoveryError}
        />

        <CityCards stats={discoveryData} />
      </div>
    );
  }

  const summary = discoveryData?.cities?.find(
    (item) => item.slug === slug
  );

  const isProjects = params.get('projects') === 'true';

  const purpose = categories.some(
    (item) => item.purpose === params.get('purpose')
  )
    ? params.get('purpose')
    : undefined;

  const category = categoryFor(purpose);

  // Query for properties or builder projects
  const propertiesQuery = listingQuery(params, {
    purpose,
    city: city.name,
  });

  const projectsQuery = listingQuery(params, {
    city: city.name,
    stage: params.get('propertyStatus') || undefined,
  });

  const {
    data: properties,
    error: propertiesError,
    loading: propertiesLoading,
    reload: reloadProperties,
  } = useData(!isProjects ? `properties?${propertiesQuery}` : null);

  const {
    data: projectsData,
    error: projectsError,
    loading: projectsLoading,
  } = useData(isProjects ? `projects?${projectsQuery}` : null);

  const displayData = isProjects ? projectsData : properties;
  const displayLoading = isProjects ? projectsLoading : propertiesLoading;
  const displayError = isProjects ? projectsError : propertiesError;

  function updateParams(updates) {
    const next = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === false
      ) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }

    next.delete('page');

    const queryString = next.toString();

    router.push(
      `/cities/${slug}${queryString ? `?${queryString}` : ''}`,
      { scroll: false }
    );
  }

  function toggleLocality(locality) {
    if (
      (params.get('q') || '').toLowerCase() ===
      locality.toLowerCase()
    ) {
      updateParams({ q: null });
    } else {
      updateParams({ q: locality });
    }
  }

  function clearAll() {
    router.push(`/cities/${slug}`, { scroll: false });
    setMinPriceInput('');
    setMaxPriceInput('');
  }

  function handleHeroSearchSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedCityName = form.get('city');
    const query = (form.get('q') || '').trim();

    const targetCity = cityGuides.find((c) => c.name === selectedCityName);
    const targetSlug = targetCity ? targetCity.slug : slug;

    const next = new URLSearchParams(params.toString());
    next.delete('page');

    if (query) {
      next.set('q', query);
    } else {
      next.delete('q');
    }

    if (targetSlug !== slug) {
      router.push(`/cities/${targetSlug}${next.size ? `?${next.toString()}` : ''}`);
    } else {
      router.push(`/cities/${slug}${next.size ? `?${next.toString()}` : ''}`, { scroll: false });
    }
  }

  function handlePageChange(pageNumber) {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(pageNumber));
    router.push(`/cities/${slug}?${next.toString()}`, { scroll: true });
  }

  // Active filters count
  const filterKeys = [
    'projects',
    'bedrooms',
    'type',
    'furnishing',
    'propertyStatus',
    'parking',
    'minPrice',
    'maxPrice',
    'amenities',
    'q',
  ];
  const activeFiltersCount = filterKeys.filter((k) => !!params.get(k)).length;

  const currentBedrooms = params.get('bedrooms') || '';
  const currentType = params.get('type') || '';
  const currentStatus = params.get('propertyStatus') || '';
  const currentFurnishing = params.get('furnishing') || '';

  const isRentOrPg = purpose === 'rent' || purpose === 'pg';

  // Section title computation based on active side search filters
  const getSectionTitle = () => {
    if (isProjects) {
      if (currentBedrooms) return `${currentBedrooms} BHK Builder Projects in ${city.name}`;
      return `New Builder Projects in ${city.name}`;
    }
    if (currentBedrooms && currentType) {
      return `${currentBedrooms} BHK ${currentType}s in ${city.name}`;
    }
    if (currentBedrooms) {
      return `${currentBedrooms} BHK Flats & Homes in ${city.name}`;
    }
    if (currentType) {
      return `${currentType} Properties in ${city.name}`;
    }
    if (purpose) {
      return `${category?.label || 'Properties'} for ${category?.label} in ${city.name}`;
    }
    return `Properties in ${city.name}`;
  };

  // Price presets - compact for NoBroker style
  const pricePresets = isRentOrPg
    ? [
        { label: 'Any', min: null, max: null },
        { label: '< 15K', min: null, max: '15000' },
        { label: '15K-30K', min: '15000', max: '30000' },
        { label: '30K-50K', min: '30000', max: '50000' },
        { label: '> 50K', min: '50000', max: null },
      ]
    : [
        { label: 'Any', min: null, max: null },
        { label: '< 50L', min: null, max: '5000000' },
        { label: '50L-1Cr', min: '5000000', max: '10000000' },
        { label: '1Cr-2Cr', min: '10000000', max: '20000000' },
        { label: '> 2Cr', min: '20000000', max: null },
      ];

  return (
    <div className="city-page-fullscreen-container">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION (Centered Layout & Centered Search Bar)
         ───────────────────────────────────────────────────────────── */}
      <section className="city-hero-fullscreen">
        <img
          src={
            city.image.includes('unsplash')
              ? city.image.replace('w=1200', 'w=1800')
              : city.image
          }
          alt={`${city.name} skyline`}
          className="city-hero-fullscreen-bg"
        />
        <div className="city-hero-fullscreen-overlay" />

        <div className="city-hero-fullscreen-content">
          {/* Top exploration breadcrumb */}
          <div className="w-full flex items-center justify-between flex-wrap gap-2 mb-3">
            <Link
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold transition"
              href="/cities"
            >
              ← Explore all cities
            </Link>
          </div>

          {/* Centered Heading & Tagline */}
          <div className="text-center max-w-2xl mx-auto mb-2">
            <h1 className="!my-0 !text-3xl md:!text-4xl text-white font-bold">
              Explore {city.name}
            </h1>
            <p className="city-hero-fullscreen-tagline !mb-0 !mt-1 text-white/85 text-sm">
              {city.tagline}
            </p>
          </div>

          {/* Centered Trust Chips */}
          {summary && (
            <div className="city-hero-fullscreen-chips justify-center !mb-1">
              <span className="city-hero-chip">
                <span className="w-2 h-2 rounded-full bg-lime inline-block" />
                {summary.total} properties
              </span>

              <span className="city-hero-chip">
                <span className="w-2 h-2 rounded-full bg-lime inline-block" />
                {summary.projects} projects
              </span>
            </div>
          )}

          {/* ── SEARCH BAR CENTERED IN THE MIDDLE OF HERO ── */}
          <form
            className="city-hero-search"
            onSubmit={handleHeroSearchSubmit}
          >
            <div
              className="search-tabs"
              role="tablist"
              aria-label="What are you looking for in this city?"
            >
              <button
                role="tab"
                aria-selected={!purpose}
                type="button"
                className={!purpose ? 'active' : ''}
                onClick={() => updateParams({ purpose: null })}
              >
                All properties
              </button>
              {categories.map((item) => {
                const Icon =
                  item.purpose === 'buy'
                    ? House
                    : item.purpose === 'rent'
                    ? KeyRound
                    : item.purpose === 'pg'
                    ? BedDouble
                    : BriefcaseBusiness;
                const isActive = purpose === item.purpose;
                return (
                  <button
                    role="tab"
                    aria-selected={isActive}
                    key={item.purpose}
                    type="button"
                    className={isActive ? 'active' : ''}
                    onClick={() =>
                      updateParams({
                        purpose: isActive ? null : item.purpose,
                      })
                    }
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="search-inputs">
              <label className="flex gap-2 items-center">
                <MapPin size={18} className="text-forest flex-shrink-0" />
                <select
                  name="city"
                  defaultValue={city.name}
                  aria-label="City"
                  onChange={(e) => {
                    const targetCity = cityGuides.find(
                      (c) => c.name === e.target.value
                    );
                    if (targetCity && targetCity.slug !== slug) {
                      const q = params.get('q');
                      const nextQuery = new URLSearchParams({
                        ...(purpose ? { purpose } : {}),
                        ...(q ? { q } : {}),
                      }).toString();
                      router.push(
                        `/cities/${targetCity.slug}${
                          nextQuery ? `?${nextQuery}` : ''
                        }`
                      );
                    }
                  }}
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2.5 search-locality">
                <Search size={18} className="muted flex-shrink-0" />
                <input
                  name="q"
                  key={params.get('q') || ''}
                  defaultValue={params.get('q') || ''}
                  aria-label={`Locality or property in ${city.name}`}
                  placeholder={`Search locality or landmark in ${city.name} (e.g. ${city.localities
                    .slice(0, 2)
                    .join(', ')})`}
                  maxLength={100}
                />
              </label>

              <button className="btn" type="submit">
                <Search size={15} />
                <span>
                  {purpose === 'pg'
                    ? 'Find PG'
                    : purpose === 'commercial'
                    ? 'Find space'
                    : purpose === 'rent'
                    ? 'Find rentals'
                    : purpose === 'buy'
                    ? 'Find homes'
                    : `Search`}
                </span>
              </button>
            </div>
          </form>

          {/* Centered Popular Localities in City */}
          <div className="city-hero-localities justify-center">
            <span className="text-white/75 font-medium text-xs">
              Popular in {city.name}:
            </span>
            {city.localities.map((loc) => {
              const isSelected =
                (params.get('q') || '').toLowerCase() === loc.toLowerCase();
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocality(loc)}
                  className={isSelected ? '!bg-lime !text-forest font-bold' : ''}
                >
                  {loc} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA (NoBroker-Style Small Cards Sidebar + Grid)
         ───────────────────────────────────────────────────────────── */}
      <div className="city-page-fullwidth pb-20">
        {discoveryError && (
          <div className="mb-6">
            <State error={discoveryError} />
          </div>
        )}

        <div className="city-discovery-layout">
          {/* ─────────────────────────────────────────────────────────
              LEFT SIDEBAR: NoBroker-Style Small Cards & Clear UI
             ───────────────────────────────────────────────────────── */}
          <aside className="city-discovery-sidebar nobroker-sidebar">
            {/* Header: Title & Reset */}
            <div className="nobroker-card flex items-center justify-between !py-2.5">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={15} className="text-forest" />
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-forest text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="nobroker-reset-btn flex items-center gap-1"
                >
                  <RotateCcw size={10} /> Clear all
                </button>
              )}
            </div>

            {/* CARD 1: NEW BUILDER PROJECTS CHECKBOX */}
            <label className="nobroker-builder-card">
              <input
                type="checkbox"
                checked={isProjects}
                onChange={(e) =>
                  updateParams({
                    projects: e.target.checked ? 'true' : null,
                  })
                }
              />
              <div className="flex-1">
                <span className="font-bold text-xs text-forest flex items-center gap-1">
                  <Building2 size={14} /> New Builder Projects
                </span>
                <span className="text-[10px] text-muted block leading-tight">
                  RERA gated communities &amp; townships
                </span>
              </div>
            </label>

            {/* CARD 2: BHK TYPE (Small Square Grid - NoBroker style) */}
            <div className="nobroker-card">
              <div className="nobroker-card-header">
                <span className="nobroker-card-title">BHK Type</span>
                {currentBedrooms && (
                  <button
                    type="button"
                    className="nobroker-reset-btn"
                    onClick={() => updateParams({ bedrooms: null })}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="nobroker-bhk-grid">
                {[
                  { id: '', label: 'Any' },
                  { id: '1', label: '1 BHK' },
                  { id: '2', label: '2 BHK' },
                  { id: '3', label: '3 BHK' },
                  { id: '4', label: '4 BHK' },
                  { id: '4+', label: '4+ BHK' },
                ].map((item) => {
                  const isSelected = item.id === ''
                    ? !currentBedrooms
                    : currentBedrooms === item.id;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`nobroker-bhk-btn ${isSelected ? 'active' : ''}`}
                      onClick={() =>
                        updateParams({
                          bedrooms: item.id || null,
                          purpose: null, // Clears purpose so all 2 BHK / 3 BHK homes come
                        })
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: PROPERTY TYPE (Compact Chips) */}
            <div className="nobroker-card">
              <div className="nobroker-card-header">
                <span className="nobroker-card-title">Property Type</span>
                {currentType && (
                  <button
                    type="button"
                    className="nobroker-reset-btn"
                    onClick={() => updateParams({ type: null })}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="nobroker-chip-grid">
                {[
                  { id: '', label: 'All' },
                  { id: 'Apartment', label: 'Apartment' },
                  { id: 'Villa', label: 'Villa' },
                  { id: 'Independent house', label: 'Independent' },
                  { id: 'Plot', label: 'Land / Plot' },
                  { id: 'Gated community', label: 'Gated Community' },
                  { id: 'Commercial', label: 'Commercial' },
                ].map((item) => {
                  const isSelected = item.id === '' ? !currentType : currentType === item.id;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`nobroker-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => updateParams({ type: item.id || null })}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 4: PRICE RANGE (Compact Presets + Min/Max) */}
            <div className="nobroker-card">
              <div className="nobroker-card-header">
                <span className="nobroker-card-title">
                  Price Range {isRentOrPg ? '(₹/mo)' : '(₹)'}
                </span>
                {(params.get('minPrice') || params.get('maxPrice')) && (
                  <button
                    type="button"
                    className="nobroker-reset-btn"
                    onClick={() => {
                      setMinPriceInput('');
                      setMaxPriceInput('');
                      updateParams({ minPrice: null, maxPrice: null });
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div className="nobroker-chip-grid mb-2">
                {pricePresets.map((preset) => {
                  const currentMin = params.get('minPrice') || null;
                  const currentMax = params.get('maxPrice') || null;
                  const isSelected = currentMin === preset.min && currentMax === preset.max;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      className={`nobroker-chip !text-[11px] ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setMinPriceInput(preset.min || '');
                        setMaxPriceInput(preset.max || '');
                        updateParams({
                          minPrice: preset.min,
                          maxPrice: preset.max,
                        });
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Min & Max Inputs */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <div>
                  <span className="text-[10px] muted block mb-0.5">Min ₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    onBlur={(e) =>
                      updateParams({ minPrice: e.target.value || null })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateParams({ minPrice: e.currentTarget.value || null });
                      }
                    }}
                    className="nobroker-input"
                  />
                </div>
                <div>
                  <span className="text-[10px] muted block mb-0.5">Max ₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    onBlur={(e) =>
                      updateParams({ maxPrice: e.target.value || null })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateParams({ maxPrice: e.currentTarget.value || null });
                      }
                    }}
                    className="nobroker-input"
                  />
                </div>
              </div>
            </div>

            {/* CARD 5: PROPERTY STATUS */}
            <div className="nobroker-card">
              <div className="nobroker-card-header">
                <span className="nobroker-card-title">Property Status</span>
                {currentStatus && (
                  <button
                    type="button"
                    className="nobroker-reset-btn"
                    onClick={() => updateParams({ propertyStatus: null })}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="nobroker-chip-grid">
                {[
                  { id: '', label: 'All' },
                  { id: 'Ready to move', label: 'Ready' },
                  { id: 'Under construction', label: 'Under Construction' },
                  { id: 'New launch', label: 'New Launch' },
                ].map((item) => {
                  const isSelected = item.id === '' ? !currentStatus : currentStatus === item.id;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`nobroker-chip ${isSelected ? 'active' : ''}`}
                      onClick={() =>
                        updateParams({ propertyStatus: item.id || null })
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 6: FURNISHING */}
            <div className="nobroker-card">
              <div className="nobroker-card-header">
                <span className="nobroker-card-title">Furnishing</span>
                {currentFurnishing && (
                  <button
                    type="button"
                    className="nobroker-reset-btn"
                    onClick={() => updateParams({ furnishing: null })}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="nobroker-chip-grid">
                {[
                  { id: '', label: 'All' },
                  { id: 'Fully furnished', label: 'Full' },
                  { id: 'Semi-furnished', label: 'Semi' },
                  { id: 'Unfurnished', label: 'None' },
                ].map((item) => {
                  const isSelected = item.id === '' ? !currentFurnishing : currentFurnishing === item.id;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`nobroker-chip ${isSelected ? 'active' : ''}`}
                      onClick={() =>
                        updateParams({ furnishing: item.id || null })
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 7: PARKING */}
            <div className="nobroker-card">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.get('parking') === 'true'}
                  onChange={(e) =>
                    updateParams({ parking: e.target.checked ? 'true' : null })
                  }
                  className="w-4 h-4 accent-forest"
                />
                <span className="text-xs font-semibold text-forest flex items-center gap-1.5">
                  <Car size={13} /> 4-Wheeler Parking Available
                </span>
              </label>
            </div>

            {/* CARD 8: LOCALITIES */}
            <div className="nobroker-card">
              <div className="nobroker-card-header">
                <span className="nobroker-card-title">Top Localities</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {city.localities.map((loc) => {
                  const isSelected =
                    (params.get('q') || '').toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocality(loc)}
                      className={`chip !text-[10.5px] !py-0.5 !px-1.5 cursor-pointer ${
                        isSelected
                          ? '!bg-forest !text-white'
                          : 'hover:!bg-[#eaf0e1]'
                      }`}
                    >
                      <span>{loc}</span>
                      {isSelected && <Check size={9} className="ml-0.5 inline" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 9: AMENITIES (Collapsible) */}
            <div className="nobroker-card">
              <button
                type="button"
                className="w-full flex items-center justify-between text-xs font-bold text-forest"
                onClick={() => setShowAmenities(!showAmenities)}
              >
                <span className="nobroker-card-title !mb-0">Amenities</span>
                {showAmenities ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showAmenities && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {amenities.map((item) => {
                    const selectedAmenities = (params.get('amenities') || '').split(',').filter(Boolean);
                    const isChecked = selectedAmenities.includes(item);

                    return (
                      <label
                        key={item}
                        className="check-label !text-[10.5px] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const nextAmenities = e.target.checked
                              ? [...selectedAmenities, item]
                              : selectedAmenities.filter((a) => a !== item);
                            updateParams({
                              amenities: nextAmenities.length ? nextAmenities.join(',') : null,
                            });
                          }}
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────────────
              RIGHT COLUMN: Sections Based on Side Search Bar
             ───────────────────────────────────────────────────────── */}
          <main className="city-main min-w-0">
            {/* Quick Section Tabs (NoBroker-Style Shortcut Bar) */}
            <div className="city-section-tabs">
              <button
                type="button"
                className={`city-section-tab ${
                  !currentBedrooms && !currentType && !isProjects ? 'active' : ''
                }`}
                onClick={() =>
                  updateParams({
                    bedrooms: null,
                    type: null,
                    projects: null,
                  })
                }
              >
                All Properties
              </button>

              <button
                type="button"
                className={`city-section-tab ${
                  currentBedrooms === '2' && !isProjects ? 'active' : ''
                }`}
                onClick={() =>
                  updateParams({
                    bedrooms: '2',
                    projects: null,
                    purpose: null,
                  })
                }
              >
                2 BHK Flats
              </button>

              <button
                type="button"
                className={`city-section-tab ${
                  currentBedrooms === '3' && !isProjects ? 'active' : ''
                }`}
                onClick={() =>
                  updateParams({
                    bedrooms: '3',
                    projects: null,
                    purpose: null,
                  })
                }
              >
                3 BHK Flats
              </button>

              <button
                type="button"
                className={`city-section-tab ${
                  currentType === 'Villa' && !isProjects ? 'active' : ''
                }`}
                onClick={() =>
                  updateParams({
                    type: 'Villa',
                    bedrooms: null,
                    projects: null,
                  })
                }
              >
                Villas
              </button>

              <button
                type="button"
                className={`city-section-tab ${isProjects ? 'active' : ''}`}
                onClick={() =>
                  updateParams({
                    projects: 'true',
                    bedrooms: null,
                    type: null,
                  })
                }
              >
                <Building2 size={13} className="inline mr-1" /> Builder Projects
              </button>
            </div>

            {/* Dynamic Section Header based on side search bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="!text-xl font-bold flex items-center gap-2">
                  {isProjects && <Building2 size={21} className="text-forest" />}
                  {getSectionTitle()}
                </h2>
                <p className="text-xs muted mt-0.5">
                  {isProjects
                    ? 'Explore RERA-approved developments and gated townships in ' + city.name
                    : currentBedrooms
                    ? `Showing verified ${currentBedrooms} BHK properties in ${city.name} with direct owner contact`
                    : 'Verified direct owner listings in ' + city.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-forest">
                  {displayData?.total ?? 0} {isProjects ? 'projects' : 'properties'} found
                </span>

                <select
                  className="input !w-auto !py-1 !px-2.5 !text-xs !min-h-0"
                  name="sort"
                  aria-label="Sort results"
                  value={params.get('sort') || ''}
                  onChange={(event) =>
                    updateParams({
                      sort: event.target.value || null,
                    })
                  }
                >
                  <option value="">Newest first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  {!isProjects && <option value="area-desc">Largest first</option>}
                </select>
              </div>
            </div>

            <State
              loading={displayLoading}
              error={displayError}
              empty={displayData?.total === 0}
            />

            {!displayLoading && displayData?.items?.length > 0 && (
              viewMode === 'map' && !isProjects ? (
                <div className="mb-8">
                  <PropertyMapView
                    properties={displayData.items}
                    city={city.name}
                  />
                </div>
              ) : (
              <div className="city-properties-grid">
                {displayData.items.map((item) =>
                  isProjects ? (
                    <ProjectCard key={item._id} item={item} />
                  ) : (
                    <PropertyCard
                      key={item._id}
                      item={item}
                      onFavorite={reloadProperties}
                    />
                  )
                )}
              </div>
              )
            )}

            {viewMode !== 'map' && (
              <Pagination
                data={displayData}
                onChange={handlePageChange}
              />
            )}

            {/* CURATED CITY SECTIONS (Shown when exploring all properties) */}
            {!isProjects && !currentBedrooms && !currentType && !displayLoading && (
              <div className="mt-12 pt-8 border-t border-line space-y-10">
                {/* Section: 2 BHK Flats shortcut */}
                <div className="p-5 rounded-xl bg-[#f8faf4] border border-[#e2e8da] flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="!text-base font-bold text-forest">
                      Looking for 2 BHK Homes in {city.name}?
                    </h3>
                    <p className="text-xs muted mt-1">
                      Browse verified 2 BHK apartments and independent homes.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn !py-2 !px-4 !text-xs"
                    onClick={() => updateParams({ bedrooms: '2', purpose: null })}
                  >
                    View 2 BHK Flats in {city.name} <ArrowUpRight size={13} className="inline ml-1" />
                  </button>
                </div>

                {/* Section: 3 BHK Flats shortcut */}
                <div className="p-5 rounded-xl bg-[#f8faf4] border border-[#e2e8da] flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="!text-base font-bold text-forest">
                      Spacious 3 BHK Flats in {city.name}
                    </h3>
                    <p className="text-xs muted mt-1">
                      Discover premium 3 BHK living spaces with top amenities in prime localities.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn !py-2 !px-4 !text-xs"
                    onClick={() => updateParams({ bedrooms: '3', purpose: null })}
                  >
                    View 3 BHK Flats in {city.name} <ArrowUpRight size={13} className="inline ml-1" />
                  </button>
                </div>

                {/* Section: Builder Projects shortcut */}
                <div className="p-5 rounded-xl bg-[#eef5e7] border border-[#bddab0] flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="eyebrow !text-forest text-[11px] block">RERA APPROVED</span>
                    <h3 className="!text-base font-bold text-forest mt-0.5">
                      New Builder Projects &amp; Townships in {city.name}
                    </h3>
                    <p className="text-xs muted mt-1">
                      Compare leading builders, floor plans and request a guided site visit.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-outline !py-2 !px-4 !text-xs"
                    onClick={() => updateParams({ projects: 'true' })}
                  >
                    Explore Builder Projects <ArrowUpRight size={13} className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
