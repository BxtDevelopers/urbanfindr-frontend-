'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {  useState, useEffect, useRef, Fragment, useMemo  } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  House,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  User,
  Wrench,
  Bell,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';

import { useApp, useData } from './providers';
import { cityGuides } from '@/lib/catalog';
import { serviceCategories } from '@/lib/serviceCategories';

function CityPickerModal({ onClose }) {
  const router = useRouter();

  function handleCityClick(city) {
    onClose();
    router.push(`/projects?city=${encodeURIComponent(city.name)}`);
  }

  return (
    <div className="city-picker-overlay" onClick={onClose}>
      <div
        className="city-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="city-picker-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="city-picker-header">
          <h2 className="city-picker-title">
            Choose Your Dream City
          </h2>
          <p className="city-picker-subtitle">
            Select the location of your dream home
          </p>
        </div>

        <div className="city-picker-grid">
          {cityGuides.map((city) => (
            <button
              key={city.slug}
              className="city-picker-item"
              onClick={() => handleCityClick(city)}
            >
              <div className="city-picker-img-wrap">
                <img
                  src={city.image}
                  alt={city.name}
                  className="city-picker-img"
                />
              </div>
              <span className="city-picker-name">
                {city.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { user, roleMeta, logout } = useApp();

  const [open, setOpen] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const pathname = usePathname();

  const isServiceProvider = user?.role === 'service_provider' || user?.role === 'service-provider';
  const isCustomer = user && !isServiceProvider && user.role !== 'admin';

  const providerCategoryParam = isServiceProvider && user?.serviceCategory ? '&category=' + user.serviceCategory : '';
  const { data: requestData } = useData(user ? 'service-requests?limit=50' + providerCategoryParam : null);

  const newLeadsCount = useMemo(() => {
    if (!requestData?.items || !isServiceProvider || !user) return 0;
    const uId = String(user._id || user.id || '');
    const uName = String(user.name || '').toLowerCase().trim();
    const uCompany = String(user.company || '').toLowerCase().trim();
    const uEmail = String(user.email || '').toLowerCase().trim();

    return requestData.items.filter((i) => {
      if (!['submitted', 'requested', 'pending', 'new', 'quotation'].includes(i.status)) return false;
      if (uId && i.assignedSpecialistId && String(i.assignedSpecialistId) === uId) return true;
      if (i.assignedSpecialist) {
        const spec = String(i.assignedSpecialist).toLowerCase().trim();
        if (uName && (spec === uName || spec.includes(uName) || uName.includes(spec))) return true;
        if (uCompany && (spec === uCompany || spec.includes(uCompany) || uCompany.includes(spec))) return true;
        if (uEmail && spec.includes(uEmail)) return true;
      }
      if (i.technician?.name) {
        const techName = String(i.technician.name).toLowerCase().trim();
        if (uName && (techName === uName || techName.includes(uName))) return true;
      }
      return false;
    }).length;
  }, [requestData?.items, isServiceProvider, user]);

  const customerRequestsCount = useMemo(() => {
    if (!requestData?.items || !isCustomer || !user) return 0;
    const uId = String(user._id || user.id || '');
    const uEmail = String(user.email || '').toLowerCase().trim();
    return requestData.items.filter((item) => {
      const itemUserId = item.user?._id ? String(item.user._id) : item.user ? String(item.user) : '';
      const itemEmail = String(item.email || '').toLowerCase().trim();
      return (uId && itemUserId === uId) || (uEmail && itemEmail === uEmail);
    }).length;
  }, [requestData?.items, isCustomer, user]);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  const [servicesLauncherOpen, setServicesLauncherOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const launcherTimeoutRef = useRef(null);

  function handleLauncherMouseEnter() {
    if (launcherTimeoutRef.current) {
      clearTimeout(launcherTimeoutRef.current);
      launcherTimeoutRef.current = null;
    }
  }

  function handleLauncherMouseLeave() {
    launcherTimeoutRef.current = setTimeout(() => {
      setServicesLauncherOpen(false);
    }, 250);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest?.('.services-launcher-wrap')) {
        setServicesLauncherOpen(false);
      }
      if (!e.target.closest?.('.user-menu-wrap')) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (launcherTimeoutRef.current) clearTimeout(launcherTimeoutRef.current);
    };
  }, []);

  const filteredLauncherCategories = serviceCategories.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase().trim();
    return (
      cat.label.toLowerCase().includes(q) ||
      cat.shortTitle?.toLowerCase().includes(q) ||
      cat.tagline?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  // Main navbar links
  const links = [
    ['Home interiors', '/interiors'],
  ];

  function handleProjectsClick() {
    setOpen(false);
    setShowProjectsModal(true);
  }

  return (
    <>
      {/* Main navbar */}
      <header className="header">
        <Link href="/" className="brand flex items-center gap-2.5 group">
          <span className="brand-icon shrink-0">
            <House size={22} />
          </span>
          <div className="flex flex-col justify-center">
            <span className="brand-text leading-none">
              urban<span className="brand-finder">findr</span><span className="brand-dot">.</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-normal text-stone-500 leading-none mt-1">
              Find. Connect. Build Your Life.
            </span>
          </div>
        </Link>

        <nav className="desktop-nav">
          <div className="flex items-center gap-5">
            {links.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={
                  pathname === href.split('?')[0]
                    ? 'nav-active'
                    : ''
                }
              >
                {label}
              </Link>
            ))}

            <button
              className={
                pathname.startsWith('/projects')
                  ? 'nav-active'
                  : ''
              }
              style={{
                fontSize: 'inherit',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                color: 'inherit',
              }}
              onClick={handleProjectsClick}
            >
              Builder projects
            </button>
          </div>
        </nav>

        {/* Right-side actions: User Avatar Initial & Dropdown */}
        <div className="flex gap-3 items-center">
          {user ? (
            <div className="relative user-menu-wrap" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-forest text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-sm hover:shadow hover:bg-[#1f4a3f] ring-2 ring-forest/15 hover:ring-lime/50 transition-all cursor-pointer select-none"
                aria-label="User account menu"
                aria-expanded={userMenuOpen}
                title={user.name || 'Account'}
              >
                {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 sm:w-60 bg-white rounded-2xl shadow-xl border border-stone-200/90 z-50 p-2 py-2.5 transition-all animate-in fade-in">
                  {/* User Profile Header */}
                  <div className="px-3 py-2 border-b border-stone-100 flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-full bg-forest/10 text-forest font-bold text-sm flex items-center justify-center shrink-0">
                      {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate capitalize">
                        {user.email || roleMeta?.label || user.role}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="space-y-0.5 pt-1">
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-all"
                    >
                      <LayoutDashboard size={15} className="text-stone-500" />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/dashboard?view=user"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-all"
                      >
                        <User size={15} className="text-stone-500" />
                        <span>User Portal View</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all text-left cursor-pointer"
                    >
                      <LogOut size={15} className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hidden sm:block"
            >
              Log in
            </Link>
          )}

          {/* Service Provider Leads Notification */}
          {isServiceProvider && (
            <Link
              href="/dashboard/leads"
              className="relative p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-all shadow-xs flex items-center justify-center cursor-pointer"
              title={`New Leads (${newLeadsCount})`}
            >
              <Bell size={18} className="text-emerald-800" />
              {newLeadsCount > 0 && (
                <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 opacity-75 pointer-events-none"></span>
              )}
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-emerald-700 text-white text-[10px] font-extrabold shadow-xs">
                {newLeadsCount}
              </span>
            </Link>
          )}

          {/* Customer Requests Counter */}
          {isCustomer && (
            <Link
              href="/dashboard/bookings"
              className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300/80 transition-all shadow-xs flex items-center justify-center cursor-pointer"
              title={`My Requests (${customerRequestsCount})`}
            >
              <Wrench size={18} className="text-[#163e35]" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#163e35] text-white text-[10px] font-extrabold shadow-xs">
                {customerRequestsCount}
              </span>
            </Link>
          )}

          {/* Google-style 9-Dots Services / Category App Launcher */}
          <div
            className="relative services-launcher-wrap flex items-center"
            onMouseEnter={handleLauncherMouseEnter}
            onMouseLeave={handleLauncherMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                setServicesLauncherOpen((prev) => !prev);
                setCategorySearch('');
              }}
              aria-label="UrbanFindr Categories & Services"
              aria-expanded={servicesLauncherOpen}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                servicesLauncherOpen
                  ? 'bg-stone-200 text-forest shadow-inner'
                  : 'text-stone-600 hover:text-forest hover:bg-stone-100'
              }`}
              title="Explore by Category"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <circle cx="5" cy="5" r="2.2" />
                <circle cx="12" cy="5" r="2.2" />
                <circle cx="19" cy="5" r="2.2" />
                <circle cx="5" cy="12" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="19" cy="12" r="2.2" />
                <circle cx="5" cy="19" r="2.2" />
                <circle cx="12" cy="19" r="2.2" />
                <circle cx="19" cy="19" r="2.2" />
              </svg>
            </button>

            {/* Services Popup with Instant Search & Category Grid */}
            {servicesLauncherOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-[320px] sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-stone-200/90 z-50 p-3 sm:p-4 transition-all duration-150 animate-in fade-in"
                onMouseEnter={handleLauncherMouseEnter}
                onMouseLeave={handleLauncherMouseLeave}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2 mb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 tracking-tight">
                      Explore by Category
                    </span>
                    <span className="text-[10px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full">
                      {serviceCategories.length}
                    </span>
                  </div>
                  <Link
                    href="/categories"
                    onClick={() => setServicesLauncherOpen(false)}
                    className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
                  >
                    <span>All categories</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Instant Search Bar inside Dotted Box Popup */}
                <div className="relative mb-3 px-1">
                  <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    autoFocus
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search category or service..."
                    className="w-full pl-8 pr-7 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-forest focus:bg-white transition-all"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-3.5 top-2 text-stone-400 hover:text-stone-600 text-xs px-1"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* 3-Column Categories Grid */}
                {filteredLauncherCategories.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">
                    No categories found for &quot;{categorySearch}&quot;
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-h-[340px] overflow-y-auto p-1 pr-1.5">
                    {filteredLauncherCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={cat.href}
                        onClick={() => setServicesLauncherOpen(false)}
                        className="flex flex-col items-center p-2 rounded-2xl hover:bg-stone-50 transition-all duration-150 group text-center"
                      >
                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow transition-transform"
                          style={{
                            backgroundColor: cat.bgTint || '#f5f5f5',
                            borderColor: cat.borderTint || '#e5e5e5',
                            borderWidth: '1px',
                            color: cat.accentColor || '#163e35',
                          }}
                        >
                          <CategoryIcon name={cat.iconName} size={22} />
                        </div>
                        <span className="text-[11px] font-medium text-stone-700 group-hover:text-forest mt-1.5 leading-tight line-clamp-1 w-full">
                          {cat.shortTitle || cat.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Bottom Promo Callout */}
                <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-forest/5 via-lime/10 to-transparent border border-forest/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Sparkles size={15} className="text-forest shrink-0" />
                    <span className="font-medium text-[11px] leading-tight">
                      Explore 13+ verified categories
                    </span>
                  </div>
                  <Link
                    href="/categories"
                    onClick={() => setServicesLauncherOpen(false)}
                    className="font-bold text-forest text-xs hover:underline whitespace-nowrap ml-2"
                  >
                    View →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link className="btn post-btn" href="/post-property">
            Post property{' '}
            <span className="text-xs bg-lime text-forest rounded px-1.5 py-0.5">
              FREE
            </span>
          </Link>



          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile navigation */}
      {open && (
        <nav className="mobile-nav">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          <button
            style={{
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              padding: 0,
              fontSize: 16,
            }}
            onClick={handleProjectsClick}
          >
            Builder projects
          </button>

          <Link
            href="/properties"
            onClick={() => setOpen(false)}
          >
            All properties
          </Link>

          <Link
            href="/cities"
            onClick={() => setOpen(false)}
          >
            Explore by city
          </Link>

          <Link
            href="/post-property"
            onClick={() => setOpen(false)}
          >
            Post property — Free
          </Link>

          {user ? (
            user.role === 'admin' ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="font-bold text-forest flex items-center gap-1.5"
                >
                  <ShieldCheck size={16} /> Admin Command Center
                </Link>
                <Link
                  href="/dashboard?view=user"
                  onClick={() => setOpen(false)}
                  className="muted text-sm"
                >
                  User Portal View
                </Link>
                <button
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    font: 'inherit',
                    padding: 0,
                    fontSize: 16,
                    color: '#991b1b',
                  }}
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >Logout</button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                >
                  {`My dashboard (${roleMeta?.shortLabel || 'Account'})`}
                </Link>
                <button
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    font: 'inherit',
                    padding: 0,
                    fontSize: 16,
                    color: '#991b1b',
                  }}
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >Logout</button>
              </>
            )
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
            >
              Log in / Register
            </Link>
          )}
        </nav>
      )}

      {/* Discovery navbar */}
      <nav
        className="discovery-nav"
        aria-label="More ways to explore"
      >
        <Link href="/properties">
          All properties
        </Link>

        <Link href="/cities">
          Explore by city
        </Link>

        <Link href="/#featured-properties">
          Featured properties
        </Link>

        <Link href="/#latest-listings">
          Latest listings
        </Link>


      </nav>

      {/* Builder projects city picker */}
      {showProjectsModal && (
        <CityPickerModal
          onClose={() => setShowProjectsModal(false)}
        />
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="wrap mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
        <div className="col-span-2">
          <Link
            href="/"
            className="brand !text-white flex items-center gap-2 mb-4"
          >
            <House size={24} />
            <span className="brand-text">urban<span className="brand-finder">findr</span><span className="brand-dot">.</span></span>
          </Link>

          <p className="max-w-sm text-sm text-white/70 mt-4 leading-7">
            A place for every next chapter. Find a home, meet its owner,
            and make it yours — direct and transparent.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
            <span className="bg-white/10 px-2.5 py-1 rounded">100% Direct Owners</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">Verified Listings</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">Instant Site Visits</span>
          </div>

          <p className="mt-6 text-xs text-white/50">
            Independent demonstration real estate platform.
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Find your place
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/buy" className="block hover:text-lime">
              Buy a home
            </Link>
            <Link href="/rent" className="block hover:text-lime">
              Rent a home
            </Link>
            <Link href="/pg" className="block hover:text-lime">
              PG / Co-living
            </Link>
            <Link href="/commercial" className="block hover:text-lime">
              Commercial
            </Link>
            <Link href="/projects" className="block hover:text-lime">
              Builder projects
            </Link>
            <Link href="/interiors" className="block hover:text-lime">
              Home interiors
            </Link>
            <Link href="/categories" className="block hover:text-lime">
              All categories & services
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Popular cities
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/cities/bengaluru" className="block hover:text-lime">
              Bengaluru
            </Link>
            <Link href="/cities/mumbai" className="block hover:text-lime">
              Mumbai
            </Link>
            <Link href="/cities/pune" className="block hover:text-lime">
              Pune
            </Link>
            <Link href="/cities/hyderabad" className="block hover:text-lime">
              Hyderabad
            </Link>
            <Link href="/cities/delhi" className="block hover:text-lime">
              Delhi
            </Link>
            <Link href="/cities/chennai" className="block hover:text-lime">
              Chennai
            </Link>
            <Link href="/cities/gurugram" className="block hover:text-lime">
              Gurugram
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Trust &amp; Legal
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/about" className="block hover:text-lime">
              About us
            </Link>
            <Link href="/contact" className="block hover:text-lime">
              Contact us
            </Link>
            <Link href="/privacy" className="block hover:text-lime">
              Privacy policy
            </Link>
            <Link href="/terms" className="block hover:text-lime">
              Terms &amp; conditions
            </Link>
            <Link href="/post-property" className="block hover:text-lime">
              Post property (Free)
            </Link>
            <Link href="/dashboard" className="block hover:text-lime">
              Your dashboard
            </Link>
            <Link href="/PHOTO-SOURCES.md" className="block hover:text-lime">
              Photo sources
            </Link>
          </div>
        </div>
      </div>

      {/* Our Services Bar */}
      <div className="wrap border-t border-white/10 py-6 mx-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Our Services</p>
          <Link href="/categories" className="text-xs text-[#C19A6B] hover:underline inline-flex items-center gap-1 font-medium">
            All categories &amp; services
            <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70">
          <Link href="/properties" className="hover:text-lime">Properties</Link>
          <span className="text-white/30">•</span>
          <Link href="/projects" className="hover:text-lime">Builder Projects</Link>
          <span className="text-white/30">•</span>
          <Link href="/interiors" className="hover:text-lime">Home Interiors</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/landscapers" className="hover:text-lime">Landscapers</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/lawyers" className="hover:text-lime">Lawyers &amp; Legal</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/electricians" className="hover:text-lime">Electricians</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/ac-technicians" className="hover:text-lime">AC Technicians</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/pest-control" className="hover:text-lime">Pest Control</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/pool-cleaning" className="hover:text-lime">Pool Cleaning</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/tank-cleaning" className="hover:text-lime">Tank Cleaning</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/inverter-maintenance" className="hover:text-lime">Inverter Maintenance</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/lift-maintenance" className="hover:text-lime">Lift Maintenance</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/office-supplies" className="hover:text-lime">Office Supplies</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/facility-management" className="hover:text-lime">Facility Management</Link>
        </div>
      </div>

      <div className="wrap border-t border-white/20 py-4 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center mx-auto">
        <span>
          © {new Date().getFullYear()} UrbanFindr. Built for better living.
        </span>

        <span className="flex items-center">
          Made for your next move
          <ArrowUpRight className="inline ml-1" size={13} />
        </span>
      </div>
    </footer>
  );
}

export function Guard({ children, roles }) {
  const { user, ready, hasRole } = useApp();

  if (!ready) {
    return (
      <div className="wrap py-20">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap py-20">
        <div className="panel max-w-xl mx-auto p-10 text-center">
          <h2>Your next chapter starts here</h2>

          <p className="muted my-5">
            Log in to manage your homes, conversations and appointments.
          </p>

          <Link className="btn" href="/login">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (roles && !hasRole(roles)) {
    return (
      <div className="wrap py-20">
        <h2>This area requires additional access.</h2>

        <p className="muted my-5">
          This feature requires an account with {Array.isArray(roles) ? roles.join(' or ') : roles} access. Your current account role is &ldquo;{user.role}&rdquo;.
        </p>

        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="btn">
            Your dashboard
          </Link>
          <Link href="/dashboard/profile" className="btn-outline">
            Account settings &amp; roles
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
