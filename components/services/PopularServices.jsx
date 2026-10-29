'use client';

import { CheckCircle2, ArrowRight, Tag, Star } from 'lucide-react';

export default function PopularServices({ category, onSelectService }) {
  const items = category?.popularServices || [];
  if (items.length === 0) return null;

  const handleBook = (serviceName) => {
    // Find closest matching service option if exact match isn't in options
    if (onSelectService) {
      onSelectService(serviceName);
    }
    // Smooth scroll to hero form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-forest text-xs font-bold uppercase tracking-wider mb-1">
              <Tag size={13} />
              <span>Transparent Rates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Popular {category?.label || 'Services'} & Packages
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Choose from our most requested {category?.label?.toLowerCase() || 'specialty'} offerings or request a personalized quote.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((svc, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between hover:border-forest/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {svc.price || 'Fair Pricing'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-stone-900 group-hover:text-forest transition-colors leading-snug">
                  {svc.name}
                </h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {svc.desc}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">Standard Warranty</span>
                <button
                  type="button"
                  onClick={() => handleBook(svc.name)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-[#114032] group-hover:translate-x-0.5 transition-all"
                >
                  <span>Book Service</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

