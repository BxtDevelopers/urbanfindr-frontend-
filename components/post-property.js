'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Check,
  ArrowRight,
  MapPin,
  Search,
  User,
  Mail,
  Phone,
  Lock,
  House,
  KeyRound,
  BedDouble,
  BriefcaseBusiness,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { categories, categoryFor } from '@/lib/catalog';
import { cities } from '@/lib/format';
import { useApp, api } from './providers';
import PropertyEditor from './property-editor';

export default function PostProperty() {
  const { user, ready, refresh, setUser, toast } = useApp();
  const params = useSearchParams();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(true);

  // Property type / purpose (Buy, Rent, PG, Commercial)
  const initialPurpose = categoryFor(params.get('purpose'))?.purpose || 'rent';
  const [purpose, setPurpose] = useState(initialPurpose);

  // Location search bar fields
  const [city, setCity] = useState(params.get('city') || 'Bengaluru');
  const [locality, setLocality] = useState(params.get('locality') || params.get('q') || '');

  // Contact details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');

  // Update contact fields when user loads
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || '');
      if (!email) setEmail(user.email || '');
      if (!phone) setPhone(user.phone || '');
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (!locality.trim()) {
        throw new Error('Please enter a locality, landmark or society name in the search bar.');
      }

      if (!user) {
        // Register or login as owner
        const payload = isRegister
          ? { name, email, phone, password, role: 'owner' }
          : { email, password };

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
      } else if (user.role === 'user') {
        const res = await api('auth/become-owner', { method: 'POST', body: {} });
        if (res?.user) setUser(res.user);
        else await refresh();
        toast('Owner account activated! Now add your property details.');
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // If in Step 2, render the PropertyEditor with pre-filled basic details
  if (step === 2) {
    return (
      <PropertyEditor
        initialPurpose={purpose}
        initialCity={city}
        initialLocality={locality}
        onBack={() => setStep(1)}
      />
    );
  }

  // Category tab icons
  const tabIcons = {
    buy: House,
    rent: KeyRound,
    pg: BedDouble,
    commercial: BriefcaseBusiness,
  };

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
          Sell or Rent your home, commercial space, or PG directly to genuine seekers.
          Connect directly with verified inquiries.
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

      {/* Main NoBroker-Style Card */}
      <div className="nb-card">
        {/* Property Type Selection Bar (Tabs same as Home Page) */}
        <div className="nb-tabs" role="tablist" aria-label="Select property type">
          {categories.map((item) => {
            const Icon = tabIcons[item.purpose] || House;
            const isActive = purpose === item.purpose;
            return (
              <button
                key={item.purpose}
                role="tab"
                aria-selected={isActive}
                type="button"
                className={`nb-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setPurpose(item.purpose)}
              >
                <Icon size={18} />
                <span>
                  {item.purpose === 'buy'
                    ? 'Buy / Resale'
                    : item.purpose === 'rent'
                    ? 'Rent'
                    : item.purpose === 'pg'
                    ? 'PG / Hostel'
                    : 'Commercial'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Card Body */}
        <div className="nb-card-body">
          {error && (
            <div role="alert" className="error mb-6 whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Search Bar: Select City + Locality Search (matching Home Page) */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
                Property Location
              </label>

              <div className="nb-search-bar">
                {/* Select City Dropdown */}
                <div className="nb-search-city">
                  <MapPin size={19} className="text-forest flex-shrink-0" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Select City"
                    required
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locality / Landmark Search Bar */}
                <div className="nb-search-locality">
                  <Search size={19} className="text-forest/60 flex-shrink-0" />
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="Search locality, landmark or property name (e.g. Indiranagar, Whitefield)"
                    maxLength={100}
                    required
                    aria-label="Locality or property"
                  />
                </div>
              </div>
            </div>

            {/* Owner Contact Information */}
            <div className="nb-contact-section">
              <h3 className="nb-contact-heading">
                <User size={19} className="text-forest" />
                Contact Details
              </h3>

              <div className="nb-contact-grid">
                {/* Name */}
                <div className="nb-field">
                  <label>Your Full Name</label>
                  <div className="nb-input-box">
                    <User size={17} className="nb-input-icon" />
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="nb-field">
                  <label>Email Address</label>
                  <div className="nb-input-box">
                    <Mail size={17} className="nb-input-icon" />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={200}
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="nb-field">
                  <label>Mobile Number</label>
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

                {/* Password field if not logged in */}
                {!user && (
                  <div className="nb-field">
                    <label>
                      {isRegister ? 'Set Password (min 10 chars)' : 'Account Password'}
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
                )}
              </div>

              {/* Logged in indicator */}
              {user && (
                <div className="flex items-center gap-2 bg-[#edf3e2] text-forest px-4 py-2.5 rounded-lg text-sm mb-6 font-medium">
                  <CheckCircle2 size={17} className="text-forest flex-shrink-0" />
                  <span>
                    Posting as <strong>{user.name}</strong> ({user.email}) • Owner tools ready
                  </span>
                </div>
              )}

              {/* Toggle Login / Register when logged out */}
              {!user && (
                <div className="flex items-center justify-between text-sm muted mb-6">
                  <span>
                    {isRegister ? 'Already registered on UrbanFindr?' : 'New property owner?'}
                  </span>
                  <button
                    type="button"
                    className="text-link font-semibold underline underline-offset-4"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setError('');
                    }}
                  >
                    {isRegister ? 'Log in with existing account' : 'Create new owner account'}
                  </button>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button type="submit" disabled={busy} className="nb-cta-btn">
              {busy ? (
                'Processing…'
              ) : (
                <>
                  <span>
                    {purpose === 'rent'
                      ? 'Post Rental Property FREE'
                      : purpose === 'buy'
                      ? 'Post Property for Sale FREE'
                      : purpose === 'pg'
                      ? 'Post PG / Co-living FREE'
                      : 'Post Commercial Property FREE'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-forest" />
              Direct Owner Listing • No Middlemen • Verified Leads
            </p>
          </form>
        </div>
      </div>

      {/* Why Post with Us / Value Props */}
      <div className="mt-8">
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
              List your property at zero cost. Keep 100% of your rental or sale
              proceeds.
            </p>
          </div>

          <div className="nb-why-card">
            <div className="nb-why-icon">
              <Phone size={22} />
            </div>
            <h3>Verified Direct Leads</h3>
            <p>
              Connect directly with genuine buyers, tenants, and co-living seekers with verified phone
              numbers.
            </p>
          </div>

          <div className="nb-why-card">
            <div className="nb-why-icon">
              <Sparkles size={22} />
            </div>
            <h3>3-Minute Fast Listing</h3>
            <p>
              Fill basic details, showcase high-res photos, and publish your listing with our simple
              2-step flow.
            </p>
          </div>
        </div>

        {/* 3 Simple Steps */}
        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {[
            ['01', 'Choose Property & Location', 'Select Buy/Rent/PG/Commercial, pick your city and enter your locality.'],
            ['02', 'Add Details & Photos', 'Provide BHK configuration, pricing, amenities and upload property pictures.'],
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
