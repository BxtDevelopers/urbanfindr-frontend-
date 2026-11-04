'use client';

import { Star, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { interiorReviews } from '@/lib/interiorData';

export default function InteriorReviewsSection() {
  return (
    <section className="py-14 bg-white scroll-mt-24 sm:scroll-mt-28" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Star size={13} className="text-amber-500 fill-amber-500" /> FEATURE 15: VERIFIED CUSTOMER REVIEWS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Loved by Homeowners Across Prime Residences
          </h2>
          <p className="text-stone-600 text-sm mt-1.5">
            Read verified reviews from customers who experienced our 45-day move-in guarantee and factory finishes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {interiorReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-stone-50 rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">{rev.date}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {rev.photo && (
                  <div className="rounded-xl overflow-hidden aspect-video border border-stone-200 shadow-sm">
                    <img
                      src={rev.photo}
                      alt="Completed home"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1">
                    {rev.author}
                    {rev.verifiedHomeowner && (
                      <CheckCircle2 size={13} className="text-emerald-600" title="Verified Homeowner" />
                    )}
                  </h4>
                  <p className="text-[11px] text-stone-500">{rev.property} · {rev.city}</p>
                </div>
                <div className="text-right text-[11px]">
                  <span className="text-stone-400">Designer:</span>
                  <p className="font-semibold text-emerald-800">{rev.designer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

