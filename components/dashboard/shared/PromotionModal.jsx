'use client';

import { useState } from 'react';
import { useApp, api } from '../../providers';
import { X, Sparkles, Check, ShieldCheck, Flame, Star, Award } from 'lucide-react';
import { money } from '@/lib/format';

export default function PromotionModal({
  isOpen,
  onClose,
  target,
  targetType = 'property',
  onPromoted
}) {
  const { toast } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('Featured Spotlight');
  const [busy, setBusy] = useState(false);

  if (!isOpen || !target) return null;

  const plans = [
    {
      id: 'Standard Boost',
      title: 'Standard Boost',
      price: 799,
      duration: '15 Days',
      badge: 'Basic',
      icon: Star,
      features: ['2x Priority in search results', 'High-visibility badge', 'Email digest spotlight']
    },
    {
      id: 'Featured Spotlight',
      title: 'Featured Spotlight',
      price: 1499,
      duration: '30 Days',
      badge: 'Most Popular',
      icon: Flame,
      features: [
        '5x Priority on homepage & search',
        'Gold Verified listing badge',
        'Direct WhatsApp inquiry priority',
        'Weekly performance analytics'
      ]
    },
    {
      id: 'Premium Showcase',
      title: 'Premium Showcase',
      price: 2499,
      duration: '60 Days',
      badge: 'Best Value',
      icon: Award,
      features: [
        'Top banner carousel placement',
        'Dedicated RERA advisor assignment',
        'Social media campaign shoutout',
        'Maximum buyer/client visibility'
      ]
    }
  ];

  async function handlePromote() {
    setBusy(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlan);
      const res = await api('promotions', {
        method: 'POST',
        body: {
          targetId: target._id || target.id,
          targetType,
          targetTitle: target.title || target.name || 'Listing',
          plan: plan.id,
          budget: plan.price,
          days: plan.id === 'Standard Boost' ? 15 : plan.id === 'Featured Spotlight' ? 30 : 60
        }
      });
      toast(res.message || 'Promotion activated successfully!');
      if (onPromoted) onPromoted(res.item);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to activate promotion.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Promote Listing</h2>
              <p className="text-xs text-stone-500 truncate max-w-sm">
                {target.title || target.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600">
            Select a promotional plan to increase inquiries, boost views, and reach prospective buyers or tenants faster:
          </p>

          <div className="grid gap-3">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#163e35] bg-[#ecf2e4]/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#163e35] text-[#d8edb3]' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{p.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {p.badge}
                          </span>
                        </div>
                        <span className="text-xs text-stone-500">{p.duration} duration</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-stone-900">
                        {money(p.price)}
                      </div>
                    </div>
                  </div>

                  <ul className="mt-3 pt-3 border-t border-stone-100 grid sm:grid-cols-2 gap-1.5 text-xs text-stone-600">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-700 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePromote}
              disabled={busy}
              className="px-5 py-2.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-sm flex items-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Activating…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Activate Promotion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

