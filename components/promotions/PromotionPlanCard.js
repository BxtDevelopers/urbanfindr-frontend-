'use client';

import { Check, Sparkles, Zap, Flame, Award, ShieldCheck } from 'lucide-react';
import { money } from '@/lib/format';

export default function PromotionPlanCard({
  plan,
  selected = false,
  onSelect,
  isRecommended = false
}) {
  const isElite = plan.slug === 'elite-boost' || plan.priority >= 90;
  const isPremium = isRecommended || plan.slug === 'premium-boost' || (plan.priority >= 50 && plan.priority < 90);

  const Icon = isElite ? Award : isPremium ? Flame : Zap;

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl p-3.5 transition-all border flex flex-col justify-between ${
        selected
          ? 'bg-gradient-to-b from-[#ecf2e4]/50 via-white to-[#ecf2e4]/25 border-[#749546] shadow-sm ring-2 ring-[#749546]/20'
          : 'bg-white border-stone-200 hover:border-[#749546]/50 hover:shadow-2xs'
      }`}
    >
      {/* Recommended Tag */}
      {isPremium && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#749546] text-white text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1 z-10 whitespace-nowrap">
          <Sparkles size={10} className="stroke-[2.5]" /> Most Popular
        </div>
      )}

      <div>
        {/* Top Header: Icon + Name + Radio */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isElite
                  ? 'bg-[#163e35] text-[#d8edb3]'
                  : isPremium
                  ? 'bg-[#ecf2e4] text-[#163e35]'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              <Icon size={15} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-stone-900 text-sm leading-tight truncate">{plan.name}</h3>
              <span className="inline-block text-[10px] font-semibold text-stone-500">
                {plan.duration} Days Validity
              </span>
            </div>
          </div>

          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
              selected
                ? 'border-[#749546] bg-[#749546] text-white shadow-2xs'
                : 'border-stone-300 bg-white group-hover:border-[#749546]'
            }`}
          >
            {selected && <Check size={10} className="stroke-[3]" />}
          </div>
        </div>

        {/* Price & Summary */}
        <div className="mb-2.5 pb-2 border-b border-stone-100">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-stone-900 tracking-tight">{money(plan.price)}</span>
            <span className="text-[11px] font-medium text-stone-500">/ {plan.duration}d</span>
          </div>
          {plan.description && (
            <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{plan.description}</p>
          )}
        </div>

        {/* Priority Indicator Pill */}
        <div className="flex items-center justify-between gap-2 mb-2.5 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
          <div className="flex items-center gap-1 min-w-0">
            <ShieldCheck size={12} className="text-[#749546] shrink-0" />
            <span className="text-[10px] font-medium text-stone-600 truncate">Search Priority</span>
          </div>
          <span className="text-[11px] font-bold text-stone-900 shrink-0">
            {plan.priority}/100
          </span>
        </div>

        {/* Features List */}
        <ul className="space-y-1.5 mb-1.5">
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-700 leading-snug">
              <Check size={12} className="text-[#749546] mt-0.5 shrink-0 stroke-[2.5]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Indicator Bottom Bar */}
      <div
        className={`mt-2.5 pt-2 border-t text-[11px] flex items-center justify-between transition-colors ${
          selected
            ? 'border-[#749546]/30 font-bold text-[#163e35]'
            : 'border-stone-100 font-medium text-stone-400 group-hover:text-stone-700'
        }`}
      >
        <span>{selected ? 'Package Selected' : 'Tap to select'}</span>
        <div
          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
            selected ? 'bg-[#ecf2e4] text-[#163e35]' : 'text-stone-300 group-hover:text-stone-500'
          }`}
        >
          {selected ? <Check size={9} className="stroke-[3]" /> : '→'}
        </div>
      </div>
    </div>
  );
}
