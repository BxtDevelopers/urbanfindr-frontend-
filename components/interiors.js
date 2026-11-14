'use client';

import {  useState  } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Calculator, 
  ShieldCheck, 
  Layers, 
  Clock, 
  House, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { api, useApp, useData } from './providers';
import { Image, State } from './ui';
import { EnquiryForm } from './engagement';
import { money } from '@/lib/format';
import { designImage } from '@/lib/media';

// Import All 15 Interior Feature Components
import InteriorHeroBanner from './InteriorHeroBanner';
import InteriorRatingsStrip from './InteriorRatingsStrip';
import InteriorPackagesSection from './interior/InteriorPackagesSection';
import InteriorCategoriesSection from './interior/InteriorCategoriesSection';
import InteriorDesignerCard from './interior/InteriorDesignerCard';
import InteriorPortfolioSection from './interior/InteriorPortfolioSection';
import InteriorMakeoverShowcase from './InteriorMakeoverShowcase';
import InteriorStoriesCarousel from './InteriorStoriesCarousel';
import InteriorStepsProcess from './InteriorStepsProcess';
import InteriorBrandCollective from './InteriorBrandCollective';
import InteriorReviewsSection from './interior/InteriorReviewsSection';
import InteriorFAQ from './InteriorFAQ';
import InteriorConsultationModal from './interior/InteriorConsultationModal';

export default function Interiors({ id }) {
  const { toast } = useApp();
  const params = useSearchParams();
  const router = useRouter();

  // Consultation Modal State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDesigner, setSelectedDesigner] = useState(null);

  // Estimator State for Instant Quotes
  const [estHomeSize, setEstHomeSize] = useState('3 BHK');
  const [estService, setEstService] = useState('Full home');
  const [estFinish, setEstFinish] = useState('Premium');

  const baseEstimates = {
    '1 BHK': { Essential: 280000, Premium: 450000, Luxe: 720000 },
    '2 BHK': { Essential: 490000, Premium: 750000, Luxe: 1150000 },
    '3 BHK': { Essential: 740000, Premium: 1120000, Luxe: 1680000 },
    '4+ BHK': { Essential: 1050000, Premium: 1580000, Luxe: 2450000 }
  };

  const serviceMultipliers = {
    'Full home': 1.0,
    Kitchen: 0.38,
    'Living & Dining': 0.32,
    'Master Bedroom': 0.28,
    Wardrobes: 0.22
  };

  const calculatedEstimate = Math.round(
    (baseEstimates[estHomeSize]?.[estFinish] || 850000) *
    (serviceMultipliers[estService] || 1.0)
  );

  // Smooth scroll handler with header + subnav offset so content is never cut in half from the top
  const scrollToSection = (elementId) => {
    if (typeof window === 'undefined') return;
    const elem = document.getElementById(elementId);
    if (elem) {
      // 86px (main header) + 20px padding = 106px
      const navOffset = 106;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  // If viewing single design item detail (e.g. /interiors/:id)
  const { data, error, loading } = useData(id ? `designs/${id}` : null);

  if (id) {
    return (
      <div className="wrap section">
        <State loading={loading} error={error} />
        {data && (
          <>
            <Link href="/interiors" className="text-link mb-6 inline-flex items-center gap-1.5 font-medium">
              ← All design ideas
            </Link>
            <p className="eyebrow">{data.category} &bull; {data.style}</p>
            <h1 className="!text-4xl font-extrabold text-stone-900 mt-1">{data.title}</h1>
            <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-8 items-start">
              <div>
                <Image src={designImage(data)} alt={data.title} className="w-full rounded-2xl shadow-md" />
                <div className="panel mt-6">
                  <h3 className="text-xl font-bold text-stone-900">Make this look your own</h3>
                  <p className="muted leading-7 my-4 text-stone-600">{data.description}</p>
                  <p className="text-2xl font-black text-forest">Starting from {money(data.startingPrice)}</p>
                  <p className="text-xs muted my-2">
                    Indicative factory-finish pricing. Actual quote depends on room dimensions, plywood grade and fittings.
                  </p>
                  <div className="space-y-2.5 mt-5">
                    {data.inclusions?.map((v) => (
                      <p key={v} className="flex items-center gap-2 text-sm text-stone-700">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>{v}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <EnquiryForm design={data} estimate={data.startingPrice} />
            </div>
          </>
        )}
      </div>
    );
  }

  // Home Interiors Master Hub (All 15 Steps Integrated)
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner with Next.js Actions */}
      <InteriorHeroBanner
        onBookClick={() => {
          setSelectedPackage(null);
          setSelectedDesigner(null);
          setShowConsultModal(true);
        }}
        onGetQuoteClick={() => scrollToSection('estimator')}
      />

      {/* Trust & Quality Highlight Strip */}
      <InteriorRatingsStrip />

      {/* FEATURE 2: INTERIOR DESIGN CATEGORIES */}
      <InteriorCategoriesSection
        onSelectCategory={(cat) => {
          setSelectedPackage({
            bhk: '3 BHK',
            tier: 'Premium',
            scope: cat.title
          });
          setShowConsultModal(true);
        }}
      />

      {/* FEATURE 4: PORTFOLIO GALLERIES */}
      <InteriorPortfolioSection
        onBookConsultation={(portfolioItem) => {
          setSelectedPackage({
            bhk: portfolioItem?.bhk || 'Turnkey',
            tier: 'Premium',
            packageName: portfolioItem?.title || 'Bespoke Package',
            scope: `${portfolioItem?.room || 'Custom'} - ${portfolioItem?.style || 'Modern'}`
          });
          setShowConsultModal(true);
        }}
      />

      {/* HOW IT WORKS / STEP-BY-STEP PROCESS */}
      <InteriorStepsProcess onBookConsultation={() => setShowConsultModal(true)} />

      {/* FEATURE 3: ALL-INCLUSIVE DESIGN PACKAGES */}
      <InteriorPackagesSection
        onSelectPackage={(pkg) => {
          setSelectedPackage(pkg);
          setShowConsultModal(true);
        }}
      />

      {/* FEATURE 8 & 3: INSTANT QUOTATION ESTIMATOR */}
      <section className="py-12 bg-stone-50 border-t border-stone-200/90 scroll-mt-36 sm:scroll-mt-40" id="estimator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                  <Calculator size={13} /> Instant Room &amp; Material Quotations
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  Calculate Your Home Interior Estimate
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Transparent itemized material costing with zero hidden fees.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Guaranteed:
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                  <Clock size={13} /> 45-Day Handover
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Home Size Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  1. Home Configuration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map((bhk) => (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => setEstHomeSize(bhk)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        estHomeSize === bhk
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Scope Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  2. Project Scope
                </label>
                <div className="space-y-1.5">
                  {['Full home', 'Kitchen', 'Living & Dining', 'Master Bedroom', 'Wardrobes'].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setEstService(sc)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        estService === sc
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span>{sc}</span>
                      {estService === sc && <Check size={13} className="text-emerald-700" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Tier */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  3. Finish Tier
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'Essential', desc: 'Commercial MR Ply + 0.8mm Laminate' },
                    { id: 'Premium', desc: 'BWP 710 Marine Ply + 1.2mm Acrylic + Hafele' },
                    { id: 'Luxe', desc: 'Action TESA HDHMR + PU Polish + Blum' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setEstFinish(tier.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        estFinish === tier.id
                          ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-stone-900">{tier.id}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Output Box */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#072418] to-stone-900 text-white rounded-2xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded">
                  Estimated Factory-Finish Turnkey Quote:
                </span>
                <p className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                  {money(calculatedEstimate)}
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  Includes 45-day handover guarantee, 3D walkthrough renders &amp; 10-year warranty.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPackage({
                    bhk: estHomeSize,
                    tier: estFinish,
                    scope: estService,
                    price: calculatedEstimate
                  });
                  setShowConsultModal(true);
                }}
                className="btn btn-primary px-6 py-3 text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Book Consultation for this Quote →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REAL HOME MAKEOVERS & CUSTOMER STORIES */}
      <InteriorMakeoverShowcase />
      <InteriorStoriesCarousel />

      {/* FEATURE 1: INTERIOR DESIGNER PROFILES */}
      <InteriorDesignerCard
        onBookConsultation={(designer) => {
          setSelectedDesigner(designer);
          setShowConsultModal(true);
        }}
      />

      {/* PREMIUM MATERIAL PARTNERS & BRAND COLLECTIVE */}
      <InteriorBrandCollective />

      {/* FEATURE 15: CUSTOMER REVIEWS */}
      <InteriorReviewsSection />

      {/* FAQ */}
      <InteriorFAQ />

      {/* FEATURE 5, 6, 7: CONSULTATION BOOKING MODAL WITH FLOOR-PLAN UPLOAD & SITE VISIT */}
      <InteriorConsultationModal
        isOpen={showConsultModal}
        onClose={() => setShowConsultModal(false)}
        preselectedPackage={selectedPackage}
        preselectedDesigner={selectedDesigner}
        onSuccess={(booking) => {
          toast(`Consultation booked! ID: ${booking.requestId}`);
        }}
      />
    </div>
  );
}
