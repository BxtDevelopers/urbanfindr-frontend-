'use client';

import {  useState  } from 'react';
import { Star, ShieldCheck, Award, MapPin, Phone, Mail, ChevronRight, CheckCircle2, User, Sparkles, X } from 'lucide-react';
import { interiorDesigners } from '@/lib/interiorData';

export default function InteriorDesignerCard({ onBookConsultation }) {
  const [selectedDesigner, setSelectedDesigner] = useState(null);

  return (
    <section className="py-12 bg-white scroll-mt-24 sm:scroll-mt-28" id="designers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
              <Sparkles size={12} />
              FEATURE 1: VERIFIED INTERIOR DESIGNER PROFILES
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Meet Our Verified Lead Interior Designers
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              Top-rated architects and space planners with proven turnkey delivery records.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {interiorDesigners.map((designer) => (
            <div
              key={designer.id}
              className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Designer Card Header */}
              <div className="p-5 pb-4 border-b border-stone-100 flex items-start gap-4">
                <div className="relative">
                  <img
                    src={designer.avatar}
                    alt={designer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] border border-white">
                    ✓
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {designer.badge}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 truncate mt-1">
                    {designer.name}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">{designer.studio}</p>

                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <span className="flex items-center text-amber-500 font-bold">
                      ★ {designer.rating}
                    </span>
                    <span className="text-stone-400">({designer.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {designer.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {designer.specialties.slice(0, 3).map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-stone-500 space-y-1 pt-1 border-t border-stone-100">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Experience:</span>
                      <span className="font-semibold text-stone-800">{designer.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Completed Homes:</span>
                      <span className="font-semibold text-stone-800">{designer.completedProjects} Projects</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Coverage:</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[140px]">{designer.locality}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => onBookConsultation && onBookConsultation(designer)}
                    className="w-full btn btn-primary text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles size={13} /> Book Consultation
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDesigner(designer)}
                    className="w-full text-center text-xs font-semibold text-stone-600 hover:text-emerald-700 py-1 transition-colors cursor-pointer"
                  >
                    View Full Profile &amp; Awards →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL RESPONSIVE DESIGNER PROFILE MODAL */}
      {selectedDesigner && (
        <div
          onClick={() => setSelectedDesigner(null)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="shrink-0 bg-stone-900 text-white p-5 flex items-start justify-between border-b border-stone-800">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedDesigner.avatar}
                  alt={selectedDesigner.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                />
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedDesigner.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedDesigner.name}</h3>
                  <p className="text-xs text-stone-300">{selectedDesigner.specialist} · {selectedDesigner.studio}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDesigner(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-stone-700 overscroll-contain">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-amber-500 font-bold text-sm">★ {selectedDesigner.rating}</span>
                  <p className="text-[11px] text-stone-400">{selectedDesigner.reviewsCount} verified reviews</p>
                </div>
                <div className="h-6 w-px bg-stone-200" />
                <div>
                  <span className="font-bold text-stone-900 text-sm">{selectedDesigner.experience}</span>
                  <p className="text-[11px] text-stone-400">Industry Experience</p>
                </div>
                <div className="h-6 w-px bg-stone-200" />
                <div>
                  <span className="font-bold text-stone-900 text-sm">{selectedDesigner.completedProjects}</span>
                  <p className="text-[11px] text-stone-400">Completed Projects</p>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
                <p className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">Design Philosophy:</p>
                <p className="leading-relaxed text-stone-600">{selectedDesigner.bio}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">Industry Honors &amp; Awards:</p>
                <div className="space-y-1.5">
                  {selectedDesigner.awards?.map((award, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2 text-stone-700 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <Award size={14} className="text-amber-600 shrink-0" />
                      <span>{award}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">Featured Turnkey Residences:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDesigner.portfolioHighlights?.map((proj, pIdx) => (
                    <span key={pIdx} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-medium border border-emerald-200">
                      ✓ {proj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="shrink-0 bg-stone-50 border-t border-stone-200 p-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDesigner(null)}
                className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = selectedDesigner;
                  setSelectedDesigner(null);
                  if (onBookConsultation) onBookConsultation(d);
                }}
                className="btn btn-primary text-xs px-5 py-2 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles size={14} /> Book Free 3D Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
