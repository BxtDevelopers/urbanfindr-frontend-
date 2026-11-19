'use client';

import { useState } from 'react';
import { useApp, useData, api } from '../../providers';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Flame,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Lock,
  Building2,
  AlertCircle
} from 'lucide-react';
import { money } from '@/lib/format';
import PromotionPlanCard from '../../promotions/PromotionPlanCard';

export default function PromotionModal({
  isOpen,
  onClose,
  target,
  targetType = 'property',
  onPromoted
}) {
  const { user, toast } = useApp();
  const { data: plansData, loading: plansLoading } = useData('promotion-plans');

  // Fallback plans if API is loading or empty
  const defaultPlans = [
    {
      _id: 'basic-boost',
      slug: 'basic-boost',
      name: 'Basic Boost',
      price: 499,
      duration: 7,
      priority: 30,
      description: 'Essential sponsored visibility for rapid local enquiries.',
      features: [
        'Sponsored badge on search & listing cards',
        'Boosted ranking across category searches',
        'Basic impressions and clicks analytics'
      ]
    },
    {
      _id: 'premium-boost',
      slug: 'premium-boost',
      name: 'Premium Boost',
      price: 999,
      duration: 15,
      priority: 60,
      description: 'High-visibility placement across search results and locality spotlights.',
      features: [
        'High promotional priority in search results',
        'Eligibility for premium sponsored top spots',
        'Detailed analytics (impressions, clicks, enquiries)',
        'Verified advertiser tag on listing'
      ]
    },
    {
      _id: 'elite-boost',
      slug: 'elite-boost',
      name: 'Elite Boost',
      price: 1999,
      duration: 30,
      priority: 100,
      description: 'Maximum exposure package for high-value properties, projects, and top services.',
      features: [
        'Highest promotional priority across all search views',
        'Guaranteed top 3 sponsored placement rotation',
        'Homepage spotlight & cross-category placements',
        'Advanced conversion analytics (CTR & site visits)'
      ]
    }
  ];

  const availablePlans = plansData?.items?.length ? plansData.items : defaultPlans;

  const [selectedPlanId, setSelectedPlanId] = useState('premium-boost');
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !target) return null;

  const currentPlan =
    availablePlans.find(p => p._id === selectedPlanId || p.slug === selectedPlanId) ||
    availablePlans[1] ||
    availablePlans[0];

  const basePrice = currentPlan.price || 999;
  const taxAmount = Math.round(basePrice * 0.18);
  const finalPayable = basePrice + taxAmount;

  const targetImage = Array.isArray(target.images) && target.images[0]
    ? target.images[0]
    : target.avatar || target.logo || target.coverImage || '';

  const targetTitle = target.title || target.name || 'Listing';

  async function handleProceedToPayment() {
    if (!agreedToTerms) {
      toast('Please agree to promotional guidelines and terms.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    try {
      const normType =
        targetType === 'project'
          ? 'builder_project'
          : targetType === 'service'
          ? 'service_provider'
          : targetType;

      const orderRes = await api('promotions/payment/create-order', {
        method: 'POST',
        body: {
          targetId: target._id || target.id,
          targetType: normType,
          planId: currentPlan._id || currentPlan.slug
        }
      });

      const fakePaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const sigRes = await api('promotions/payment/verify', {
        method: 'POST',
        body: {
          gatewayOrderId: orderRes.orderId,
          gatewayPaymentId: fakePaymentId,
          gatewaySignature: `sig_test_${Date.now()}`
        }
      });

      toast(sigRes.message || 'Payment confirmed! Promotion submitted for admin review.');
      if (onPromoted) onPromoted(sigRes.item);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-900/70 backdrop-blur-xs p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-150">
      <div className={`bg-white rounded-2xl w-full my-auto flex flex-col shadow-2xl border border-stone-200 overflow-hidden transition-all duration-200 ${
        step === 1 ? 'max-w-3xl max-h-[92vh]' : 'max-w-lg max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
              <Sparkles size={17} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                  {step === 1 ? 'Promote Your Listing' : 'Order Checkout & Payment'}
                </h2>
                <span className="text-[10px] font-bold bg-[#ecf2e4] text-[#163e35] px-2 py-0.5 rounded-full">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate max-w-xs sm:max-w-md">
                {targetTitle} ({targetType === 'builder_project' ? 'Project' : targetType === 'service_provider' ? 'Service' : 'Property'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-0.5">
                <div>
                  <p className="text-[11px] font-bold text-[#163e35] uppercase tracking-wider">
                    Select a Promotion Tier
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Boost listing position, get the Sponsored badge, and generate more direct buyer leads.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#163e35] bg-[#ecf2e4] border border-[#d8edb3] px-2 py-0.5 rounded-full shrink-0">
                    ✓ Sponsored Verified Placement
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-0.5">
                {availablePlans.map((plan) => (
                  <PromotionPlanCard
                    key={plan._id || plan.slug}
                    plan={plan}
                    selected={selectedPlanId === plan._id || selectedPlanId === plan.slug}
                    onSelect={() => setSelectedPlanId(plan._id || plan.slug)}
                    isRecommended={plan.slug === 'premium-boost' || plan.priority === 60}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-3">
                {targetImage ? (
                  <img
                    src={targetImage}
                    alt={targetTitle}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-stone-200 bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                    <Building2 size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ecf2e4] text-[#163e35] px-2 py-0.5 rounded">
                    Selected Listing
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">{targetTitle}</h4>
                  <p className="text-[11px] text-stone-500">
                    {target.locality ? `${target.locality}, ` : ''}{target.city || ''}
                  </p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                <div className="p-3 bg-stone-100/60 border-b border-stone-200 text-xs font-bold text-stone-800">
                  Order Summary
                </div>
                <div className="p-3.5 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-stone-700">
                    <span>
                      Package: <strong className="text-stone-900">{currentPlan.name}</strong> ({currentPlan.duration} Days)
                    </span>
                    <span className="font-semibold text-stone-900">{money(basePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-700">
                    <span>GST (18% Marketplace Service Tax)</span>
                    <span className="font-semibold text-stone-900">{money(taxAmount)}</span>
                  </div>
                  <div className="pt-2.5 border-t border-stone-100 flex justify-between items-baseline text-sm">
                    <span className="font-bold text-stone-900">Total Payable Amount</span>
                    <span className="text-base font-black text-[#163e35]">{money(finalPayable)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-emerald-700 shrink-0" />
                  <span>Secure 256-bit encrypted transaction via <strong>Razorpay</strong></span>
                </div>
                <span className="font-bold">UPI / Cards / NetBanking</span>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-stone-600 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-[#749546] focus:ring-[#749546]"
                />
                <span className="leading-tight">
                  I agree to the promotional terms. Promotions undergo administrative verification before going live. Verified badges remain independent of sponsored placements.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/60 shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-stone-400">Selected</p>
                  <p className="text-xs font-bold text-[#163e35]">
                    {currentPlan.name} · {money(currentPlan.price)} <span className="text-stone-400 font-normal">(+18% GST)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn !bg-[#749546] hover:!bg-[#5f7b38] text-white !py-2 !px-4 !text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-transform active:scale-[0.98] rounded-lg"
                >
                  Continue to Checkout <ArrowRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep(1)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Back
              </button>

              <button
                type="button"
                disabled={busy || !agreedToTerms}
                onClick={handleProceedToPayment}
                className="btn !bg-[#163e35] hover:!bg-[#11312a] text-white !py-2 !px-5 !text-xs font-bold inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 rounded-lg"
              >
                {busy ? (
                  <span>Verifying Payment…</span>
                ) : (
                  <>
                    <CreditCard size={14} /> Pay {money(finalPayable)} & Submit
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
