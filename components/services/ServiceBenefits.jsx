'use client';

import { ShieldCheck, Receipt, Clock4, Award, Search, UserCheck, ThumbsUp } from 'lucide-react';

export default function ServiceBenefits({ category }) {
  const steps = [
    {
      num: '01',
      title: 'Submit Your Need',
      desc: 'Select your preferred service, date, and describe the problem in seconds.',
      icon: Search
    },
    {
      num: '02',
      title: 'Expert Matched',
      desc: 'We match you with top-rated, certified specialists in your local neighborhood.',
      icon: UserCheck
    },
    {
      num: '03',
      title: 'Hassle-Free Service',
      desc: 'Get prompt doorstep completion with transparent pricing and warranty.',
      icon: ThumbsUp
    }
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Verified Professionals',
      desc: 'Rigorous background screening, verified credentials, and proven track records.'
    },
    {
      icon: Receipt,
      title: 'Transparent Pricing',
      desc: 'Fair, standard estimates with no surprise add-ons or hidden fees.'
    },
    {
      icon: Clock4,
      title: 'Punctual Doorstep Service',
      desc: 'Professionals arrive on your preferred schedule, respecting your valuable time.'
    },
    {
      icon: Award,
      title: 'UrbanFindr Guarantee',
      desc: 'Dedicated customer support and 30-day service warranty on major repairs.'
    }
  ];

  return (
    <section className="py-14 bg-stone-50 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* How It Works */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-forest uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
            How UrbanFindr {category?.label || 'Services'} Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            From emergency repairs to planned renovations, hiring qualified professionals has never been simpler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-6 relative shadow-sm hover:border-forest/30 transition-all text-center sm:text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <span className="font-mono text-2xl font-black text-stone-200">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-bold text-base text-stone-900">{step.title}</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pillars / Trust Badges */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
              The UrbanFindr Quality Standard
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Your safety and satisfaction are our highest priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center p-3">
                  <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center mb-3 shadow-md">
                    <Icon size={22} />
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 mb-1">{pillar.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

