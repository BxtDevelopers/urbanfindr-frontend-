'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { api, useApp } from './providers';
import { Field, Image, Submit } from './ui';
import {
  User as UserIcon,
  House,
  Briefcase,
  Building2,
  Wrench,
  KeyRound,
  Check,
  ShieldCheck,
  Users,
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  Handshake,
  Heart,
  Phone,
} from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';

const ROLE_OPTIONS = [
  {
    id: 'customer',
    apiValue: 'user',
    label: 'Customer',
    shortTagline: 'Buy, rent & explore',
    tagline: 'Buy, rent or hire home services',
    icon: UserIcon,
    description: 'Save favorite homes, schedule site visits, and request service estimates.',
  },
  {
    id: 'owner',
    apiValue: 'owner',
    label: 'Owner',
    shortTagline: 'List own home',
    tagline: 'List & rent/sell my own home',
    icon: House,
    description: 'Post residential or commercial properties directly with zero brokerage.',
  },
  {
    id: 'broker',
    apiValue: 'broker',
    label: 'Broker',
    shortTagline: 'Client listings',
    tagline: 'Manage client inventory & leads',
    icon: Handshake,
    description: 'Authorized agent managing listings on behalf of multiple property owners.',
  },
  {
    id: 'builder',
    apiValue: 'builder',
    label: 'Builder',
    shortTagline: 'Projects & towers',
    tagline: 'New projects & towers',
    icon: Building2,
    description: 'Real estate developer managing project launches, units, and floor plans.',
  },
  {
    id: 'channel_partner',
    apiValue: 'channel_partner',
    label: 'Channel Partner',
    shortTagline: 'RERA Agency',
    tagline: 'RERA Channel Partner & Sales Network',
    icon: Briefcase,
    description: 'Corporate real estate partner managing client inventory, sales teams & leads.',
  },
  {
    id: 'service_provider',
    apiValue: 'service_provider',
    label: 'Service Pro',
    shortTagline: 'Home services',
    tagline: 'Interiors, repairs & maintenance',
    icon: Wrench,
    description: 'Specialist offering interior design, painting, cleaning, and renovation.',
  },
];

export default function AuthPage({ register = false, adminLogin = false }) {
  const { setUser, toast } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const next = params.get('next');
  const isAdminLogin = adminLogin || next?.startsWith('/admin') || params.get('role') === 'admin';
  const initialRoleParam = params.get('role');
  const defaultRole =
    ROLE_OPTIONS.find((r) => r.id === initialRoleParam || r.apiValue === initialRoleParam)?.id ||
    'customer';
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const input = Object.fromEntries(formData);

      if (register) {
        const matched = ROLE_OPTIONS.find((r) => r.id === selectedRole);
        input.role = matched ? matched.apiValue : 'user';
        input.accountType = selectedRole;
      }

      const endpoint = `auth/${register ? 'register' : 'login'}`;
      const data = await api(endpoint, {
        method: 'POST',
        body: input,
      });

      setUser(data.user);
      toast(
        register
          ? 'Welcome to your next chapter.'
          : data.user.role === 'admin'
          ? 'Welcome back, Administrator.'
          : 'Welcome back.'
      );

      const defaultDest = data.user.role === 'admin' ? '/admin' : '/dashboard';
      const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : defaultDest;
      router.push(destination);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const providerServices = serviceCategories.filter((c) => c.slug !== 'properties');

  /* =========================================================================
     LOGIN PAGE VIEW
     ========================================================================= */
  if (!register) {
    return (
      <section className="min-h-[calc(100vh-86px)] w-full flex flex-col lg:flex-row bg-[#fafbf9]">
        {/* Left Showcase Side */}
        <div className="relative w-full lg:w-1/2 min-h-[520px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 lg:p-14 text-white overflow-hidden bg-stone-900">
          {/* Architectural Villa Hero Backdrop with Light, Clear Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/photos/hero-home.jpg"
              alt="Luxury modern architectural residence"
              className="w-full h-full object-cover object-center"
            />
            {/* Soft transparent gradient so the villa photo stays bright, clear, and vibrant */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />
          </div>

          {/* Center Headline & Subtitle */}
          <div className="relative z-10 my-auto max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              Your dream home is just a login away.
            </h1>
            <p className="text-stone-100 text-sm sm:text-base leading-relaxed mt-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              Verified listings, trusted partners and complete real estate solutions — all in one
              place.
            </p>
          </div>

          {/* Bottom 4 Circular Feature Badges */}
          <div className="relative z-10 pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-2 shadow-md">
                  <House size={18} />
                </div>
                <div className="font-semibold text-xs text-white leading-tight drop-shadow-sm">
                  Verified Properties
                </div>
                <div className="text-[11px] text-stone-200 leading-tight mt-0.5 drop-shadow-sm">
                  100% genuine listings
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-2 shadow-md">
                  <ShieldCheck size={18} />
                </div>
                <div className="font-semibold text-xs text-white leading-tight drop-shadow-sm">
                  Trusted Professionals
                </div>
                <div className="text-[11px] text-stone-200 leading-tight mt-0.5 drop-shadow-sm">
                  Brokers, builders & owners
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-2 shadow-md">
                  <Users size={18} />
                </div>
                <div className="font-semibold text-xs text-white leading-tight drop-shadow-sm">
                  Top Home Services
                </div>
                <div className="text-[11px] text-stone-200 leading-tight mt-0.5 drop-shadow-sm">
                  Interiors, repairs & more
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-2 shadow-md">
                  <MapPin size={18} />
                </div>
                <div className="font-semibold text-xs text-white leading-tight drop-shadow-sm">
                  Multiple Locations
                </div>
                <div className="text-[11px] text-stone-200 leading-tight mt-0.5 drop-shadow-sm">
                  Find properties near you
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="relative w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-white overflow-hidden">
          {/* Subtle Decorative Botanical Leaf in Bottom Right Corner */}
          <div
            className="absolute -bottom-8 -right-8 pointer-events-none opacity-20 text-[#163e35] select-none"
            aria-hidden="true"
          >
            <svg
              width="220"
              height="220"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M190 190C190 110 130 50 50 50C50 130 110 190 190 190Z"
                fill="currentColor"
              />
              <path
                d="M170 170C170 100 120 40 40 40C40 110 90 170 170 170Z"
                stroke="white"
                strokeWidth="2"
              />
              <path d="M50 50L190 190" stroke="white" strokeWidth="2" />
              <path d="M90 90L130 70" stroke="white" strokeWidth="1.5" />
              <path d="M120 120L160 100" stroke="white" strokeWidth="1.5" />
              <path d="M140 140L180 120" stroke="white" strokeWidth="1.5" />
              <path d="M110 110L90 150" stroke="white" strokeWidth="1.5" />
              <path d="M140 140L120 180" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Top-Right Quick Navigation */}
          <div className="flex justify-end items-center text-xs text-stone-600 mb-8 sm:mb-12">
            <span>Don't have an account?</span>
            <Link
              href={`/register${
                params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''
              }`}
              className="ml-1.5 font-bold text-[#163e35] hover:underline inline-flex items-center gap-1"
            >
              Sign Up <ArrowRight size={13} />
            </Link>
          </div>

          {/* Centered Form Wrapper */}
          <div className="max-w-md w-full mx-auto my-auto relative z-10">
            {/* Emerald Welcome Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eaf0df] text-[#163e35] mb-3">
              <UserCheck size={14} /> Welcome Back
            </div>

            <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
              Log in to your account
            </h2>
            <p className="text-stone-500 text-sm mt-1.5 mb-7">
              Continue your journey with UrbanFindr.
            </p>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs mb-5 font-medium whitespace-pre-line"
              >
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={submit}>
              {/* Email address field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    minLength={1}
                    maxLength={100}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#163e35] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  'Signing in...'
                ) : (
                  <>
                    Log In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div className="text-center mt-7 pt-4 border-t border-stone-100 text-xs text-stone-500">
              New to UrbanFindr?{' '}
              <Link
                href={`/register${
                  params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''
                }`}
                className="font-bold text-[#163e35] hover:underline inline-flex items-center gap-1"
              >
                Create an account <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Bottom spacing helper */}
          <div className="h-4" />
        </div>
      </section>
    );
  }

  /* =========================================================================
     REGISTRATION PAGE VIEW
     ========================================================================= */
  return (
    <section className="min-h-[calc(100vh-86px)] w-full py-4 sm:py-6 px-4 sm:px-6 bg-[#f8faf7] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Text Header at the top of the form */}
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-snug">
            Your next chapter <span className="text-[#163e35]">starts here</span>
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-relaxed">
            Discover verified properties, trusted professionals and complete real estate solutions
            — all in one place.
          </p>

          {/* 4 Feature Badges in a compact, sleek badge bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs text-[11px] font-semibold text-stone-700">
              <House size={13} className="text-[#163e35]" /> Verified Listings
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs text-[11px] font-semibold text-stone-700">
              <ShieldCheck size={13} className="text-[#163e35]" /> Trusted Professionals
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs text-[11px] font-semibold text-stone-700">
              <MapPin size={13} className="text-[#163e35]" /> Multiple Services
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs text-[11px] font-semibold text-stone-700">
              <Heart size={13} className="text-[#163e35]" /> Built for Your Needs
            </span>
          </div>
        </div>

        {/* Clean Form Card in the middle */}
        <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-stone-200/70">
          <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight leading-tight">
                Create your account
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Join UrbanFindr to find, list or service properties across India.
              </p>
            </div>
            <div className="text-xs text-stone-500">
              Already have an account?{' '}
              <Link
                href={`/login${
                  params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''
                }`}
                className="font-bold text-[#163e35] hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs mb-3 font-medium whitespace-pre-line"
            >
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={submit}>
            {/* Account Type Selection */}
            <div>
              <div className="text-xs font-bold text-stone-800 mb-1.5">Select your account type</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = selectedRole === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setSelectedRole(opt.id)}
                      className={`relative p-2 rounded-xl border text-center flex flex-col items-center justify-between min-h-[72px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#163e35] bg-[#163e35] text-white shadow-sm ring-1 ring-[#163e35]'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-[#163e35]/40 hover:bg-stone-50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-[#163e35] flex items-center justify-center shadow-xs">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}

                      <div
                        className={`p-1 rounded-md mb-0.5 ${
                          isSelected ? 'text-white' : 'text-[#163e35]'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="font-bold text-xs leading-tight">{opt.label}</div>
                      <div
                        className={`text-[9px] leading-tight mt-0.5 ${
                          isSelected ? 'text-[#d8edb3]' : 'text-stone-400'
                        }`}
                      >
                        {opt.shortTagline}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Inputs: Full Name & Phone Number */}
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={16}
                  />
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={16}
                  />
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    pattern="\\+?[0-9\\s-]{10,16}"
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2-Column Inputs: Email & Password */}
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={16}
                  />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={16}
                  />
                  <input
                    name="password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={10}
                    maxLength={100}
                    placeholder="Min 10 characters"
                    className="w-full pl-9 pr-9 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 focus:outline-none cursor-pointer"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role specific inputs */}
            {selectedRole === 'broker' && (
              <div className="panel bg-sky-50/60 border-sky-200/80 p-3 space-y-2.5 my-1.5 rounded-xl">
                <div className="flex items-center gap-2 text-sky-900 font-semibold text-xs tracking-wider uppercase">
                  <Handshake size={15} /> Broker Credentials
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Field label="Brokerage / Agency name">
                    <input name="company" placeholder="e.g. Apex Realty Advisory" maxLength={120} />
                  </Field>
                  <Field label="RERA Agent License ID">
                    <input name="reraId" placeholder="e.g. A51900012345" maxLength={60} />
                  </Field>
                </div>
              </div>
            )}

            {selectedRole === 'builder' && (
              <div className="panel bg-amber-50/60 border-amber-200/80 p-3 space-y-2.5 my-1.5 rounded-xl">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs tracking-wider uppercase">
                  <Building2 size={15} /> Developer Details
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Field label="Developer / Firm name">
                    <input
                      name="company"
                      required
                      placeholder="e.g. Horizon Urban Developers"
                      maxLength={120}
                    />
                  </Field>
                  <Field label="RERA Registration ID">
                    <input name="reraId" placeholder="e.g. PRM/KA/RERA/..." maxLength={60} />
                  </Field>
                </div>
              </div>
            )}

            {selectedRole === 'channel_partner' && (
              <div className="panel bg-emerald-50/60 border-emerald-200/80 p-3 space-y-2.5 my-1.5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs tracking-wider uppercase">
                  <Briefcase size={15} /> Channel Partner Credentials
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Field label="Agency / Firm name">
                    <input
                      name="company"
                      required
                      placeholder="e.g. Apex Realty Advisory Network"
                      maxLength={120}
                    />
                  </Field>
                  <Field label="Channel Partner RERA ID">
                    <input
                      name="reraId"
                      required
                      placeholder="e.g. KA/RERA/AGENT/2024/00842"
                      maxLength={60}
                    />
                  </Field>
                </div>
              </div>
            )}

            {selectedRole === 'service_provider' && (
              <div className="panel bg-purple-50/60 border-purple-200/80 p-3 space-y-2.5 my-1.5 rounded-xl">
                <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs tracking-wider uppercase">
                  <Wrench size={15} /> Service Specialization
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Field label="Service category">
                    <select name="serviceCategory" defaultValue="interior-designers">
                      {providerServices.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Professional title">
                    <input
                      name="specialist"
                      placeholder="e.g. Senior Interior Architect"
                      maxLength={80}
                    />
                  </Field>
                </div>
                <Field label="Years of experience">
                  <input name="experience" placeholder="e.g. 7+ years" maxLength={30} />
                </Field>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2.5 bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-2.5 sm:py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50"
            >
              {busy ? (
                'Creating account...'
              ) : (
                <>
                  Register <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Terms and Privacy policy */}
          <p className="text-center text-[11px] text-stone-500 mt-3 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/about" className="font-semibold text-[#163e35] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/about" className="font-semibold text-[#163e35] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
