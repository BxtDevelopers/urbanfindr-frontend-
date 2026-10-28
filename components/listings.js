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
  Sparkles,
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
  const [viewMode, setViewMode] = useState('grid');
  const [savingSearch, setSavingSearch] = useState(false);
  const [currentCity, setCurrentCity] = useState(params.get('city') || city || '');

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
    ? params.get('city') || city || ''
    : '';

  const currentCityData = cityGuides?.find(
    c => c.name?.toLowerCase() === (currentCity || '').toLowerCase() || c.slug === (currentCity || '').toLowerCase().replace(/\s+/g, '-')
  );
  const currentCityLocalities = currentCityData?.localities || [];

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
      {!hideHeader &&
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
          <div className={projects ? 'projects-hero-heading' : 'page-heading'}>
            <p className={projects ? 'projects-hero-eyebrow' : 'eyebrow'}>
              {projects
                ? 'COMMUNITIES FOR YOUR NEXT CHAPTER'
                : favorites
                  ? 'A LITTLE CLOSER TO HOME'
                  : 'YOUR SPACE IS OUT THERE'}
            </p>

            <h1 className={projects ? 'projects-hero-title' : ''}>
              {projects
                ? 'A fresh beginning starts here.'
                : favorites
                  ? 'Your saved homes.'
                  : params.get('featured') === 'true'
                    ? 'Featured properties.'
                    : 'Explore all properties.'}
            </h1>

            <p className={projects ? 'projects-hero-sub' : 'muted mt-4'}>
              {projects
                ? 'Compare builders, explore floor plans and book a project visit.'
                : 'Find the right place. Connect directly with the owner.'}
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

      <form
        key={`${purpose || ''}:${city || ''}:${params}`}
        onSubmit={search}
        className={projects ? 'projects-search-bar' : 'panel mb-8'}
      >
        <div className="filter-grid">
          {projects ? (
            <>
              <Field label="Search project or builder">
                <input
                  name="q"
                  defaultValue={params.get('q') || ''}
                  placeholder="Project, builder or locality"
                />
              </Field>

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

              <Field label="Locality">
                <input
                  name="locality"
                  list="project-localities-datalist"
                  defaultValue={params.get('locality') || ''}
                  placeholder={currentCityLocalities.length ? `e.g. ${currentCityLocalities.slice(0, 2).join(', ')}` : "All localities"}
                />
                {currentCityLocalities.length > 0 && (
                  <datalist id="project-localities-datalist">
                    {currentCityLocalities.map(loc => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                )}
              </Field>

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

              <Field label="Configurations">
                <select
                  name="bedrooms"
                  defaultValue={params.get('bedrooms') || ''}
                >
                  <option value="">All BHKs</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
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
            </>
          ) : (
            <>
              <Field label="Locations (up to 5)">
                <MultiLocationInput
                  selectedCity={currentCity}
                  initialValue={params.get('localities') || params.get('q') || ''}
                />
              </Field>

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
            </>
          )}
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

            <button className={projects ? 'projects-search-btn' : 'btn'} type="submit">
              <Search size={16} />
              Search
            </button>
          </div>
        </div>
      </form>

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

      {/* Featured Projects Placement (Step 12) */}
      {projects && !loading && data?.items?.some(item => item.featured) && (
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-forest/10 via-forest/5 to-transparent border border-forest/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow !text-forest !mb-1 flex items-center gap-1 font-bold">
                <Sparkles size={14} className="text-forest" /> SPONSORED DEVELOPER SHOWCASES
              </p>
              <h2 className="!text-2xl font-bold">Featured Builder Developments</h2>
            </div>
            <span className="pill !bg-forest !text-lime text-xs font-semibold">Priority Placements</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.filter(item => item.featured).slice(0, 3).map(item => (
              <ProjectCard key={`featured-${item._id}`} item={item} />
            ))}
          </div>
        </div>
      )}

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
  );
}
