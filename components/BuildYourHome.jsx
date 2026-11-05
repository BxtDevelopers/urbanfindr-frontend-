'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  House,
  HardHat,
  ShieldCheck,
  Smartphone,
  Lock,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Phone,
  ArrowRight,
  DraftingCompass,
  FileCheck,
  Hammer,
  Award,
  ChevronRight,
  Building2,
  Calendar,
  Check,
  MessageSquare,
  Users,
  KeyRound,
  X
} from 'lucide-react';
import { api, useApp } from './providers';

export default function BuildYourHome() {
  const { user, toast } = useApp();
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [plotLocation, setPlotLocation] = useState('');
  const [propertyType, setPropertyType] = useState('residential');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!fullName.trim()) {
      toast('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      toast('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!plotLocation.trim()) {
      toast('Please enter the location of your plot.');
      return;
    }

    setSubmitting(true);
    try {
      await api('service-requests', {
        method: 'POST',
        body: {
          category: 'Home Construction',
          categorySlug: 'construction',
          serviceType: propertyType === 'commercial' ? 'Commercial Construction' : 'Residential Construction',
          name: fullName.trim(),
          phone: cleanPhone,
          city: plotLocation.trim(),
          locality: plotLocation.trim(),
          address: plotLocation.trim(),
          description: `Plot Construction Consultation for ${propertyType} property in ${plotLocation.trim()}. Special Offer Lead.`,
          contactPreference: 'call'
        }
      });
      setSubmitted(true);
      toast('Thank you! Our construction specialist will call you shortly.');
    } catch (err) {
      toast(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO SECTION (Exact Structure of Uploaded Image in UrbanFindr Brand Palette) ── */}
      <section className="relative overflow-hidden bg-[#fffdfa] border-b border-stone-200">
        {/* Left background: Construction image shifted right to come into full view */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-[48%] bg-contain lg:bg-cover bg-[position:15%_center] bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('/images/construction.png')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#fffdfa] hidden lg:block" />
          <div className="absolute inset-0 bg-[#fffdfa]/85 lg:hidden" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* 1. LEFT COLUMN: Spanning visual room for the construction building on desktop */}
            <div className="hidden lg:block lg:col-span-3 h-full" />

            {/* 2. CENTER COLUMN: Exact Text Structure Arranged Same as Uploaded Image */}
            <div className="lg:col-span-5 space-y-4 text-center">
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#163e35] tracking-tight leading-tight">
                Construct Your Property With Us
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl font-bold text-stone-900">
                Residential &amp; Commercial Construction
              </p>

              {/* Centered Gradient Accent Line */}
              <div className="w-48 sm:w-64 h-[3px] bg-gradient-to-r from-transparent via-[#749546] to-transparent rounded-full mx-auto my-3" />

              {/* 3 Feature Badges in Single Horizontal Row */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 py-2">
                {/* Badge 1: LIVE App Tracking */}
                <div className="flex items-center gap-2">
                  <Smartphone size={22} className="text-[#749546] shrink-0" strokeWidth={2} />
                  <div className="text-left">
                    <div className="text-xs font-black text-stone-900 leading-tight">LIVE</div>
                    <div className="text-[11px] text-stone-600 leading-tight whitespace-nowrap">App Tracking</div>
                  </div>
                </div>

                <div className="h-7 w-px bg-stone-300" />

                {/* Badge 2: QASCON 350+ Quality Checks */}
                <div className="flex items-center gap-2">
                  <FileCheck size={22} className="text-[#749546] shrink-0" strokeWidth={2} />
                  <div className="text-left">
                    <div className="text-xs font-black text-stone-900 leading-tight">QASCON® 350+</div>
                    <div className="text-[11px] text-stone-600 leading-tight whitespace-nowrap">Quality Checks</div>
                  </div>
                </div>

                <div className="h-7 w-px bg-stone-300" />

                {/* Badge 3: ESCROW Protected Payments */}
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} className="text-[#749546] shrink-0" strokeWidth={2} />
                  <div className="text-left">
                    <div className="text-xs font-black text-stone-900 leading-tight">ESCROW</div>
                    <div className="text-[11px] text-stone-600 leading-tight whitespace-nowrap">Protected Payments</div>
                  </div>
                </div>
              </div>

              {/* Special Offer Box (Matching Uploaded Image) */}
              <div className="relative rounded-2xl border-2 border-[#749546] bg-white p-5 sm:p-6 pt-7 text-center shadow-sm max-w-sm sm:max-w-md mx-auto">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#749546] text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-xs whitespace-nowrap">
                  NOVEMBER SPECIAL OFFER
                </div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-stone-800">
                  SAVE UP TO
                </div>
                <div className="text-3xl sm:text-5xl font-black text-[#163e35] my-1 tracking-tight">
                  ₹<span className="text-[#749546]">10 LAKHS*</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-stone-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
                  <span>Offer Valid Till 5th November Only</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
                </div>
              </div>
            </div>

            {/* 3. RIGHT COLUMN: Connect with Trusted Home Builders Lead Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-6 sm:p-7 relative max-w-md mx-auto">
                <div className="mb-5 space-y-1 text-center">
                  <h2 className="text-xl sm:text-2xl font-black text-[#163e35] tracking-tight">
                    Connect with Trusted Home Builders
                  </h2>
                  <p className="text-xs text-stone-500">
                    Trusted Builders for End-to-End Home Construction
                  </p>
                </div>

                {submitted ? (
                  <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#ecf2e4] text-[#163e35] mx-auto flex items-center justify-center shadow-xs">
                      <CheckCircle2 size={36} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-xl text-stone-900">Consultation Scheduled!</h3>
                      <p className="text-xs text-stone-500 max-w-xs mx-auto">
                        Our senior construction consultant will contact you at <span className="font-bold text-stone-800">{phone}</span> to review your plot specs and design plans.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-[#f7f8f3] text-[#163e35] font-bold text-xs rounded-lg hover:bg-[#ecf2e4] transition-all"
                    >
                      Submit Another Plot
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name*"
                        className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#749546] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Mobile Number with Indian Flag and +91 Prefix */}
                    <div className="flex rounded-lg border border-stone-200 bg-[#f8fafc] focus-within:border-[#749546] focus-within:bg-white overflow-hidden transition-all">
                      <div className="px-3 py-3 text-xs font-bold text-stone-700 bg-stone-100/70 border-r border-stone-200 flex items-center gap-1.5 shrink-0 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                        <span className="text-[9px] text-stone-400">▼</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Mobile Number*"
                        className="w-full px-3.5 py-3 text-sm bg-transparent focus:outline-none text-stone-900 placeholder-stone-400"
                      />
                    </div>

                    {/* Location of Plot */}
                    <div>
                      <input
                        type="text"
                        required
                        value={plotLocation}
                        onChange={(e) => setPlotLocation(e.target.value)}
                        placeholder="Location of your plot*"
                        className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#749546] focus:bg-white transition-all"
                      />
                    </div>

                    {/* CTA Button in Brand Dark Green */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#163e35] hover:bg-[#23584c] text-[#d8edb3] hover:text-white text-base font-black rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Connecting Builders…</span>
                        </>
                      ) : (
                        <span>Get Started For Free</span>
                      )}
                    </button>

                    {/* Disclaimer */}
                    <p className="text-[11px] text-stone-400 text-center leading-relaxed pt-1">
                      *By submitting, you agree to our <Link href="/privacy" className="text-stone-500 underline">Privacy Policy</Link>, allowing us to use your information as outlined
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS SECTION (Cities excluded, 300+ Homes, compact padding) ── */}
      <section className="py-6 sm:py-8 bg-white border-b border-[#e6e8e1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            {/* Stat 1: 300+ Homes Handed Over */}
            <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2e4] text-[#163e35] border border-[#d8edb3] flex items-center justify-center mb-2 shadow-xs">
                <House size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#163e35] tracking-tight">
                300+
              </div>
              <div className="text-sm font-bold text-stone-800 mt-0.5">
                Homes
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Built and handed over
              </p>
            </div>

            {/* Stat 2: 8 Months Execution */}
            <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2e4] text-[#163e35] border border-[#d8edb3] flex items-center justify-center mb-2 shadow-xs">
                <Clock size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#163e35] tracking-tight">
                8
              </div>
              <div className="text-sm font-bold text-stone-800 mt-0.5">
                Months
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Express execution
              </p>
            </div>

            {/* Stat 3: 14,247 Design Plans */}
            <div className="flex flex-col items-center text-center px-4 pt-3 md:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2e4] text-[#163e35] border border-[#d8edb3] flex items-center justify-center mb-2 shadow-xs">
                <DraftingCompass size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#163e35] tracking-tight">
                14,247
              </div>
              <div className="text-sm font-bold text-stone-800 mt-0.5">
                Design Plans
              </div>
              <p className="text-xs text-[#749546] font-medium">
                Ready-to-build options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR CONSTRUCTION PROCESS: PLAN. BUILD. TRACK. MOVE IN. (From uploaded image) ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Our Construction Process:
            </h2>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight mt-1">
              Plan. Build. Track. Move In.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Connect with Us */}
            <div className="bg-[#f4f6f8] rounded-2xl p-6 sm:p-7 space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 text-stone-800 flex items-center justify-start">
                <MessageSquare size={26} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b]">Connect with Us</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Share your basic details through a quick form. Our team contacts you within 20 minutes for a free technical consultation.
              </p>
            </div>

            {/* Card 2: Define Your Requirements */}
            <div className="bg-[#f4f6f8] rounded-2xl p-6 sm:p-7 space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 text-stone-800 flex items-center justify-start">
                <Users size={26} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b]">Define Your Requirements</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Discuss your plot details, budget, and timeline with our experts. We craft a clear project plan tailored to your goals.
              </p>
            </div>

            {/* Card 3: Approve Designs */}
            <div className="bg-[#f4f6f8] rounded-2xl p-6 sm:p-7 space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 text-stone-800 flex items-center justify-start">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1e293b]">Approve Designs</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Review floor plans, drawings, and 3D views. Work closely with our architects until every detail is finalized.
              </p>
            </div>

            {/* Card 4: Live Progress */}
            <div className="bg-[#f4f6f8] rounded-2xl p-6 sm:p-7 space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 text-stone-800 flex items-center justify-start">
                <Building2 size={26} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b]">Live Progress</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Track construction in real time via our app with daily photos, quality reports, and payment updates.
              </p>
            </div>

            {/* Card 5: Move In */}
            <div className="bg-[#f4f6f8] rounded-2xl p-6 sm:p-7 space-y-4 transition-transform hover:-translate-y-1 duration-200">
              <div className="w-10 h-10 text-stone-800 flex items-center justify-start">
                <KeyRound size={26} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b]">Move In</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Take possession of your fully completed home. Move in with confidence, backed by a 10year warranty.
              </p>
            </div>

            {/* Card 6: Talk to our Construction Advisor */}
            <div className="bg-[#f4f6f8] rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 overflow-hidden transition-transform hover:-translate-y-1 duration-200">
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-xs border border-stone-200 bg-stone-100">
                <img
                  src="/images/advisor-meeting.jpg"
                  alt="Construction Advisor"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-[#1e293b] leading-snug">
                  Talk to our Construction Advisor
                </h3>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 sm:px-5 py-2.5 bg-[#163e35] hover:bg-[#23584c] text-[#d8edb3] hover:text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <span>Talk to an Expert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US? COMPARISON TABLE SECTION (Matching Uploaded Image with UrbanFindr Branding) ── */}
      <section className="py-14 sm:py-20 bg-[#fafbfa] border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
            Why Us?
          </h2>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-900 bg-stone-50/60">
                    <th className="py-4 px-6 font-bold text-sm sm:text-base w-1/2">
                      Parameter
                    </th>
                    <th className="py-4 px-6 font-bold text-sm sm:text-base text-center w-1/4">
                      <span className="text-[#163e35]">urban<span className="text-[#749546]">findr</span></span>
                    </th>
                    <th className="py-4 px-6 font-bold text-sm sm:text-base text-center text-stone-500 w-1/4">
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800 text-xs sm:text-sm">
                  {[
                    'App-Based Project Tracking',
                    'Escrow Money Safety',
                    '14,000+ Design Options',
                    '470+ Quality Checks',
                    'Cost Overrun Protection',
                    'Experience Centres'
                  ].map((param, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-stone-800">
                        {param}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xs">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-2xs">
                          <X size={14} strokeWidth={3} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-3 bg-[#163e35] hover:bg-[#23584c] text-[#d8edb3] hover:text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Talk To Our Expert</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── TALK TO OUR CONSTRUCTION ADVISOR SECTION (Exact Match of Uploaded Image) ── */}
      <section className="py-16 sm:py-24 bg-white border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subhead, Bullets */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Talk to our Construction Advisor
              </h2>
              <p className="text-base sm:text-lg text-stone-600">
                Submit the form and an advisor will contact you within 20 minutes.
              </p>

              <div className="pt-4 space-y-3">
                <h4 className="text-base font-bold text-stone-900">
                  In this consultation, we&apos;ll cover:
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-base text-stone-700">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-2 shrink-0" />
                    <span>Project scope, budget, and timelines.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-2 shrink-0" />
                    <span>Site feasibility and approvals.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-2 shrink-0" />
                    <span>Right build for home or business.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-2 shrink-0" />
                    <span>Execute with cost control and quality.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-2 shrink-0" />
                    <span>Next steps and expected timelines.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-2 shrink-0" />
                    <span>Plan your project with clarity and confidence.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Lead Form Card */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="bg-white rounded-2xl shadow-xl border border-stone-200/90 p-6 sm:p-8 max-w-md w-full relative">
                <div className="mb-5 space-y-1 text-center">
                  <h3 className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                    Connect with Trusted Home Builders
                  </h3>
                  <p className="text-xs text-stone-500">
                    Trusted Builders for End-to-End Home Construction
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name*"
                      className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#749546] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="flex rounded-lg border border-stone-200 bg-[#f8fafc] focus-within:border-[#749546] focus-within:bg-white overflow-hidden transition-all">
                    <div className="px-3 py-3 text-xs font-bold text-stone-700 bg-stone-100/70 border-r border-stone-200 flex items-center gap-1.5 shrink-0 select-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                      <span className="text-[9px] text-stone-400">▼</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Mobile Number*"
                      className="w-full px-3.5 py-3 text-sm bg-transparent focus:outline-none text-stone-900 placeholder-stone-400"
                    />
                  </div>

                  {/* Location of Plot */}
                  <div>
                    <input
                      type="text"
                      required
                      value={plotLocation}
                      onChange={(e) => setPlotLocation(e.target.value)}
                      placeholder="Location of your plot*"
                      className="w-full px-4 py-3 text-sm bg-[#f8fafc] border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#749546] focus:bg-white transition-all"
                    />
                  </div>

                  {/* CTA Button: Start Your Construction in Brand Dark Green */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#163e35] hover:bg-[#23584c] text-[#d8edb3] hover:text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting Builders…</span>
                      </>
                    ) : (
                      <span>Start Your Construction</span>
                    )}
                  </button>

                  {/* Disclaimer */}
                  <p className="text-[11px] text-stone-400 text-center leading-relaxed pt-1">
                    *By submitting, you agree to our <Link href="/privacy" className="text-stone-500 underline">Privacy Policy</Link>, allowing us to use your information as outlined
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
