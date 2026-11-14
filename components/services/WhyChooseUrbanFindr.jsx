'use client';

import { ShieldCheck, Receipt, Clock, Award, Star, CheckCircle2, Headphones, Sparkles } from 'lucide-react';

export default function WhyChooseUrbanFindr({ category }) {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Verified Professionals',
      desc: 'Every specialist is background-checked, licensed, and vetted for quality craftsmanship and reliability.',
      badge: 'Background Checked'
    },
    {
      icon: Receipt,
      title: 'Transparent Upfront Rates',
      desc: 'Clear, standardized pricing with upfront estimates and no unexpected surcharges.',
      badge: 'Transparent Rates'
    },
    {
      icon: Clock,
      title: 'Punctual Doorstep Delivery',
      desc: 'Professionals arrive on your chosen date and preferred time slot, respecting your valuable schedule.',
      badge: 'On-Time Arrival'
    },
    {
      icon: Award,
      title: 'UrbanFindr 30-Day Guarantee',
      desc: 'Complete peace of mind with a 30-day rework warranty on repairs and dedicated customer dispute resolution.',
      badge: '30-Day Warranty'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-forest" />
            <span>Why Choose UrbanFindr</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2922] tracking-tight">
            Trusted {category?.label || 'Services'} Backed by Real Guarantees
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            From emergency repairs to planned installations, UrbanFindr connects you directly with top-rated, certified local professionals.
          </p>
        </div>

        {/* 4 Trust Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-stone-50/70 hover:bg-white rounded-2xl border border-stone-200/90 hover:border-forest/40 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 group-hover:bg-forest text-forest group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-forest bg-forest/5 px-2 py-0.5 rounded-full border border-forest/15">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-forest transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>UrbanFindr Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust & Confidence Metric Strip */}
        <div className="mt-8 bg-gradient-to-r from-forest/5 via-forest/10 to-forest/5 rounded-2xl border border-forest/15 p-4 sm:p-5 flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400" />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-stone-900">4.9 / 5 Rating</span>
            <span className="text-xs text-stone-500">(15,000+ Reviews)</span>
          </div>

          <div className="h-4 w-px bg-stone-300 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-800">
            <Sparkles size={16} className="text-forest" />
            <span className="font-semibold">Direct Professional Connect</span>
          </div>

          <div className="h-4 w-px bg-stone-300 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-800">
            <Headphones size={16} className="text-forest" />
            <span className="font-semibold">7 Days Customer Support</span>
          </div>
        </div>

      </div>
    </section>
  );
}
