'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Check,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { categoryFor } from '@/lib/catalog';
import { useApp, api } from './providers';
import PropertyEditor from './property-editor';

export default function PostProperty() {
  const { user, ready, refresh, setUser, toast } = useApp();
  const params = useSearchParams();

  // If user is already authenticated, bypass step 1 and show the dynamic PropertyEditor directly!
  if (user) {
    return (
      <div className="nb-post-wrap">
        {/* Logged in status banner */}
        <div className="flex items-center justify-between bg-[#edf3e2] text-forest border border-[#d2dfc4] px-4 py-3 rounded-xl text-sm mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={18} className="text-forest flex-shrink-0" />
            <span>
              Signed in as <strong>{user.name}</strong> ({user.email}) • Role:{' '}
              <strong className="capitalize">{user.role}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await api('auth/logout', { method: 'POST' });
                setUser(null);
                toast('Logged out successfully.');
              } catch (e) {
                toast(e.message);
              }
            }}
            className="text-xs text-forest/80 hover:text-forest underline font-semibold flex items-center gap-1"
          >
            <LogOut size={13} />
            Switch Account
          </button>
        </div>

        <PropertyEditor
          initialPurpose={categoryFor(params.get('purpose'))?.purpose || 'rent'}
          initialCity={params.get('city') || 'Bengaluru'}
          initialLocality={params.get('locality') || params.get('q') || ''}
          initialOwnership={
            user.role === 'channel_partner'
              ? 'channel_partner'
              : user.role === 'broker'
              ? 'broker'
              : user.role === 'builder'
              ? 'builder'
              : 'owner'
          }
        />
      </div>
    );
  }

  // If user is NOT logged in, show the clean Auth Gate
  return <AuthGate params={params} />;
}

function AuthGate({ params }) {
  const { setUser, toast } = useApp();
  const [isRegister, setIsRegister] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Contact / Auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ownership, setOwnership] = useState('owner');
  const [company, setCompany] = useState('');
  const [reraId, setReraId] = useState('');

  async function handleAuth(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const payload = isRegister
        ? {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            role: ownership,
            company: company.trim(),
            reraId: reraId.trim(),
          }
        : { email: email.trim(), password };

      const data = await api(`auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        body: payload,
      });

      setUser(data.user);
      toast(
        isRegister
          ? 'Account created! Now add your property details.'
          : 'Welcome back! Now add your property details.'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nb-post-wrap">
      {/* Hero Header */}
      <div className="nb-hero">
        <div className="nb-hero-badge">
          <Sparkles size={14} className="text-forest" />
          FOR PROPERTY OWNERS • DIRECT LISTINGS
        </div>
        <h1 className="nb-hero-title">
          Post your Property for{' '}
          <em className="text-forest underline decoration-lime decoration-4 underline-offset-8">
            FREE
          </em>
        </h1>
        <p className="nb-hero-sub">
          Sell or Rent your home, PG, or commercial space directly to genuine seekers.
          Zero brokerage, direct buyer &amp; tenant calls.
        </p>

        <div className="nb-trust-strip">
          <span className="nb-trust-pill">
            <Check size={14} className="text-forest" /> Direct Owner Network
          </span>
          <span className="nb-trust-pill">
            <Check size={14} className="text-forest" /> Direct Tenant / Buyer Calls
          </span>
          <span className="nb-trust-pill">
            <Check size={14} className="text-forest" /> 100% Free Ad Posting
          </span>
        </div>
      </div>

      {/* Main Auth Gate Card */}
      <div className="nb-card max-w-xl mx-auto">
        {/* Toggle Login / Register */}
        <div className="grid grid-cols-2 p-1.5 bg-[#f4f6ef] border-b border-[#dce4d5]">
          <button
            type="button"
            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              isRegister
                ? 'bg-white text-forest shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Create Free Account
          </button>
          <button
            type="button"
            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              !isRegister
                ? 'bg-white text-forest shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Sign In to Existing Account
          </button>
        </div>

        <div className="nb-card-body">
          {error && (
            <div role="alert" className="error mb-6 whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="mb-5">
            <h2 className="!text-xl font-bold text-stone-900">
              {isRegister ? 'Start with a free account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isRegister
                ? 'Sign up in 30 seconds to manage your listing, respond to inquiries, and track views.'
                : 'Sign in to access your properties and post a new listing.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <>
                {/* Full Name */}
                <div className="nb-field">
                  <label>
                    Your Full Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="nb-input-box">
                    <User size={17} className="nb-input-icon" />
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="nb-field">
              <label>
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="nb-input-box">
                <Mail size={17} className="nb-input-icon" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone (Only for registration) */}
            {isRegister && (
              <div className="nb-field">
                <label>
                  Mobile Number (for buyer / tenant calls) <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="nb-input-box">
                  <Phone size={17} className="nb-input-icon" />
                  <span className="nb-phone-prefix">+91</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    pattern="\+?[0-9\s-]{10,16}"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="nb-field">
              <label>
                {isRegister ? 'Set Password (min 10 characters)' : 'Your Password'}{' '}
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="nb-input-box">
                <Lock size={17} className="nb-input-icon" />
                <input
                  name="password"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  minLength={isRegister ? 10 : 1}
                  maxLength={100}
                  placeholder={
                    isRegister ? 'Create secure password' : 'Enter your password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={busy} className="nb-cta-btn !mt-6">
              {busy ? (
                'Processing…'
              ) : (
                <>
                  <span>
                    {isRegister
                      ? 'Create Account & Continue to Post'
                      : 'Sign In & Continue to Post'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-forest" />
              100% Free • Verified Direct Contacts • Privacy Protected
            </p>
          </form>
        </div>
      </div>

      {/* Why Post on UrbanFinder */}
      <div className="mt-12">
        <div className="text-center mb-6">
          <p className="eyebrow">WHY POST ON URBANFINDR</p>
          <h2 className="!text-3xl font-semibold">How UrbanFindr helps you rent or sell faster</h2>
        </div>

        <div className="nb-why-grid">
          <div className="nb-why-card">
            <div className="nb-why-icon">
              <ShieldCheck size={22} />
            </div>
            <h3>100% Free Listing</h3>
            <p>
              List your property at zero cost. Keep 100% of your rental or sale proceeds without middleman commissions.
            </p>
          </div>

          <div className="nb-why-card">
            <div className="nb-why-icon">
              <Phone size={22} />
            </div>
            <h3>Verified Direct Leads</h3>
            <p>
              Connect directly with genuine buyers, tenants, and co-living seekers with verified phone numbers.
            </p>
          </div>

          <div className="nb-why-card">
            <div className="nb-why-icon">
              <Sparkles size={22} />
            </div>
            <h3>3-Minute Fast Listing</h3>
            <p>
              Fill specifications, showcase high-res photos, and publish your listing with our streamlined dynamic flow.
            </p>
          </div>
        </div>

        {/* 3 Simple Steps */}
        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {[
            ['01', 'Sign in & Choose Category', 'Select Buy/Rent/PG/Commercial, pick your city and property specifications.'],
            ['02', 'Add Details & Photos', 'Provide BHK configuration, pricing, amenities, and upload property pictures.'],
            ['03', 'Direct Calls & Close Deal', 'Receive direct calls and inquiries from genuine seekers without intermediaries.'],
          ].map(([num, heading, desc]) => (
            <div className="panel" key={num}>
              <p className="eyebrow">{num}</p>
              <h3 className="!text-lg font-semibold">{heading}</h3>
              <p className="muted text-sm leading-6 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
