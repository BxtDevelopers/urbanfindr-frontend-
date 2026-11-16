'use client';

import Link from 'next/link';
import { Sparkles, FolderKanban, FileCheck2, MessageSquareText } from 'lucide-react';

/**
 * Mobile-Only Projects Encyclopedia Showcase (MagicBricks "magicHomes" style)
 * Appears exclusively on mobile (< lg) directly after Featured Properties.
 * Color theme: UrbanFindr Forest Green (#163e35, #ecf2e4, #d8edb3).
 */
export default function MobileProjectsShowcase() {
  return (
    <section
      className="lg:hidden wrap pt-2 pb-6 px-4"
      aria-label="New Projects Encyclopedia"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#f2f8f4] via-[#f7fbf8] to-[#edf6f0] border border-[#d5ead9] p-5 pt-4 shadow-sm text-center">
        {/* Top "New Launch" Pill Badge with Subtle Sparkle */}
        <div className="flex justify-center mb-1.5">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[10.5px] font-extrabold uppercase tracking-wider border border-[#fde68a] shadow-2xs">
            <Sparkles size={11} className="text-[#d97706]" />
            <span>New Launch</span>
          </span>
        </div>

        {/* Title: Builder (dark green) + Projects (light green) according to website color theme */}
        <h3 className="text-[23px] font-black tracking-tight leading-tight">
          <span className="text-[#163e35]">Builder </span>
          <span className="text-[#749546]">Projects</span>
        </h3>

        {/* Subtitle / Eyebrow */}
        <p className="text-xs font-semibold text-stone-700 tracking-tight mt-0.5">
          Encyclopedia For All New Projects
        </p>

        {/* 3-Column Feature Grid with Subtle Vertical Dividers */}
        <div className="grid grid-cols-3 divide-x divide-[#cfe7d4] gap-1 my-4 pt-1">
          {/* Item 1: Directory */}
          <div className="px-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white border border-[#d2e7d7] shadow-2xs flex items-center justify-center text-[#0284c7] transition-transform active:scale-95">
              <FolderKanban size={22} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 leading-snug mt-2 line-clamp-2">
              Directory For All New Projects
            </span>
          </div>

          {/* Item 2: Latest RERA Reports */}
          <div className="px-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white border border-[#d2e7d7] shadow-2xs flex items-center justify-center text-[#16a34a] transition-transform active:scale-95">
              <FileCheck2 size={22} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 leading-snug mt-2 line-clamp-2">
              Latest RERA Reports
            </span>
          </div>

          {/* Item 3: Expert Reviews */}
          <div className="px-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white border border-[#d2e7d7] shadow-2xs flex items-center justify-center text-[#d97706] transition-transform active:scale-95">
              <MessageSquareText size={22} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 leading-snug mt-2 line-clamp-2">
              Expert Reviews &amp; Advice
            </span>
          </div>
        </div>

        {/* View All Projects Button (Website Theme Color #163e35) */}
        <Link
          href="/projects"
          className="w-full flex items-center justify-center py-3 px-5 rounded-full bg-[#163e35] hover:bg-[#1f4a3f] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer"
        >
          View All Projects
        </Link>
      </div>
    </section>
  );
}
