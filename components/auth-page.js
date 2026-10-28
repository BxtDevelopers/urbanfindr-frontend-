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
     REGISTRATION PAGE VIEW (Matching Reference Design)
     ========================================================================= */
  return (
    <section className="min-h-[calc(100vh-86px)] w-full flex flex-col lg:flex-row bg-[#f8faf7]">
      {/* Left Showcase Side */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white border-r border-stone-200/70">
        <div>
          {/* Brand Logo & Sub-tagline */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-xl bg-[#163e35] text-[#d8edb3] flex items-center justify-center shadow-md group-hover:bg-[#1f5247] transition-colors">
              <House size={22} />
            </span>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#163e35] leading-none">
                urban<span className="text-[#749546]">findr</span>
                <span className="text-[#749546]">.</span>
              </span>
              <p className="text-[11px] text-stone-500 font-medium leading-none mt-1">
                Find. Connect. Build Your Life.
              </p>
            </div>
          </Link>

          {/* Headline & Subtitle */}
          <div className="my-6 sm:my-8">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-stone-900 leading-[1.15] tracking-tight">
              Your next chapter <br />
              <span className="text-[#163e35]">starts here</span>
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mt-3.5 max-w-lg">
              Discover verified properties, trusted professionals and complete real estate solutions
              — all in one place.
            </p>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 py-4 mb-6 border-y border-stone-200/80">
            <div className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-[#163e35]/10 text-[#163e35] flex items-center justify-center mb-1.5 shadow-sm">
                <House size={16} />
              </div>
              <div className="text-[11px] font-semibold text-stone-800 leading-tight">
                Verified
                <br />
                Listings
              </div>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-[#163e35]/10 text-[#163e35] flex items-center justify-center mb-1.5 shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <div className="text-[11px] font-semibold text-stone-800 leading-tight">
                Trusted
                <br />
                Professionals
              </div>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-[#163e35]/10 text-[#163e35] flex items-center justify-center mb-1.5 shadow-sm">
                <MapPin size={16} />
              </div>
              <div className="text-[11px] font-semibold text-stone-800 leading-tight">
                Multiple
                <br />
                Services
              </div>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-[#163e35]/10 text-[#163e35] flex items-center justify-center mb-1.5 shadow-sm">
                <Heart size={16} />
              </div>
              <div className="text-[11px] font-semibold text-stone-800 leading-tight">
                Built for
                <br />
                Your Needs
              </div>
            </div>
          </div>
        </div>

        {/* Villa Photo with "More than just properties" badge */}
        <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[16/10] sm:aspect-[16/11] w-full mt-2">
          <img
            src="/photos/hero-home.jpg"
            alt="Contemporary luxury villa residence"
            className="w-full h-full object-cover"
          />
          {/* Curved dark green badge on bottom left corner */}
          <div className="absolute -bottom-1 -left-1 bg-[#163e35] text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-tr-[45px] shadow-lg flex items-center">
            <span className="font-serif italic text-sm sm:text-base tracking-wide text-[#d8edb3]">
              More than just properties
            </span>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-[#f8faf7]">
        {/* Top-Right Quick Link */}
        <div className="flex justify-end items-center text-xs text-stone-600 mb-4 sm:mb-6">
          <span>Already have an account?</span>
          <Link
            href={`/login${
              params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''
            }`}
            className="ml-1.5 font-bold text-[#163e35] hover:underline inline-flex items-center gap-1"
          >
            Login <ArrowRight size={13} />
          </Link>
        </div>

        {/* Clean Form Card */}
        <div className="max-w-xl w-full mx-auto my-auto bg-white rounded-2xl p-6 sm:p-9 shadow-lg border border-stone-200/70">
          {/* Top Green Accent Pill */}
          <div className="w-8 h-1 bg-[#163e35] rounded-full mb-3" />

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 mb-6">
            Join UrbanFindr to find, list or service properties across India.
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
            {/* Account Type Selection */}
            <div>
              <div className="text-xs font-bold text-stone-800 mb-2.5">Select your account type</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = selectedRole === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setSelectedRole(opt.id)}
                      className={`relative p-2.5 rounded-xl border text-center flex flex-col items-center justify-between min-h-[92px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#163e35] bg-[#163e35] text-white shadow-sm ring-1 ring-[#163e35]'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-[#163e35]/40 hover:bg-stone-50'
                      }`}
                    >
                      {/* Active Checkmark Pill in top-right */}
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-[#163e35] flex items-center justify-center shadow-xs">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}

                      <div
                        className={`p-1.5 rounded-lg mb-1 ${
                          isSelected ? 'text-white' : 'text-[#163e35]'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="font-bold text-xs leading-tight">{opt.label}</div>
                      <div
                        className={`text-[10px] leading-tight mt-0.5 ${
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
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={17}
                  />
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    size={17}
                  />
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    pattern="\+?[0-9\s-]{10,16}"
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Full-width Email Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  size={17}
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                />
              </div>
            </div>

            {/* Full-width Password Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  size={17}
                />
                <input
                  name="password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={10}
                  maxLength={100}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:border-[#163e35] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 focus:outline-none cursor-pointer"
                  aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Use at least 10 characters with a mix of letters, numbers and symbols.
              </p>
            </div>

            {/* Role specific inputs */}
            {selectedRole === 'broker' && (
              <div className="panel bg-sky-50/60 border-sky-200/80 p-3.5 space-y-3 my-2 rounded-xl">
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
              <div className="panel bg-amber-50/60 border-amber-200/80 p-3.5 space-y-3 my-2 rounded-xl">
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

            {selectedRole === 'service_provider' && (
              <div className="panel bg-purple-50/60 border-purple-200/80 p-3.5 space-y-3 my-2 rounded-xl">
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
              className="w-full mt-4 bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50"
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
          <p className="text-center text-[11px] text-stone-500 mt-5 leading-relaxed">
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

        {/* Bottom spacing helper */}
        <div className="h-2" />
      </div>
    </section>
  );
}
