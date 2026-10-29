'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { getCategoryBySlug } from '@/lib/serviceCategories';
import ServiceHero from './ServiceHero';
import CategoryDirectory from './CategoryDirectory';
import WhyChooseUrbanFindr from './WhyChooseUrbanFindr';

export default function CategoryPage({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityParam = searchParams?.get('city');
  const localityParam = searchParams?.get('locality') || searchParams?.get('q') || '';

  const [selectedCity, setSelectedCity] = useState(cityParam || '');
  const [selectedLocality, setSelectedLocality] = useState(localityParam || '');
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    if (cityParam !== undefined && cityParam !== null) {
      setSelectedCity(cityParam);
    }
  }, [cityParam]);

  useEffect(() => {
    if (localityParam !== undefined && localityParam !== null) {
      setSelectedLocality(localityParam);
    }
  }, [localityParam]);

  const handleHeroSearch = ({ city, locality }) => {
    setSelectedCity(city);
    setSelectedLocality(locality);
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (locality) params.set('locality', locality);
    router.push(`/categories/${slug}${params.toString() ? '?' + params.toString() : ''}`);
  };

  const category = getCategoryBySlug(slug) || {
    slug,
    label: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Service Category',
    headline: 'Safe, reliable solutions for your home and business.',
    supportingText: 'Find trusted professionals for installations, repairs, and regular maintenance.',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85',
    serviceOptions: ['General Inspection', 'Standard Repair', 'Maintenance Service'],
    defaultPlaceholder: 'Describe your requirement in detail...',
    benefits: [
      {
        title: 'Verified Professionals',
        desc: 'Licensed and trained technicians in your area.'
      },
      {
        title: 'Transparent Pricing',
        desc: 'Upfront rates with no hidden costs.'
      },
      {
        title: 'Convenient Scheduling',
        desc: 'Choose your preferred date and time slot.'
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen text-stone-800 flex flex-col">
      {/* SECTION A: Functional Breadcrumbs */}
      <div className="bg-[#051812] border-b border-emerald-950/80 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-emerald-300 transition-colors font-medium text-stone-300"
            >
              <Home size={13} className="text-emerald-400" />
              <span>Home</span>
            </Link>
            <ChevronRight size={12} className="text-stone-600" />
            <Link
              href="/categories"
              className="hover:text-emerald-300 transition-colors font-medium text-stone-300"
            >
              Explore by Category
            </Link>
            <ChevronRight size={12} className="text-stone-600" />
            <span className="font-semibold text-emerald-300">{category.label}</span>
          </nav>
        </div>
      </div>

      {/* SECTION B: Compact Hero Section with Full Background Image, Left Text & Large Search Bar, and Right Form */}
      <ServiceHero
        category={category}
        initialCity={selectedCity}
        initialLocality={selectedLocality}
        onSearch={handleHeroSearch}
        selectedService={selectedService}
        onResetPreload={() => setSelectedService('')}
      />

      {/* SECTION C: 2-Column Category Directory Showcase with Filter Sidebar and Cards Grid */}
      <CategoryDirectory
        category={category}
        initialCity={selectedCity || 'Hyderabad'}
        initialLocality={selectedLocality}
      />

      {/* SECTION D: Why Choose UrbanFindr Section */}
      <WhyChooseUrbanFindr category={category} />
    </div>
  );
}
