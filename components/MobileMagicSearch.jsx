'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Search,
  Check,
  X,
  ChevronDown,
  SlidersHorizontal,
  Building,
  Home as HomeIcon,
  Grid,
  Briefcase,
  Store,
  Warehouse,
  Sparkles
} from 'lucide-react';

// Only the 8 metro cities that exist on the UrbanFindr website (no added cities like Ghaziabad, etc.)
export const MAGIC_CITIES = [
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-hyderabad.svg'
  },
  {
    id: 'delhi',
    name: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-delhi-ncr.svg'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-bengaluru.svg'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-mumbai.svg'
  },
  {
    id: 'pune',
    name: 'Pune',
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-pune.svg'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-chennai.svg'
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-delhi-ncr.svg'
  },
  {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=200&h=200&q=80',
    fallbackSvg: '/images/city-delhi-ncr.svg'
  }
];

export default function MobileMagicSearch({ initialTotal = null }) {
  const router = useRouter();

  // Active category tab: 'buy' | 'rent' | 'projects' | 'plot' | 'commercial' | 'pg'
  const [activeCategory, setActiveCategory] = useState('buy');

  // Filter modal open state
  const [isOpen, setIsOpen] = useState(false);

  // Full-screen Circular City Selector Modal (Reference Image 1)
  const [isCitySelectOpen, setIsCitySelectOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Selected City: Initially empty ("Search By City")
  const [selectedCity, setSelectedCity] = useState('');

  // Budget
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Property types: array of selected values e.g. ['Flat']
  const [selectedTypes, setSelectedTypes] = useState(['Flat']);

  // BHK: array of selected BHKs e.g. ['1', '2']
  const [selectedBhks, setSelectedBhks] = useState([]);

  // Possession Within (Reference Image 2): '1 yr' | '2 yrs' | '3 yrs' | '3 yrs+' | ''
  const [possessionWithin, setPossessionWithin] = useState('');

  // Check Advanced Filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Filter state variables
  const [postedBy, setPostedBy] = useState(''); // 'owner' | 'broker' | 'builder' | ''
  const [preferredTenant, setPreferredTenant] = useState(''); // 'Family' | 'Bachelors' | 'Company' | 'Anyone' | ''
  const [postedSince, setPostedSince] = useState(''); // 'yesterday' | '3days' | '7days' | '2weeks' | 'month' | ''
  const [availability, setAvailability] = useState(''); // 'immediate' | '15days' | '30days' | 'after30days' | ''
  const [furnishing, setFurnishing] = useState(''); // 'Fully furnished' | 'Semi-furnished' | 'Unfurnished' | ''
  const [floor, setFloor] = useState(''); // 'ground' | '1-4' | '5-8' | '9-12' | '13+' | ''
  const [bathrooms, setBathrooms] = useState(''); // '1' | '2' | '3' | '4' | ''
  const [propertyStatus, setPropertyStatus] = useState(''); // 'Ready to move' | 'Under construction' | 'New launch' | ''
  const [propertyAge, setPropertyAge] = useState(''); // 'Newly built' | 'Resale' | 'Older property' | ''
  const [ownershipType, setOwnershipType] = useState(''); // 'Freehold' | 'Leasehold' | 'Co-operative Society' | ''
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Live real properties/projects count from website database
  const [liveCount, setLiveCount] = useState(initialTotal || null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const countAbortRef = useRef(null);

  // Quick pick popular cities (exact website cities)
  const popularCities = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Pune', 'Delhi', 'Chennai', 'Gurugram', 'Delhi NCR'];

  // Lock body scroll when either filter modal or city modal is open
  useEffect(() => {
    if (isOpen || isCitySelectOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isCitySelectOpen]);

  // Exact Property Types matching UrbanFindr website categories:
  // Rent: Flat, House / Villa, Commercial (Agricultural REMOVED)
  // Buy: Flat, House / Villa, Plot / Land, Commercial Space
  // Plot: Plot / Land, Commercial Plot
  // Commercial: Office Space, Shop / Retail, Showroom, Warehouse
  // New Projects: Flat, House / Villa, Plot / Land
  const propertyTypesByCategory = {
    buy: [
      { id: 'Flat', label: 'Flat', icon: Building, dbType: 'Apartment' },
      { id: 'House/Villa', label: 'House / Villa', icon: HomeIcon, dbType: 'Villa,Independent house' },
      { id: 'Plot/Land', label: 'Plot / Land', icon: Grid, dbType: 'Plot' },
      { id: 'Commercial', label: 'Commercial Space', icon: Briefcase, dbType: 'Office,Shop,Warehouse' }
    ],
    rent: [
      { id: 'Flat', label: 'Flat', icon: Building, dbType: 'Apartment' },
      { id: 'House/Villa', label: 'House / Villa', icon: HomeIcon, dbType: 'Villa,Independent house' },
      { id: 'Commercial', label: 'Commercial', icon: Briefcase, dbType: 'Office,Shop,Warehouse' }
    ],
    plot: [
      { id: 'Plot/Land', label: 'Plot / Land', icon: Grid, dbType: 'Plot' },
      { id: 'Commercial Land', label: 'Commercial Plot', icon: Building, dbType: 'Plot' }
    ],
    commercial: [
      { id: 'Commercial Office Space', label: 'Office Space', icon: Briefcase, dbType: 'Office' },
      { id: 'Shops', label: 'Shop / Retail', icon: Store, dbType: 'Shop' },
      { id: 'Showrooms', label: 'Showroom', icon: Sparkles, dbType: 'Shop,Office' },
      { id: 'Warehouse', label: 'Warehouse', icon: Warehouse, dbType: 'Warehouse' }
    ],
    projects: [
      { id: 'Flat', label: 'Flat', icon: Building, dbType: 'Apartment' },
      { id: 'House/Villa', label: 'House / Villa', icon: HomeIcon, dbType: 'Villa' },
      { id: 'Plot/Land', label: 'Plot / Land', icon: Grid, dbType: 'Plot' }
    ],
    pg: [
      { id: 'PG', label: 'PG / Co-living', icon: Building, dbType: 'PG' }
    ]
  };

  const currentTypeOptions = propertyTypesByCategory[activeCategory] || propertyTypesByCategory.buy;

  // Handle switching category tab
  const handleCategorySwitch = (newCat) => {
    setActiveCategory(newCat);
    setMinBudget('');
    setMaxBudget('');
    setPossessionWithin('');
    const opts = propertyTypesByCategory[newCat] || [];
    if (opts.length > 0) {
      if (newCat === 'plot') setSelectedTypes(['Plot/Land']);
      else if (newCat === 'commercial') setSelectedTypes(['Commercial Office Space']);
      else setSelectedTypes(['Flat']);
    } else {
      setSelectedTypes([]);
    }
  };

  // Count active applied filters
  const getAppliedCount = () => {
    let count = 0;
    if (selectedCity) count += 1;
    if (minBudget || maxBudget) count += 1;
    if (activeCategory === 'projects') {
      if (selectedBhks.length > 0) count += selectedBhks.length;
      if (possessionWithin) count += 1;
      if (propertyStatus) count += 1;
    } else {
      count += selectedTypes.length;
      count += selectedBhks.length;
      if (postedBy) count += 1;
      if (preferredTenant) count += 1;
      if (postedSince) count += 1;
      if (availability) count += 1;
      if (furnishing) count += 1;
      if (floor) count += 1;
      if (bathrooms) count += 1;
      if (propertyStatus) count += 1;
      if (propertyAge) count += 1;
      if (ownershipType) count += 1;
      count += selectedAmenities.length;
    }
    return count;
  };

  const resetFilters = () => {
    setActiveCategory(activeCategory);
    setSelectedCity('');
    setMinBudget('');
    setMaxBudget('');
    setPossessionWithin('');
    setSelectedTypes(activeCategory === 'plot' ? ['Plot/Land'] : ['Flat']);
    setSelectedBhks([]);
    setPostedBy('');
    setPreferredTenant('');
    setPostedSince('');
    setAvailability('');
    setFurnishing('');
    setFloor('');
    setBathrooms('');
    setPropertyStatus('');
    setPropertyAge('');
    setOwnershipType('');
    setSelectedAmenities([]);
    setShowAdvanced(false);
  };

  // Build query params helper for live count and search navigation
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    if (activeCategory === 'projects') {
      if (selectedCity) params.set('city', selectedCity);
      if (propertyStatus) params.set('stage', propertyStatus);
      if (possessionWithin) params.set('possession', possessionWithin);
      if (minBudget) params.set('minPrice', minBudget);
      if (maxBudget) params.set('maxPrice', maxBudget);
      if (selectedBhks.length > 0) params.set('bedrooms', selectedBhks.join(','));
      return { endpoint: 'projects', params };
    }

    // Set correct purpose matching database
    if (activeCategory === 'buy') {
      params.set('purpose', 'buy');
    } else if (activeCategory === 'rent') {
      params.set('purpose', 'rent');
    } else if (activeCategory === 'pg') {
      params.set('purpose', 'pg');
    } else if (activeCategory === 'commercial') {
      params.set('purpose', 'commercial');
    } else if (activeCategory === 'plot') {
      params.set('type', 'Plot');
    }

    if (selectedCity) params.set('city', selectedCity);

    // Map selectedTypes using current category definition
    if (selectedTypes.length > 0 && activeCategory !== 'plot') {
      const typeList = [];
      const opts = propertyTypesByCategory[activeCategory] || [];
      selectedTypes.forEach((t) => {
        const found = opts.find((o) => o.id === t);
        if (found && found.dbType) {
          typeList.push(found.dbType);
        } else {
          typeList.push(t);
        }
      });
      if (typeList.length > 0) {
        params.set('type', typeList.join(','));
      }
    }

    if (minBudget) params.set('minPrice', minBudget);
    if (maxBudget) params.set('maxPrice', maxBudget);
    if (selectedBhks.length > 0) params.set('bedrooms', selectedBhks.join(','));

    // Advanced filters
    if (postedBy) params.set('postedBy', postedBy);
    if (preferredTenant) params.set('preferredTenant', preferredTenant);
    if (postedSince) params.set('postedSince', postedSince);
    if (availability) params.set('availability', availability);
    if (furnishing) params.set('furnishing', furnishing);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (propertyStatus) params.set('propertyStatus', propertyStatus);
    if (propertyAge) params.set('propertyAge', propertyAge);
    if (ownershipType) params.set('ownership', ownershipType);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));

    return { endpoint: 'properties', params };
  }, [
    activeCategory,
    selectedCity,
    selectedTypes,
    minBudget,
    maxBudget,
    selectedBhks,
    possessionWithin,
    postedBy,
    preferredTenant,
    postedSince,
    availability,
    furnishing,
    bathrooms,
    propertyStatus,
    propertyAge,
    ownershipType,
    selectedAmenities
  ]);

  // Fetch real live count from website database (debounced)
  useEffect(() => {
    if (countAbortRef.current) {
      countAbortRef.current.abort();
    }
    const controller = new AbortController();
    countAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        setIsLoadingCount(true);
        const { endpoint, params } = buildQueryParams();
        params.set('limit', '1');
        const res = await fetch(`/api/${endpoint}?${params.toString()}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.total === 'number') {
            setLiveCount(data.total);
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Keep prior count
        }
      } finally {
        setIsLoadingCount(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [buildQueryParams]);

  const isRentMode = activeCategory === 'rent' || activeCategory === 'pg';

  // Budget select options aligned with actual prices
  const buyMinBudgets = [
    { value: '', label: 'Min' },
    { value: '2500000', label: '₹25 Lac' },
    { value: '5000000', label: '₹50 Lac' },
    { value: '7500000', label: '₹75 Lac' },
    { value: '10000000', label: '₹1 Cr' },
    { value: '15000000', label: '₹1.5 Cr' },
    { value: '20000000', label: '₹2 Cr' },
    { value: '25000000', label: '₹2.5 Cr' },
    { value: '30000000', label: '₹3 Cr' },
    { value: '50000000', label: '₹5 Cr' }
  ];

  const buyMaxBudgets = [
    { value: '', label: 'Max' },
    { value: '5000000', label: '₹50 Lac' },
    { value: '7500000', label: '₹75 Lac' },
    { value: '10000000', label: '₹1 Cr' },
    { value: '15000000', label: '₹1.5 Cr' },
    { value: '20000000', label: '₹2 Cr' },
    { value: '25000000', label: '₹2.5 Cr' },
    { value: '30000000', label: '₹3 Cr' },
    { value: '50000000', label: '₹5 Cr' },
    { value: '100000000', label: '₹10 Cr+' }
  ];

  const rentMinBudgets = [
    { value: '', label: 'Min' },
    { value: '10000', label: '₹10,000' },
    { value: '15000', label: '₹15,000' },
    { value: '20000', label: '₹20,000' },
    { value: '25000', label: '₹25,000' },
    { value: '30000', label: '₹30,000' },
    { value: '40000', label: '₹40,000' },
    { value: '50000', label: '₹50,000' },
    { value: '75000', label: '₹75,000' },
    { value: '100000', label: '₹1 Lac' }
  ];

  const rentMaxBudgets = [
    { value: '', label: 'Max' },
    { value: '25000', label: '₹25,000' },
    { value: '35000', label: '₹35,000' },
    { value: '50000', label: '₹50,000' },
    { value: '65000', label: '₹65,000' },
    { value: '75000', label: '₹75,000' },
    { value: '100000', label: '₹1 Lac' },
    { value: '150000', label: '₹1.5 Lac+' }
  ];

  const minBudgetOptions = isRentMode ? rentMinBudgets : buyMinBudgets;
  const maxBudgetOptions = isRentMode ? rentMaxBudgets : buyMaxBudgets;

  const toggleType = (typeName) => {
    if (selectedTypes.includes(typeName)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== typeName));
    } else {
      setSelectedTypes([...selectedTypes, typeName]);
    }
  };

  const toggleBhk = (bhk) => {
    if (selectedBhks.includes(bhk)) {
      setSelectedBhks(selectedBhks.filter((b) => b !== bhk));
    } else {
      setSelectedBhks([...selectedBhks, bhk]);
    }
  };

  const togglePossession = (val) => {
    if (possessionWithin === val) {
      setPossessionWithin('');
    } else {
      setPossessionWithin(val);
    }
  };

  const toggleAmenity = (name) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleMinBudgetChange = (val) => {
    setMinBudget(val);
    if (val && maxBudget && Number(val) > Number(maxBudget)) {
      setMaxBudget('');
    }
  };

  const handleMaxBudgetChange = (val) => {
    setMaxBudget(val);
    if (val && minBudget && Number(val) < Number(minBudget)) {
      setMinBudget('');
    }
  };

  // Execute Search / View Properties
  const handleSearch = () => {
    setIsOpen(false);
    setIsCitySelectOpen(false);
    const { endpoint, params } = buildQueryParams();
    router.push(`/${endpoint}?${params.toString()}`);
  };

  const filteredMagicCities = MAGIC_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearchTerm.trim().toLowerCase())
  );

  const getButtonLabel = () => {
    const num = typeof liveCount === 'number' ? `${liveCount.toLocaleString('en-IN')} ` : '';
    if (activeCategory === 'projects') return `View ${num}Projects`;
    if (activeCategory === 'rent') return `View ${num}Properties for Rent`;
    if (activeCategory === 'buy') return `View ${num}Properties for Sale`;
    if (activeCategory === 'plot') return `View ${num}Plots / Lands`;
    if (activeCategory === 'commercial') return `View ${num}Commercial Spaces`;
    return `View ${num}Properties`;
  };

  return (
    <>
      {/* =========================================================================
          1. MOBILE HOME SEARCH SECTION (lg:hidden) - Website Theme Color (#163e35)
          ========================================================================= */}
      <div className="lg:hidden w-full pt-1 pb-1">
        {/* Category Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b border-stone-200/90 px-1 pb-2">
          <button
            type="button"
            onClick={() => handleCategorySwitch('buy')}
            className={`relative pb-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'buy'
                ? 'font-bold text-[#163e35]'
                : 'font-semibold text-stone-600 hover:text-stone-900'
            }`}
          >
            Buy
            {activeCategory === 'buy' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#163e35] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCategorySwitch('rent')}
            className={`relative pb-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'rent'
                ? 'font-bold text-[#163e35]'
                : 'font-semibold text-stone-600 hover:text-stone-900'
            }`}
          >
            Rent
            {activeCategory === 'rent' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#163e35] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCategorySwitch('projects')}
            className={`relative pb-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'projects'
                ? 'font-bold text-[#163e35]'
                : 'font-semibold text-stone-600 hover:text-stone-900'
            }`}
          >
            New Projects
            {activeCategory === 'projects' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#163e35] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCategorySwitch('pg')}
            className={`relative pb-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'pg'
                ? 'font-bold text-[#163e35]'
                : 'font-semibold text-stone-600 hover:text-stone-900'
            }`}
          >
            PG
            {activeCategory === 'pg' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#163e35] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCategorySwitch('commercial')}
            className={`relative pb-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              activeCategory === 'commercial'
                ? 'font-bold text-[#163e35]'
                : 'font-semibold text-stone-600 hover:text-stone-900'
            }`}
          >
            Commercial
            {activeCategory === 'commercial' && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#163e35] rounded-full" />
            )}
          </button>
        </div>

        {/* Search Pill: Initially shows "Search By City" */}
        <div
          onClick={() => setIsOpen(true)}
          className="mt-3.5 w-full bg-white rounded-full border border-stone-200/90 shadow-[0_6px_20px_rgba(22,62,53,0.06)] px-4 py-2 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin size={18} className="text-[#163e35] shrink-0" />
            <span className="text-sm font-medium text-stone-700 truncate">
              {selectedCity || 'Search By City'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            aria-label="Search"
            className="w-9 h-9 rounded-full bg-[#163e35] hover:bg-[#24564a] text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. FULLSCREEN FILTERS MODAL (Reference Image 2)
          ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Top Bar: Back Arrow | Filters (count) | Reset */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 -ml-1 text-[#163e35] hover:opacity-80 cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft size={22} />
              </button>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                Filters
                {getAppliedCount() > 0 && (
                  <span className="text-[#163e35] font-semibold text-sm">
                    ({getAppliedCount()})
                  </span>
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="text-[#163e35] text-sm font-bold hover:underline cursor-pointer px-1 py-0.5"
            >
              Reset
            </button>
          </div>

          {/* Sub Navigation Category Tabs */}
          <div className="flex items-center gap-5 px-4 pt-3 border-b border-stone-200 overflow-x-auto no-scrollbar shrink-0 bg-white">
            {[
              { id: 'buy', label: 'Buy' },
              { id: 'rent', label: 'Rent' },
              { id: 'projects', label: 'New Projects' },
              { id: 'plot', label: 'Plot' },
              { id: 'commercial', label: 'Commercial' }
            ].map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategorySwitch(tab.id)}
                  className={`relative pb-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'font-bold text-[#163e35]'
                      : 'font-semibold text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#163e35] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scrollable Filter Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* =========================================================================
                SELECT CITY: Clean Card Dropdown matching Reference Image 2
                ========================================================================= */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-stone-900">
                  Select City
                </h3>
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => setSelectedCity('')}
                    className="text-[11px] text-[#163e35] font-semibold hover:underline"
                  >
                    Clear city
                  </button>
                )}
              </div>

              {/* City Dropdown Trigger Row (Reference Image 2) */}
              <button
                type="button"
                onClick={() => setIsCitySelectOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-stone-200 bg-white hover:border-[#163e35] active:bg-stone-50 cursor-pointer shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin size={18} className="text-[#163e35] shrink-0" />
                  <span className={`text-sm font-semibold truncate ${selectedCity ? 'text-stone-900' : 'text-stone-500'}`}>
                    {selectedCity || 'Select City'}
                  </span>
                </div>
                <ChevronDown size={18} className="text-stone-600 shrink-0 ml-2" />
              </button>

              {/* Quick-pick popular cities for non-projects categories */}
              {activeCategory !== 'projects' && (
                <div className="flex items-center flex-wrap gap-2 mt-2.5">
                  {popularCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCity(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        selectedCity === c
                          ? 'bg-[#ecf2e4] text-[#163e35] border border-[#163e35] font-bold'
                          : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Budget */}
            <div>
              <h3 className="text-sm font-bold text-stone-900 mb-2.5">Budget</h3>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <select
                    value={minBudget}
                    onChange={(e) => handleMinBudgetChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:border-[#163e35] cursor-pointer"
                  >
                    {minBudgetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  />
                </div>

                <span className="text-xs font-semibold text-stone-500">to</span>

                <div className="relative flex-1">
                  <select
                    value={maxBudget}
                    onChange={(e) => handleMaxBudgetChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:border-[#163e35] cursor-pointer"
                  >
                    {maxBudgetOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Visual Range Slider matching website theme color */}
              <div className="mt-5 px-2">
                <div className="relative h-1.5 bg-stone-200 rounded-full flex items-center">
                  <div
                    className="absolute h-1.5 bg-[#163e35] rounded-full transition-all"
                    style={{
                      left: minBudget ? '20%' : '0%',
                      right: maxBudget ? '20%' : '0%'
                    }}
                  />
                  <div
                    className="absolute w-5 h-5 rounded-full bg-white border-[2.5px] border-[#163e35] shadow-sm -ml-2.5 transition-all"
                    style={{ left: minBudget ? '20%' : '0%' }}
                  />
                  <div
                    className="absolute w-5 h-5 rounded-full bg-white border-[2.5px] border-[#163e35] shadow-sm -mr-2.5 transition-all"
                    style={{ right: maxBudget ? '20%' : '0%' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: PROPERTY TYPE (For Buy, Rent, Plot, Commercial) */}
            {activeCategory !== 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-stone-900">
                    Property Type
                  </h3>
                  {selectedTypes.length > 0 && (
                    <span className="text-[11px] text-[#163e35] font-semibold">
                      {selectedTypes.length} selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentTypeOptions.map((item) => {
                    const isSelected = selectedTypes.includes(item.id);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleType(item.id)}
                        className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 text-[#163e35]">
                            <Check size={15} strokeWidth={2.7} />
                          </span>
                        )}
                        <span className={`mb-1.5 ${isSelected ? 'text-[#163e35]' : 'text-stone-600'}`}>
                          <Icon size={24} strokeWidth={1.8} />
                        </span>
                        <span className="text-[11.5px] leading-tight font-medium">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4: BHK (For Buy, Rent, New Projects) */}
            {activeCategory !== 'plot' && activeCategory !== 'commercial' && (
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-2.5">BHK</h3>
                <div className="flex items-center flex-wrap gap-2">
                  {[
                    { id: '1', label: '+ 1 BHK' },
                    { id: '2', label: '+ 2 BHK' },
                    { id: '3', label: '+ 3 BHK' },
                    { id: '4', label: '+ 4 BHK' }
                  ].map((bhk) => {
                    const isSelected = selectedBhks.includes(bhk.id);
                    return (
                      <button
                        key={bhk.id}
                        type="button"
                        onClick={() => toggleBhk(bhk.id)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                            : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {isSelected ? `✓ ${bhk.label.replace('+ ', '')}` : bhk.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                Section 5 (For New Projects): Possession Within (Reference Image 2)
                ========================================================================= */}
            {activeCategory === 'projects' && (
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-2.5">
                  Possession Within
                </h3>
                <div className="flex items-center flex-wrap gap-2">
                  {['1 yr', '2 yrs', '3 yrs', '3 yrs+'].map((poss) => {
                    const isSelected = possessionWithin === poss;
                    return (
                      <button
                        key={poss}
                        type="button"
                        onClick={() => togglePossession(poss)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                            : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {isSelected ? `✓ ${poss}` : poss}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                Section 6: CHECK ADVANCED FILTERS
                ========================================================================= */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-2xl border border-[#dce8e0] bg-[#f8faf6] hover:bg-[#ecf2e4]/70 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal size={17} className="text-[#163e35]" />
                  <span className="text-xs sm:text-sm font-bold text-stone-900">
                    Check Advanced Filters
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-stone-500 transition-transform duration-200 ${
                    showAdvanced ? 'rotate-180 text-[#163e35]' : ''
                  }`}
                />
              </button>

              {/* Advanced Filter Content */}
              {showAdvanced && (
                <div className="mt-4 p-4 rounded-2xl bg-[#f8faf6] border border-[#dce8e0] space-y-5 animate-in fade-in duration-150">
                  {/* Property Status (Buy & Projects) */}
                  {(activeCategory === 'buy' || activeCategory === 'projects') && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                        Property Status
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: '', label: 'All' },
                          { id: 'Ready to move', label: 'Ready to Move' },
                          { id: 'Under construction', label: 'Under Construction' },
                          { id: 'New launch', label: 'New Launch' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPropertyStatus(item.id)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              propertyStatus === item.id
                                ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                                : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            {propertyStatus === item.id && item.id ? `✓ ${item.label}` : item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posted By (Non-projects) */}
                  {activeCategory !== 'projects' && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                        Posted By
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: '', label: 'All' },
                          { id: 'owner', label: 'Owner' },
                          { id: 'builder', label: 'Builder' },
                          { id: 'broker', label: 'Broker / Agent' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPostedBy(item.id)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              postedBy === item.id
                                ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                                : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            {postedBy === item.id && item.id ? `✓ ${item.label}` : item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tenants Preferred (Rent & PG Only) */}
                  {(activeCategory === 'rent' || activeCategory === 'pg') && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                        Tenants Preferred
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: '', label: 'All' },
                          { id: 'Family', label: 'Family' },
                          { id: 'Bachelors', label: 'Bachelors' },
                          { id: 'Company', label: 'Company' },
                          { id: 'Anyone', label: 'Anyone' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPreferredTenant(item.id)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              preferredTenant === item.id
                                ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                                : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            {preferredTenant === item.id && item.id ? `✓ ${item.label}` : item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Lift',
                        'Power backup',
                        'Covered parking',
                        'Security',
                        'Gym',
                        'Swimming pool',
                        'Clubhouse',
                        'Garden'
                      ].map((name) => {
                        const isSelected = selectedAmenities.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleAmenity(name)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#ecf2e4] border-[#163e35] text-[#163e35] font-bold shadow-2xs'
                                : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            {isSelected ? `✓ ${name}` : `+ ${name}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Bar: Real Dynamic Count branded in UrbanFindr Forest Green */}
          <div className="p-4 bg-white border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-3.5 px-6 rounded-full bg-[#163e35] hover:bg-[#24564a] active:scale-[0.99] text-white font-bold text-base shadow-md transition-all flex items-center justify-center cursor-pointer"
            >
              {isLoadingCount ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Loading matching properties…</span>
                </span>
              ) : (
                getButtonLabel()
              )}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. FULLSCREEN "SELECT CITY" SCREEN (Strictly matching Reference Image 1)
          ========================================================================= */}
      {isCitySelectOpen && (
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Top Bar: Back Arrow | "Select City" */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 shrink-0 bg-white">
            <button
              type="button"
              onClick={() => setIsCitySelectOpen(false)}
              className="p-1 -ml-1 text-[#163e35] hover:opacity-80 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-base font-bold text-stone-900">
              Select City
            </h2>
          </div>

          {/* Search Input for fast filter */}
          <div className="px-5 pt-3 pb-2 shrink-0">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={citySearchTerm}
                onChange={(e) => setCitySearchTerm(e.target.value)}
                placeholder="Search your city…"
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#163e35]"
              />
              {citySearchTerm && (
                <button
                  type="button"
                  onClick={() => setCitySearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 3-Column Circular Photo Grid (Image 1) */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-y-7 gap-x-3 sm:gap-x-6">
              {filteredMagicCities.map((city) => {
                const isSelected = selectedCity.trim().toLowerCase() === city.name.trim().toLowerCase() ||
                  (city.id === 'bengaluru' && selectedCity.toLowerCase() === 'bangalore') ||
                  (city.id === 'gurugram' && selectedCity.toLowerCase() === 'gurgaon') ||
                  (city.id === 'delhi' && (selectedCity.toLowerCase() === 'new delhi' || selectedCity.toLowerCase() === 'delhi'));

                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city.name);
                      setIsCitySelectOpen(false);
                      setCitySearchTerm('');
                    }}
                    className="flex flex-col items-center group cursor-pointer text-center focus:outline-none"
                  >
                    {/* Circular Photo Container */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-sm border border-stone-200/90 group-hover:scale-105 transition-transform duration-200 bg-stone-100 flex items-center justify-center">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = city.fallbackSvg || '/images/city-hyderabad.svg';
                        }}
                      />

                      {/* Centered Teal/Green Circular Badge with Checkmark when selected (Image 1) */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#163e35]/30 flex items-center justify-center animate-in zoom-in-75 duration-150">
                          <div className="w-6 h-6 rounded-full bg-[#163e35] text-white flex items-center justify-center shadow-md">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* City Name below photo */}
                    <span
                      className={`mt-2 text-xs sm:text-sm leading-tight text-center ${
                        isSelected
                          ? 'font-bold text-[#163e35]'
                          : 'font-medium text-stone-800 group-hover:text-stone-900'
                      }`}
                    >
                      {city.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredMagicCities.length === 0 && (
              <div className="text-center py-12 text-stone-500 text-sm">
                No cities found matching &quot;{citySearchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
