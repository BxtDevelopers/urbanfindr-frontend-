'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Check, MapPin, Download, ChevronLeft, ChevronRight, 
  Sparkles, ShieldCheck, Building2, Calendar, Maximize2, Layers, 
  Phone, Mail, Globe, CheckCircle2, FileText, ArrowRight
} from 'lucide-react';
import { useData } from './providers';
import { Image, State, SectionTitle } from './ui';
import { ConnectPanel, EnquiryForm } from './engagement';
import { money } from '@/lib/format';
import { categoryFor, isMonthly, builderProfileFor } from '@/lib/catalog';
import { propertyImages, projectImages } from '@/lib/media';

export function Gallery({ images, title }) {
  const [index, setIndex] = useState(null);
  const imgs = images?.length ? images : ['/images/home-1.svg'];
  return (
    <>
      <div className="gallery">
        <button onClick={() => setIndex(0)} aria-label="Open image gallery" className="relative group">
          <Image src={imgs[0]} alt={title} />
          <span className="badge absolute bottom-4 left-4 bg-stone-900/80 text-white backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
            View {imgs.length} photographs
          </span>
        </button>
        <div>
          {[1, 2].map((v) => (
            <button key={v} onClick={() => setIndex(v % imgs.length)} aria-label={`Open image ${v + 1}`}>
              <Image src={imgs[v % imgs.length]} alt={`${title} view ${v + 1}`} />
            </button>
          ))}
        </div>
      </div>
      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          className="modal"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIndex(null);
          }}
          tabIndex={-1}
        >
          <button className="close" onClick={() => setIndex(null)} aria-label="Close gallery">
            ×
          </button>
          <button
            className="icon-btn mr-3 shrink-0"
            onClick={() => setIndex((index + imgs.length - 1) % imgs.length)}
            aria-label="Previous image"
          >
            <ChevronLeft />
          </button>
          <Image src={imgs[index]} alt={`${title} view ${index + 1}`} />
          <button
            className="icon-btn ml-3 shrink-0"
            onClick={() => setIndex((index + 1) % imgs.length)}
            aria-label="Next image"
          >
            <ChevronRight />
          </button>
          <span className="absolute bottom-3 text-white text-sm bg-stone-900/70 px-3 py-1 rounded">
            {index + 1} / {imgs.length}
          </span>
        </div>
      )}
    </>
  );
}

function ProjectDetailsView({ item }) {
  const [plan, setPlan] = useState(0);
  const [zoomPlan, setZoomPlan] = useState(false);
  const configs = item.configurations || [];
  const selectedConfig = configs[plan] || configs[0];
  const developer = builderProfileFor(item.builder) || {
    name: item.builder,
    experienceYears: 15,
    completedProjects: 12,
    ongoingProjects: 4,
    reraId: item.rera || 'PRM/RERA/DEV-GEN',
    about: `${item.builder} is an established residential developer committed to sustainable communities, high construction standards, and timely delivery.`,
    verified: true
  };

  const images = projectImages(item);

  return (
    <div className="wrap pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-stone-500 mt-6 mb-2">
        <Link href="/" className="hover:text-forest">Home</Link>
        <span>/</span>
        <Link href="/projects" className="hover:text-forest">Builder Projects</Link>
        <span>/</span>
        <Link href={`/projects?city=${encodeURIComponent(item.city)}`} className="hover:text-forest">{item.city}</Link>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate max-w-xs">{item.title}</span>
      </div>

      <Link className="text-link mt-2 mb-4 inline-flex items-center gap-1.5" href="/projects">
        <ArrowLeft size={15} /> Back to all builder projects
      </Link>

      {/* Project Title & Badge Bar */}
      <div className="page-heading !pt-4 !pb-6">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className={`chip font-semibold ${item.stage === 'Ready to move' ? '!bg-emerald-100 !text-emerald-900 !border-emerald-300' : '!bg-amber-50 !text-amber-900 !border-amber-200'}`}>
            <Calendar size={13} className="inline mr-1" />
            {item.stage}
          </span>

          <span className="chip !bg-forest/10 !text-forest !border-forest/20 font-semibold">
            <ShieldCheck size={13} className="inline mr-1 text-forest" />
            Verified Developer Project
          </span>

          {item.featured && (
            <span className="chip !bg-forest !text-lime font-bold tracking-wide uppercase text-[11px]">
              <Sparkles size={12} className="inline mr-1" />
              Featured Showcase
            </span>
          )}

          {item.status && item.status !== 'approved' && (
            <span className="chip !bg-amber-200 text-amber-900 font-bold uppercase text-[11px]">
              Moderation: {item.status}
            </span>
          )}
        </div>

        <h1 className="!text-3xl md:!text-4xl font-extrabold text-stone-900">{item.title}</h1>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-stone-600">
          <p className="flex items-center gap-1.5 font-semibold text-forest">
            <Building2 size={16} />
            <span>Developed by {item.builder}</span>
          </p>
          <span>•</span>
          <p className="flex items-center gap-1.5">
            <MapPin size={16} className="text-stone-400" />
            <span>{item.locality}, {item.city}</span>
          </p>
          {item.possession && (
            <>
              <span>•</span>
              <p className="font-medium text-stone-800">
                Possession: <strong className="text-forest">{item.possession}</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Photographs Gallery (Step 6) */}
      <Gallery images={images} title={item.title} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8 items-start">
        <div className="space-y-6">
          {/* Price Range & Quick Metrics (Step 7 & 8) */}
          <div className="panel p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <p className="muted text-xs uppercase tracking-wider font-semibold">Price range</p>
                <h2 className="mt-1 !text-3xl font-extrabold text-stone-900">
                  {money(item.price)}
                  {item.maxPrice && item.maxPrice > item.price ? ` – ${money(item.maxPrice)}` : ''}
                </h2>
                <p className="text-xs text-stone-500 mt-1">Government taxes &amp; registration charges applicable extra</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1.5 bg-forest/10 text-forest font-semibold rounded-lg text-sm">
                  {item.stage}
                </span>
                <p className="text-xs muted mt-1.5">Target possession: {item.possession || 'Announced upon booking'}</p>
              </div>
            </div>

            <div className="divider my-5" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                <p className="text-xs text-stone-500">Project Area</p>
                <strong className="text-lg text-stone-900">{item.acres || '—'} Acres</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                <p className="text-xs text-stone-500">Total Residences</p>
                <strong className="text-lg text-stone-900">{item.units || '—'} Units</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                <p className="text-xs text-stone-500">High-Rise Towers</p>
                <strong className="text-lg text-stone-900">{item.towers || '—'} Towers</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60">
                <p className="text-xs text-stone-500">Starting Carpet Area</p>
                <strong className="text-lg text-stone-900">{item.area ? `${item.area} sq ft` : '—'}</strong>
              </div>
            </div>
          </div>

          {/* About the Project */}
          <div className="panel p-6">
            <h3 className="!text-xl font-bold">About {item.title}</h3>
            <p className="muted whitespace-pre-line leading-7 mt-3 text-stone-700">{item.description}</p>
            
            {/* RERA Reference Box (Step 8) */}
            <div className="bg-lime/15 border border-forest/20 p-4 rounded-xl mt-6 flex items-start gap-3">
              <ShieldCheck size={24} className="text-forest shrink-0 mt-0.5" />
              <div className="text-xs leading-5">
                <strong className="text-forest text-sm block">Official RERA Registration: {item.rera}</strong>
                <p className="text-stone-700 mt-1">
                  This project is catalogued under official State Real Estate Regulatory Authority compliance. 
                  Prospective buyers are advised to independently inspect RERA portal documentation, sanctions, and encumbrances before committing funds.
                </p>
              </div>
            </div>
          </div>

          {/* Configurations & Floor Plans (Step 6 & 7) */}
          <div className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="!text-xl font-bold">Available Configurations &amp; Floor Plans</h3>
                <p className="text-xs muted mt-1">Select a unit layout to view dimensions, carpet area, and architectural floor plan</p>
              </div>
              <a 
                className="btn-outline !text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5" 
                href={`/api/projects/${item._id}/brochure`} 
                download
              >
                <Download size={14} /> Download Project Brochure (.txt)
              </a>
            </div>

            {/* Configuration Tabs */}
            <div className="tab-row my-4 border-b pb-2">
              {configs.map((v, i) => (
                <button 
                  key={i} 
                  className={`!text-sm font-semibold !py-2 !px-4 rounded-lg transition ${plan === i ? 'active !bg-forest !text-white' : '!bg-stone-100 !text-stone-700 hover:!bg-stone-200'}`} 
                  onClick={() => setPlan(i)}
                >
                  {v.name}
                </button>
              ))}
            </div>

            {/* Selected Configuration Card */}
            {selectedConfig && (
              <div className="mt-4 border border-stone-200 rounded-xl p-5 bg-stone-50/50">
                <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-stone-200">
                  <div>
                    <h4 className="font-bold text-lg text-stone-900">{selectedConfig.name} Residence</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Estimated Carpet Area: <strong>{selectedConfig.area} sq ft</strong>
                      {selectedConfig.area && selectedConfig.price ? (
                        <span> · Approx. ₹ {Math.round(selectedConfig.price / selectedConfig.area).toLocaleString('en-IN')} / sq ft</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500">Starting Price</p>
                    <strong className="text-xl text-forest font-bold">{money(selectedConfig.price)}</strong>
                  </div>
                </div>

                {/* Floor Plan Image */}
                <div className="mt-4 relative group">
                  <div className="bg-white p-3 rounded-lg border border-stone-200 overflow-hidden text-center cursor-pointer" onClick={() => setZoomPlan(true)}>
                    <Image 
                      src={selectedConfig.plan} 
                      alt={`${selectedConfig.name} architectural floor plan layout`} 
                      className="w-full max-h-[380px] object-contain mx-auto rounded transition group-hover:scale-[1.01]" 
                    />
                    <div className="mt-2 text-xs text-stone-500 flex items-center justify-center gap-1">
                      <Maximize2 size={13} /> Click to expand floor plan
                    </div>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs muted mt-3">Architectural floor plans are indicative representations. Final deliverables will conform to sanctioned authority drawings.</p>
          </div>

          {/* Floor Plan Modal Zoom */}
          {zoomPlan && selectedConfig && (
            <div 
              className="modal" 
              role="dialog" 
              aria-modal="true" 
              onClick={() => setZoomPlan(false)}
            >
              <button className="close" onClick={() => setZoomPlan(false)}>×</button>
              <div className="bg-white p-6 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h3 className="font-bold text-lg">{item.title} — {selectedConfig.name} Floor Plan</h3>
                  <span className="text-sm font-semibold text-forest">{selectedConfig.area} sq ft · {money(selectedConfig.price)}</span>
                </div>
                <Image src={selectedConfig.plan} alt={selectedConfig.name} className="w-full max-h-[70vh] object-contain mx-auto" />
              </div>
            </div>
          )}

          {/* Project Amenities */}
          <div className="panel p-6">
            <h3 className="!text-xl font-bold">Community &amp; Lifestyle Amenities</h3>
            <p className="text-xs muted mt-1 mb-5">Curated recreational and wellness facilities integrated into the master plan</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {item.amenities?.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-xs font-medium text-stone-800">
                  <Check size={14} className="text-forest shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Builder Profile Showcase (Step 1) */}
          <div className="panel p-6 border-l-4 border-forest">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-forest text-lime flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                  {developer.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="!text-lg font-bold text-stone-900">{developer.name}</h3>
                    {developer.verified && <ShieldCheck size={16} className="text-forest" />}
                  </div>
                  <p className="text-xs text-stone-500">Corporate Developer • {developer.experienceYears || '15+'} Years of Industry Experience</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-stone-500">Corporate RERA:</span>
                <strong className="block text-stone-800 font-mono text-[11px]">{developer.reraId}</strong>
              </div>
            </div>

            <p className="text-sm muted mt-4 leading-relaxed">{developer.about}</p>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-stone-100 text-center">
              <div>
                <strong className="text-base text-forest font-bold">{developer.completedProjects || 15}+</strong>
                <p className="text-[11px] text-stone-500">Completed Projects</p>
              </div>
              <div>
                <strong className="text-base text-forest font-bold">{developer.ongoingProjects || 5}</strong>
                <p className="text-[11px] text-stone-500">Active Developments</p>
              </div>
              <div>
                <strong className="text-base text-forest font-bold">{item.city}</strong>
                <p className="text-[11px] text-stone-500">Operating Market</p>
              </div>
            </div>
          </div>

          {/* Project Enquiries (Step 9) */}
          <div className="mt-8">
            <EnquiryForm project={item} />
          </div>
        </div>

        {/* Sticky Connect & Site Visit Panel (Step 10) */}
        <div className="side-sticky">
          <ConnectPanel item={item} project={true} />
        </div>
      </div>
    </div>
  );
}

export default function Details({ id, project = false }) {
  const { data: item, error, loading } = useData(`${project ? 'projects' : 'properties'}/${id}`);

  if (!item) {
    return (
      <div className="wrap section">
        <State loading={loading} error={error} />
      </div>
    );
  }

  if (project) {
    return <ProjectDetailsView item={item} />;
  }

  // Regular residential / commercial / PG property view
  return (
    <div className="wrap pb-20">
      <Link className="text-link mt-7" href={categoryFor(item.purpose)?.path || '/properties'}>
        <ArrowLeft size={15} /> Back to homes
      </Link>
      <div className="page-heading !pt-7">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="chip">{item.type}</span>
          {item.verified && (
            <span className="chip">
              <Check size={12} /> Reviewed listing
            </span>
          )}
          <span className="chip">Direct owner listing</span>
          {item.status !== 'approved' && <span className="chip">{item.status}</span>}
        </div>
        <h1>{item.title}</h1>
        <p className="muted mt-4 flex gap-2 items-center">
          <MapPin size={16} />
          {item.locality}, {item.city}
        </p>
      </div>

      <Gallery images={propertyImages(item)} title={item.title} />

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-8 items-start">
        <div>
          <div className="panel">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <p className="muted text-xs">Asking price</p>
                <h2 className="mt-2">
                  {money(item.price)}
                  {!isMonthly(item) ? '' : <span className="muted text-base"> / month</span>}
                </h2>
              </div>
              <div className="text-right text-xs muted">
                {item.area?.toLocaleString()} sq ft · {item.furnishing}
              </div>
            </div>
            <div className="divider" />
            <div className="summary-grid">
              {[
                [item.bedrooms || '—', 'Bedrooms'],
                [item.bathrooms || '—', 'Bathrooms'],
                [`${item.area} sq ft`, 'Built-up area'],
              ].map(([v, k]) => (
                <div key={k}>
                  <strong className="text-lg">{v}</strong>
                  <p className="text-xs muted mt-2">{k}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel mt-6">
            <h3>About this home</h3>
            <p className="muted whitespace-pre-line leading-7 mt-4">{item.description}</p>
            <div className="grid grid-cols-2 gap-5 mt-6 text-sm">
              {[
                ...(item.purpose === 'pg'
                  ? [
                      ['Room sharing', item.sharing || 'Private room'],
                      ['Meals included', item.mealsIncluded ? 'Yes' : 'No'],
                      ['Available beds', item.availableBeds ?? 1],
                    ]
                  : []),
                ...(item.purpose === 'commercial'
                  ? [['Transaction', item.transaction === 'sale' ? 'For sale' : 'For lease']]
                  : []),
                ['Address', item.address],
                ['Available from', item.availableFrom ? new Date(item.availableFrom).toLocaleDateString('en-IN') : 'Now'],
                ['Preferred tenants', item.preferredTenant],
                ['Parking', item.parking ? 'Available' : 'Not available'],
                ['Deposit', money(item.deposit)],
                ['Maintenance', `${money(item.maintenance)} / month`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs muted mb-1">{k}</p>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel mt-6">
            <h3>Room for a little more</h3>
            <div className="flex flex-wrap gap-3 mt-5">
              {item.amenities?.map((v) => (
                <span className="chip" key={v}>
                  <Check size={13} />
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        <ConnectPanel item={item} project={false} />
      </div>
    </div>
  );
}
