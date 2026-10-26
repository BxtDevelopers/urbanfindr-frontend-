'use client';
import { designImage } from '@/lib/media';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Search,
  Building2,
  Armchair,
  Check,
  House,
  KeyRound,
  BedDouble,
  BriefcaseBusiness,
  Plus,
  Star,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Sparkles,
  HelpCircle,
  MessageSquareQuote
} from 'lucide-react';
import { useData } from './providers';
import { PropertyCard, ProjectCard, SectionTitle, State, Image } from './ui';
import { CityCards } from './city-discovery';
import { categories, categoryFor } from '@/lib/catalog';
import ExploreCategories from './ExploreCategories';
import BuilderProjectsBanner from './BuilderProjectsBanner';
import VerifiedPropertiesCarousel from './VerifiedPropertiesCarousel';
import FeaturedProfessionals from './FeaturedProfessionals';
import { cities, money } from '@/lib/format';

export default function HomePage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState('buy');
  const [featuredPurpose, setFeaturedPurpose] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const featured = useData(`properties?featured=true&limit=3${featuredPurpose ? '&purpose=' + featuredPurpose : ''}`);
  const verified = useData('properties?verified=true&limit=12');
  const latest = useData('properties?limit=6');
  const discovery = useData('discovery');
  const projects = useData('projects?limit=3');
  const designs = useData('designs?limit=3');

  function search(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const city = form.get('city');
    if (city) params.set('city', city);

    const q = form.get('q');
    if (q) params.set('q', q);

    router.push(`${categoryFor(purpose).path}?${params}`);
  }

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
      text: 'Finding an independent house without aggressive brokers seemed impossible until UrbanFinder. Verified listings gave us confidence and peace of mind.'
    }
  ];

  const faqs = [
    {
      q: 'How does UrbanFinder connect you directly with owners?',
      a: 'UrbanFinder connects genuine buyers and tenants directly with verified property owners and builder project coordinators with transparent contact details and zero middleman friction.'
    },
    {
      q: 'How are properties verified before going live?',
      a: 'Every property posted on UrbanFinder is reviewed by our administration team to check property ownership details, pricing authenticity, images, and locality information before being marked as a Reviewed Listing.'
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
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow flex items-center gap-2">
            <span className="w-2 h-2 bg-forest rounded-full" />
            DIRECT OWNERS. MORE POSSIBILITIES.
          </p>
          <h1>Every space.<br />Every <em>next chapter.</em></h1>
          <p className="hero-sub">
            Buy a home. Find a rental. Share a place. Build your business.<br className="hidden lg:block" />
            Your next move starts here, directly with owners.
          </p>
          <div className="hero-proof">
            <span className="flex -space-x-2">
              {['A', 'R', 'S', 'M'].map((value, i) => (
                <span key={value} className={`avatar avatar-${i}`}>{value}</span>
              ))}
            </span>
            <span>
              <strong>Find the space that fits your life.</strong><br />
              <span className="text-xs muted">Properties, new communities and thoughtful interiors.</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <img 
            src="/images/home-hero.png" 
            alt="UrbanFinder properties, interiors and home services"
            className="w-full max-w-[540px] h-auto object-contain" 
          />
        </div>
      </div>

      {/* Property Search Panel */}
      <form className="search-panel wrap" onSubmit={search}>
        <div className="search-tabs" role="tablist" aria-label="What are you looking for?">
          {categories.map(item => (
            <button
              role="tab"
              aria-selected={purpose === item.purpose}
              key={item.purpose}
              type="button"
              className={purpose === item.purpose ? 'active' : ''}
              onClick={() => setPurpose(item.purpose)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Inputs: City, Locality, Search Button */}
        <div className="search-inputs">
          <label className="flex gap-3 items-center">
            <MapPin size={19} className="text-forest" />
            <select name="city" defaultValue="Bengaluru" aria-label="City">
              {cities.map(city => <option key={city}>{city}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-3 search-locality flex-1">
            <Search size={19} className="muted" />
            <input
              name="q"
              aria-label="Locality or property"
              placeholder="Search localities (comma-separated for multiple), landmarks, or projects"
              maxLength={100}
            />
          </label>

          <button className="btn">
            <Search size={17} />
            {purpose === 'pg' ? 'Find my PG' : purpose === 'commercial' ? 'Find my space' : 'Find my home'}
          </button>
        </div>
      </form>
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
          <p className="eyebrow">URBANFINDER HOME INTERIORS</p>
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
          description="See why renters, buyers and landlords choose UrbanFinder to connect directly without middlemen."
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
