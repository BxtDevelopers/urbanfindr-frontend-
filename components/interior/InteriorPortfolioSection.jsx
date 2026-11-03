'use client';

import { useState } from 'react';
import { Camera, Maximize2, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { interiorPortfolio } from '@/lib/interiorData';

export default function InteriorPortfolioSection({ onBookConsultation }) {
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [activeBeforeAfter, setActiveBeforeAfter] = useState({});
  const [modalItem, setModalItem] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const rooms = ['All', 'Living Room', 'Modular Kitchen', 'Master Bedroom', 'Wardrobes & Storage', 'Full Home Turnkey'];
  const styles = ['All', 'Scandinavian Minimalist', 'Modern Contemporary', 'Modern Luxury', 'Industrial Modern', 'Warm Bohemian'];

  const filteredPortfolio = interiorPortfolio.filter(item => {
    const matchRoom = selectedRoom === 'All' || item.room === selectedRoom;
    const matchStyle = selectedStyle === 'All' || item.style === selectedStyle;
    return matchRoom && matchStyle;
  });

  const openModal = (item) => {
    setModalItem(item);
    setActiveImageIndex(0);
  };

  // Helper to compile all unique photos, before/after, and renders for rich viewing
  const getModalImages = (item) => {
    if (!item) return [];
    const list = [];

    // 1. Completed final state
    if (item.afterImage) {
      list.push({
        url: item.afterImage,
        label: 'Final Completed Handover',
        sublabel: 'Finished Space',
        badge: 'Final Reveal',
        badgeColor: 'bg-emerald-600 text-white',
        type: 'after',
        desc: 'Completed interior execution with factory-assembled woodwork, concealed cove lighting, and tailored finishes.'
      });
    }

    // 2. Before renovation condition
    if (item.beforeImage) {
      list.push({
        url: item.beforeImage,
        label: 'Original Site Condition',
        sublabel: 'Pre-Renovation State',
        badge: 'Before Renovation',
        badgeColor: 'bg-amber-400 text-stone-950 font-bold',
        type: 'before',
        desc: 'Raw builder-finish space prior to civil alterations, concealed piping/wiring, and modular cabinetry installation.'
      });
    }

    // 3. Perspective 3D renders and alternate angles
    if (Array.isArray(item.renders)) {
      item.renders.forEach((renderUrl, idx) => {
        // Avoid adding the exact same URL if already added
        if (renderUrl !== item.afterImage && renderUrl !== item.beforeImage) {
          list.push({
            url: renderUrl,
            label: `Perspective Angle #${idx + 1}`,
            sublabel: 'Alternate Angle View',
            badge: `Angle View ${idx + 1}`,
            badgeColor: 'bg-indigo-600 text-white',
            type: 'render',
            desc: `Detailed architectural angle and layout perspective for ${item.room}.`
          });
        }
      });
    }

    // Ensure at least 2 images exist if possible
    if (list.length === 1 && item.afterImage) {
      list.push({
        url: item.afterImage,
        label: 'Detailed Architectural View',
        sublabel: 'Close-up Detail',
        badge: 'Detail View',
        badgeColor: 'bg-stone-800 text-white',
        type: 'render',
        desc: 'Precision craftsmanship and material joinery inspection.'
      });
    }

    return list;
  };

  const modalImages = modalItem ? getModalImages(modalItem) : [];
  const currentImage = modalImages[activeImageIndex] || modalImages[0];

  return (
    <section className="py-14 bg-stone-50 border-t border-stone-200 scroll-mt-24 sm:scroll-mt-28" id="portfolio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
              <Camera size={13} /> FEATURE 4: PORTFOLIO GALLERIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Real Completed Homes Portfolio &amp; 3D Renders
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Explore before &amp; after transformations delivered across prime gated residences.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm mb-8">
          <div className="flex overflow-x-auto gap-1.5 no-scrollbar py-0.5">
            {rooms.map(room => (
              <button
                key={room}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRoom === room
                    ? 'bg-emerald-900 text-white shadow'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {room}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Style:</span>
            <select
              value={selectedStyle}
              onChange={e => setSelectedStyle(e.target.value)}
              className="text-xs rounded-lg border border-stone-300 px-2.5 py-1.5 bg-stone-50 font-medium"
            >
              {styles.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolio.map((item) => {
            const currentMode = activeBeforeAfter[item.id] || 'after';
            const displayImage = currentMode === 'before' ? item.beforeImage : item.afterImage;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image Container with Before / After Switcher */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={displayImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Before / After Pill Toggle */}
                  <div className="absolute top-3 left-3 z-10 flex bg-black/70 backdrop-blur-md rounded-full p-0.5 border border-white/20">
                    <button
                      type="button"
                      onClick={() => setActiveBeforeAfter(prev => ({ ...prev, [item.id]: 'before' }))}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        currentMode === 'before'
                          ? 'bg-amber-400 text-stone-900 shadow'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBeforeAfter(prev => ({ ...prev, [item.id]: 'after' }))}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        currentMode === 'after'
                          ? 'bg-emerald-500 text-white shadow'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      After
                    </button>
                  </div>

                  {/* Budget & Area Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {item.budget} · {item.carpetArea}
                  </div>

                  {/* Lightbox Trigger */}
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    title="Enlarge"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-700 font-bold">{item.room}</span>
                      <span className="text-stone-400">{item.locality}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags?.map((t, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">Designer: <strong className="text-stone-800">{item.designer}</strong></span>
                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Inspect Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL RESPONSIVE PORTFOLIO LIGHTBOX MODAL */}
      {modalItem && (
        <div
          onClick={() => setModalItem(null)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh]"
          >
            {/* 1. Header Bar with Project Title, Category & Close */}
            <div className="shrink-0 bg-stone-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-stone-800">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {modalItem.room} · {modalItem.style}
                  </span>
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                    {modalItem.carpetArea} · {modalItem.bhk}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 truncate">
                  {modalItem.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-stone-400">Total Investment</p>
                  <p className="text-base font-black text-emerald-400 font-mono">{modalItem.budget}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 2. Main Image Spotlight Showcase Stage */}
            <div className="relative h-60 sm:h-72 md:h-80 w-full bg-stone-950 shrink-0 select-none overflow-hidden flex items-center justify-center group">
              {currentImage?.url ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.label}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                  No preview available
                </div>
              )}

              {/* Prev / Next Chevrons */}
              {modalImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : modalImages.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/65 hover:bg-black text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
                    title="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(prev => (prev < modalImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/65 hover:bg-black text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
                    title="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Active Image Indicator Badge (Bottom Left) */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold">{currentImage?.label || 'Perspective Angle'}</span>
                <span className="text-stone-300 text-[11px]">({activeImageIndex + 1} of {modalImages.length})</span>
              </div>

              {/* Before / After Direct Switcher (Top Left) */}
              {modalImages.some(img => img.type === 'before') && (
                <div className="absolute top-3 left-3 z-10 flex bg-black/70 backdrop-blur-md rounded-full p-0.5 border border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      const bIdx = modalImages.findIndex(img => img.type === 'before');
                      if (bIdx !== -1) setActiveImageIndex(bIdx);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentImage?.type === 'before'
                        ? 'bg-amber-400 text-stone-900 shadow'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const aIdx = modalImages.findIndex(img => img.type === 'after');
                      if (aIdx !== -1) setActiveImageIndex(aIdx);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentImage?.type === 'after'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    After
                  </button>
                </div>
              )}
            </div>

            {/* 3. Generous Scrollable Body with Project Details & Remaining Images */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 overscroll-contain bg-stone-50/50">
              {/* Project Meta & Details */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {modalItem.designer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Design Architect</p>
                      <p className="text-sm font-bold text-stone-900">{modalItem.designer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-stone-600">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Location</span>
                      <span className="font-semibold text-stone-800">{modalItem.locality}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Carpet Area</span>
                      <span className="font-semibold text-stone-800">{modalItem.carpetArea}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Total Investment</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">{modalItem.budget}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">Project Scope &amp; Transformation</h4>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {modalItem.description}
                  </p>
                </div>

                {/* Tags */}
                {modalItem.tags && modalItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {modalItem.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1"
                      >
                        <Check size={11} className="text-emerald-600" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ALL PROJECT ANGLES & REMAINING IMAGES */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Camera size={16} className="text-emerald-600" />
                      Project Angles &amp; All Images ({modalImages.length} Views Available)
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Click any photo or 3D angle below to inspect it in high resolution in the main showcase above.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Interactive Gallery
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
                  {modalImages.map((img, idx) => {
                    const isCurrent = activeImageIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 flex flex-col bg-white ${
                          isCurrent
                            ? 'border-emerald-600 ring-4 ring-emerald-500/20 shadow-md scale-[1.02]'
                            : 'border-stone-200 hover:border-emerald-500 hover:shadow-sm'
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-emerald-950/25 flex items-center justify-center">
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <Check size={10} /> Active View
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-1.5 right-1.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow backdrop-blur-md truncate block ${img.badgeColor}`}
                            >
                              {img.badge}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-stone-50 text-[11px] font-semibold text-stone-800 truncate">
                          {img.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Sticky Footer with Quick CTAs */}
            <div className="shrink-0 bg-white border-t border-stone-200 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Guaranteed 45-day handover · 10-year warranty included</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const item = modalItem;
                    setModalItem(null);
                    if (typeof onBookConsultation === 'function') {
                      onBookConsultation(item);
                    } else {
                      const target = document.getElementById('consultation') || document.getElementById('packages');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="btn btn-primary text-xs px-4 py-2 cursor-pointer shadow-sm"
                >
                  Book Consultation for this Style
                </button>
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
