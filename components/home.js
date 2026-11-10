'use client';
import { designImage } from '@/lib/media';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Search,
  Building2,
  Armchair,
  House,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  BadgeCheck,
  IndianRupee
} from 'lucide-react';
import { useData } from './providers';
import { PropertyCard, ProjectCard, SectionTitle, State, Image } from './ui';
import { CityCards } from './city-discovery';
import { categories, categoryFor } from '@/lib/catalog';
import CategoryIcon from './CategoryIcon';
import ExploreCategories from './ExploreCategories';
import BuilderProjectsBanner from './BuilderProjectsBanner';
import VerifiedPropertiesCarousel from './VerifiedPropertiesCarousel';
import FeaturedProfessionals from './FeaturedProfessionals';
import { cities, money } from '@/lib/format';

function HeroCategoryIcon({ name }) {
  switch (name) {
    case 'Properties':
      return (
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <path
            d="M16 5L4.5 14.5H8V26.5C8 27.05 8.45 27.5 9 27.5H23C23.55 27.5 24 27.05 24 26.5V14.5H27.5L16 5Z"
            fill="#9bc269"
            stroke="#163e35"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M16 5L4.5 14.5H9.5L16 9L22.5 14.5H27.5L16 5Z" fill="#d8edb3" stroke="#163e35" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13.2 27.5V19.2C13.2 18.54 13.74 18 14.4 18H17.6C18.26 18 18.8 18.54 18.8 19.2V27.5" fill="#163e35" />
        </svg>
      );
    case 'Interior Designers':
      return (
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <path
            d="M7.5 13C7.5 10.79 9.29 9 11.5 9H20.5C22.71 9 24.5 10.79 24.5 13V18.5H7.5V13Z"
            fill="#d8edb3"
            stroke="#163e35"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M16 9.5V18" stroke="#163e35" strokeWidth="1.4" />
          <rect x="4" y="14.5" width="4.5" height="9.5" rx="2.2" fill="#9bc269" stroke="#163e35" strokeWidth="1.6" />
          <rect x="23.5" y="14.5" width="4.5" height="9.5" rx="2.2" fill="#9bc269" stroke="#163e35" strokeWidth="1.6" />
          <rect x="7" y="18" width="18" height="6" rx="1.8" fill="#a9ce7b" stroke="#163e35" strokeWidth="1.6" />
          <path d="M7.5 24V27M24.5 24V27" stroke="#163e35" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'Inverter Maintenance':
      return (
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <rect x="9" y="6" width="4" height="3.5" rx="1" fill="#749546" stroke="#163e35" strokeWidth="1.4" />
          <rect x="19" y="6" width="4" height="3.5" rx="1" fill="#163e35" />
          <rect x="5.5" y="9.5" width="21" height="16.5" rx="2.5" fill="#d8edb3" stroke="#163e35" strokeWidth="1.7" />
          <path
            d="M17.2 12.2L12.8 18.3H16.2L14.8 23.3L19.6 17H16.2L17.2 12.2Z"
            fill="#749546"
            stroke="#163e35"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'AC Technicians':
      return (
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <path
            d="M23.5 6.8C21.1 5.6 18.1 6.1 16.2 8.1C14.7 9.6 14.2 11.7 14.8 13.6L7.1 21.3C6.1 22.3 6.1 23.9 7.1 24.9C8.1 25.9 9.7 25.9 10.7 24.9L18.4 17.2C20.3 17.8 22.4 17.3 23.9 15.8C25.9 13.8 26.3 10.7 25 8.3L21.5 11.8L19.2 9.5L23.5 6.8Z"
            fill="#9db8a7"
            stroke="#163e35"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'Electricians':
      return (
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <path
            d="M17.8 4.5L8.5 17.2H15.2L13.8 27.5L23.5 14.5H16.8L17.8 4.5Z"
            fill="#749546"
            stroke="#163e35"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="11" fill="#ecf2e4" stroke="#163e35" strokeWidth="1.6" />
          <circle cx="11.5" cy="16" r="1.4" fill="#163e35" />
          <circle cx="16" cy="16" r="1.4" fill="#163e35" />
          <circle cx="20.5" cy="16" r="1.4" fill="#163e35" />
        </svg>
      );
  }
}

export default function HomePage() {
  const router = useRouter();
  const [featuredPurpose, setFeaturedPurpose] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [locationKeyword, setLocationKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [hasChosenType, setHasChosenType] = useState(false);
  const [budgetRange, setBudgetRange] = useState('');
  const [hasChosenBudget, setHasChosenBudget] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [budgetSearch, setBudgetSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null); // 'city' | 'type' | 'budget' | null
  const searchBarRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const propertyTypeOptions = [
    { value: '', label: 'Any Type', sub: 'All homes & properties' },
    { value: 'buy', label: 'Buy', sub: 'Homes & plots for sale' },
    { value: 'rent', label: 'Rent', sub: 'Apartments & houses for rent' },
    { value: 'pg', label: 'PG / Co-living', sub: 'Shared & private rooms' },
    { value: 'commercial', label: 'Commercial', sub: 'Offices, shops & spaces' },
    { value: 'type:Apartment', label: 'Apartment', sub: 'Flats & gated communities' },
    { value: 'type:Villa', label: 'Villa', sub: 'Luxury independent villas' },
    { value: 'type:Independent house', label: 'Independent House', sub: 'Individual homes' },
    { value: 'type:Plot', label: 'Plot', sub: 'Residential & investment land' },
    { value: 'services', label: 'Home Services', sub: 'Interiors, electricians, AC & more' }
  ];

  const budgetOptionsByType = {
    rent: [
      { value: '', label: 'Any Budget', sub: 'Show all monthly rentals' },
      { value: '0-15000', label: 'Under ₹15,000 / mo', sub: 'Budget flats & 1 BHK homes' },
      { value: '15000-30000', label: '₹15,000 – ₹30,000 / mo', sub: '2 BHK & family apartments' },
      { value: '30000-60000', label: '₹30,000 – ₹60,000 / mo', sub: 'Spacious 3 BHK & gated homes' },
      { value: '60000-', label: 'Above ₹60,000 / mo', sub: 'Luxury villas & penthouses' }
    ],
    pg: [
      { value: '', label: 'Any Budget', sub: 'Show all PG & co-living plans' },
      { value: '0-8000', label: 'Under ₹8,000 / mo', sub: 'Shared rooms & hostels' },
      { value: '8000-15000', label: '₹8,000 – ₹15,000 / mo', sub: 'Twin & single AC rooms' },
      { value: '15000-25000', label: '₹15,000 – ₹25,000 / mo', sub: 'Premium private studios' },
      { value: '25000-', label: 'Above ₹25,000 / mo', sub: 'Luxury co-living suites' }
    ],
    commercial: [
      { value: '', label: 'Any Budget', sub: 'Show all commercial budgets' },
      { value: '0-50000', label: 'Under ₹50,000 / mo', sub: 'Retail shops & starter offices' },
      { value: '50000-150000', label: '₹50,000 – ₹1.5L / mo', sub: 'Mid-size offices & showrooms' },
      { value: '150000-5000000', label: '₹1.5L – ₹50L', sub: 'Large leases & compact spaces' },
      { value: '5000000-20000000', label: '₹50L – ₹2 Cr', sub: 'Commercial properties for sale' },
      { value: '20000000-', label: 'Above ₹2 Cr', sub: 'Flagship offices & warehouses' }
    ],
    services: [
      { value: '', label: 'Any Budget', sub: 'Show all service packages' },
      { value: '0-2000', label: 'Under ₹2,000', sub: 'Quick repairs & maintenance' },
      { value: '2000-10000', label: '₹2,000 – ₹10,000', sub: 'Deep cleaning & servicing' },
      { value: '10000-100000', label: '₹10,000 – ₹1 Lakh', sub: 'Room upgrades & installations' },
      { value: '100000-', label: 'Above ₹1 Lakh', sub: 'Full-home interiors & renovations' }
    ],
    'type:Plot': [
      { value: '', label: 'Any Budget', sub: 'Show all plot price ranges' },
      { value: '0-2500000', label: 'Under ₹25 Lakh', sub: 'Affordable residential plots' },
      { value: '2500000-5000000', label: '₹25L – ₹50 Lakh', sub: 'Developing layout plots' },
      { value: '5000000-10000000', label: '₹50L – ₹1 Cr', sub: 'Prime gated community plots' },
      { value: '10000000-', label: 'Above ₹1 Cr', sub: 'Corner & commercial land' }
    ],
    'type:Villa': [
      { value: '', label: 'Any Budget', sub: 'Show all villa price ranges' },
      { value: '0-10000000', label: 'Under ₹1 Cr', sub: 'Compact & suburban villas' },
      { value: '10000000-20000000', label: '₹1 Cr – ₹2 Cr', sub: 'Gated community villas' },
      { value: '20000000-50000000', label: '₹2 Cr – ₹5 Cr', sub: 'Premium luxury villas' },
      { value: '50000000-', label: 'Above ₹5 Cr', sub: 'Ultra-luxury estates' }
    ],
    default: [
      { value: '', label: 'Any Budget', sub: 'Show all price ranges' },
      { value: '0-5000000', label: 'Under ₹50 Lakh', sub: 'Affordable & starter homes' },
      { value: '5000000-10000000', label: '₹50L – ₹1 Cr', sub: 'Mid-segment residences' },
      { value: '10000000-20000000', label: '₹1 Cr – ₹2 Cr', sub: 'Premium & spacious homes' },
      { value: '20000000-', label: 'Above ₹2 Cr', sub: 'Luxury villas & estates' }
    ]
  };

  const budgetOptions = budgetOptionsByType[propertyType] || budgetOptionsByType.default;
  const budgetFieldLabel =
    propertyType === 'rent' || propertyType === 'pg' ? 'Monthly Budget' : 'Budget';
  const budgetSearchPlaceholder =
    propertyType === 'rent'
      ? 'Search rent (e.g. 15,000, 30,000)…'
      : propertyType === 'pg'
      ? 'Search PG rent (e.g. 8,000, 15,000)…'
      : propertyType === 'services'
      ? 'Search service budget…'
      : 'Search budget (e.g. 50L, 1 Cr)…';

  const activeLocationLabel = selectedCity || locationKeyword || 'Select Location';
  const activePropertyTypeLabel = hasChosenType
    ? (propertyTypeOptions.find((o) => o.value === propertyType)?.label || 'Any Type')
    : 'Select Type';
  const activeBudgetLabel = hasChosenBudget
    ? (budgetOptions.find((o) => o.value === budgetRange)?.label || 'Any Budget')
    : 'Select Budget';

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(citySearch.trim().toLowerCase())
  );
  const filteredPropertyTypes = propertyTypeOptions.filter((opt) => {
    const q = typeSearch.trim().toLowerCase();
    return !q || opt.label.toLowerCase().includes(q) || opt.sub.toLowerCase().includes(q);
  });
  const filteredBudgets = budgetOptions.filter((opt) => {
    const q = budgetSearch.trim().toLowerCase();
    return !q || opt.label.toLowerCase().includes(q) || opt.sub.toLowerCase().includes(q);
  });

  const featured = useData(`properties?featured=true&limit=3${featuredPurpose ? '&purpose=' + featuredPurpose : ''}`);
  const verified = useData('properties?verified=true&limit=12');
  const latest = useData('properties?limit=6');
  const discovery = useData('discovery');
  const projects = useData('projects?limit=3');
  const designs = useData('designs?limit=3');

  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (locationKeyword) params.set('q', locationKeyword);

    if (budgetRange) {
      const [minVal, maxVal] = budgetRange.split('-');
      if (minVal) params.set('minPrice', minVal);
      if (maxVal) params.set('maxPrice', maxVal);
    }

    if (propertyType === 'services') {
      router.push(`/categories?${params.toString()}`);
      return;
    }

    if (propertyType.startsWith('type:')) {
      params.set('type', propertyType.replace('type:', ''));
      router.push(`/properties?${params.toString()}`);
      return;
    }

    if (propertyType) {
      const cat = categoryFor(propertyType);
      router.push(`${cat ? cat.path : '/properties'}?${params.toString()}`);
      return;
    }

    router.push(`/properties?${params.toString()}`);
  }

  const heroQuickCategories = [
    { label: 'Properties', href: '/properties', iconName: 'Properties' },
    { label: 'Home Interior', href: '/interiors', iconName: 'Interior Designers' },
    { label: 'Inverter Maintenance', line1: 'Inverter', line2: 'Maintenance', href: '/categories/inverter-maintenance', iconName: 'Inverter Maintenance' },
    { label: 'AC Technicians', href: '/categories/ac-technicians', iconName: 'AC Technicians' },
    { label: 'Electricians', href: '/categories/electricians', iconName: 'Electricians' },
    { label: '& More', href: '/categories', isMore: true }
  ];

  const heroFloatingServices = [
    {
      line1: 'Home',
      line2: 'Interior',
      href: '/interiors',
      iconName: 'Interior Designers',
      iconBg: 'bg-amber-50 border-amber-200/70',
      posClass: 'top-[12%] left-[18%]'
    },
    {
      line1: 'AC',
      line2: 'Technicians',
      href: '/categories/ac-technicians',
      iconName: 'AC Technicians',
      iconBg: 'bg-sky-50 border-sky-200/70',
      posClass: 'top-[8%] right-[14%]'
    },
    {
      line1: 'Electricians',
      line2: '',
      href: '/categories/electricians',
      iconName: 'Electricians',
      iconBg: 'bg-amber-50 border-amber-200/70',
      posClass: 'top-[28%] right-[3%]'
    },
    {
      line1: 'Lift',
      line2: 'Maintenance',
      href: '/categories/lift-maintenance',
      iconName: 'Lift Maintenance',
      iconBg: 'bg-indigo-50 border-indigo-200/70',
      posClass: 'top-[48%] right-[3%]'
    },
    {
      line1: 'Pest Control',
      line2: '',
      href: '/categories/pest-control',
      iconName: 'Pest Control',
      iconBg: 'bg-emerald-50 border-emerald-200/70',
      posClass: 'bottom-[22%] right-[3%]'
    }
  ];

  const testimonials = [
    {
      name: 'Rhea Sharma',
      role: 'Tenant in Bengaluru',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      text: 'Found the perfect home in HSR Layout within days! Direct owner contact was fast, and the visit was confirmed within minutes. Best renting experience so far.'
    },
    {
      name: 'Vikramaditya Roy',
      role: 'Property Owner in Mumbai',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      text: 'Listed my 2 BHK in Powai and got genuine tenant leads within 48 hours. No spam calls from agents. Truly direct, transparent, and completely free.'
    },
    {
      name: 'Priya & Sandeep Menon',
      role: 'Home Buyers in Pune',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Finding an independent house without aggressive brokers seemed impossible until UrbanFindr. Verified listings gave us confidence and peace of mind.'
    }
  ];

  const faqs = [
    {
      q: 'How does UrbanFindr connect you directly with owners?',
      a: 'UrbanFindr connects genuine buyers and tenants directly with verified property owners and builder project coordinators with transparent contact details and zero middleman friction.'
    },
    {
      q: 'How are properties verified before going live?',
      a: 'Every property posted on UrbanFindr is reviewed by our administration team to check property ownership details, pricing authenticity, images, and locality information before being marked as a Reviewed Listing.'
    },
    {
      q: 'Can I search multiple localities at once?',
      a: 'Yes! Simply type your preferred localities separated by commas (e.g. "Indiranagar, Whitefield, HSR") in the locality search bar to view homes across multiple areas simultaneously.'
    },
    {
      q: 'How do I book and track site visits?',
      a: 'Click "Schedule Visit" on any property or builder project page, select your preferred date within the next 90 days, and the owner will confirm. You can track visit status live in your dashboard.'
    },
    {
      q: 'Can I list both residential and commercial spaces?',
      a: 'Yes. Owners can post apartments, villas, independent houses, plots, PG / co-living accommodations, as well as commercial offices, shops, and warehouses for sale or lease.'
    }
  ];

  return <>
    {/* Hero Section */}
    <section className="relative bg-gradient-to-br from-white via-[#f7fbff] to-[#edf5fd] border-b border-[#e6e8e1]">
      {/* Right-aligned Hero Background Image with Airy White / Sky-Blue Blend (Desktop) */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[62%] xl:w-[60%] pointer-events-none overflow-hidden">
        <img
          src="/images/hero.png"
          alt="Family looking at their dream home"
          className="w-full h-full object-cover object-[70%_20%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #ffffff 0%, rgba(249,252,255,0.96) 15%, rgba(247,251,255,0.58) 34%, rgba(247,251,255,0) 56%), linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 16%, rgba(255,255,255,0) 84%, rgba(255,255,255,0.65) 100%)'
          }}
        />
      </div>

      {/* Floating Service Pills on Right Visual (Desktop - matching reference image UI) */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[52%] pointer-events-none z-30">
        {/* Top-right brand sparkle accent */}
        <svg
          viewBox="0 0 36 36"
          className="absolute top-[9%] right-[4%] w-7 h-7 text-[#163e35]"
          fill="none"
          aria-hidden="true"
        >
          <path d="M8 22L18 6M14 26L28 14M18 30L32 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {heroFloatingServices.map((item) => (
          <Link
            key={item.line1 + item.line2}
            href={item.href}
            className={`pointer-events-auto absolute ${item.posClass} group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:shadow-[0_12px_30px_rgba(22,62,53,0.16)] hover:border-[#163e35]/30 hover:-translate-y-0.5 transition-all`}
          >
            <span className={`w-8 h-8 rounded-lg border ${item.iconBg} flex items-center justify-center shrink-0`}>
              <CategoryIcon name={item.iconName} size={19} />
            </span>
            <span className="text-[11.5px] font-bold text-[#252d27] group-hover:text-[#163e35] leading-[1.2] whitespace-nowrap">
              {item.line1}
              {item.line2 && (
                <>
                  <br />
                  {item.line2}
                </>
              )}
            </span>
            <ChevronRight size={13} className="text-stone-400 group-hover:text-[#163e35] group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
          </Link>
        ))}
      </div>

      {/* Main Left Hero Content */}
      <div className="wrap relative z-30 pt-8 sm:pt-12 lg:pt-14 pb-6 lg:pb-8 pointer-events-none">
        <div className="max-w-[650px] pointer-events-auto">
          {/* Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef5f0] border border-[#dce8e0] shadow-2xs mb-5">
            <span className="w-5 h-5 rounded-md bg-white text-[#163e35] flex items-center justify-center shrink-0 shadow-2xs">
              <House size={13} />
            </span>
            <span className="text-xs font-bold text-[#163e35] tracking-tight">
              Your One-Stop Destination
            </span>
          </div>

          {/* Headline */}
          <h1 className="!text-[34px] sm:!text-[46px] lg:!text-[52px] !font-extrabold !leading-[1.12] !tracking-[-0.03em] text-[#1f2923]">
            Find Your Dream Home
            <br />
            <span className="text-[#1f2923]">&amp; </span>
            <span className="text-[#163e35]">Trusted Services</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-[#46534b] leading-relaxed max-w-lg font-semibold">
            Buy, Rent or Explore a wide range of home services — all in one place with UrbanFindr.
          </p>

          {/* Quick Category Strip (matching reference duotone icon row in website colors) */}
          <div className="mt-7 grid grid-cols-3 sm:grid-cols-6 items-center gap-y-3 sm:gap-y-0">
            {heroQuickCategories.map((cat, idx) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`group relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 transition-all text-center ${
                  cat.isMore
                    ? 'rounded-2xl bg-white/80 backdrop-blur-xs border border-[#dce3d6] shadow-[0_4px_14px_rgba(22,62,53,0.06)] hover:bg-white hover:border-[#163e35]/40'
                    : 'rounded-xl hover:bg-white/60'
                }`}
              >
                {!cat.isMore && idx < heroQuickCategories.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-7 bg-[#dce3d6]"
                  />
                )}
                <span className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <HeroCategoryIcon name={cat.isMore ? 'More' : cat.iconName} />
                </span>
                <span className="text-[11px] font-semibold text-[#163e35] group-hover:text-[#749546] leading-[1.2] text-center transition-colors">
                  {cat.line1 ? (
                    <>
                      {cat.line1}
                      <br />
                      {cat.line2}
                    </>
                  ) : (
                    cat.label
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Hero Image Card */}
        <div className="lg:hidden mt-6 rounded-2xl overflow-hidden border border-[#e6e8e1] shadow-sm bg-white pointer-events-auto">
          <img
            src="/images/hero.png"
            alt="Family looking at their dream home"
            className="w-full h-56 sm:h-72 object-cover object-[60%_20%]"
          />
        </div>
      </div>

      {/* Bottom Search Bar: Half Inside Hero, Half Outside Below (matching previous search-panel layout) */}
      <div className="wrap relative z-40 -mb-20 sm:-mb-[44px] pointer-events-auto">
        <form
          ref={searchBarRef}
          onSubmit={search}
          className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_14px_40px_rgba(15,23,42,0.10)] p-2.5 sm:p-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] items-center gap-1.5 sm:gap-0"
        >
          {/* 1. Location Custom Searchable Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const next = openDropdown === 'city' ? null : 'city';
                setOpenDropdown(next);
                if (next === 'city') setCitySearch('');
              }}
              aria-expanded={openDropdown === 'city'}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                openDropdown === 'city' ? 'bg-[#f4f8f5]' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-[#65705f] leading-none mb-1 whitespace-nowrap">
                    Location
                  </span>
                  <span
                    className={`block text-xs sm:text-[13.5px] truncate ${
                      selectedCity || locationKeyword ? 'font-bold text-[#1f2923]' : 'font-semibold text-[#65705f]'
                    }`}
                  >
                    {activeLocationLabel}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                  openDropdown === 'city' ? 'rotate-180 text-[#163e35]' : ''
                }`}
              />
            </button>

            {openDropdown === 'city' && (
              <div className="absolute left-0 top-full mt-2.5 w-full sm:w-72 bg-white rounded-2xl border border-[#e6e8e1] shadow-[0_20px_50px_rgba(15,23,42,0.16)] p-2.5 z-50">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    autoFocus
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search city or locality…"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#f7f8f3] border border-[#e6e8e1] rounded-xl text-[#1f2923] placeholder:text-[#65705f] focus:outline-none focus:border-[#163e35]"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity('');
                      setLocationKeyword('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      !selectedCity && !locationKeyword
                        ? 'bg-[#ecf2e4] text-[#163e35] font-bold'
                        : 'text-[#252d27] hover:bg-stone-50 hover:text-[#163e35]'
                    }`}
                  >
                    <span>All Cities</span>
                    {!selectedCity && !locationKeyword && <Check size={14} className="text-[#163e35]" />}
                  </button>
                  {filteredCities.map((city) => {
                    const active = selectedCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setLocationKeyword('');
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#ecf2e4] text-[#163e35] font-bold'
                            : 'text-[#252d27] hover:bg-stone-50 hover:text-[#163e35]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={13} className={active ? 'text-[#163e35]' : 'text-stone-400'} />
                          {city}
                        </span>
                        {active && <Check size={14} className="text-[#163e35]" />}
                      </button>
                    );
                  })}
                  {citySearch.trim() && !filteredCities.some((c) => c.toLowerCase() === citySearch.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity('');
                        setLocationKeyword(citySearch.trim());
                        setOpenDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#163e35] bg-[#ecf2e4]/60 hover:bg-[#ecf2e4] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Search size={13} />
                        <span className="truncate">Search &ldquo;{citySearch.trim()}&rdquo;</span>
                      </span>
                    </button>
                  )}
                  {filteredCities.length === 0 && !citySearch.trim() && (
                    <p className="px-3 py-2 text-xs text-[#65705f]">No matching cities</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Property Type Custom Searchable Dropdown */}
          <div className="relative sm:border-l border-t sm:border-t-0 border-[#e6e8e1]">
            <button
              type="button"
              onClick={() => {
                const next = openDropdown === 'type' ? null : 'type';
                setOpenDropdown(next);
                if (next === 'type') setTypeSearch('');
              }}
              aria-expanded={openDropdown === 'type'}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                openDropdown === 'type' ? 'bg-[#f4f8f5]' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                  <House size={15} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-[#65705f] leading-none mb-1 whitespace-nowrap">
                    Property Type
                  </span>
                  <span
                    className={`block text-xs sm:text-[13.5px] truncate ${
                      hasChosenType ? 'font-bold text-[#1f2923]' : 'font-semibold text-[#65705f]'
                    }`}
                  >
                    {activePropertyTypeLabel}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                  openDropdown === 'type' ? 'rotate-180 text-[#163e35]' : ''
                }`}
              />
            </button>

            {openDropdown === 'type' && (
              <div className="absolute left-0 top-full mt-2.5 w-full sm:w-72 bg-white rounded-2xl border border-[#e6e8e1] shadow-[0_20px_50px_rgba(15,23,42,0.16)] p-2.5 z-50">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    autoFocus
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    placeholder="Search property type…"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#f7f8f3] border border-[#e6e8e1] rounded-xl text-[#1f2923] placeholder:text-[#65705f] focus:outline-none focus:border-[#163e35]"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {filteredPropertyTypes.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#65705f]">No matching property types</p>
                  ) : (
                    filteredPropertyTypes.map((opt) => {
                      const active = hasChosenType && propertyType === opt.value;
                      return (
                        <button
                          key={opt.value || 'any'}
                          type="button"
                          onClick={() => {
                            setPropertyType(opt.value);
                            setHasChosenType(true);
                            setBudgetRange('');
                            setHasChosenBudget(false);
                            setBudgetSearch('');
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#ecf2e4] text-[#163e35]'
                              : 'text-[#252d27] hover:bg-stone-50 hover:text-[#163e35]'
                          }`}
                        >
                          <div>
                            <span className="block text-xs font-bold">{opt.label}</span>
                            <span className="block text-[10px] text-[#65705f]">{opt.sub}</span>
                          </div>
                          {active && <Check size={14} className="text-[#163e35] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Budget Custom Searchable Dropdown */}
          <div className="relative sm:border-l border-t sm:border-t-0 border-[#e6e8e1]">
            <button
              type="button"
              onClick={() => {
                const next = openDropdown === 'budget' ? null : 'budget';
                setOpenDropdown(next);
                if (next === 'budget') setBudgetSearch('');
              }}
              aria-expanded={openDropdown === 'budget'}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                openDropdown === 'budget' ? 'bg-[#f4f8f5]' : 'hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                  <IndianRupee size={15} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold text-[#65705f] leading-none mb-1 whitespace-nowrap">
                    {budgetFieldLabel}
                  </span>
                  <span
                    className={`block text-xs sm:text-[13.5px] truncate ${
                      hasChosenBudget ? 'font-bold text-[#1f2923]' : 'font-semibold text-[#65705f]'
                    }`}
                  >
                    {activeBudgetLabel}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                  openDropdown === 'budget' ? 'rotate-180 text-[#163e35]' : ''
                }`}
              />
            </button>

            {openDropdown === 'budget' && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2.5 w-full sm:w-72 bg-white rounded-2xl border border-[#e6e8e1] shadow-[0_20px_50px_rgba(15,23,42,0.16)] p-2.5 z-50">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    autoFocus
                    value={budgetSearch}
                    onChange={(e) => setBudgetSearch(e.target.value)}
                    placeholder={budgetSearchPlaceholder}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#f7f8f3] border border-[#e6e8e1] rounded-xl text-[#1f2923] placeholder:text-[#65705f] focus:outline-none focus:border-[#163e35]"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {filteredBudgets.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#65705f]">No matching budget ranges</p>
                  ) : (
                    filteredBudgets.map((opt) => {
                      const active = hasChosenBudget && budgetRange === opt.value;
                      return (
                        <button
                          key={opt.value || 'any'}
                          type="button"
                          onClick={() => {
                            setBudgetRange(opt.value);
                            setHasChosenBudget(true);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#ecf2e4] text-[#163e35]'
                              : 'text-[#252d27] hover:bg-stone-50 hover:text-[#163e35]'
                          }`}
                        >
                          <div>
                            <span className="block text-xs font-bold">{opt.label}</span>
                            <span className="block text-[10px] text-[#65705f]">{opt.sub}</span>
                          </div>
                          {active && <Check size={14} className="text-[#163e35] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto sm:ml-2 px-6 py-3 bg-[#163e35] hover:bg-[#24564a] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>
    </section>

    {/* Explore by Category Section */}
    <ExploreCategories />

    {/* 1. Featured Properties */}
    <section className="wrap section !pt-8" id="featured-properties">
      <SectionTitle
        eyebrow="A LITTLE EXTRA SOMETHING"
        title="Featured properties"
        description="A curated selection of approved listings, chosen by our platform team."
        href={`/properties?featured=true${featuredPurpose ? '&purpose=' + featuredPurpose : ''}`}
        link="See featured properties"
      />
      <div className="tab-row mb-6">
        <button className={!featuredPurpose ? 'active' : ''} onClick={() => setFeaturedPurpose('')}>
          All properties
        </button>
        {categories.map(item => (
          <button
            key={item.purpose}
            className={featuredPurpose === item.purpose ? 'active' : ''}
            onClick={() => setFeaturedPurpose(item.purpose)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <State loading={featured.loading} error={featured.error} empty={featured.data?.total === 0} />
      <div className="grid md:grid-cols-3 gap-6">
        {!featured.loading && featured.data?.items?.map(item => (
          <PropertyCard key={item._id} item={item} />
        ))}
      </div>
    </section>

    {/* Builder Projects Investment Showcase (directly after Featured Properties) */}
    <BuilderProjectsBanner />

    {/* 2. Verified Properties Section (Seamless Infinite Carousel) */}
    <section className="wrap section !pt-4" id="verified-properties">
      <VerifiedPropertiesCarousel
        items={verified.data?.items}
        loading={verified.loading}
        error={verified.error}
        total={verified.data?.total}
      />
    </section>

    {/* 3. Featured Professionals (Verified Experts) Section */}
    <FeaturedProfessionals />

    {/* Popular Cities */}
    <section className="soft-section" id="explore-by-city">
      <div className="wrap section">
        <SectionTitle
          eyebrow="START WITH A PLACE YOU LOVE"
          title="Explore by city"
          description="Eight premier metro regions. Countless ways to find your next home, shared space or workplace."
          href="/cities"
          link="Explore all cities"
        />
        <CityCards stats={discovery.data} />
      </div>
    </section>

    {/* Latest Listings */}
    <section className="wrap section" id="latest-listings">
      <SectionTitle
        eyebrow="FRESH ON THE MARKET"
        title="Recently added properties"
        description="The newest approved homes and spaces, ready for your shortlist."
        href="/properties"
        link="View all properties"
      />
      <State loading={latest.loading} error={latest.error} empty={latest.data?.total === 0} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!latest.loading && latest.data?.items?.map(item => (
          <PropertyCard key={item._id} item={item} />
        ))}
      </div>
    </section>

    {/* Builder Projects */}
    <section className="builder-section soft-section" id="builder-projects">
      <div className="wrap section">
        <SectionTitle
          eyebrow="ROOM TO DREAM BIGGER"
          title="Builder projects. New possibilities."
          description="Discover communities, compare configurations and meet your future home."
          href="/projects"
          link="Explore builder projects"
        />
        <div className="builder-feature">
          <div>
            <span className="round-icon"><Building2 size={24} /></span>
            <h3>A new home.<br />A whole new beginning.</h3>
          </div>
          <p>
            Explore floor plans, amenities and possession timelines. Request a callback, message your project coordinator or book a site visit.
          </p>
          <Link href="/projects" className="btn-outline">
            Find your project<ArrowRight size={16} />
          </Link>
        </div>
        <State loading={projects.loading} error={projects.error} empty={projects.data?.total === 0} />
        <div className="grid md:grid-cols-3 gap-6">
          {projects.data?.items?.map(item => (
            <ProjectCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </section>

    {/* Home Interiors */}
    <section className="wrap section" id="home-interiors">
      <div className="interior-banner">
        <Image
          src="/photos/living-1.jpg"
          alt="Sunlit living room with comfortable seating and natural materials"
        />
        <div className="interior-banner-copy">
          <p className="eyebrow">URBANFINDR HOME INTERIORS</p>
          <h2>A home you found.<br />A home you make.</h2>
          <p className="muted my-5">
            Personalise every corner. Explore full-home designs, modular kitchens, bedrooms, wardrobes, furniture and painting renovations.
          </p>
          <Link href="/interiors" className="btn">
            Explore home interiors<ArrowUpRight size={17} />
          </Link>
          <div className="flex gap-5 mt-7 text-xs">
            <span>✦ Personal design support</span>
            <span>✦ Clear cost estimates</span>
          </div>
        </div>
      </div>

      <div className="interior-service-links">
        {['Full home', 'Kitchen', 'Bedroom', 'Living room', 'Wardrobe', 'Furniture & furnishing', 'Painting & renovation'].map(value => (
          <Link key={value} href={`/interiors?category=${encodeURIComponent(value)}`}>
            <Armchair size={17} />
            {value}
            <ArrowUpRight size={14} />
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {designs.data?.items?.map(item => (
          <Link href={`/interiors/${item._id}`} className="property-card" key={item._id}>
            <div className="card-image">
              <Image src={designImage(item)} alt={item.title} />
              <span className="card-badge bg-white/95 text-stone-900 border border-stone-200/80 absolute left-3 top-3 font-semibold">{item.category}</span>
            </div>
            <div className="p-5">
              <h3 className="!text-lg">{item.title}</h3>
              <div className="flex justify-between mt-4 text-sm">
                <span>From {money(item.startingPrice)}</span>
                <ArrowUpRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* 4. Customer Testimonials Section */}
    <section className="soft-section" id="testimonials">
      <div className="wrap section">
        <SectionTitle
          eyebrow="REAL EXPERIENCES"
          title="Loved by thousands of movers & owners"
          description="See why renters, buyers and landlords choose UrbanFindr to connect directly without middlemen."
        />
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="panel flex flex-col justify-between bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    {t.name}
                    <BadgeCheck size={14} className="text-forest" />
                  </h4>
                  <p className="text-xs muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 5. Frequently Asked Questions (FAQ) Section */}
    <section className="wrap section" id="faq">
      <SectionTitle
        eyebrow="GOT QUESTIONS?"
        title="Frequently asked questions"
        description="Everything you need to know about finding homes, scheduling visits, and posting properties directly."
      />
      <div className="max-w-3xl mx-auto mt-8 space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              className="border border-stone-200 rounded-xl overflow-hidden bg-white transition"
            >
              <button
                type="button"
                className="w-full text-left p-5 font-semibold text-base flex justify-between items-center gap-4 hover:bg-stone-50"
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp size={18} className="text-forest shrink-0" /> : <ChevronDown size={18} className="muted shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>

    {/* For Property Owners Banner */}
    <section className="wrap pb-20">
      <div className="owner-banner">
        <div>
          <p className="eyebrow text-forest/60">FOR PROPERTY OWNERS & BROKERS</p>
          <h2>Your property. Someone’s perfect place.</h2>
          <p className="muted mt-3">
            Sell, rent, list a PG or offer a business space. Post your property and create your direct presence for free.
          </p>
        </div>
        <Link href="/post-property" className="btn">
          Post your property<ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  </>;
}
